import React, { useState } from "react";
import { IconButton, List, ListItem, ListItemText, Collapse, Button } from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ReplyIcon from "@mui/icons-material/StarRate";
import styled from "@emotion/styled";
import { useNavigate } from "react-router-dom";
import parse from "html-react-parser";
import DOMPurify from "dompurify";
import { Chapter } from "../stores/ChapterStore";
import { ProjectSlim } from "../stores/ProjectStore";
import useScreenStore, { Screen } from "../stores/ScreenStore";

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
  const { getScreensByChapterId } = useScreenStore();

  const toggleChapter = async (index: number) => {
    if (openChapters.includes(index)) {
      setOpenChapters(openChapters.filter((i) => i !== index));
    } else {
      setOpenChapters([...openChapters, index]);
      try {
        const screens: Screen[] = await getScreensByChapterId(props.chapters[index].id);
        setScreens(screens);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const editChapter = (id: string) => {
    navigate(id);
  };

  const deleteChapter = (id: string) => {
    if (props.deleteChapter) {
      props.deleteChapter(id);
    }
  };

  const handleSectionClick = (sectionId: string | undefined) => {
    if (sectionId) {
      if (props.isSelectingSection) {
        props.setSelectionId(sectionId);
      }
      console.log(`Section ID: ${sectionId}`);
    }
  };

  const handleCreateNew = async () => {
    if (props.createChapter) {
      props.createChapter();
    }
  };

  return (
    <ChapterSelectorContainer>
      {props.activeProject && <h2 style={{ textAlign: "center" }}>{props.activeProject?.title}</h2>}

      {/* Chapter list that opens relative to the button */}
      <ChaptersContainer>
        {props.chapters.length ? (
          <List>
            {props.chapters.map((chapter, index) => (
              <div key={"chapter-" + index}>
                {/* ListItem for each chapter */}
                <StyledListItem $chapter $isSelectable={props.isSelectingChapter} onClick={() => toggleChapter(index)}>
                  <ListItemText primary={chapter.title || "No title"} />
                  {props.isSelectingChapter && openChapters.includes(index) && (
                    <>
                      <ActionButton onClick={() => editChapter(chapter.id)}>EDIT</ActionButton>
                      <ActionButton $delete onClick={() => deleteChapter(chapter.id)}>
                        DELETE
                      </ActionButton>
                    </>
                  )}
                  {openChapters.includes(index) ? <ExpandLess /> : <ExpandMore />}
                </StyledListItem>

                {/* Collapsible List for sections */}
                <Collapse in={openChapters.includes(index)} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {screens.length &&
                      screens.map((section, secIndex) => (
                        <StyledListItem key={"section-" + secIndex} $isSelectable={props.isSelectingSection} onClick={() => handleSectionClick(section.id)}>
                          <SectionText>
                            <SectionNumber>
                              {chapter.order}.{section.order}
                            </SectionNumber>
                            {parse(DOMPurify.sanitize(section.text, { USE_PROFILES: { html: true } }))}
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
          </List>
        ) : (
          <SectionText>No Chapters to Display</SectionText>
        )}
      </ChaptersContainer>
      {!props.isSelectingSection && (
        <AddButton style={{ marginTop: "20px" }} onClick={handleCreateNew} variant="outlined">
          New Chapter
        </AddButton>
      )}
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
  height: 450px;
  overflow-y: scroll;
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
  max-height: 40px;
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

const ActionButton = styled(Button, { shouldForwardProp: (prop) => prop !== "$delete" })<{ $delete?: boolean }>`
  background-color: ${(props) => (props.$delete ? "red" : "lightgreen")};
  color: ${(props) => (props.$delete ? "white" : "purple")};
  border: 1px solid purple;

  &:hover {
    background-color: purple;
    color: white;
  }
`;

const StyledListItem = styled(ListItem, { shouldForwardProp: (prop) => prop !== "$isSelectable" && prop !== "$chapter" })<{
  $isSelectable: boolean;
  $chapter?: boolean;
}>`
  &:hover {
    background-color: ${(props) => (props.$isSelectable ? (props.$chapter ? "coral" : "green") : props.$chapter && "lightgrey")};
    color: ${(props) => props.$isSelectable && "white"};
  }
  border-radius: ${(props) => (props.$chapter ? "8px" : "0")};
  border: 2px solid black;
  cursor: ${(props) => props.$isSelectable && "pointer"};
  padding-left: 12px;
  min-height: 60px;
  width: ${(props) => (props.$chapter ? "100%" : "90%")};
  margin: 0 auto;
`;
