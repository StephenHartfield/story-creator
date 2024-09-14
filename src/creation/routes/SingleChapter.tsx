import FormSections from "../chapters/FormSections";
import { storage } from "../../firebaseConfig";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import useProjectStore from "../stores/ProjectStore";
import useChapterStore, { Chapter } from "../stores/ChapterStore";
import useScreenStore, { Screen } from "../stores/ScreenStore";

const SingleChapter: React.FC = () => {
  const [chapter, setChapter] = useState<Chapter>();
  const [screens, setScreens] = useState<Screen[]>([]);
  const [imagesToUpload, setImagesToUpload] = useState<File[]>([]);
  const navigate = useNavigate();
  const { chapterId } = useParams<{ chapterId: string }>();
  const { activeProject } = useProjectStore();
  const { getChapterById, updateChapter } = useChapterStore();
  const { getScreensByChapterId, addScreen, deleteScreen, updateScreens } = useScreenStore();

  useEffect(() => {
    if (activeProject?.id) {
      getData();
    }
  }, []);

  const getData = async () => {
    if (chapterId) {
      const sChapter = await getChapterById(chapterId);
      if (sChapter) {
        setChapter(sChapter);
        const screens = await getScreensByChapterId(chapterId);
        if (!screens.length) {
          addScreenHandle();
        } else {
          setScreens(screens);
        }
      } else {
        console.log("No such chapter found!");
      }
    }
  };

  const submitData = async (scrns: Screen[], c: Chapter) => {
    try {
      updateChapter(c);
      updateScreens(scrns);
      if (imagesToUpload.length) {
        try {
          imagesToUpload.forEach((im) => {
            const storageRef = ref(storage, `${activeProject?.id}/${im.name}`);
            const uploadTask = uploadBytesResumable(storageRef, im);
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
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                  // setShowProgressPercent(false);
                  navigate("/chapters");
                });
              }
            );
          });
        } catch (e) {
          console.error("Error uploading Image");
        }
      } else {
        navigate("/chapters");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addScreenHandle = async () => {
    const newScreen: any = { text: "", chapterId: chapterId, projectId: activeProject?.id, order: screens.length + 1 };
    console.log(newScreen);
    await addScreen(newScreen);
    const newScreens = await getScreensByChapterId(newScreen.chapterId);
    console.log(newScreens);
    setScreens(newScreens);
  };

  const removeScreen = async (id: string) => {
    const userConfirmed = window.confirm("Are you sure you want to delete this screen?");
    if (userConfirmed && chapterId) {
      await deleteScreen(id, chapterId);
      const screenCopy = await getScreensByChapterId(chapterId);
      setScreens(screenCopy);
    }
  };

  const handleImageUploadAdd = (file: File) => {
    const files = [...imagesToUpload];
    files.push(file);
    setImagesToUpload(files);
  };

  return (
    <>
      <StyledLink to="/chapters">Back to List</StyledLink>
      {chapter && activeProject && (
        <FormSections
          addScreen={addScreenHandle}
          addImageFile={(file: File) => handleImageUploadAdd(file)}
          removeScreen={(id: string) => removeScreen(id)}
          activeProject={activeProject}
          submit={(screens: Screen[], chapter: Chapter) => submitData(screens, chapter)}
          screens={screens}
          chapter={chapter}
        />
      )}
    </>
  );
};

export default SingleChapter;

const StyledLink = styled(Link)`
  background-color: coral;
  border: 2px solid lightgreen;
  color: white !important;
  border-radius: 8px;
  width: 150px;
  padding: 10px 25px;
  text-align: center;
  margin-bottom: 20px;
  &:hover {
    background-color: lightgreen;
    border-color: coral;
  }
`;
