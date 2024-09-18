import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import Nav from "./Nav";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig";
import Loading from "../Loading";
import useProjectStore from "./stores/ProjectStore";
import useChapterStore from "./stores/ChapterStore";
import useScreenStore from "./stores/ScreenStore";
import useSettingStore from "./stores/SettingsStore";
import useCurrencyStore from "./stores/CurrencyStore";
import useReferenceStore from "./stores/ReferenceStore";
import useColorService from "./services/ColorsService";

export interface SelectedSection {
  id: string;
  text: string;
}

const Creator: React.FC = () => {
  const [topNavWidth, setTopNavWidth] = useState<number>();
  const [user, setUser] = useState<any>();
  const [initiated, setInitiated] = useState<boolean>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentProjectId, setCurrentProjectId] = useState<string>();
  const { activeProject, initProjects } = useProjectStore();
  const { initChapters, emptyChapters } = useChapterStore();
  const { initScreens, emptyScreens } = useScreenStore();
  const { initSettings, emptySettings } = useSettingStore();
  const { initCurrencies, emptyCurrencies } = useCurrencyStore();
  const { initReferences, emptyReferences } = useReferenceStore();
  const { setupColors, emptyColors } = useColorService();
  // const onDragStart = () => {...}
  // const onDragEnd = () => {...}

  const updateTopNavWidth = () => {
    setTopNavWidth(document.documentElement.clientWidth);
  };

  useEffect(() => {
    setIsLoading(true);
    updateTopNavWidth();
    window.addEventListener("resize", updateTopNavWidth);
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      }
      setIsLoading(false);
    });
    return () => {
      window.removeEventListener("resize", updateTopNavWidth);
    };
  }, []);

  useEffect(() => {
    if (user?.uid && !currentProjectId && !activeProject?.id) {
      initData(user.uid);
    }
    if (currentProjectId && activeProject && currentProjectId !== activeProject.id) {
      initData(user.uid, activeProject.id);
    }
    if (currentProjectId && !activeProject?.id) {
      emptyData();
    }
    if (activeProject) {
      setupColors(activeProject);
    }
  }, [user, activeProject]);

  const initData = async (userId: string, activeProjectId?: string) => {
    const aId = activeProjectId ? activeProjectId : await initProjects(userId);
    if (aId) {
      setCurrentProjectId(aId);
      const chReady: boolean = await initChapters(aId);
      const scrnReady: boolean = await initScreens(aId);
      const settingReady: boolean = await initSettings(aId);
      const currenciesReady: boolean = await initCurrencies(aId);
      const referencesReady: boolean = await initReferences(aId);
      setInitiated(chReady && scrnReady && settingReady && currenciesReady && referencesReady);
    }
  };

  const emptyData = () => {
    setCurrentProjectId("EMPTIED");
    emptyChapters();
    emptyScreens();
    emptySettings();
    emptyCurrencies();
    emptyColors();
  };

  return (
    <Base style={{ width: topNavWidth, minWidth: "100%", overflowY: "scroll" }}>
      <Loading isLoading={isLoading} />
      {initiated && <Nav user={user} />}
    </Base>
  );
};

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
