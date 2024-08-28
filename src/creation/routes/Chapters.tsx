import { useEffect, useState } from "react";
import ChapterSelector from "../chapters/ChapterSelector";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import Loading from "../../Loading";
import { ProjectSlim } from "./Projects";

export interface Chapter {
    id: string;
    title: string;
    number: number;
    pages: PageSimple[];
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
}

const Chapters: React.FC<ChaptersProps> = ({activeProject}) => {
    const [selectedChapter, setSelectedChapter] = useState<string>('');
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

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
        if ( activeProject ) {
            setIsLoading(true);
            fetchChapters();
        }
    }, [ activeProject ]);

    return (
        <>
            <Loading isLoading={isLoading} />
            {activeProject ? !isLoading && <ChapterSelector chapters={chapters}
                isSelectingChapter={true} isSelectingSection={false} setSelectionId={setSelectedChapter} />
            : <span>No Active Project</span>}
        </>
    )
}

export default Chapters;