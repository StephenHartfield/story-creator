import { useEffect, useState } from "react";
import FormSections from "./chapters/FormSections";
import styled from '@emotion/styled';
import ChapterSelector from "./chapters/ChapterSelector";
import RepliesCreator from "./replies/RepliesCreator";
import AddOns from "./AddOns";
import Nav from "./Nav";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import Loading from "../Loading";
import { Project, ProjectSlim } from "./routes/Projects";
import { collection, getDocs, query, where } from "firebase/firestore";

export interface SelectedSection {
    id: string;
    text: string;
}
export const projectDBKey = 'projects';

const Creator: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [topNavWidth, setTopNavWidth] = useState<number>();
    const [user, setUser] = useState<any>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [activeProject, setActiveProject] = useState<ProjectSlim>();

    const updateTopNavWidth = () => {
        setTopNavWidth(document.documentElement.clientWidth);
    };

    useEffect(() => {
        setIsLoading(true);
        updateTopNavWidth();
        window.addEventListener('resize', updateTopNavWidth);
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
                fetchProjects(user);
            }
            setIsLoading(false);
        });
        return () => {
            window.removeEventListener('resize', updateTopNavWidth);
        };
    }, []);

    const fetchProjects = async ( lUser: any ) => {
        try {
            const q = query(collection(db, projectDBKey), where("userId", "==", lUser.uid));
            const querySnapshot = await getDocs(q);
            const projectsList = querySnapshot.docs.map((doc) => {
                return ({
                id: doc.id,
                ...doc.data(),
            })}) as Project[];
            const activeProjId = localStorage.getItem(`${lUser.uid}-active-project`);
            if ( activeProjId ) {
                const matchedProj = projectsList.find( p => p.id === activeProjId );
                if ( matchedProj ) {
                    setActiveProject(matchedProj);
                    const filtered = projectsList.filter( p => p.id !== matchedProj.id );
                    filtered.unshift(matchedProj);
                    setProjects(filtered);
                } else {
                    setProjects(projectsList);
                }
            } else {
                setProjects(projectsList);
            }
            setIsLoading(false);
        } catch (e) {
            console.error(e);
            setIsLoading(false);
        }
    };

    return (
        <Base style={{ width: topNavWidth, minWidth: '100%', overflowY: 'scroll' }}>
            <Loading isLoading={isLoading} />
            {/* <AddOns />
            {!selectedSection && <Base>
                <ChapterSelector setSelectionId={setSelectedChapter} isSelectingChapter={true} isSelectingSection={false}/>
                <FormSections selectedChapter={selectedChapter} currentImages={currentImages} setCurrentImages={setCurrentImages} setSelectedSection={setSelectedSection} />
                {currentImages && currentImages.map( (image, imgIndex) => (
                    <ImageThumbnail key={imgIndex+'sidebar'} src={image} alt={`Image ${imgIndex + 1}`} />
                ) )}
            </Base>}
            {selectedSection && <Base>
                <RepliesCreator id={selectedSection.id} text={selectedSection.text}></RepliesCreator>
            </Base>} */}
            <Nav projects={projects} setActiveProject={setActiveProject} activeProject={activeProject} user={user} />
        </Base>
    )
}

export default Creator;

const Base = styled.div`
    display: block;
    width: auto;
    overflow: hidden;
`;

const ImageThumbnail = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #ccc;
`;