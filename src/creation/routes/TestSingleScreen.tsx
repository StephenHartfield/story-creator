import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import styled from '@emotion/styled';
import { db, storage } from '../../firebaseConfig';
import { Screen, screenDBKey } from './SingleChapter';
import { repliesDBKey } from './SingleScreen';
import { Reply } from '../replies/RepliesCreator';
import { TypeAnimation } from 'react-type-animation';
import { getDownloadURL, ref } from 'firebase/storage';
import Loading from '../../Loading';
import { Setting, settingsDBKey } from './Settings';
import { Currency, currencyDBKey } from './CurrencyManager';
import { ProjectSlim } from './Projects';
import { Button } from '@mui/material';

export interface UserCurrency {
    currency: Currency;
    userValue: number;
}

interface TestProps {
    activeProject: ProjectSlim | undefined;
}

const TestScreen: React.FC<TestProps> = ({ activeProject }) => {
    const { screenId } = useParams<{ screenId: string }>();
    const [screen, setScreen] = useState<Screen | null>(null);
    const [replies, setReplies] = useState<Reply[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [defaultBg, setDefaultBg] = useState<string>();
    const [settings, setSettings] = useState<Setting>();
    const [userCurrencies, setUserCurrencies] = useState<UserCurrency[]>([]);
    const [readyToTest, setReadyToTest] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchScreen = async () => {
            setIsLoading(true);
            if (screenId) {
                const screenRef = doc(db, screenDBKey, screenId);
                const screenDoc = await getDoc(screenRef);
                if (screenDoc.exists()) {
                    let sc: any = {};
                    const setts = await fetchSettings({ ...screenDoc.data(), id: screenDoc.id } as Screen);
                    if (screenDoc.data().image) {
                        const fileRef = ref(storage, screenDoc.data().image);
                        const url = await getDownloadURL(fileRef);
                        sc = { ...screenDoc.data(), id: screenDoc.id, imageLocal: url } as Screen;
                    } else {
                        if (setts) {
                            setDefaultBg(setts.defaultBackground);
                        }
                        sc = { ...screenDoc.data(), id: screenDoc.id } as Screen;
                    }
                    setScreen(sc);
                    const q = query(collection(db, repliesDBKey), where("screenId", "==", screenId));
                    const querySnapshot = await getDocs(q);
                    const repliesList = querySnapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    })) as Reply[];
                    if (repliesList.length) {
                        const sorted = repliesList.sort((a, b) => a.order - b.order);
                        setReplies(sorted);
                    } else {
                        setReplies([]);
                    }
                    setIsLoading(false);
                } else {
                    console.error('Screen not found');
                    setIsLoading(false);
                }
            }
        };
        if(activeProject && !readyToTest) {
            initializeTest();
        }
        fetchScreen();
    }, [screenId, activeProject]);

    useEffect(() => {
        if(replies && replies.length && userCurrencies.length) {
            //hide if requirement not met
            const indexesToRemove: number[] = [];
            replies.forEach((r, i) => {
                if(r.requirements.length) {
                    r.requirements.forEach(req => {
                        if(req.type==='currency') {
                            const currencyToCheck = userCurrencies.find(uc => uc.currency.keyWord===req.keyWord);
                            if(currencyToCheck) {
                                if (req.greaterThan && currencyToCheck.userValue <= (req.value as number)) {
                                    indexesToRemove.push(i);
                                } else if(!req.greaterThan && currencyToCheck.userValue >= (req.value as number)) {
                                    indexesToRemove.push(i);
                                }
                            } else {
                                indexesToRemove.push(i);
                            }
                        }
                    })
                }
            })
            const repCopy = [...replies];
            const replyFiltered = repCopy.filter((_, idx) => !indexesToRemove.includes(idx));
            setReplies(replyFiltered);
        }
    }, [userCurrencies, isLoading]);

    const initializeTest = async () => {
        const q = query(collection(db, currencyDBKey), where("projectId", "==", activeProject?.id));
        const querySnapshot = await getDocs(q);
        const currencyList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Currency[];
        const userCurrencies = currencyList.map(curr => ({ currency: curr, userValue: curr.startingValue || 0 }));
        setUserCurrencies(userCurrencies);
    }

    const fetchSettings = async (scrn: Screen): Promise<Setting | null> => {
        try {
            const q = query(collection(db, settingsDBKey), where('screenId', "==", scrn.id));
            const settingSnap = await getDocs(q);

            if (settingSnap.docs[0]) {
                const se = { ...settingSnap.docs[0].data(), id: settingSnap.docs[0].id } as Setting;
                setSettings(se);
                return se;
            } else {
                const q = query(collection(db, settingsDBKey), where('chapterId', "==", scrn.chapterId));
                const settingCSnap = await getDocs(q);
                if (settingCSnap.docs[0]) {
                    const sc = { ...settingCSnap.docs[0].data(), id: settingCSnap.docs[0].id } as Setting;
                    setSettings(sc);
                    return sc;
                }
            }
        } catch (e) {
            console.error(e);
        }
        return null;
    }

    const handleReplyClick = (reply: Reply) => {
        if ( reply.effects.length > 0) {
            const userCurrenciesCopy = [...userCurrencies];
            reply.effects.forEach(e => {
                if(e.type==='currency') {
                    let matchedI = 0;
                    const currencyToChange = userCurrenciesCopy.find((uc, idx) => {
                        if (uc.currency.keyWord===e.keyWord) {
                            matchedI = idx;
                            return uc;
                        }
                    })
                    if (currencyToChange) {
                        currencyToChange.userValue += e.value as number;
                        userCurrenciesCopy[matchedI] = currencyToChange;
                        setUserCurrencies(userCurrenciesCopy);
                    }
                }
            })
        }
        navigate(`/testing/${reply.linkToSectionId}`);
    }

    const handleUserCurrency = (key: string, val: any) => {
        if (val==='' || (!isNaN(val) && !isNaN(parseFloat(val)))) {
            const userCopy = [...userCurrencies];
            let matchedi = 0;
            const match = userCopy.find((uc, idx) => {
                if (uc.currency.keyWord === key) {
                    matchedi = idx;
                    return uc;
                }
            });
            if (match) {
                match.userValue = parseInt(val);
                userCopy[matchedi] = match;
            }
            setUserCurrencies(userCopy);
        } else {
            console.error('not a number!');
        }
    }

    const startTest = () => {
        // userCurrencies.forEach(c => {
        //     localStorage.setItem(`user-currency-${activeProject?.id}-${c.currency.keyWord}`, c.userValue.toString());
        // })
        setReadyToTest(true);
    }


    if (!readyToTest) {
        return (
            <FormContainer>
                <FormTitle>User Starts With</FormTitle>
                {userCurrencies.map((curr, index) => (
                    <CurrencyRow key={'curr' + index}>
                        <CurrencyLabel>{curr.currency.displayName}</CurrencyLabel>
                        <CurrencyInput
                            type="number"
                            value={curr.userValue}
                            onChange={(e) => handleUserCurrency(curr.currency.keyWord, e.target.value)}
                        />
                    </CurrencyRow>
                ))}
                <SubmitButton onClick={startTest}>Start Test</SubmitButton>
            </FormContainer>
        )
    } else {
        return (
            <>
                <Loading isLoading={isLoading} />
                {userCurrencies.map(c => (
                    <div key={c.currency.keyWord}>
                        {settings?.showCurrencies?.includes(c.currency.keyWord) && <p>{c.currency.displayName}: {c.userValue}</p>}
                    </div>
                ))}
                {screen && <ScreenContainer background={screen.imageLocal} bgColor={defaultBg}>
                    <ScreenContent>
                        <TypeAnimation key={screen.text} cursor={false} sequence={[screen.text]} style={{ width: '300px', background: 'transparent' }} wrapper='div' speed={50} />
                        <ReplySection>
                            {replies && replies.map((reply, index) => (
                                <ReplyButton onClick={() => handleReplyClick(reply)} key={index}>{reply.text}</ReplyButton>
                            ))}
                        </ReplySection>
                    </ScreenContent>
                </ScreenContainer>}
            </>
        );
    }
};

export default TestScreen;

const ScreenContainer = styled.div<{ background: string | undefined, bgColor: string | undefined }>`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-image: url(${props => props.background});
  background-color: ${props => props.bgColor};
  background-size: cover;
  background-position: center;
`;

const ScreenContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 90%;
  width: 90%;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  padding: 20px;
`;

const FormContainer = styled.div`
  max-width: 400px;
  width: 100%;
  margin: 50px auto;
  padding: 30px;
  background-color: #f4f4f4;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormTitle = styled.h2`
  color: #ff6f61; /* Coral color */
  margin-bottom: 20px;
  font-size: 24px;
`;

const CurrencyRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
`;

const CurrencyLabel = styled.span`
  font-size: 16px;
  color: #6a1b9a; /* Purple color */
  flex: 1;
`;

const CurrencyInput = styled.input`
  width: 100px;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 16px;
  flex: 1;
  background-color: #e0f7e4; /* Light green background */
`;

const SubmitButton = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  background-color: #ff6f61; /* Coral color */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #e65100; /* Darker coral on hover */
  }
`;

const ReplySection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
`;

const ReplyButton = styled.button`
  padding: 10px 20px;
  font-size: 18px;
  background-color: coral;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: darkorange;
  }
`;
