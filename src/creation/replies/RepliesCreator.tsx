import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Button, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import styled from '@emotion/styled';
import ChapterSelector from '../chapters/ChapterSelector';
import Requirement from '../RequirementHandler';
import ReplyRow from './ReplyRow';
import { Screen } from '../routes/SingleChapter';

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
    keyWord: string | undefined;
    greaterThan?: boolean;
}

interface RepliesCProps {
    submit: (repls: Reply[], scrn: Screen) => Promise<void>;
    screen: Screen;
    replies: Reply[];
    addReply: () => {};
    removeReply: (id: string) => {};
    setReplies: Dispatch<SetStateAction<Reply[]>>;
}


const RepliesCreator: React.FC<RepliesCProps> = (props: RepliesCProps) => {
    const [replies, setReplies] = useState<Reply[]>([]);
    const [screen, setScreen] = useState<Screen>();
    const [chapterSelectorOpen, setChapterSelectorOpen] = useState<boolean>(false);
    const [indexToAddLinkTo, setIndexToAddLinkTo] = useState<number>();

    useEffect(() => {
        setReplies(props.replies);
        if (props.screen?.id) {
            setScreen(props.screen);
        }
    }, [props.replies, props.screen])

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
        props.setReplies(updatedReplies);
    }

    return (
        <Wrapper>
            <RepliesCreatorContainer>
                {/* Section Text */}
                <SectionText>{props.screen?.text}</SectionText>

                {/* Dynamic Replies */}
                {replies.map((reply, index) => (
                    <ReplyContainer key={index}>
                        <ReplyRow updateReply={(rep: Reply) => updateReply(rep, index)} index={index} reply={reply} toggleChapterSelector={() => toggleChapterSelector(index)} />
                        <IconButton onClick={() => props.removeReply(reply.id)}>
                            <RemoveIcon />
                        </IconButton>
                    </ReplyContainer>
                ))}
                <IconButton onClick={props.addReply}>
                    <AddIcon />
                </IconButton>
            {screen && screen.id && <SubmitButton onClick={() => props.submit(replies, screen)} variant="outlined">Submit Replies</SubmitButton>}
            </RepliesCreatorContainer>
            {chapterSelectorOpen && (
                <span>open chapter selector</span>
                // <ChapterSelector setSelectionId={(id: string) => setLinkTo(id)}
                //     isSelectingChapter={false}
                //     isSelectingSection={true} />
            )}
        </Wrapper>
    );
};

export default RepliesCreator;

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
