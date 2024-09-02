import React, { useState } from 'react';
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
import { ProjectSlim } from '../routes/Projects';
import { useNavigate } from 'react-router-dom';
import { Screen, screenDBKey } from '../routes/SingleChapter';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, storage } from '../../firebaseConfig';
import { getDownloadURL, ref } from 'firebase/storage';

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
    activeProject?: ProjectSlim | undefined;
    createChapter?: () => void;
    deleteChapter?: (id: string) => void;
}


const ChapterSelector: React.FC<SelectorProps> = (props: SelectorProps) => {
    const [openChapters, setOpenChapters] = useState<number[]>([]);
    const [screens, setScreens] = useState<Screen[]>([]);
    const navigate = useNavigate();

    const toggleChapter = async (index: number) => {
        if (openChapters.includes(index)) {
            setOpenChapters(openChapters.filter(i => i !== index));
        } else {
            setOpenChapters([...openChapters, index]);
            try {
                const q = query(collection(db, screenDBKey), where("chapterId", "==", props.chapters[index].id));
                const querySnapshot = await getDocs(q);
                const screensList = await Promise.all( querySnapshot.docs.map(async(doc) => {
                    if (doc.data().image) {
                        const fileRef = ref(storage, doc.data().image);
                        const url = await getDownloadURL(fileRef);
                        return { ...doc.data(), id: doc.id, imageLocal: url} as Screen;
                    } else {
                        return {id: doc.id, ...doc.data()} as Screen;
                    }
                }));
                if (screensList.length) {
                    const sorted = screensList.sort((a, b) => a.order - b.order);
                    setScreens(sorted);
                }
            } catch (e) {
                console.error(e);
            }
        }
    };

    const editChapter = (id: string) => {
        navigate(id);
    }

    const deleteChapter = (id: string) => {
        if ( props.deleteChapter ) {
            props.deleteChapter(id);
        }
    }

    const handleSectionClick = (sectionId: string | undefined) => {
        if ( sectionId ) {
            if (props.isSelectingSection) {
                props.setSelectionId(sectionId);
            }
            console.log(`Section ID: ${sectionId}`);
        }
    };

    const handleCreateNew = async () => {
        if ( props.createChapter ) {
            props.createChapter();
        }
    }


    return (
        <ChapterSelectorContainer>
            {props.activeProject && <h2 style={{textAlign: 'center'}}>{props.activeProject?.title}</h2>}

            {/* Chapter list that opens relative to the button */}
            <ChaptersContainer>
                {props.chapters.length ? <List>
                    {props.chapters.map((chapter, index) => (
                        <div key={'chapter-' + index}>

                            {/* ListItem for each chapter */}
                            <StyledListItem $chapter $isSelectable={props.isSelectingChapter} onClick={() => toggleChapter(index)}>
                                <ListItemText primary={chapter.title || 'No title'} />
                                {props.isSelectingChapter && openChapters.includes(index) && (
                                    <>
                                        <ActionButton onClick={() => editChapter(chapter.id)}>EDIT</ActionButton>
                                        <ActionButton $delete onClick={() => deleteChapter(chapter.id)}>DELETE</ActionButton>
                                    </>
                                )}
                                {openChapters.includes(index) ? <ExpandLess /> : <ExpandMore />}
                            </StyledListItem>

                            {/* Collapsible List for sections */}
                            <Collapse in={openChapters.includes(index)} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    {screens.length && screens.map((section, secIndex) => (
                                        <StyledListItem key={'section-' + secIndex}
                                            $isSelectable={props.isSelectingSection}
                                            onClick={() => handleSectionClick(section.id)}>

                                            <SectionText>
                                                <SectionNumber>{chapter.order}.{section.order}</SectionNumber>
                                                {section.text}
                                            </SectionText>
                                    
                                            {section.imageLocal && <ThumbnailImage src={section.imageLocal} alt={`Section ${section.order}`} />}

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
            <AddButton style={{marginTop: '20px'}} onClick={handleCreateNew} variant="outlined">New Chapter</AddButton>
        </ChapterSelectorContainer>
    );
};

export default ChapterSelector;


const AddButton = styled(Button)`
    background-color: lightgreen;
    color: purple;
    margin-top: 20px;
    margin: 0 auto;
`;

const ChapterSelectorContainer = styled.div`
  position: relative;
  width: 75%;
  display: flex;
  flex-direction: column;
  align-items: center;
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

const ActionButton = styled(Button)<{$delete?:boolean}>`
  background-color: ${props => props.$delete ? 'red' : 'lightgreen'};
  color: ${props => props.$delete ? 'white' : 'purple'};
  border: 1px solid purple;

  &:hover {
    background-color: purple;
    color: white;
  }
`;

const StyledListItem = styled(ListItem) <{ $isSelectable: boolean, $chapter?: boolean }>`
    &:hover {
        background-color: ${props => props.$isSelectable ? (props.$chapter ? 'coral' : 'green') : (props.$chapter && 'lightgrey')};
        color: ${props => props.$isSelectable && 'white'};
    }
    border-radius: ${props => props.$chapter ? '8px' : '0'};
    border: 2px solid black;
    cursor: ${props => props.$isSelectable && 'pointer'};
    padding-left: 12px;
    min-height: 60px;
    width: ${props => props.$chapter ? '100%' : '90%'};
    margin: 0 auto;
`;
