import { useEffect, useState } from "react";
import ChapterSelector from "../chapters/ChapterSelector";
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import Loading from "../../Loading";
import { ProjectSlim } from "./Projects";
import { useNavigate } from "react-router-dom";

export interface Chapter {
    id: string;
    title: string;
    order: number;
    screens?: PageSimple[];
    background?: string;
}

export interface PageSimple {
    text: string;
    image?: string;
    replies?: boolean;
    id: string;
    number: number;
}

export const chapterDBKey = 'chapters';

interface ChaptersProps {
    activeProject: ProjectSlim | undefined;
    userId: string;
}

const Chapters: React.FC<ChaptersProps> = ({ activeProject, userId }) => {
    const [selectedChapter, setSelectedChapter] = useState<string>('');
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchChapters = async () => {
            try {
                const q = query(collection(db, chapterDBKey), where("projectId", "==", activeProject?.id));
                const querySnapshot = await getDocs(q);
                const chaptersList = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Chapter[];
                setChapters(chaptersList);
                setIsLoading(false);
            } catch (e) {
                console.error(e);
                setIsLoading(false);
            }
        };
        if (activeProject) {
            setIsLoading(true);
            fetchChapters();
        }
    }, [activeProject]);

    const deleteChapter = async (id: string) => {
        if ( !userId ) {
            console.error('Not logged in');
            return;
        }
        const userConfirmed = window.confirm('Are you sure you want to delete this chapter?');

        if (userConfirmed) {
            try {
                const chapterRef = doc(db, chapterDBKey, id);
                await deleteDoc(chapterRef);
                const chaptersCopy = [...chapters];
                const filtered = chaptersCopy.filter(c => c.id !== id);
                filtered.forEach( async(c, idx) => await updateChapterOrder(c, idx));
                setChapters(filtered);
                console.log(`Chapter ${id} deleted.`);
            } catch (e) {
                console.error(e);
            }
        } else {
            console.log('Chapter deletion canceled.');
        }
    }

    const updateChapterOrder = async( ch: Chapter, idx: number ) => {
        ch.order = idx + 1;
        await updateDoc(doc(db, chapterDBKey, ch.id), {...ch});
    }

    const createChapter = async () => {
        if ( !userId ) {
            console.error('Not logged in');
            return;
        }
        const newChapter = {
            title: '',
            order: chapters.length + 1,
            sound: '',
            background: '',
            screens: [],
            projectId: activeProject?.id,
            userId: userId
        }
        const addedChapter = await addDoc(collection(db, chapterDBKey), newChapter);
        navigate(addedChapter.id);
    }

    return (
        <>
            <Loading isLoading={isLoading} />
            {activeProject ? !isLoading && (
                <ChapterSelector deleteChapter={(id) => deleteChapter(id)}
                    createChapter={createChapter}
                    chapters={chapters} 
                    activeProject={activeProject} 
                    isSelectingChapter={true} 
                    isSelectingSection={false} 
                    setSelectionId={setSelectedChapter} />
            ) : <span>No Active Project</span>}
        </>
    )
}

export default Chapters;