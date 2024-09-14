import { create } from "zustand";
import { collection, doc, getCountFromServer, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import useChapterStore, { chapterDBKey } from "./ChapterStore";
import useScreenStore from "./ScreenStore";
import useCurrencyStore from "./CurrencyStore";

export interface Project {
  id: string;
  userId: string;
  title: string;
  currencies: number;
  hasEnemies: boolean;
  hasItems: boolean;
  hasTitleScreen: boolean;
  hasTransitions: boolean;
  hasLoops: boolean;
  voiceOversMuted: boolean;
  chapterCount: number;
  screenCount: number;
  imageCount: number;
  soundCount: number;
  themeColors: string[];
}

export interface ProjectSlim {
  id: string;
  title: string;
  themeColors: string[];
}

interface ProjectState {
  projects: Project[];
  activeProject: ProjectSlim | undefined;
  initProjects: (userId: string) => Promise<string>;
  updateAPStats: (projects: Project[], activeProject: ProjectSlim) => Promise<void>;
  updateActiveProject: (activeProject: ProjectSlim, id: string) => void;
  updateThemeColor: (val: string, projectId: string, isDeleting?: boolean) => void;
}

export const projectDBKey = "projects";

const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  activeProject: undefined,
  initProjects: async (userId: string): Promise<string> => {
    try {
      const q = query(collection(db, projectDBKey), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const projectsList = querySnapshot.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      }) as Project[];
      const activeProjId = localStorage.getItem(`${userId}-active-project`);
      if (activeProjId) {
        const matchedProj = projectsList.find((p) => p.id === activeProjId);
        if (matchedProj) {
          set((state) => ({
            ...state,
            activeProject: matchedProj,
          }));
          const filtered = projectsList.filter((p) => p.id !== matchedProj.id);
          filtered.unshift(matchedProj);
          set((state) => ({
            ...state,
            projects: filtered,
          }));
          return matchedProj.id;
        } else {
          set((state) => ({
            ...state,
            projects: projectsList,
          }));
        }
      } else {
        set((state) => ({
          ...state,
          projects: projectsList,
        }));
      }
      return "";
    } catch (e) {
      console.error(e);
      return "";
    }
  },
  updateAPStats: async (projectCopy: Project[], activeProject: ProjectSlim) => {
    if (activeProject) {
      const mActiveProject = projectCopy.find((p) => p.id === activeProject.id);
      if (mActiveProject) {
        try {
          const { chapters } = useChapterStore.getState();
          mActiveProject.chapterCount = chapters.length;
          const { screens } = useScreenStore.getState();
          mActiveProject.screenCount = screens.length;
          const { currencies } = useCurrencyStore.getState();
          mActiveProject.currencies = currencies.length;
          await updateDoc(doc(db, projectDBKey, mActiveProject.id), { ...mActiveProject });

          const filtered = projectCopy.filter((p) => p.id !== activeProject.id);
          filtered.unshift(mActiveProject);
          set((state) => ({
            ...state,
            projects: filtered,
          }));
        } catch (e) {
          console.error(e);
        }
      }
    }
  },
  updateActiveProject: (proj: ProjectSlim, userId: string) => {
    set((state) => {
      if (state.activeProject?.id === proj?.id) {
        localStorage.removeItem(`${userId}-active-project`);
        return { ...state, activeProject: undefined };
      } else {
        localStorage.setItem(`${userId}-active-project`, proj.id);
        return { ...state, activeProject: proj };
      }
    });
  },
  updateThemeColor: async (val: string, projectId: string, isDeleting?: boolean) => {
    const proj = get().projects.find((p) => p.id === projectId);
    if (proj) {
      if (isDeleting) {
        proj.themeColors = proj.themeColors.filter((color) => color !== val);
      } else {
        proj.themeColors.push(val);
      }
      const updatedProjects = get().projects.map((p) => (p.id === proj.id ? { ...p, ...proj } : p));
      set((state) => ({
        ...state,
        projects: updatedProjects,
      }));
      await updateDoc(doc(db, projectDBKey, proj.id), { ...proj });
    }
  },
}));

export default useProjectStore;
