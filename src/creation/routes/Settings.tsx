import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { addDoc, collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Screen, screenDBKey } from './SingleChapter';
import { Chapter, chapterDBKey } from './Chapters';
import { Currency, currencyDBKey } from './CurrencyManager';
import Select from 'react-dropdown-select';
import { Option } from '../replies/RepliesCreator';
import { ProjectSlim } from './Projects';

export const settingsDBKey = 'settings';

export interface Setting {
    id: string;
    timeForRepliesToDisplay: number;
    autoAdvances: boolean;
    showCurrencies?: string[];
    timeToAnswer: number;
    defaultBackground: string;
    screenId?: string;
    chapterId?: string;
}

interface SettingProps {
    activeProject: ProjectSlim | undefined;
}

const Settings: React.FC<SettingProps> = ({activeProject}) => {
    const [timeForRepliesToDisplay, setTimeForRepliesToDisplay] = useState<number>(5000);
    const [autoAdvances, setAutoAdvances] = useState<boolean>(false);
    const [timeToAnswer, setTimeToAnswer] = useState<number>(10000);
    const [defaultBackground, setDefaultBackground] = useState<string>('');
    const [currencyOpts, setCurrencyOpts] = useState<Option[]>([]);
    const [showCurrencies, setShowCurrencies] = useState<string[]>([]);
    const [currenciesSelected, setCurrenciesSelected] = useState<any[]>([]);
    const [settingId, setSettingId] = useState<string>();
    const [screen, setScreen] = useState<Screen>();
    const [chapter, setChapter] = useState<Chapter>();
    const { screenId } = useParams<{ screenId: string }>();
    const { chapterId } = useParams<{ chapterId: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        if (activeProject) {
            if (screenId) {
                fetchSettings(screenId);
                fetchScreenData(screenId);
            }
            if (chapterId) {
                fetchSettings(chapterId);
                fetchChapterData(chapterId);
            }
        }
    }, [activeProject]);

    const fetchSettings = async (id: string) => {
        try {
            const q = query(collection(db, settingsDBKey), where(screenId ? 'screenId' : 'chapterId', "==", id));
            const settingSnap = await getDocs(q);

            if (settingSnap.docs[0]) {
                const se = { ...settingSnap.docs[0].data(), id: settingSnap.docs[0].id } as Setting;
                setTimeForRepliesToDisplay(se.timeForRepliesToDisplay);
                setAutoAdvances(se.autoAdvances);
                setTimeToAnswer(se.timeToAnswer);
                setDefaultBackground(se.defaultBackground);
                setShowCurrencies(se.showCurrencies);
                setSettingId(se.id);

                const q = query(collection(db, currencyDBKey), where("projectId", "==", activeProject?.id));
                const querySnapshot = await getDocs(q);
                const currencyList = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Currency[];
                const mappedList = currencyList.map(c => ({ value: c.keyWord, label: c.displayName }));
                setCurrencyOpts(mappedList);
                if (se.showCurrencies && se.showCurrencies.length) {
                    setCurrenciesSelected(mappedList.filter(c => se.showCurrencies?.includes(c.value)));
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    const fetchScreenData = async (id: string) => {
        try {
            const screenRef = doc(db, screenDBKey, id);
            const screenSnap = await getDoc(screenRef);

            if (screenSnap.exists()) {
                const screenData = { id: screenSnap.id, ...screenSnap.data() };
                setScreen(screenData as Screen);
            }
        } catch (e) {
            console.error(e);
        }
    }
    const fetchChapterData = async (id: string) => {
        try {
            const chapterRef = doc(db, chapterDBKey, id);
            const chapterSnap = await getDoc(chapterRef);

            if (chapterSnap.exists()) {
                const chapterData = { id: chapterSnap.id, ...chapterSnap.data() };
                setChapter(chapterData as Chapter);
            }
        } catch (e) {
            console.error(e);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const settingsData: any = {
            timeForRepliesToDisplay,
            autoAdvances,
            timeToAnswer,
            defaultBackground,
            showCurrencies,
            screenId: screenId || '',
            chapterId: chapterId || ''
        };
        try {
            if (settingId) {
                await updateDoc(doc(db, settingsDBKey, settingId), settingsData);
            } else {
                await addDoc(collection(db, settingsDBKey), settingsData);
            }
            console.log('Submitted Settings:', settingsData);
            const chi = chapterId ? chapterId : screen?.chapterId;
            navigate(`/chapters/${chi}`);
        } catch (e) {
            console.error(e);
        }
    };

    const handleCurrencies = (opt: any[]) => {
        setShowCurrencies(opt.map( o => o.value as string));
        setCurrenciesSelected(opt);
    }

    return (
        <>
            <StyledLink to={`/chapters/${chapterId ? chapterId : screen?.chapterId}`}>Back to List</StyledLink>
            <SettingsContainer>
                <h2>Settings {chapterId ? 'for chapter ' + chapter?.title : 'for screen override ' + screen?.text.slice(0, 10) + '...'}</h2>
                <form onSubmit={handleSubmit}>
                    <FormGroup>
                        <label htmlFor="timeForRepliesToDisplay">Time for Replies to Display (ms):</label>
                        <Input
                            type="number"
                            id="timeForRepliesToDisplay"
                            value={timeForRepliesToDisplay}
                            onChange={(e) => setTimeForRepliesToDisplay(Number(e.target.value))}
                        />
                    </FormGroup>

                    <FormGroup>
                        <label htmlFor="autoAdvances">Auto Advances:</label>
                        <Checkbox
                            type="checkbox"
                            id="autoAdvances"
                            checked={autoAdvances}
                            onChange={(e) => setAutoAdvances(e.target.checked)}
                        />
                    </FormGroup>

                    <FormGroup>
                        <label htmlFor="showCurrencies">Display Currencies:</label>
                        <Select options={currencyOpts} multi values={currenciesSelected} onChange={(values: any[]) => handleCurrencies(values)} />
                    </FormGroup>

                    <FormGroup>
                        <label htmlFor="timeToAnswer">Time to Answer (ms):</label>
                        <Input
                            type="number"
                            id="timeToAnswer"
                            value={timeToAnswer}
                            onChange={(e) => setTimeToAnswer(Number(e.target.value))}
                        />
                    </FormGroup>

                    <FormGroup>
                        <label htmlFor="defaultBackground">Default Background:</label>
                        <Input
                            type="text"
                            id="defaultBackground"
                            value={defaultBackground}
                            onChange={(e) => setDefaultBackground(e.target.value)}
                        />
                    </FormGroup>

                    <SubmitButton type="submit">
                        Save Settings
                    </SubmitButton>
                </form>
            </SettingsContainer>
        </>
    );
};

export default Settings;

const StyledLink = styled(Link)`
    background-color: coral;
    border: 2px solid lightgreen;
    color: white !important;
    border-radius: 8px;
    width: 150px;
    padding: 10px 25px;
    text-align: center;
    margin-bottom: 20px;
    &:hover {
        background-color: lightgreen;
        border-color: coral;
    }
`;

const SettingsContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  font-size: 16px;
  border-radius: 4px;
  border: 1px solid #ccc;
  margin-top: 5px;
`;

const Checkbox = styled.input`
  margin-left: 10px;
  width: 20px;
  height: 20px;
`;

const SubmitButton = styled.button`
  background-color: coral;
  color: white;
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: darkorange;
  }

  &:disabled {
    background-color: gray;
    cursor: not-allowed;
  }
`;

const OverrideNotice = styled.div`
  margin-top: 20px;
  padding: 10px;
  background-color: #ffc107;
  color: #333;
  border-radius: 5px;
  font-size: 16px;
  text-align: center;
`;
