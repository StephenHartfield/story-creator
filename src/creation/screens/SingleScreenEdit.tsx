import React, { useEffect, useState } from "react";
import { ArrowDropDown, ArrowDropUp, Check, Reply, Settings } from "@mui/icons-material";
import "@rc-component/color-picker/assets/index.css";
import { Button } from "@mui/material";
import styled from "@emotion/styled";
import useProjectStore from "../stores/ProjectStore";
import DeleteIcon from "@mui/icons-material/Delete";
import parse from "html-react-parser";
import DOMPurify from "dompurify";
import ScreenTextEditor from "./ScreenTextEditor";
import { useNavigate } from "react-router-dom";
import useReferenceStore, { Reference } from "../stores/ReferenceStore";
import useScreenStore, { Screen } from "../stores/ScreenStore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../../firebaseConfig";

interface Data {
  id: string;
  text: string;
  imageLocal?: string;
  type: "reference" | "screen";
}

interface EditorProps {
  index: number;
  colorsToUse: string[];
  handleAddColorsToUse: (val: string) => void;
  addImageFile?: (file: File) => void;
  reference?: Reference;
  screen?: Screen;
}

const SingleScreenEdit: React.FC<EditorProps> = ({ index, colorsToUse, handleAddColorsToUse, addImageFile, reference, screen }) => {
  const [dataToUse, setDataToUse] = useState<Data>();
  const [isZipped, setIsZipped] = useState<boolean>(true);
  const [imageToUpload, setImageToUpload] = useState<File>();
  const { activeProject } = useProjectStore();
  const { updateReference, deleteReference } = useReferenceStore();
  const { updateScreen, deleteScreen } = useScreenStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (reference?.id) {
      setDataToUse({ ...reference, type: "reference" });
    } else if (screen?.id) {
      setDataToUse({ ...screen, type: "screen" });
    }
  }, [reference, screen]);

  const handleChange = (key: "imageLocal" | "image" | "text", value: string) => {
    if (reference?.id) {
      const refCopy = { ...reference, [key]: value };
      updateReference(refCopy);
    } else if (screen?.id) {
      const scrnCopy = { ...screen, [key]: value };
      updateScreen(scrnCopy);
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
      } else {
        setImageToUpload(event.target.files[0]);
      }
      const imageUrl = URL.createObjectURL(event.target.files[0]);
      handleChange("imageLocal", imageUrl);
      handleChange("image", `${activeProject?.id}/${event.target.files[0].name}`);
    }
  };

  const saveHandle = async () => {
    if (reference?.id) {
      updateReference(reference, true);
    } else if (screen?.id) {
      updateScreen(screen, true);
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
      <SectionGroup zipped={isZipped}>
        <HeaderWrapper>
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
          <RightWrapper>
            <StyledButton title="Settings" onClick={() => navigate(`/settings/screens/${dataToUse.id}`)}>
              <Settings />
            </StyledButton>
            <StyledButton title="Test Screen" onClick={() => navigate(`/testing/${dataToUse.id}`)}>
              <Check />
            </StyledButton>
            <StyledButton title="Edit Replies" onClick={() => navigate(`screens/${dataToUse.id}`)}>
              <Reply />
            </StyledButton>
            <StyledButton title="Open Screen" onClick={() => setIsZipped(!isZipped)}>
              {!isZipped ? <ArrowDropUp /> : <ArrowDropDown />}
            </StyledButton>
          </RightWrapper>
        </HeaderWrapper>

        <BodyWrapper zipped={isZipped}>
          <ScreenTextEditor
            value={dataToUse.text}
            activeProject={activeProject}
            colorsToUse={colorsToUse}
            addColor={(val: string) => handleAddColorsToUse(val)}
            handleChange={(val: string) => handleSectionChange(val)}
          />
          <ActionButtons>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e)} style={{ display: "none" }} id={`upload-${index}`} />
            <ActionButton as="label" htmlFor={`upload-${index}`}>
              Add Image
            </ActionButton>
            <ActionButton type="button">Add Sound</ActionButton>
            <RemoveButton type="button" onClick={removeHandle}>
              <DeleteIcon />
            </RemoveButton>
            <ActionButton isSave={true} onClick={saveHandle}>
              SAVE
            </ActionButton>
          </ActionButtons>
          <ImageList>
            {dataToUse.imageLocal && (
              <ImageContainer>
                <StyledImg src={dataToUse.imageLocal} alt={`Section ${index + 1} Image`} />
                <DeleteButton onClick={deleteImageHandle}>
                  <DeleteIcon />
                </DeleteButton>
              </ImageContainer>
            )}
          </ImageList>
        </BodyWrapper>
      </SectionGroup>
    );
  }
};

export default SingleScreenEdit;

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

const BButton = styled.button`
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
