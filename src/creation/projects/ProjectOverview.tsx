import React from 'react';
import styled from '@emotion/styled';
import { CheckCircle, Cancel } from '@mui/icons-material';
import { Button } from '@mui/material';
import { Project, ProjectSlim } from '../routes/Projects';

interface POProps {
  project: Project; 
  selectProject: () => void; 
  activeProject: ProjectSlim | undefined
}

const ProjectOverview: React.FC<POProps> = ({project, selectProject, activeProject}) => {

  return (
    <OverviewWrapper $active={activeProject?.id===project.id}>
      <TitleWrapper>
        <p>Project:</p>
        <Title>{project.title}</Title>
        <Button style={{backgroundColor: 'coral', color: 'white'}} onClick={selectProject}>{activeProject?.id===project.id ? 'Set Inactive' : 'Set Active'}</Button>
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
          <Label>Currency:</Label>
          {project.hasCurrencies ? <GreenCheck /> : <RedX />}
          <Button variant="outlined">Add</Button>
        </ChecklistRow>

        <ChecklistRow>
          <Label>Item:</Label>
          {project.hasItems ? <GreenCheck /> : <RedX />}
          <Button variant="outlined">Add</Button>
        </ChecklistRow>

        <ChecklistRow>
          <Label>Enemy:</Label>
          {project.hasEnemies ? <GreenCheck /> : <RedX />}
          <Button variant="outlined">Add</Button>
        </ChecklistRow>
      </ChecklistWrapper>

      <CountsWrapper>
        <CountRow>Chapters: {project.chapterCount || 0}</CountRow>
        <CountRow>Pages: {project.pageCount || 0}</CountRow>
        <CountRow>Images: {project.imageCount || 0}</CountRow>
        <CountRow>Sounds: {project.soundCount || 0}</CountRow>
      </CountsWrapper>
    </OverviewWrapper>
  );
};

export default ProjectOverview;

const OverviewWrapper = styled.div <{$active:boolean}>`
  display: flex;
  width: 100%;
  justify-content: space-around;
  align-items: flex-start;
  padding: 20px 0;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: ${props => props.$active ? 'lightgreen' : '#f8f9fa'};
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
