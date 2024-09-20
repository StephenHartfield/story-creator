import React, { useEffect, useState } from "react";
import { ArrowDropDown, ArrowDropUp, Check, DragIndicator, Reply, Settings } from "@mui/icons-material";
import "@rc-component/color-picker/assets/index.css";
import { Box, Button, colors, Modal } from "@mui/material";
import styled from "@emotion/styled";
import useProjectStore from "../stores/ProjectStore";
import DeleteIcon from "@mui/icons-material/Delete";
import parse from "html-react-parser";
import DOMPurify from "dompurify";
import ScreenTextEditor from "./ScreenTextEditor";
import { useNavigate } from "react-router-dom";
import useReferenceStore, { Reference } from "../stores/ReferenceStore";
import useScreenStore, { Screen } from "../stores/ScreenStore";
import { ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../../firebaseConfig";
import ReferenceRequirement, { ReferRequirement } from "./ReferenceRequirement";
import AddOnsPopover from "./AddOnsPopover";
import ImagePopover from "./ImagePopover";
import RequirementsPopover from "./RequirementsPopover";
import useColorService from "../services/ColorsService";

interface Data {
  id: string;
  text: string;
  title?: string;
  imageLocal?: string;
  requirements?: ReferRequirement[];
  type: "reference" | "screen";
}

type Key = "image" | "imageLocal" | "text" | "title";

interface EditorProps {
  toggleShowScreen: () => void;
  index: number;
  dragHandleProps: any;
  addImageFile?: (file: File) => void;
  reference?: Reference;
  screen?: Screen;
}

const SingleScreenEdit: React.FC<EditorProps> = ({ toggleShowScreen, index, dragHandleProps, addImageFile, reference, screen }) => {
  const [dataToUse, setDataToUse] = useState<Data>();
  const [isZipped, setIsZipped] = useState<boolean>(true);
  const [imageToUpload, setImageToUpload] = useState<File>();
  const [chapterSelectorOpen, setChapterSelectorOpen] = useState<boolean>(false);
  const { activeProject } = useProjectStore();
  const { updateReference, deleteReference, saveReference } = useReferenceStore();
  const { updateScreen, deleteScreen, saveScreen } = useScreenStore();
  const navigate = useNavigate();
  const { colors, addColor } = useColorService();

  useEffect(() => {
    if (reference?.id) {
      setDataToUse({ ...reference, type: "reference" });
    } else if (screen?.id) {
      setDataToUse({ ...screen, type: "screen" });
    }
  }, [reference, screen]);

  const handleChange = (key: Key, value: string) => {
    if (reference?.id) {
      updateReference(key, value, reference.id);
    } else if (screen?.id) {
      updateScreen(key, value, screen.id);
    }
  };

  const handleSectionChange = (val: string) => {
    handleChange("text", val);
  };

  const removeHandle = () => {
    const userConfirmed = window.confirm("Are you sure you want to delete?");
    if (userConfirmed) {
      if (reference?.id) {
        deleteReference(reference.id);
      } else if (screen?.id) {
        deleteScreen(screen.id, screen.chapterId);
      }
    }
  };

  const deleteImageHandle = () => {
    handleChange("imageLocal", "");
    handleChange("image", "");
    // removing image from storage should be done elsewhere.
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      if (addImageFile) {
        addImageFile(event.target.files[0]);
      }
      setImageToUpload(event.target.files[0]);
      const imageUrl = URL.createObjectURL(event.target.files[0]);
      if (event.target.files) {
        handleChange("imageLocal", imageUrl);
        handleChange("image", `${activeProject?.id}/${event.target.files[0].name}`);
      }
    }
  };
  const updateRequirement = (requirement: ReferRequirement) => {
    if (reference?.id) {
      const refCopy = { ...reference };
      const reqCopy = refCopy.requirements || [];
      reqCopy.push(requirement);
      updateReference("requirements", reqCopy, reference.id);
      toggleRequirementsPopup();
    }
  };

  const toggleRequirementsPopup = async () => {
    setChapterSelectorOpen(!chapterSelectorOpen);
  };

  const handleAddColorsToUse = (val: string) => {
    if (activeProject?.id) {
      addColor(activeProject, val);
    }
  };

  const saveHandle = async () => {
    if (reference?.id) {
      saveReference(reference);
    } else if (screen?.id) {
      saveScreen(screen);
    }
    if (imageToUpload) {
      try {
        const storageRef = ref(storage, `${activeProject?.id}/${imageToUpload.name}`);
        const uploadTask = uploadBytesResumable(storageRef, imageToUpload);
        // setShowProgressPercent(true);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            // setProgresspercent(progress);
          },
          (error) => {
            alert(error);
          },
          () => {
            console.log(`uploaded image ${imageToUpload.name}`);
          }
        );
      } catch (e) {
        console.error("Error uploading Image");
      }
    }
  };

  if (dataToUse?.id && activeProject) {
    return (
      <>
        <SectionGroup zipped={isZipped}>
          <HeaderWrapper>
            {isZipped ? (
              <LeftWrapper {...dragHandleProps}>
                <DragIndicator />
              </LeftWrapper>
            ) : (
              <div style={{ width: "50px", height: "50px" }}></div>
            )}
            {screen?.id ? (
              <TextWrapper>
                {isZipped ? (
                  parse(
                    DOMPurify.sanitize(dataToUse.text, {
                      USE_PROFILES: { html: true },
                    })
                  )
                ) : (
                  <h2 style={{ marginTop: "0", textAlign: "center" }}>Screen {index + 1}</h2>
                )}
              </TextWrapper>
            ) : (
              <TextWrapperTitle>
                <TitleInput value={dataToUse.title} type="text" placeholder="Title" onChange={(e) => handleChange("title", e.target.value)} />
              </TextWrapperTitle>
            )}
            <RightWrapper>
              <StyledButton title="Settings" onClick={() => navigate(`/settings/screens/${dataToUse.id}`)}>
                <Settings />
              </StyledButton>
              <StyledButton title="Test Screen" onClick={() => navigate(`/testing/${dataToUse.id}`)}>
                <Check />
              </StyledButton>
              {screen?.id && (
                <StyledButton title="Edit Replies" onClick={toggleShowScreen}>
                  <Reply />
                </StyledButton>
              )}
              <StyledButton title="Open Screen" onClick={() => setIsZipped(!isZipped)}>
                {!isZipped ? <ArrowDropUp /> : <ArrowDropDown />}
              </StyledButton>
            </RightWrapper>
          </HeaderWrapper>

          <BodyWrapper zipped={isZipped}>
            <ScreenTextEditor
              value={dataToUse.text}
              colorsToUse={colors}
              isZipped={isZipped}
              addColor={(val: string) => handleAddColorsToUse(val)}
              handleChange={(val: string) => handleSectionChange(val)}
            />
            <ActionButtons>
              <div>
                <AddOnsPopover handleImageUpload={handleImageUpload} toggleRequirementsPopup={toggleRequirementsPopup} reference={reference} />
                {dataToUse.imageLocal && <ImagePopover imageSrc={dataToUse.imageLocal} deleteImageHandle={deleteImageHandle} />}
                {dataToUse.requirements?.length ? <RequirementsPopover requirements={dataToUse.requirements} /> : null}
              </div>
              <div>
                <RemoveButton type="button" onClick={removeHandle}>
                  <DeleteIcon />
                </RemoveButton>
                <ActionButton isSave={true} onClick={saveHandle}>
                  SAVE
                </ActionButton>
              </div>
            </ActionButtons>
          </BodyWrapper>
        </SectionGroup>
        <Modal open={chapterSelectorOpen} onClose={toggleRequirementsPopup} aria-labelledby="modal-title" aria-describedby="modal-description">
          <Box sx={style}>
            <h2>How User Gets Access</h2>
            <ReferenceRequirement addRequirement={updateRequirement}></ReferenceRequirement>
          </Box>
        </Modal>
      </>
    );
  }
};

export default SingleScreenEdit;

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "8px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

const HeaderWrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
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
  height: 40px;
`;

const TextWrapperTitle = styled.div`
  width: 400px;
  overflow: hidden;
  height: 40px;
  display: flex;
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

const TitleInput = styled.input`
  font-size: 22px;
`;

const SectionGroup = styled.div<{ zipped: boolean }>`
  background-color: #e6e6e6;
  width: 650px;
  max-width: 650px;
  padding: ${(props) => (props.zipped ? "5px 15px 5px" : "5px 15px 30px")};
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: height 0.5s ease-in-out;
  overflow: hidden;
  height: ${(props) => (props.zipped ? "44px" : "460px")};
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 10px;
  margin-top: 10px;
  div {
    display: flex;
    button {
      margin: 0 5px;
    }
  }
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
