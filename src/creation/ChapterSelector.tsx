import React, { Dispatch, SetStateAction, useState } from 'react';
import {
    IconButton,
    List,
    ListItem,
    ListItemText,
    Collapse,
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ReplyIcon from '@mui/icons-material/StarRate';
import styled from '@emotion/styled';

interface Section {
    id: string;
    number: number;
    text: string;
    image: string;
    replies?: any;
}

export interface Chapter {
    id: string;
    title: string;
    number: number;
    sections: Section[];
}

interface SelectorProps {
    isSelectingChapter: boolean;
    isSelectingSection: boolean;
    setSelectionId: any;
}

const chaptersData: Chapter[] = [
    {
        title: 'Chapter 1',
        number: 1,
        id: 'mockc1',
        sections: [
            { number: 1, id: 'mocks1', text: 'This is the first sentence of section 1.1', image: 'https://via.placeholder.com/50', replies: true },
            { number: 2, id: 'mocks2', text: 'This is the first sentence of section 1.2 and it goes like this with a paddie wack ', image: 'https://via.placeholder.com/50', replies: false }
        ]
    },
    {
        title: 'Chapter 2',
        number: 2,
        id: 'mockc2',
        sections: [
            { number: 1, id: 'mock22', text: 'The section 2.1 first sentence starts here...', image: 'https://via.placeholder.com/50', replies: true }
        ]
    }
];

const ChapterSelector: React.FC<SelectorProps> = (props: SelectorProps) => {
    const [openChapters, setOpenChapters] = useState<number[]>([]); // Tracks which chapters are expanded.

    const toggleChapter = (index: number) => {
        if (props.isSelectingChapter) {
            const matched = chaptersData.find((_, i) => i === index);
            if (matched?.id) {
                props.setSelectionId(matched.id);
            } else {
                console.error('couldnt find chapter');
            }
            return;
        }
        if (openChapters.includes(index)) {
            setOpenChapters(openChapters.filter(i => i !== index));
        } else {
            setOpenChapters([...openChapters, index]);
        }
    };

    const handleSectionClick = (sectionId: string) => {
        if (props.isSelectingSection) {
            props.setSelectionId(sectionId);
        }
        console.log(`Section ID: ${sectionId}`);
    };


    return (
        <ChapterSelectorContainer>

            {/* Chapter list that opens relative to the button */}
            <ChaptersContainer>
                <List>
                    {chaptersData.map((chapter, index) => (
                        <div key={'chapter-' + index}>

                            {/* ListItem for each chapter */}
                            <StyledListItem $chapter $isSelectable={props.isSelectingChapter} onClick={() => toggleChapter(index)}>
                                <ListItemText primary={chapter.title} />
                                {!props.isSelectingChapter && (openChapters.includes(index) ? <ExpandLess /> : <ExpandMore />)}
                            </StyledListItem>

                            {/* Collapsible List for sections */}
                            <Collapse in={openChapters.includes(index)} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    {chapter.sections.map((section, secIndex) => (
                                        <StyledListItem key={'section-' + secIndex}
                                            $isSelectable={props.isSelectingSection}
                                            onClick={() => handleSectionClick(section.id)}>
                                            {/* Section number and first sentence */}
                                            <SectionText>
                                                <SectionNumber>{chapter.number}.{section.number}</SectionNumber>
                                                {section.text}
                                            </SectionText>

                                            {/* Thumbnail */}
                                            <ThumbnailImage src={section.image} alt={`Section ${section.number}`} />

                                            {/* Hamburger button for replies */}
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
                </List>
            </ChaptersContainer>
        </ChapterSelectorContainer>
    );
};

export default ChapterSelector;

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
