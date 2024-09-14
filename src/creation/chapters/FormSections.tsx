import React, { useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { ArrowDropDown, ArrowDropUp, Check, DragIndicator, Image, Reply, Settings, VolumeUp } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import parse from "html-react-parser";
import DOMPurify from "dompurify";
import { Chapter } from "../stores/ChapterStore";
import { ProjectSlim } from "../stores/ProjectStore";
import useScreenStore, { Screen, screenDBKey } from "../stores/ScreenStore";
import ScreenTextEditor from "../screens/ScreenTextEditor";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

interface FSProps {
  chapter: Chapter;
  screens: Screen[];
  submit: (screens: Screen[], chapter: Chapter) => void;
  activeProject: ProjectSlim;
  addImageFile: (file: File) => void;
  addScreen: () => {};
  removeScreen: (id: string) => void;
}

interface Section extends Screen {
  isZipped: boolean;
}

const FormSections: React.FC<FSProps> = ({ chapter, screens, submit, activeProject, addImageFile, addScreen, removeScreen }) => {
  const [title, setTitle] = useState<string>("");
  const [chImage, setChImage] = useState<string>("");
  const [chImageLocal, setChImageLocal] = useState<string>("");
  const [sections, setSections] = useState<Section[]>([]);
  const [colorsToUse, setColorsToUse] = useState<string[]>([]);
  const navigate = useNavigate();
  const { updateScreen, updateScreens } = useScreenStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = (e: any) => {
    e.preventDefault();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  useEffect(() => {
    if (chapter && !title) {
      setTitle(chapter.title);
    }
    if (chapter.imageLocal && !chImageLocal) {
      setChImageLocal(chapter.imageLocal);
    }
    if (screens) {
      setSections(screens.map((s) => ({ ...s, isZipped: true })));
    }
  }, [chapter, screens]);

  useEffect(() => {
    if (activeProject) {
      const fromTheme = [...colorsToUse];
      const storedColors = localStorage.getItem(`${activeProject.id}-stored-colors`);
      if (storedColors) {
        const toArray = storedColors.split(",");
        const combinedArray = [...new Set([...toArray, ...activeProject.themeColors])];
        setColorsToUse(combinedArray);
      } else {
        setColorsToUse(fromTheme);
      }
    }
  }, [activeProject]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleAddColorsToUse = (val: string) => {
    const updatedThemeColors = [...colorsToUse, val];
    if (updatedThemeColors.length > 8) {
      const copy = [...colorsToUse];
      const notThemedColors = copy.filter((c) => !activeProject.themeColors.includes(c));
      notThemedColors.shift();
      notThemedColors.push(val);
      const newCombined = [...activeProject.themeColors].concat([...notThemedColors]);
      const toStorage = newCombined.map((c) => c).join(",");
      localStorage.setItem(`${activeProject.id}-stored-colors`, toStorage);
      setColorsToUse(newCombined);
    } else {
      const toStorage = updatedThemeColors.map((c) => c).join(",");
      localStorage.setItem(`${activeProject.id}-stored-colors`, toStorage);
      setColorsToUse(updatedThemeColors);
    }
  };

  const handleSectionChange = (index: number, value: string) => {
    const newSections = [...sections];
    newSections[index].text = value;
    setSections(newSections);
  };

  const handleImageUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      addImageFile(event.target.files[0]);
      const imageUrl = URL.createObjectURL(event.target.files[0]);
      if (index === 999) {
        setChImage(`${activeProject.id}/${event.target.files[0].name}`);
        setChImageLocal(imageUrl);
        return;
      }
      const newSections = [...sections];
      newSections[index].imageLocal = imageUrl;
      newSections[index].image = `${activeProject.id}/${event.target.files[0].name}`;
      setSections(newSections);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ch = { ...chapter, title: title, image: chImage };
    submit(sections, ch);
  };

  const addReplies = (id: string) => {
    navigate(`screens/${id}`);
  };

  const onDeleteImage = async (index: number) => {
    const copySections = [...sections];
    const copySingle = copySections[index];
    copySingle.imageLocal = "";
    copySingle.image = "";
    await updateDoc(doc(db, screenDBKey, copySingle.id), { ...copySingle });
    copySections[index] = copySingle;
    setSections(copySections);
  };

  const saveScreen = (e: React.ChangeEvent<HTMLInputElement>, section: Screen) => {
    e.preventDefault();
    updateScreen(section, true);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const { source, destination } = result;
    const itemList = sections.concat();
    const [removed]: Section[] = itemList.splice(source.index, 1);
    itemList.splice(destination.index, 0, removed);
    const newScreens = itemList.map((s, idx) => ({ ...s, order: idx + 1 }));
    setSections(newScreens);
    updateScreens(newScreens);
  };

  const showToggle = (e: any, section: Section, index: number) => {
    e.preventDefault();
    const sectionCopy = { ...section };
    sectionCopy.isZipped = !sectionCopy.isZipped;
    const sectionsCopy = [...sections];
    sectionsCopy[index] = sectionCopy;
    setSections(sectionsCopy);
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <FormGroup>
        <Label htmlFor="title">Title:</Label>
        <Input type="text" id="title" value={title} onChange={handleTitleChange} />
        <ActionButtons>
          <StyledButton onClick={handleImageClick}>
            <Image />
          </StyledButton>
          <StyledButton>
            <VolumeUp />
          </StyledButton>
          <StyledButton onClick={() => navigate(`/settings/chapters/${chapter.id}`)}>
            <Settings />
          </StyledButton>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={(e) => handleImageUpload(999, e)} style={{ display: "none" }} />
          {chImageLocal && <img src={chImageLocal} style={{ width: "40px" }} />}
        </ActionButtons>
      </FormGroup>

      <SectionsContainer>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="rows">
            {(provided: any) => (
              <div ref={provided.innerRef} className="rows">
                {sections.map((section, index) => (
                  <Draggable key={`${section.id}-${index}`} draggableId={`${section.id}-${index}`} index={index}>
                    {(provided: any) => (
                      <SectionGroup
                        key={section.id + index}
                        zipped={section.isZipped}
                        style={{
                          userSelect: "none",
                          ...provided.draggableProps.style,
                        }}
                        ref={provided.innerRef}>
                        <HeaderWrapper>
                          {section.isZipped && (
                            <LeftWrapper {...provided.draggableProps} {...provided.dragHandleProps}>
                              <DragIndicator />
                            </LeftWrapper>
                          )}
                          <TextWrapper>
                            {section.isZipped ? (
                              parse(
                                DOMPurify.sanitize(section.text, {
                                  USE_PROFILES: { html: true },
                                })
                              )
                            ) : (
                              <h2 style={{ marginTop: "0", textAlign: "center" }}>Screen {index + 1}</h2>
                            )}
                          </TextWrapper>
                          <RightWrapper>
                            <StyledButton title="Settings" onClick={() => navigate(`/settings/screens/${section.id}`)}>
                              <Settings />
                            </StyledButton>
                            <StyledButton title="Test Screen" onClick={() => navigate(`/testing/${section.id}`)}>
                              <Check />
                            </StyledButton>
                            <StyledButton title="Edit Replies" onClick={() => addReplies(section.id)}>
                              <Reply />
                            </StyledButton>
                            <StyledButton title="Open Screen" onClick={(e: any) => showToggle(e, section, index)}>
                              {!section.isZipped ? <ArrowDropUp /> : <ArrowDropDown />}
                            </StyledButton>
                          </RightWrapper>
                        </HeaderWrapper>

                        <BodyWrapper zipped={section.isZipped}>
                          <ScreenTextEditor
                            value={section.text}
                            activeProject={activeProject}
                            colorsToUse={colorsToUse}
                            addColor={(val: string) => handleAddColorsToUse(val)}
                            handleChange={(val: string) => handleSectionChange(index, val)}
                          />
                          <ActionButtons>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(index, e)}
                              style={{ display: "none" }}
                              id={`upload-${index}`}
                            />
                            <ActionButton as="label" htmlFor={`upload-${index}`}>
                              Add Image
                            </ActionButton>
                            <ActionButton type="button">Add Sound</ActionButton>
                            <RemoveButton type="button" onClick={() => removeScreen(section.id)}>
                              <DeleteIcon />
                            </RemoveButton>
                            <ActionButton isSave={true} onClick={(e: any) => saveScreen(e, section)}>
                              SAVE
                            </ActionButton>
                          </ActionButtons>
                          <ImageList>
                            {section.imageLocal && (
                              <ImageContainer>
                                <StyledImg src={section.imageLocal} alt={`Section ${index + 1} Image`} />
                                <DeleteButton onClick={() => onDeleteImage(index)}>
                                  <DeleteIcon />
                                </DeleteButton>
                              </ImageContainer>
                            )}
                          </ImageList>
                        </BodyWrapper>
                      </SectionGroup>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <AddButton type="button" onClick={addScreen}>
          <AddIcon />
        </AddButton>
      </SectionsContainer>

      <SubmitButton type="submit">Submit</SubmitButton>
    </FormContainer>
  );
};

export default FormSections;

const FormContainer = styled.form`
  max-width: 800px;
  width: 700px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
`;

const HeaderWrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: flex-start;
  max-height: 50px;
`;

const LeftWrapper = styled.div`
  background-color: purple;
  width: 30px;
  height: 47px;
  border-radius: 10px;
  margin-right: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
`;

const TextWrapper = styled.div`
  width: 400px;
  overflow: hidden;
  height: 100%;
`;

const RightWrapper = styled.div`
  width: 200px;
  display: flex;
  justify-content: flex-end;
`;

const BodyWrapper = styled.div<{ zipped: boolean }>`
  display: ${(props) => (props.zipped ? "none" : "block")};
`;

const StyledButton = styled.button`
  background-color: lightgray;
  display: flex;
  justify-content: center;
  border: 1px solid coral;
  padding: 4px;
  margin: 7px 2px 2px;
  width: 33.45px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: bold;
  margin-bottom: 8px;
`;

const Input = styled.input`
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const SectionsContainer = styled.div`
  margin-bottom: 20px;
  width: 700px;
`;

const SectionGroup = styled.div<{ zipped: boolean }>`
  background-color: #e6e6e6;
  width: 650px;
  max-width: 650px;
  padding: ${(props) => (props.zipped ? "5px 15px 5px" : "15px 15px 30px")};
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: height 0.5s ease-in-out;
  overflow: hidden;
  height: ${(props) => (props.zipped ? "44px" : "450px")};
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 10px;
`;

const Button = styled.button`
  padding: 10px 15px;
  font-size: 14px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
`;

const ActionButton = styled(Button)<{ isSave?: boolean }>`
  background-color: ${(props) => (props.isSave ? "green" : "purple")};
  color: white;

  &:hover {
    background-color: #138496;
  }
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

const AddButton = styled(Button)`
  background-color: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;

  &:hover {
    background-color: #0056b3;
  }
`;

const SubmitButton = styled(Button)`
  background-color: #28a745;
  color: white;
  width: 200px;
  margin: 0 auto;

  &:hover {
    background-color: #218838;
  }
`;

const ImageList = styled.div`
  margin-top: 10px;
`;

const ImageContainer = styled.div`
  position: relative;
  display: inline-block;
  width: 150px;
  height: 150px;

  &:hover button {
    display: block;
  }
`;

const StyledImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
`;

const DeleteButton = styled.button`
  display: none;
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(255, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  padding: 5px;
  font-size: 16px;

  &:hover {
    background-color: rgba(255, 0, 0, 1);
  }
`;
