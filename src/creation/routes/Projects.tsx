import { useEffect, useState } from "react";
import Loading from "../../Loading";
import ProjectOverview from "../projects/ProjectOverview";
import { Link } from "react-router-dom";
import styled from "@emotion/styled";
import { Button } from "@mui/material";
import CreateProject from "../projects/CreateProject";
import useProjectStore, { ProjectSlim } from "../stores/ProjectStore";

interface ProjectsProps {
  userId: string | undefined;
}

const Projects: React.FC<ProjectsProps> = ({ userId }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showCreateNew, setShowCreateNew] = useState<boolean>(false);
  const [updated, setUpdated] = useState<boolean>();
  const { activeProject, projects, updateAPStats, updateActiveProject } = useProjectStore();

  useEffect(() => {
    if (!updated) {
      setUpdated(true);
      updateStats();
    }
  }, [updated]);

  const updateStats = async () => {
    if (activeProject) {
      setIsLoading(true);
      const lPCopy = [...projects];
      await updateAPStats(lPCopy, activeProject);
      setIsLoading(false);
    }
  };

  const selectProject = (proj: ProjectSlim) => {
    if (userId) {
      updateActiveProject(proj, userId);
    }
  };

  const createProject = () => {
    setShowCreateNew(false);
  };

  return (
    <>
      <Loading isLoading={isLoading} />
      {userId ? (
        <>
          {!showCreateNew && (
            <>
              {projects?.length ? (
                projects.map((project, index) => (
                  <div style={{ width: "100%", margin: "20px 0" }} key={"proj" + index}>
                    <ProjectOverview activeProject={activeProject} selectProject={() => selectProject(project)} project={project} />
                  </div>
                ))
              ) : (
                <span>No Projects</span>
              )}
              <AddButton onClick={() => setShowCreateNew(true)} variant="outlined">
                New Project
              </AddButton>
            </>
          )}
          {showCreateNew && <CreateProject exit={createProject} userId={userId} />}
        </>
      ) : (
        <Link to="/auth">LOG IN</Link>
      )}
    </>
  );
};

export default Projects;

const AddButton = styled(Button)`
  background-color: lightgreen;
  color: purple;
  margin-top: 20px;
`;
