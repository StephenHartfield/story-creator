import React, { useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import AddIcon from "@mui/icons-material/Add";
import { Image, Settings, VolumeUp } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import useChapterStore, { Chapter } from "../stores/ChapterStore";
import { ProjectSlim } from "../stores/ProjectStore";
import useScreenStore, { Screen } from "../stores/ScreenStore";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import SingleScreenEdit from "../screens/SingleScreenEdit";
import ImagePopover from "../screens/ImagePopover";
import { Box, Modal } from "@mui/material";
import SingleScreen from "../routes/SingleScreen";

interface FSProps {
  chapter: Chapter;
  submit: (screens: Screen[], chapter: Chapter) => void;
  activeProject: ProjectSlim;
  addImageFile: (file: File) => void;
  addScreen: () => {};
}

const FormSections: React.FC<FSProps> = ({ chapter, submit, activeProject, addImageFile, addScreen }) => {
  const [title, setTitle] = useState<string>("");
  const [chImage, setChImage] = useState<string>("");
  const [chImageLocal, setChImageLocal] = useState<string>("");
  const [sections, setSections] = useState<Screen[]>([]);
  const [singleScreenId, setSingleScreenId] = useState<string>();
  const [showScreenModal, setShowScreenModal] = useState<boolean>(false);
  const navigate = useNavigate();
  const { screens, getScreensByChapterId, updateScreens } = useScreenStore();
  const { updateChapter } = useChapterStore();
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
      const getScreens = async () => {
        const filtered = await getScreensByChapterId(chapter.id);
        if (filtered) {
          setSections(filtered);
        }
      };
      getScreens();
    }
  }, [chapter, screens]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
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
    }
  };

  const toggleShowScreen = (sectionId?: string) => {
    setSingleScreenId(sectionId);
    setShowScreenModal(!showScreenModal);
  };

  const deleteChImage = () => {
    setChImage("");
    setChImageLocal("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ch = { ...chapter, title: title, image: chImage };
    submit(sections, ch);
  };

  const saveChapter = () => {
    const ch = { ...chapter, title: title, image: chImage, imageLocal: chImageLocal };
    updateChapter(ch);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const { source, destination } = result;
    const itemList = sections.concat();
    const [removed]: Screen[] = itemList.splice(source.index, 1);
    itemList.splice(destination.index, 0, removed);
    const newScreens = itemList.map((s, idx) => ({ ...s, order: idx + 1 }));
    setSections(newScreens);
    updateScreens(newScreens);
  };

  return (
    <>
      <FormContainer>
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
            {chImageLocal && <ImagePopover deleteImageHandle={deleteChImage} imageSrc={chImageLocal} />}
            <ActionButton isSave={true} onClick={saveChapter}>
              SAVE
            </ActionButton>
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
                        <div
                          style={{
                            userSelect: "none",
                            ...provided.draggableProps.style,
                          }}
                          ref={provided.innerRef}
                          {...provided.draggableProps}>
                          <SingleScreenEdit
                            toggleShowScreen={() => toggleShowScreen(section.id)}
                            key={`${section.id}-${index}`}
                            dragHandleProps={provided.dragHandleProps}
                            screen={section}
                            index={index}
                            addImageFile={addImageFile}
                          />
                        </div>
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

        <SubmitButton onClick={handleSubmit}>Save All</SubmitButton>
      </FormContainer>
      {singleScreenId && (
        <Modal open={showScreenModal} onClose={toggleShowScreen} aria-labelledby="modal-title" aria-describedby="modal-description">
          <Box sx={style}>
            <SingleScreen toggleShowScreen={toggleShowScreen} screenId={singleScreenId} chapterId={chapter.id} />
          </Box>
        </Modal>
      )}
    </>
  );
};

export default FormSections;

const style = {
  position: "absolute" as "absolute",
  top: "55%",
  left: "58%",
  transform: "translate(-50%, -50%)",
  width: "auto",
  height: 450,
  padding: "30px 70px",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "8px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

const FormContainer = styled.div`
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
