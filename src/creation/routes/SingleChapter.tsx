import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import FormSections from "../chapters/FormSections";
import { ProjectSlim } from "./Projects"
import { Chapter, chapterDBKey } from "./Chapters";
import { db } from "../../firebaseConfig";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import styled from '@emotion/styled';

export interface Screen {
    id: string;
    order: number;
    text: string;
    image?: string;
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
    const navigate = useNavigate();

    useEffect(() => {
        if (chapterId) {
            getChapterById();
        }
    }, [chapterId]);

    const getChapterById = async () => {
        if (chapterId) {
            try {
                const chapterRef = doc(db, chapterDBKey, chapterId);
                const chapterSnap = await getDoc(chapterRef);

                if (chapterSnap.exists()) {
                    const chapterData = { id: chapterSnap.id, ...chapterSnap.data() };
                    setChapter(chapterData as Chapter);
                    try {
                        const q = query(collection(db, screenDBKey), where("chapterId", "==", chapterData.id));
                        const querySnapshot = await getDocs(q);
                        const screensList = querySnapshot.docs.map((doc) => ({
                            id: doc.id,
                            ...doc.data(),
                        })) as Screen[];
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
        try {
            await updateDoc(doc(db, chapterDBKey, c.id), {...c});
            scrns.forEach( async (s) => {
                if ( s.id ) {
                    await updateDoc(doc(db, screenDBKey, s.id), {...s});
                } else {
                    // await addDoc(collection(db, screenDBKey), s);
                    console.error('no id found on section!');
                    console.error(s)
                }
            })
            navigate('/chapters');
        } catch (e) {
            console.error(e);
        }
    }

    const addScreen = async() => {
        const newScreen = {text: '', chapterId: chapter?.id, order: screens.length + 1};
        const screenData = await addDoc(collection(db, screenDBKey), newScreen);
        const ret = await getDoc(screenData);
        const s = {...ret.data(), id: ret.id};
        setScreens([...screens, s as Screen ]);
    }

    const removeScreen = async(id: string) => {
        const userConfirmed = window.confirm('Are you sure you want to delete this screen?');

        if (userConfirmed) {
            try {
                const screenRef = doc(db, screenDBKey, id);
                await deleteDoc(screenRef);
                const screensCopy = [...screens];
                const filtered = screensCopy.filter(s => s.id !== id);
                filtered.forEach( async(s, idx) => await updateScreenOrder(s, idx));
                setScreens(filtered);
                console.log(`Screen ${id} deleted.`);
            } catch (e) {
                console.error(e);
            }
        }
    }

    const updateScreenOrder = async( s: Screen, idx: number ) => {
        s.order = idx + 1;
        await updateDoc(doc(db, screenDBKey, s.id), {...s});
    }

    return (
        <>
            <StyledLink to="/chapters">Back to List</StyledLink>
            {chapter && <FormSections
                addScreen={addScreen}
                removeScreen={(id: string) => removeScreen(id)}
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