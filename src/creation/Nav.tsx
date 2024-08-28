import { ExpandLess, ExpandMore } from '@mui/icons-material';
import React, { Dispatch, SetStateAction, useState } from 'react';
import styled from 'styled-components';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Breadcrumbs from './Breadcrumbs';
import Chapters from './routes/Chapters';
import Auth from './routes/Auth';
import Projects, { Project, ProjectSlim } from './routes/Projects';
import SingleChapter from './routes/SingleChapter';

interface NavProps {
  user: any;
  projects: Project[];
  activeProject: ProjectSlim | undefined;
  setActiveProject: Dispatch<SetStateAction<ProjectSlim | undefined>>;
}

const Nav: React.FC<NavProps> = ({user, projects, activeProject, setActiveProject}) => {
  const [isAssetsOpen, setIsAssetsOpen] = useState(false);
  const [isAddOnsOpen, setIsAddOnsOpen] = useState(false);

  const toggleAssets = () => {
    setIsAssetsOpen(!isAssetsOpen);
  };

  const toggleAddOns = () => {
    setIsAddOnsOpen(!isAddOnsOpen);
  };

  return (
    <Container>
      <Router>

        <LeftSidebar>
          <LogoWrapper>
            <LogoMock><span style={{ display: 'block' }}>Story</span>Creator</LogoMock>
          </LogoWrapper>
          <SidebarButton to="/projects">Projects</SidebarButton>
          <SidebarButton to="/chapters">Chapters</SidebarButton>
          <SidebarButton to="/replies">Replies</SidebarButton>
          <SidebarButton to="/transitions">Transitions</SidebarButton>
          <SidebarButton to="/loops">Loops</SidebarButton>
        </LeftSidebar>


        <TopNav>
          <NavButton onClick={toggleAssets}>Assets {isAssetsOpen ? <ExpandLess /> : <ExpandMore />}</NavButton>
          {isAssetsOpen && (
            <Dropdown>
              <DropdownItem href="#">Images</DropdownItem>
              <DropdownItem href="#">Sounds</DropdownItem>
            </Dropdown>
          )}

          <NavButton onClick={toggleAddOns}>AddOns {isAddOnsOpen ? <ExpandLess /> : <ExpandMore />}</NavButton>
          {isAddOnsOpen && (
            <Dropdown $addons>
              <DropdownItem href="#">Currencies</DropdownItem>
              <DropdownItem href="#">Items</DropdownItem>
              <DropdownItem href="#">Enemies</DropdownItem>
            </Dropdown>
          )}

          <NavButton>Settings</NavButton>
          {activeProject ? <AProject>{activeProject.title}</AProject> : <AProject>NO PROJECT</AProject>}
          <LoginButton to="/login">{user && user.email ? 'LOG OUT' : 'LOG IN'}</LoginButton>
        </TopNav>

        {/* <Breadcrumbs /> */}

        <Content>
          <Base>
            <Routes>
              <Route path="/projects" element={<Projects userId={user?.uid} projects={projects} activeProject={activeProject} setActiveProject={setActiveProject}/>} />
              <Route path="/chapters" element={<Chapters activeProject={activeProject} />} />
              <Route path='/chapters/new' element={<SingleChapter activeProject={activeProject} />} />
              <Route path="/login" element={<Auth />} />
              {/* <Route path="/pages" element={<Pages />} />
                        <Route path="/replies" element={<Replies />} />
                        <Route path="/transitions" element={<Transitions />} />
                        <Route path="/loops" element={<Loops />} />
                        <Route path="/assets/images" element={<Images />} />
                        <Route path="/assets/sounds" element={<Sounds />} />
                        <Route path="/addons/currencies" element={<Currencies />} />
                        <Route path="/addons/items" element={<Items />} />
                        <Route path="/addons/enemies" element={<Enemies />} />
                        <Route path="/settings" element={<Settings />} /> */}
            </Routes>
          </Base>
        </Content>
      </Router>
    </Container>
  );
};

export default Nav;

// Styled components

const LogoWrapper = styled.div`
    background-color: white;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 30px;
    border-color: lightgreen;
    border-width: 2px;
    border-style: solid;
    width: 130px;
    padding-right: 10px;
    margin: 0 auto;
`;
const LogoMock = styled.h1`
    color: purple;
    text-align: center;
    font-size: 30px;
    line-height: 32px;
    margin-bottom: 5px;
    margin-top: 5px;
    span {
      color: coral;
    }
`;

const Container = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
  flex-direction: column;
`;

const LeftSidebar = styled.div`
  position: absolute;
  top: 20px;
  left: 0;
  height: 100%;
  width: 200px;
  background-color: #2e2e2e;
  display: flex;
  flex-direction: column;
  padding: 10px;
  gap: 10px;
  background: linear-gradient(to bottom, #5e5e5e, #2e2e2e);
`;

const SidebarButton = styled(Link)`
  background: linear-gradient(to right, #8a8a8a, #565656);
  border: none;
  color: white;
  padding: 15px 10px;
  text-align: left;
  font-size: 16px;
  cursor: pointer;
  border-radius: 5px;
  transition: background 0.3s ease;

  &:hover {
    background: linear-gradient(to right, #a0a0a0, #6e6e6e);
  }
`;

const TopNav = styled.div`
  position: fixed;
  top: 0;
  z-index: 9999;
  width: calc(100% - 240px);
  margin-left: 220px;
  height: 50px;
  background-color: purple;
  display: flex;
  justify-content: flex-start;
  padding: 10px 0 10px 20px;
  gap: 20px;
  align-items: center;
`;

const NavButton = styled.button`
  background-color: #ff6f61;
  border: none;
  color: white;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s ease;

  svg {
    margin-bottom: -3px;
    font-size: 20px;
  }

  &:hover {
    background-color: #ff8866;
  }
`;

const LoginButton = styled(Link)`
  background-color: lightgreen;
  border: none;
  color: black;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s ease;
  position: absolute;
  right: 40px;

  &:hover {
    background-color: #ff8866;
  }
`;

const Dropdown = styled.div <{ $addons?: boolean }>`
  position: absolute;
  top: 60px;
  left: ${props => props.$addons && '150px'};
  background-color: coral;
  border-radius: 5px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
`;

const DropdownItem = styled.a`
  padding: 10px;
  color: white;
  text-decoration: none;
  font-size: 14px;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: lightgreen;
    color: black
  }
`;

const AProject = styled.span`
  color: lightgreen;
  text-decoration: underline;
`;

const Content = styled.div`
  width: calc(100% - 220px);
  margin-top: 70px;
  margin-left: 220px;
  padding-top: 15px;
  flex: 1;
  background-color: #f5f5f5;
  display: flex;
  justify-content: center;
`;

const Base = styled.div`
    max-width: 100%;
    width: 80%;
    padding: 20px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
`;
