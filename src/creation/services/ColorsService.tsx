import { create } from "zustand";
import { ProjectSlim } from "../stores/ProjectStore";

interface ColorState {
  colors: string[];
  setupColors: (activeProject: ProjectSlim) => void;
  emptyColors: () => void;
  addColor: (activeProject: ProjectSlim, newColor: string) => void;
}

const useColorService = create<ColorState>((set, get) => ({
  colors: [],
  setupColors: (activeProject: ProjectSlim) => {
    const fromTheme = [...activeProject.themeColors];
    const storedColors = localStorage.getItem(`${activeProject.id}-stored-colors`);
    console.log("here");
    if (storedColors) {
      const toArray = storedColors.split(",");
      const combinedArray = [...new Set([...toArray, ...fromTheme])];
      set((state) => ({
        ...state,
        colors: combinedArray,
      }));
    } else {
      set((state) => ({
        ...state,
        colors: fromTheme,
      }));
    }
  },
  emptyColors: () => {
    set((state) => ({
      ...state,
      colors: [],
    }));
  },
  addColor: (activeProject: ProjectSlim, newColor: string) => {
    const updatedThemeColors = [...get().colors, newColor];
    if (updatedThemeColors.length > 8) {
      const copy = [...get().colors];
      const notThemedColors = copy.filter((c) => !activeProject.themeColors.includes(c));
      notThemedColors.shift();
      notThemedColors.push(newColor);
      const newCombined = [...activeProject.themeColors].concat([...notThemedColors]);
      const toStorage = newCombined.map((c) => c).join(",");
      localStorage.setItem(`${activeProject.id}-stored-colors`, toStorage);
      set((state) => ({
        ...state,
        colors: newCombined,
      }));
    } else {
      const toStorage = updatedThemeColors.map((c) => c).join(",");
      localStorage.setItem(`${activeProject.id}-stored-colors`, toStorage);
      set((state) => ({
        ...state,
        colors: updatedThemeColors,
      }));
    }
  },
}));

export default useColorService;
