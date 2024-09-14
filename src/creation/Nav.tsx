import { ExpandLess, ExpandMore } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from "react-router-dom";
import Breadcrumbs from "./Breadcrumbs";
import Chapters from "./routes/Chapters";
import Auth from "./routes/Auth";
import SingleChapter from "./routes/SingleChapter";
import SingleScreen from "./routes/SingleScreen";
import CurrencyManager from "./routes/CurrencyManager";
import TestScreen from "./routes/TestSingleScreen";
import Settings from "./routes/Settings";
import useProjectStore from "./stores/ProjectStore";
import Projects from "./routes/Projects";
import References from "./routes/References";

interface NavProps {
  user: any;
}

const Nav: React.FC<NavProps> = ({ user }) => {
  const [isAssetsOpen, setIsAssetsOpen] = useState(false);
  const [isAddOnsOpen, setIsAddOnsOpen] = useState(false);
  const { activeProject } = useProjectStore();

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
            <LogoMock>
              <span style={{ display: "block" }}>Story</span>Creator
            </LogoMock>
          </LogoWrapper>
          <SidebarButton to="/projects">Projects</SidebarButton>
          <SidebarButton to="/chapters">Chapters</SidebarButton>
          <SidebarButton to="/references">References</SidebarButton>
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
              <DropdownItem $gold onClick={() => setIsAddOnsOpen(false)} to="/currency">
                Currencies
              </DropdownItem>
              <DropdownItem to="/">Items</DropdownItem>
              <DropdownItem to="/">Enemies</DropdownItem>
            </Dropdown>
          )}

          <NavButton>Settings</NavButton>
          {activeProject ? <AProject>{activeProject?.title}</AProject> : <AProject>NO PROJECT</AProject>}
          <LoginButton to="/login">{user && user.email ? "LOG OUT" : "LOG IN"}</LoginButton>
        </TopNav>

        {/* <Breadcrumbs /> */}

        <Content>
          <Base>
            <Routes>
              <Route path="/">
                <Route index element={<Navigate to="projects" replace />} />
                <Route path="projects" element={<Projects userId={user?.uid} />} />
                <Route path="chapters" element={<Chapters userId={user?.uid} />} />
                <Route path="chapters/:chapterId" element={<SingleChapter />} />
                <Route path="chapters/:chapterId/screens/:screenId" element={<SingleScreen />} />
                <Route path="testing/:screenId" element={<TestScreen />} />
                <Route path="currency" element={<CurrencyManager />} />
                <Route path="settings/screens/:screenId" element={<Settings />} />
                <Route path="settings/chapters/:chapterId" element={<Settings />} />
                <Route path="references" element={<References userId={user?.uid} />} />
                <Route path="login" element={<Auth />} />
              </Route>
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
  top: 0;
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

const Dropdown = styled.div<{ $addons?: boolean }>`
  position: absolute;
  top: 60px;
  left: ${(props) => props.$addons && "150px"};
  background-color: coral;
  border-radius: 5px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
`;

const DropdownItem = styled(Link)<{ $gold?: boolean }>`
  padding: 10px;
  color: ${(props) => (props.$gold ? "purple" : "white")};
  text-decoration: none;
  font-size: 14px;
  border-radius: 5px;
  cursor: pointer;
  background-color: ${(props) => (props.$gold ? "#FFD700" : "transparent")};

  &:hover {
    background-color: ${(props) => (props.$gold ? "purple" : "lightgreen")};
    color: ${(props) => (props.$gold ? "#FFD700" : "black")};
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
