import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from '@emotion/styled';
import { TypeAnimation } from 'react-type-animation';
import parse from 'html-react-parser';
import DOMPurify from 'dompurify';
import Loading from '../../Loading';
import useProjectStore from '../stores/ProjectStore';
import useScreenStore, { Screen } from '../stores/ScreenStore';
import useSettingStore, { Setting } from '../stores/SettingsStore';
import useCurrencyStore, { Currency } from '../stores/CurrencyStore';
import useReplyStore, { Reply } from '../stores/ReplyStore';

export interface UserCurrency {
    currency: Currency;
    userValue: number;
}

const TestScreen: React.FC = () => {
    const { screenId } = useParams<{ screenId: string }>();
    const [screen, setScreen] = useState<Screen | null>(null);
    const [replies, setReplies] = useState<Reply[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [defaultBg, setDefaultBg] = useState<string>();
    const [settings, setSettings] = useState<Setting>();
    const [userCurrencies, setUserCurrencies] = useState<UserCurrency[]>([]);
    const [readyToTest, setReadyToTest] = useState<boolean>(false);
    const [display, setDisplay] = useState<any>();
    const navigate = useNavigate();
    const { activeProject } = useProjectStore();
    const { getScreenById } = useScreenStore();
    const { getSettingByScreenId, getSettingByChapterId } = useSettingStore()
    const { currencies } = useCurrencyStore();
    const { getRepliesByScreenId } = useReplyStore();

    useEffect(() => {
        const fetchScreen = async () => {
            setIsLoading(true);
            if (screenId) {
                const screen = await getScreenById(screenId);
                if (screen) {
                    const setts = fetchSettings(screen);
                    if (setts && !screen.imageLocal) {
                        setDefaultBg(setts.defaultBackground);
                    }
                    setScreen(screen);
                    runFadeIn();
                    const repliesList = await getRepliesByScreenId(screen.id);
                    if (repliesList.length) {
                        const sorted = repliesList.sort((a, b) => a.order - b.order);
                        setReplies(sorted);
                    } else {
                        setReplies([{ text: 'Continue', linkToSectionId: screen.linkToNextScreen, id: '', order: 1, screenId: '', requirements: [], effects: [] }]);
                    }
                    setIsLoading(false);
                } else {
                    console.error('Screen not found');
                    setIsLoading(false);
                }
            }
        };
        if (activeProject && !readyToTest) {
            initializeTest();
        }
        fetchScreen();
    }, [screenId, activeProject]);

    useEffect(() => {
        if (replies && replies.length && userCurrencies.length) {
            //hide if requirement not met
            const indexesToRemove: number[] = [];
            replies.forEach((r, i) => {
                if (r.requirements.length) {
                    r.requirements.forEach(req => {
                        if (req.type === 'currency') {
                            const currencyToCheck = userCurrencies.find(uc => uc.currency.keyWord === req.keyWord);
                            if (currencyToCheck) {
                                if (req.greaterThan && currencyToCheck.userValue <= (req.value as number)) {
                                    indexesToRemove.push(i);
                                } else if (!req.greaterThan && currencyToCheck.userValue >= (req.value as number)) {
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
        const userCurrencies = currencies.map(curr => ({ currency: curr, userValue: curr.startingValue || 0 }));
        setUserCurrencies(userCurrencies);
    }

    const fetchSettings = (scrn: Screen): Setting | null => {
        try {
            const sSetting = getSettingByScreenId(scrn.id);
            if (sSetting) {
                setSettings(sSetting);
                return sSetting;
            } else {
                const cSetting = getSettingByChapterId(scrn.chapterId);
                if (cSetting) {
                    setSettings(cSetting);
                    return cSetting;
                } else {
                    setSettings(undefined);
                }
            }
        } catch (e) {
            console.error(e);
        }
        return null;
    }

    const handleReplyClick = (reply: Reply) => {
        if (reply.effects.length > 0) {
            const userCurrenciesCopy = [...userCurrencies];
            reply.effects.forEach(e => {
                if (e.type === 'currency') {
                    let matchedI = 0;
                    const currencyToChange = userCurrenciesCopy.find((uc, idx) => {
                        if (uc.currency.keyWord === e.keyWord) {
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
        if (val === '' || (!isNaN(val) && !isNaN(parseFloat(val)))) {
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
        setReadyToTest(true);
        runFadeIn();
    }

    const runFadeIn = () => {
        if (screen) {
            setTimeout(() => {
                const element = document.getElementById('fade-in-element');
                if (element) {
                    const arr = Array.from(element.children);
                    arr.forEach(el => {
                        el.classList.add('fade-out');
                    })
                    setTimeout(() => {
                        setTimeout(() => {
                            element.classList.add('ready');
                        }, 50);
                        recursiveAddClass(0, arr);
                    }, 1000)
                }
            }, 1);
        }
    }

    const recursiveAddClass = (i: number, el: any[]) => {
        setTimeout(() => {
            if (i < el.length) {
                el[i].classList.add('fade-in');
                i++;
                recursiveAddClass(i, el);
            } else {
                const replies = document.getElementById('replies-section');
                replies?.classList.add('ready');
            }
        }, i * 500)
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
                    <ScreenContent key={screen.id}>
                        <TextWrapper id='fade-in-element'>
                            {parse(DOMPurify.sanitize(screen.text, { USE_PROFILES: { html: true } }))}
                            {/* <TypeAnimation key={screen.text} cursor={false} sequence={[screen.text]} style={{ width: '300px', background: 'transparent' }} wrapper='div' speed={80} /> */}
                        </TextWrapper>
                        <ReplySection id='replies-section'>
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
  width: 450px;
  max-width: 450px;
  background: transparent;
  border-radius: 10px;
  padding: 20px;
`;

const TextWrapper = styled.div`
    height: 225px;
    max-height: 225px;
    opacity: 0;
    transition: opacity .5s ease-in-out;
    .fade-in {
        opacity: 1 !important;
        }
    .fade-out { 
        opacity: 0;
        transition: opacity 1s ease-in-out;
    }
    &.ready {
        opacity: 1;
    }
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
  opacity: 0;
    transition: opacity 1s ease-in-out;
  &.ready {
    opacity: 1;
  }
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
