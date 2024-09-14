import React, { useState } from "react";
import styled from "@emotion/styled";
import { CheckCircle, Cancel } from "@mui/icons-material";
import { Button } from "@mui/material";
import useProjectStore, { Project, ProjectSlim } from "../stores/ProjectStore";
import { useNavigate } from "react-router-dom";
import ColorPicker from "@rc-component/color-picker";
import "@rc-component/color-picker/assets/index.css";
import { Popover } from "@mui/material";

interface POProps {
  project: Project;
  selectProject: () => void;
  activeProject: ProjectSlim | undefined;
}

const ProjectOverview: React.FC<POProps> = ({ project, selectProject, activeProject }) => {
  const [pickedColor, setPickedColor] = useState<string>("white");
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const navigate = useNavigate();
  const { updateThemeColor } = useProjectStore();

  const goToCurrencies = () => {
    navigate("/currency");
  };

  const openCP = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleCloseCP = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "color-picker-popover" : undefined;

  const pickColor = (val: any) => {
    const hex = val.toHexString();
    setPickedColor(hex);
  };

  const deleteColor = (val: string) => {
    updateThemeColor(val, project.id, true);
  };

  const updateThemeColorHandle = () => {
    if (pickedColor) {
      updateThemeColor(pickedColor, project.id);
      handleCloseCP();
    }
  };

  return (
    <OverviewWrapper $active={activeProject?.id === project.id}>
      <TitleWrapper>
        <p>Project:</p>
        <Title>{project.title}</Title>
        <Button style={{ backgroundColor: "coral", color: "white" }} onClick={selectProject}>
          {activeProject?.id === project.id ? "Set Inactive" : "Set Active"}
        </Button>
      </TitleWrapper>
      <ChecklistWrapper>
        <ChecklistRow>
          <Label>TitleScreen:</Label>
          {project.hasTitleScreen ? <GreenCheck /> : <RedX />}
          <Button variant="outlined">Add</Button>
        </ChecklistRow>
        <ChecklistRow>
          <Label>Transitions:</Label>
          {project.hasTransitions ? <GreenCheck /> : <RedX />}
          <Button variant="outlined">Add</Button>
        </ChecklistRow>
        <ChecklistRow>
          <Label>Loops:</Label>
          {project.hasLoops ? <GreenCheck /> : <RedX />}
          <Button variant="outlined">Add</Button>
        </ChecklistRow>
        <ChecklistRow>
          <Label>Currencies:</Label>
          {project.currencies ? (
            <>
              ({project.currencies})<GreenCheck />
            </>
          ) : (
            <RedX />
          )}
          <Button onClick={goToCurrencies} variant="outlined">
            Add
          </Button>
        </ChecklistRow>

        <ChecklistRow>
          <Label>Items:</Label>
          {project.hasItems ? <GreenCheck /> : <RedX />}
          <Button variant="outlined">Add</Button>
        </ChecklistRow>

        <ChecklistRow>
          <Label>Enemies:</Label>
          {project.hasEnemies ? <GreenCheck /> : <RedX />}
          <Button variant="outlined">Add</Button>
        </ChecklistRow>
      </ChecklistWrapper>

      <CountsWrapper>
        <CountRow>Chapters: {project.chapterCount || 0}</CountRow>
        <CountRow>Screens: {project.screenCount || 0}</CountRow>
        <CountRow>Images: {project.imageCount || 0}</CountRow>
        <CountRow>Sounds: {project.soundCount || 0}</CountRow>
        <CountRow>
          Theme Colors:{" "}
          {project.themeColors && project.themeColors.length
            ? project.themeColors.map((color, idx) => (
                <div key={color} style={{ backgroundColor: color, width: "80px", height: "20px", fontSize: "8px", borderRadius: "10px" }}>
                  <DeleteColorBtn onClick={() => deleteColor(color)}>{idx + 1}</DeleteColorBtn>
                </div>
              ))
            : null}
        </CountRow>
        <ColorButton aria-describedby={id} onClick={openCP}>
          Add Color
        </ColorButton>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleCloseCP}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}>
          <ColorPickerWrapper>
            <ColorPicker value={pickedColor} onChange={pickColor} />
          </ColorPickerWrapper>
          <ColorButton onClick={updateThemeColorHandle} style={{ backgroundColor: pickedColor }}>
            <span style={{ backgroundColor: "white", padding: "2px 10px" }}>Save As Theme Color</span>
          </ColorButton>
        </Popover>
      </CountsWrapper>
    </OverviewWrapper>
  );
};

export default ProjectOverview;

const OverviewWrapper = styled.div<{ $active: boolean }>`
  display: flex;
  width: 100%;
  justify-content: space-around;
  align-items: flex-start;
  padding: 20px 0;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: ${(props) => (props.$active ? "lightgreen" : "#f8f9fa")};
`;

const TitleWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h1`
  font-size: 36px;
  margin-top: 0;
`;

const ChecklistWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const ChecklistRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const Label = styled.span`
  font-weight: bold;
  flex: 1;
  padding-right: 10px;
`;

const GreenCheck = styled(CheckCircle)`
  color: green;
  margin-right: 10px;
`;

const RedX = styled(Cancel)`
  color: red;
  margin-right: 10px;
`;

const CountsWrapper = styled.div`
  margin-top: 20px;
`;

const CountRow = styled.div`
  margin-bottom: 10px;
  font-size: 1.1rem;
  font-weight: bold;
`;

const ColorPickerWrapper = styled.div`
  z-index: 10;
  background-color: white;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 8px;
`;

const ColorButton = styled.button`
  padding: 5px 20px;
  border-radius: 10px;
  border: 1px solid black;
`;

const DeleteColorBtn = styled.button`
  height: 20px;
  width: 25px;
  transition: width 0.5s;
  :hover {
    background-color: red;
    color: white;
    width: 40px;
  }
`;
