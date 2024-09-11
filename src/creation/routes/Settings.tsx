import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Select from 'react-dropdown-select';
import { Option } from '../replies/RepliesCreator';
import useProjectStore from '../stores/ProjectStore';
import useChapterStore, { Chapter } from '../stores/ChapterStore';
import useScreenStore, { Screen } from '../stores/ScreenStore';
import useSettingStore, { Setting } from '../stores/SettingsStore';
import useCurrencyStore from '../stores/CurrencyStore';

const Settings: React.FC = () => {
    const [timeForRepliesToDisplay, setTimeForRepliesToDisplay] = useState<number>();
    const [autoAdvances, setAutoAdvances] = useState<boolean>();
    const [timeToAnswer, setTimeToAnswer] = useState<number>();
    const [defaultBackground, setDefaultBackground] = useState<string>();
    const [currencyOpts, setCurrencyOpts] = useState<Option[]>([]);
    const [showCurrencies, setShowCurrencies] = useState<string[]>([]);
    const [currenciesSelected, setCurrenciesSelected] = useState<any[]>([]);
    const [settingId, setSettingId] = useState<string>();
    const [screen, setScreen] = useState<Screen>();
    const [chapter, setChapter] = useState<Chapter>();
    const { screenId } = useParams<{ screenId: string }>();
    const { chapterId } = useParams<{ chapterId: string }>();
    const navigate = useNavigate();
    const {activeProject} = useProjectStore();
    const {getChapterById} = useChapterStore();
    const {getScreenById} = useScreenStore();
    const {getSettingByChapterId, getSettingByScreenId, updateOrAddSetting} = useSettingStore();
    const {currencies} = useCurrencyStore();

    useEffect(() => {
        if (activeProject) {
            if (screenId) {
                fetchSettings(screenId);
            }
            if (chapterId) {
                fetchSettings(chapterId);
                fetchChapterData(chapterId);
            }
        }
    }, [activeProject]);

    const fetchSettings = async (id: string) => {
        try {
            const setting = screenId ? getSettingByScreenId(id) : getSettingByChapterId(id);
            const mappedList = currencies.map(c => ({ value: c.keyWord, label: c.displayName }));
            setCurrencyOpts(mappedList);
            if (setting) {
                setTimeForRepliesToDisplay(setting.timeForRepliesToDisplay);
                setAutoAdvances(setting.autoAdvances);
                setTimeToAnswer(setting.timeToAnswer);
                setDefaultBackground(setting.defaultBackground);
                if(setting.showCurrencies) {
                    setShowCurrencies(setting.showCurrencies);
                }
                setSettingId(setting.id);

                if (setting.showCurrencies && setting.showCurrencies.length) {
                    setCurrenciesSelected(mappedList.filter(c => setting.showCurrencies?.includes(c.value)));
                }
                if(screenId) {
                    fetchScreenData(id, mappedList, setting);
                }
            } else if(screenId) {
                fetchScreenData(id, mappedList);
            }
        } catch (e) {
            console.error(e);
        }
    }

    const fetchScreenData = async(id: string, mappedList: {value: string, label: string}[], currSettings?: Setting) => {
        try {
            const screen = await getScreenById(id);
            if (screen) {
                setScreen(screen);

                //find chapter defaults to inherit if not already filled
                const se = getSettingByChapterId(screen.chapterId);
                if (se) {
                    if(typeof timeForRepliesToDisplay === 'undefined' && typeof se.timeForRepliesToDisplay !== 'undefined') {
                        setTimeForRepliesToDisplay(se.timeForRepliesToDisplay);
                    }
                    if(typeof currSettings?.autoAdvances === 'undefined' && typeof se.autoAdvances !== 'undefined') {
                        setAutoAdvances(se.autoAdvances);
                    }
                    if(typeof currSettings?.timeToAnswer === 'undefined' && typeof se.timeToAnswer !== 'undefined') {
                        setTimeToAnswer(se.timeToAnswer);
                    }
                    if(typeof currSettings?.defaultBackground === 'undefined' && typeof se.defaultBackground !== 'undefined') {
                        setDefaultBackground(se.defaultBackground);
                    }
                    if(typeof currSettings?.showCurrencies === 'undefined' || currSettings.showCurrencies.length===0 && typeof se.showCurrencies !== 'undefined' && se.showCurrencies.length) {
                        setShowCurrencies(se.showCurrencies || []);
                        setCurrenciesSelected(mappedList.filter(c => se.showCurrencies?.includes(c.value)));
                    }
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    const fetchChapterData = async (id: string) => {
        try {
            const chapter = await getChapterById(id);
            if (chapter) {
                setChapter(chapter);
            }
        } catch (e) {
            console.error(e);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const settingsData: any = {
            projectId: activeProject?.id,
            screenId: screenId || '',
            chapterId: chapterId || ''
        };
        if (timeForRepliesToDisplay) {
            settingsData.timeForRepliesToDisplay = timeForRepliesToDisplay;
        }
        if (autoAdvances) {
            settingsData.autoAdvances = autoAdvances;
        }
        if (timeToAnswer) {
            settingsData.timeToAnswer = timeToAnswer;
        }
        if (defaultBackground) {
            settingsData.defaultBackground = defaultBackground;
        }
        if (showCurrencies) {
            settingsData.showCurrencies = showCurrencies;
        }
        try {
            updateOrAddSetting(settingsData, settingId);
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
