import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Box, Button, IconButton, Modal } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import styled from '@emotion/styled';
import ChapterSelector from '../chapters/ChapterSelector';
import Requirement from '../RequirementHandler';
import ReplyRow from './ReplyRow';
import { Screen } from '../routes/SingleChapter';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Currency, currencyDBKey } from '../routes/CurrencyManager';
import { Chapter, chapterDBKey } from '../routes/Chapters';
import Loading from '../../Loading';

export interface Reply {
    id: string;
    order: number;
    text?: string;
    screenId: string;
    linkToSectionId?: string;
    requirements: Requirement[];
    effects: Requirement[];
}

export interface Requirement {
    addedAs: 'requirement' | 'effect' | undefined;
    type: 'currency' | 'item' | undefined;
    value: number | boolean | undefined;
    keyWord: string;
    greaterThan?: boolean;
}

interface RepliesCProps {
    submit: (repls: Reply[], scrn: Screen) => Promise<void>;
    screen: Screen;
    replies: Reply[];
    activeProjectId: string;
    addReply: () => {};
    removeReply: (id: string) => {};
    setReplies: Dispatch<SetStateAction<Reply[]>>;
}

export interface Option {
    value: string;
    label: string;
}


const RepliesCreator: React.FC<RepliesCProps> = (props: RepliesCProps) => {
    const [replies, setReplies] = useState<Reply[]>([]);
    const [screen, setScreen] = useState<Screen>();
    const [chapterSelectorOpen, setChapterSelectorOpen] = useState<boolean>(false);
    const [indexToAddLinkTo, setIndexToAddLinkTo] = useState<number>();
    const [currencyOpts, setCurrencyOpts] = useState<Option[]>([])
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        getCurrencies();
    }, []);

    useEffect(() => {
        setReplies(props.replies);
        if (props.screen?.id) {
            setScreen(props.screen);
        }
    }, [props.replies, props.screen]);

    const getCurrencies = async () => {
        const q = query(collection(db, currencyDBKey), where("projectId", "==", props.activeProjectId));
        const querySnapshot = await getDocs(q);
        const currencyList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Currency[];
        setCurrencyOpts(currencyList.map(c => ({ value: c.keyWord, label: c.displayName })));
    }

    const fetchChapters = async () => {
        try {
            const q = query(collection(db, chapterDBKey), where("projectId", "==", props.activeProjectId));
            const querySnapshot = await getDocs(q);
            const chaptersList = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Chapter[];
            setChapters(chaptersList);
            setIsLoading(false);
        } catch (e) {
            console.error(e);
            setIsLoading(false);
        }
    };

    const toggleChapterSelector = async (index: number) => {
        setIsLoading(true);
        await fetchChapters();
        setIndexToAddLinkTo(index);
        setChapterSelectorOpen(!chapterSelectorOpen);
    };

    const setLinkTo = (id: string) => {
        if (indexToAddLinkTo !== undefined) {
            const updatedReplies = [...replies];
            updatedReplies[indexToAddLinkTo].linkToSectionId = id;
            props.setReplies(updatedReplies);
            setChapterSelectorOpen(!chapterSelectorOpen);
        }
    }

    const updateReply = (rep: Reply, index: number) => {
        const updatedReplies = [...replies];
        updatedReplies[index] = rep;
        props.setReplies(updatedReplies);
    }

    return (
        <Wrapper>
            <Loading isLoading={isLoading} />
            <RepliesCreatorContainer>
                {/* Section Text */}
                <SectionText>{props.screen?.text}</SectionText>

                {/* Dynamic Replies */}
                {replies.map((reply, index) => (
                    <ReplyContainer key={index}>
                        <ReplyRow currencies={currencyOpts} updateReply={(rep: Reply) => updateReply(rep, index)} index={index} reply={reply} toggleChapterSelector={() => toggleChapterSelector(index)} />
                        <RemoveButton onClick={() => props.removeReply(reply.id)}>
                            <DeleteIcon />
                        </RemoveButton>
                    </ReplyContainer>
                ))}
                <IconButton onClick={props.addReply}>
                    <AddIcon />
                </IconButton>
                {screen && screen.id && <SubmitButton onClick={() => props.submit(replies, screen)} variant="outlined">Submit Replies</SubmitButton>}
            </RepliesCreatorContainer>
            {chapterSelectorOpen && chapters?.length && (
                <Modal
                    open={chapterSelectorOpen}
                    onClose={toggleChapterSelector}
                    aria-labelledby="modal-title"
                    aria-describedby="modal-description"
                >
                    <Box sx={style}>
                        <ChapterSelector setSelectionId={(id: string) => setLinkTo(id)}
                            chapters={chapters}
                            isSelectingChapter={false}
                            isSelectingSection={true} />
                    </Box>
                </Modal>
            )}
        </Wrapper>
    );
};

export default RepliesCreator;

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 800,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'center'
};

const RepliesCreatorContainer = styled.div`
    padding: 20px;
    display: flex;
    flex-direction: column;
`;

const SubmitButton = styled(Button)`
    background-color: lightgreen;
    color: purple;
    margin-top: 20px;
    margin: 0 auto;
`;

const RemoveButton = styled(Button)`
  background-color: #dc3545;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #c82333;
  }
`;

const SectionText = styled.h2`
    font-size: 18px;
    margin-bottom: 20px;
`;

const ReplyContainer = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 10px;
`;

const Wrapper = styled.div`
    display: flex;
`;
