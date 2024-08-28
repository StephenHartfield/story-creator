import React, { Dispatch, SetStateAction, useState } from 'react';
import {
    IconButton,
    List,
    ListItem,
    ListItemText,
    Collapse,
    Button,
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ReplyIcon from '@mui/icons-material/StarRate';
import styled from '@emotion/styled';
import { Chapter } from '../routes/Chapters';
import { useNavigate } from 'react-router-dom';

interface Section {
    id: string;
    number: number;
    text: string;
    image: string;
    replies?: any;
}

interface SelectorProps {
    isSelectingChapter: boolean;
    isSelectingSection: boolean;
    setSelectionId: any;
    chapters: Chapter[];
}


const ChapterSelector: React.FC<SelectorProps> = (props: SelectorProps) => {
    const [openChapters, setOpenChapters] = useState<number[]>([]);
    const navigate = useNavigate();

    const toggleChapter = (index: number) => {
        if (openChapters.includes(index)) {
            setOpenChapters(openChapters.filter(i => i !== index));
        } else {
            setOpenChapters([...openChapters, index]);
        }
    };

    const editChapter = (index: number) => {
        const matched = props.chapters.find((_, i) => i === index);
        if (matched?.id) {
            props.setSelectionId(matched.id);
        } else {
            console.error('couldnt find chapter');
        }
    }

    const handleSectionClick = (sectionId: string) => {
        if (props.isSelectingSection) {
            props.setSelectionId(sectionId);
        }
        console.log(`Section ID: ${sectionId}`);
    };

    const handleCreateNew = () => {
        navigate('new');
    }


    return (
        <ChapterSelectorContainer>

            {/* Chapter list that opens relative to the button */}
            <ChaptersContainer>
                {props.chapters.length ? <List>
                    {props.chapters.map((chapter, index) => (
                        <div key={'chapter-' + index}>

                            {/* ListItem for each chapter */}
                            <StyledListItem $chapter $isSelectable={props.isSelectingChapter} onClick={() => toggleChapter(index)}>
                                <ListItemText primary={chapter.title} />
                                {openChapters.includes(index) ? <ExpandLess /> : <ExpandMore />}
                                {props.isSelectingChapter && openChapters.includes(index) && <ActionButton onClick={() => editChapter(index)}>EDIT</ActionButton>}
                            </StyledListItem>

                            {/* Collapsible List for sections */}
                            <Collapse in={openChapters.includes(index)} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    {chapter.pages && chapter.pages.map((section, secIndex) => (
                                        <StyledListItem key={'section-' + secIndex}
                                            $isSelectable={props.isSelectingSection}
                                            onClick={() => handleSectionClick(section.id)}>

                                            <SectionText>
                                                <SectionNumber>{chapter.number}.{section.number}</SectionNumber>
                                                {section.text}
                                            </SectionText>
                                    
                                            <ThumbnailImage src={section.image} alt={`Section ${section.number}`} />

                                            {section.replies && (
                                                <RepliesButton edge="end">
                                                    <ReplyIcon />
                                                </RepliesButton>
                                            )}
                                        </StyledListItem>
                                    ))}
                                </List>
                            </Collapse>
                        </div>
                    ))}
                </List> : <SectionText>No Chapters to Display</SectionText>}
            </ChaptersContainer>
            <AddButton onClick={handleCreateNew} variant="outlined">New Chapter</AddButton>
        </ChapterSelectorContainer>
    );
};

export default ChapterSelector;


const AddButton = styled(Button)`
    background-color: lightgreen;
    color: purple;
    margin-top: 20px;
`;

const ChapterSelectorContainer = styled.div`
  position: relative;
  width: 400px;
`;

const ChaptersContainer = styled.div`
  position: relative;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 10px;
  width: 94%;
`;

const SectionNumber = styled.b`
    padding-right: 5px;
`;
const SectionText = styled.span`
  flex-grow: 1;
  margin-right: 15px;
  font-size: 14px;
  max-width: 295px;
  min-width: 295px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const ThumbnailImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
  margin-right: 10px;
`;

const RepliesButton = styled(IconButton)`
  margin-left: auto;
`;

const ActionButton = styled(Button)`
  background-color: #17a2b8;
  color: white;

  &:hover {
    background-color: #138496;
  }
`;

const StyledListItem = styled(ListItem) <{ $isSelectable: boolean, $chapter?: boolean }>`
    &:hover {
        background-color: ${props => props.$isSelectable ? (props.$chapter ? 'blue' : 'green') : (props.$chapter && 'lightgrey')};
        color: ${props => props.$isSelectable && 'white'};
    }
    border-radius: 8px;
    border: 2px solid black;
    cursor: ${props => props.$isSelectable && 'pointer'};
    padding-left: 12px;
`;
