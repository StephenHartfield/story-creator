import React, { useState } from "react";
import { TextField, Button } from "@mui/material";
import Loading from "../../Loading";
import useProjectStore from "../stores/ProjectStore";

interface ProjectFormProps {
  userId: string;
  exit: () => void;
}

const CreateProject: React.FC<ProjectFormProps> = ({ userId, exit }) => {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>();
  const { addProject } = useProjectStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      alert("Title is required!");
      return;
    }
    setLoading(true);

    try {
      const project = {
        title,
        userId,
        currencies: 0,
        hasEnemies: false,
        hasItems: false,
        hasTitleScreen: false,
        hasTransitions: false,
        hasLoops: false,
        chapterCount: 0,
        screenCount: 0,
        imageCount: 0,
        soundCount: 0,
        themeColors: [],
      };

      await addProject(project);
      setMsg("Successfully Created " + title + " project!");
      setTitle("");

      setTimeout(() => {
        exit();
      }, 2000);
    } catch (error) {
      console.error("Error adding project: ", error);
      setMsg("Failed to add project! Contact somebody who knows what they're doing!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Loading isLoading={loading} />
      {msg && <p>{msg}</p>}
      <Button variant="outlined" color="secondary" onClick={exit}>
        BACK
      </Button>
      <h2>Create New Project</h2>
      <form onSubmit={handleSubmit}>
        <TextField fullWidth label="Project Title" value={title} onChange={(e) => setTitle(e.target.value)} variant="outlined" margin="normal" />
        <Button type="submit" variant="contained" color="primary" disabled={!title}>
          SUBMIT
        </Button>
      </form>
    </>
  );
};

export default CreateProject;
