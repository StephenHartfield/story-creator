import { useEffect, useState } from "react";
import ChapterSelector from "../chapters/ChapterSelector";
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import Loading from "../../Loading";
import { useNavigate } from "react-router-dom";
import useProjectStore from "../stores/ProjectStore";
import useChapterStore, { Chapter } from "../stores/ChapterStore";


interface ChaptersProps {
    userId: string;
}

const Chapters: React.FC<ChaptersProps> = ({userId}) => {
    const [selectedChapter, setSelectedChapter] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const {activeProject} = useProjectStore();
    const {chapters, deleteChapter, addChapter} = useChapterStore();

    const deleteChapterHandle = async (id: string) => {
        if ( !userId ) {
            console.error('Not logged in');
            return;
        }
        const userConfirmed = window.confirm('Are you sure you want to delete this chapter?');

        if (userConfirmed) {
            deleteChapter(id);
        } else {
            console.log('Chapter deletion canceled.');
        }
    }

    const createChapter = async () => {
        if ( !userId ) {
            console.error('Not logged in');
            return;
        }
        setIsLoading(true);
        const newChapter: any = {
            title: '',
            order: chapters.length + 1,
            sound: '',
            background: '',
            screens: [],
            projectId: activeProject?.id,
            userId: userId
        }
        const id = await addChapter(newChapter);
        setIsLoading(false);
        navigate(id);
    }

    return (
        <>
            {activeProject ? chapters && chapters.length && (
                <ChapterSelector deleteChapter={(id) => deleteChapterHandle(id)}
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