import { collection, DocumentData, getDocs, query, QuerySnapshot, where } from "firebase/firestore";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import Loading from "../../Loading";
import ProjectOverview from "../projects/ProjectOverview";
import { Link } from "react-router-dom";
import styled from '@emotion/styled';
import { Button } from "@mui/material";
import CreateProject from "../projects/CreateProject";
import { projectDBKey } from "../Creator";

export interface Project {
    id: string;
    userId: string;
    title: string;
    hasCurrencies: boolean;
    hasEnemies: boolean;
    hasItems: boolean;
    hasTitleScreen: boolean;
    hasTransitions: boolean;
    hasLoops: boolean;
    voiceOversMuted: boolean;
    chapterCount: number;
    pageCount: number;
    imageCount: number;
    soundCount: number;
}

export interface ProjectSlim {
    id: string;
    title: string;
}

interface ProjectsProps {
    userId: string | undefined;
    projects: Project[];
    activeProject: ProjectSlim | undefined;
    setActiveProject: Dispatch<SetStateAction<ProjectSlim | undefined>>;
}

const Projects: React.FC<ProjectsProps> = ({ userId, projects, activeProject, setActiveProject }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showCreateNew, setShowCreateNew] = useState<boolean>(false);
    const [lProjects, setLProjects] = useState<Project[]>([]);

    useEffect(() => {
        setLProjects(projects);
    }, [projects]);

    const fetchProjects = async () => {
        try {
            const q = query(collection(db, projectDBKey), where("userId", "==", userId));
            const querySnapshot = await getDocs(q);
            const projectsList = querySnapshot.docs.map((doc) => {
                return ({
                id: doc.id,
                ...doc.data(),
            })}) as Project[];
            const activeProjId = localStorage.getItem(`${userId}-active-project`);
            if ( activeProjId ) {
                const matchedProj = projectsList.find( p => p.id === activeProjId );
                if ( matchedProj ) {
                    setActiveProject(matchedProj);
                    const filtered = projectsList.filter( p => p.id !== matchedProj.id );
                    filtered.unshift(matchedProj);
                    setLProjects(filtered);
                } else {
                    setLProjects(projectsList);
                }
            } else {
                setLProjects(projectsList);
            }
            setIsLoading(false);
        } catch (e) {
            console.error(e);
            setIsLoading(false);
        }
    };

    const selectProject = (proj: ProjectSlim) => {
        activeProject?.id === proj?.id ? setActiveProject(undefined) : setActiveProject(proj);
        localStorage.setItem(`${userId}-active-project`, proj.id);
    }

    const createProject = () => {
        setShowCreateNew(false);
        fetchProjects();
    }

    return (
        <>
            <Loading isLoading={isLoading} />
            {userId ? (
                <>
                    {!showCreateNew && (
                        <>
                            {lProjects?.length ? lProjects.map((project, index) => (
                                <div style={{width: '100%', margin: '20px 0'}} key={'proj' + index}>
                                    <ProjectOverview activeProject={activeProject} selectProject={() => selectProject(project)} project={project} />
                                </div>
                            )) : <span>No Projects</span>}
                            <AddButton onClick={() => setShowCreateNew(true)} variant="outlined">New Project</AddButton>
                        </>
                    )}
                    {showCreateNew && (
                        <CreateProject exit={createProject} userId={userId} />
                    )}
                </>
            ) : <Link to="/auth">LOG IN</Link>}
        </>
    )
}

export default Projects;

const AddButton = styled(Button)`
    background-color: lightgreen;
    color: purple;
    margin-top: 20px;
`;