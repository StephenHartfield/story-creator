import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import FormSections from "../chapters/FormSections";
import { ProjectSlim } from "./Projects"
import { Chapter, chapterDBKey } from "./Chapters";
import { db, storage } from "../../firebaseConfig";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import styled from '@emotion/styled';
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

export interface Screen {
    id: string;
    order: number;
    text: string;
    image?: string;
    imageLocal?: string;
    replies?: any;
    chapterId: string;
}

export const screenDBKey = 'screens';

interface SingleChapterProps {
    activeProject: ProjectSlim | undefined;
}
const SingleChapter: React.FC<SingleChapterProps> = ({ activeProject }) => {
    const { chapterId } = useParams<{ chapterId: string }>();
    const [chapter, setChapter] = useState<Chapter>();
    const [screens, setScreens] = useState<Screen[]>([]);
    const [imagesToUpload, setImagesToUpload] = useState<File[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (chapterId && activeProject?.id) {
            getChapterById();
        }
    }, [activeProject]);

    const getChapterById = async () => {
        if (chapterId) {
            try {
                const chapterRef = doc(db, chapterDBKey, chapterId);
                const chapterSnap = await getDoc(chapterRef);

                if (chapterSnap.exists()) {
                    let chapterData: any = {};
                    if (chapterSnap.data().image) {
                        const fileRef = ref(storage, chapterSnap.data().image);
                        const url = await getDownloadURL(fileRef);
                        chapterData = { ...chapterSnap.data(), id: chapterSnap.id, imageLocal: url };
                    } else {
                        chapterData = { id: chapterSnap.id, ...chapterSnap.data() };
                    }
                    setChapter(chapterData as Chapter);
                    try {
                        const q = query(collection(db, screenDBKey), where("chapterId", "==", chapterData.id));
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
                        } else {
                            addScreen();
                        }
                    } catch (e) {
                        console.error('Error fetching related screens ' + e);
                    }
                } else {
                    console.log('No such chapter found!');
                }
            } catch (error) {
                console.error('Error fetching chapter:', error);
            }
        }
    };

    const submitData = async (scrns: Screen[], c: Chapter) => {
        scrns.forEach(s => s.imageLocal='');
        try {
            await updateDoc(doc(db, chapterDBKey, c.id), { ...c });
            scrns.forEach(async (s) => {
                if (s.id) {
                    await updateDoc(doc(db, screenDBKey, s.id), { ...s });
                } else {
                    console.error('no id found on section!');
                    console.error(s)
                }
            })
            if (imagesToUpload.length) {
                try {
                    imagesToUpload.forEach(im => {
                        const storageRef = ref(storage, `${activeProject?.id}/${im.name}`);
                        const uploadTask = uploadBytesResumable(storageRef, im);
                        // setShowProgressPercent(true);
                        uploadTask.on("state_changed",
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
                                    navigate('/chapters');
                                });
                            }
                        );
                    })
                } catch (e) {
                    console.error("Error uploading Image");
                }
            } else {
                navigate('/chapters');
            }
        } catch (e) {
            console.error(e);
        }
    }

    const addScreen = async () => {
        const newScreen = { text: '', chapterId: chapter?.id, order: screens.length + 1 };
        const screenData = await addDoc(collection(db, screenDBKey), newScreen);
        const ret = await getDoc(screenData);
        const s = { ...ret.data(), id: ret.id };
        setScreens([...screens, s as Screen]);
    }

    const removeScreen = async (id: string) => {
        const userConfirmed = window.confirm('Are you sure you want to delete this screen?');

        if (userConfirmed) {
            try {
                const screenRef = doc(db, screenDBKey, id);
                await deleteDoc(screenRef);
                const screensCopy = [...screens];
                const filtered = screensCopy.filter(s => s.id !== id);
                filtered.forEach(async (s, idx) => await updateScreenOrder(s, idx));
                setScreens(filtered);
                console.log(`Screen ${id} deleted.`);
            } catch (e) {
                console.error(e);
            }
        }
    }

    const updateScreenOrder = async (s: Screen, idx: number) => {
        s.order = idx + 1;
        await updateDoc(doc(db, screenDBKey, s.id), { ...s });
    }

    const handleImageUploadAdd = (file: File) => {
        const files = [...imagesToUpload];
        files.push(file);
        setImagesToUpload(files);
    }

    return (
        <>
            <StyledLink to="/chapters">Back to List</StyledLink>
            {chapter && activeProject && <FormSections
                addScreen={addScreen}
                addImageFile={(file: File) => handleImageUploadAdd(file)}
                removeScreen={(id: string) => removeScreen(id)}
                activeProject={activeProject}
                submit={(screens: Screen[], chapter: Chapter) => submitData(screens, chapter)}
                screens={screens}
                chapter={chapter} />}
        </>
    )
}

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