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

const TestScreen: React.FC = () => {
    const { screenId } = useParams<{ screenId: string }>();
    const [screen, setScreen] = useState<Screen | null>(null);
    const [replies, setReplies] = useState<Reply[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [defaultBg, setDefaultBg] = useState<string>();
    const [settings, setSettings] = useState<Setting>();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchScreen = async () => {
            setIsLoading(true);
            if (screenId) {
                const screenRef = doc(db, screenDBKey, screenId);
                const screenDoc = await getDoc(screenRef);
                if (screenDoc.exists()) {
                    let sc: any = {};
                    const setts = await fetchSettings({...screenDoc.data(), id: screenDoc.id} as Screen);
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
                    }
                    setIsLoading(false);
                } else {
                    console.error('Screen not found');
                    setIsLoading(false);
                }
            }
        };

        fetchScreen();
    }, [screenId]);

    const fetchSettings = async(scrn: Screen): Promise<Setting | null> => {
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
        console.log( reply );
        navigate(`/testing/${reply.linkToSectionId}`);
    }

    return (
        <>
            <Loading isLoading={isLoading} />
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
};

export default TestScreen;

// Styled Components
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

const TextSection = styled.div`
  flex: 1;
  font-size: 24px;
  font-weight: bold;
  color: #333;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
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
