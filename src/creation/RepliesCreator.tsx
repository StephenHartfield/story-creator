import React, { useState } from 'react';
import { IconButton, Button, TextField, Modal, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import styled from '@emotion/styled';
import ChapterSelector from './ChapterSelector';
import { SelectedSection } from './Creator';
import Requirement from './RequirementHandler';
import ReplyRow from './ReplyRow';

export interface Reply {
    text?: string;
    linkToSectionId?: string;
    requirements: Requirement[];
    effects: Requirement[];
}

export interface Requirement {
    addedAs: 'requirement' | 'effect' | undefined;
    type: 'currency' | 'item' | undefined;
    value: number | boolean | undefined;
    keyWord: string | undefined;
    greaterThan?: boolean;
}

export const initialReply = {text: '', linkToSectionId: '', requirements: [], effects: []};

const RepliesCreator: React.FC<SelectedSection> = (props: SelectedSection) => {
    const [replies, setReplies] = useState<Reply[]>([initialReply]); // Initial state with one reply.
    const [chapterSelectorOpen, setChapterSelectorOpen] = useState<boolean>(false);
    const [indexToAddLinkTo, setIndexToAddLinkTo] = useState<number>();

    const addReply = () => {
        const rp = {text:'', linkToSectionId:'', requirements: [], effects: []};
        setReplies([...replies, rp]);
    };

    const removeReply = (index: number) => {
        const updatedReplies = replies.filter((_, i) => i !== index);
        setReplies(updatedReplies);
    };

    const toggleChapterSelector = (index: number) => {
        setIndexToAddLinkTo(index);
        setChapterSelectorOpen(!chapterSelectorOpen);
    };

    const setLinkTo = (id: string) => {
        if (indexToAddLinkTo !== undefined) {
            const updatedReplies = [...replies];
            updatedReplies[indexToAddLinkTo].linkToSectionId = id;
            setReplies(updatedReplies);
            setChapterSelectorOpen(!chapterSelectorOpen);
        }
    }

    const updateReply = (rep: Reply, index: number) => {
        const updatedReplies = [...replies];
        updatedReplies[index] = rep;
        setReplies(updatedReplies);
    }

    return (
        <RepliesCreatorContainer>
            {/* Section Text */}
            <SectionText>{props.text}</SectionText>

            {/* Dynamic Replies */}
            {replies.map((reply, index) => (
                <ReplyContainer key={index}>
                    <ReplyRow updateReply={(rep: Reply) => updateReply(rep, index)} index={index} reply={reply} toggleChapterSelector={() => toggleChapterSelector(index)} />
                    <IconButton onClick={() => removeReply(index)}>
                        <RemoveIcon />
                    </IconButton>
                </ReplyContainer>
            ))}
            <IconButton onClick={() => addReply()}>
                <AddIcon />
            </IconButton>

            {chapterSelectorOpen && <ChapterSelector setSelectionId={(id: string) => setLinkTo(id)} isSelectingChapter={false} isSelectingSection={true} />}
        </RepliesCreatorContainer>
    );
};

export default RepliesCreator;

// Styled Components

const RepliesCreatorContainer = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
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

const ModalContent = styled(Box)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  border: 2px solid #000;
  box-shadow: 24px;
  padding: 16px;
  width: 80%;
`;
