import { create } from "zustand";
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db, storage } from "../../firebaseConfig";
import { getDownloadURL, ref } from "firebase/storage";
import useSettingStore from "./SettingsStore";
import useReplyStore from "./ReplyStore";

export interface Screen {
  id: string;
  order: number;
  text: string;
  image?: string;
  imageLocal?: string;
  replies?: any;
  chapterId: string;
  projectId: string;
  linkToNextScreen: string;
}

export const screenDBKey = "screens";

interface ScreenState {
  screens: Screen[];
  initScreens: (projectId: string) => Promise<boolean>;
  emptyScreens: () => void;
  deleteScreen: (id: string, chapterId: string) => Promise<void>;
  updateScreenOrder: (scrn: Screen, idx: number) => Promise<void>;
  addScreen: (newChapter: any) => Promise<void>;
  getScreenById: (id: string) => Promise<Screen | undefined>;
  getScreensByChapterId: (chapterId: string) => Promise<Screen[]>;
  initRepliesForWholeChapter: (screenId: string) => void;
  getScreensByChapterIdSimple: (chapterId: string) => Screen[];
  updateScreen: (key: string, value: string, id: string, save?: boolean) => void;
  saveScreen: (s: Screen) => Promise<void>;
  updateScreens: (scrns: Screen[]) => Promise<void>;
}

const useScreenStore = create<ScreenState>((set, get) => ({
  screens: [],
  initScreens: async (projectId: string) => {
    try {
      const q = query(collection(db, screenDBKey), where("projectId", "==", projectId));
      const querySnapshot = await getDocs(q);
      const screensList = querySnapshot.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      }) as Screen[];
      set((state) => ({
        ...state,
        screens: screensList,
      }));
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  emptyScreens: () => {
    set((state) => ({
      ...state,
      screens: [],
    }));
  },
  addScreen: async (newScreen: any) => {
    const screenData = await addDoc(collection(db, screenDBKey), newScreen);
    set((state) => ({
      ...state,
      screens: [...state.screens, { ...newScreen, id: screenData.id }],
    }));
  },
  getScreenById: async (id: string) => {
    const scrn = get().screens.find((s) => s.id === id);
    if (scrn?.image) {
      const fileRef = ref(storage, scrn.image);
      const url = await getDownloadURL(fileRef);
      return { ...scrn, imageLocal: url };
    }
    return scrn;
  },
  getScreensByChapterId: async (chapterId: string) => {
    const scrns = get().screens.filter((s) => s.chapterId === chapterId);
    const screensList = await Promise.all(
      scrns.map(async (scrn) => {
        if (scrn.image && !scrn.imageLocal) {
          const fileRef = ref(storage, scrn.image);
          const url = await getDownloadURL(fileRef).catch((e) => console.error(e));
          return { ...scrn, imageLocal: url || "" };
        } else {
          return scrn;
        }
      })
    );
    screensList.forEach((s) => {
      useReplyStore.getState().initRepliesByScreenId(s.id);
    });
    return screensList.sort((a, b) => a.order - b.order);
  },
  initRepliesForWholeChapter: (screenId: string) => {
    const matchedScreen = get().screens.find((s) => s.id === screenId);
    if (matchedScreen) {
      const scrns = get().screens.filter((s) => s.chapterId === matchedScreen.chapterId);
      scrns.forEach((s) => {
        useReplyStore.getState().initRepliesByScreenId(s.id);
      });
    }
  },
  getScreensByChapterIdSimple: (chapterId: string) => {
    return get().screens.filter((s) => s.chapterId === chapterId);
  },
  deleteScreen: async (id: string, chapterId: string) => {
    try {
      const screenRef = doc(db, screenDBKey, id);
      await deleteDoc(screenRef);
      const { screens } = get();
      const allFiltered = screens.filter((s) => s.id !== id);
      const scs = await get().getScreensByChapterId(chapterId);
      const filtered = scs.filter((s) => s.id !== id);
      if (filtered.length) {
        filtered.forEach(async (s, idx) => {
          await get().updateScreenOrder(s, idx);
          const i = allFiltered.findIndex((af) => af.id === s.id);
          if (i) {
            allFiltered[i] = s;
          }
        });
      }
      set((state) => ({
        ...state,
        screens: allFiltered,
      }));
      const settings = useSettingStore.getState().getSettingByScreenId(id);
      if (settings) {
        useSettingStore.getState().deleteSetting(settings.id);
      }
      const relatedReplies = await useReplyStore.getState().getRepliesByScreenId(id);
      if (relatedReplies) {
        relatedReplies.forEach(async (r) => {
          await useReplyStore.getState().deleteReply(r.id, id);
        });
      }
    } catch (e) {
      console.error(e);
    }
  },
  updateScreenOrder: async (scrn: Screen, idx: number) => {
    scrn.order = idx + 1;
    await updateDoc(doc(db, screenDBKey, scrn.id), { ...scrn });
  },
  updateScreen: async (key: string, value: string, id: string) => {
    const updated = get().screens.map((screen) => (screen.id === id ? { ...screen, [key]: value } : screen));
    set((state) => ({
      ...state,
      screens: updated,
    }));
  },
  saveScreen: async (s: Screen) => {
    await updateDoc(doc(db, screenDBKey, s.id), { ...s });
  },
  updateScreens: async (scrns: Screen[]) => {
    const updatedScreens = get().screens.map((screen) => {
      let toReturn;
      scrns.forEach((passedScrn) => {
        if (screen.id === passedScrn.id) {
          toReturn = { ...screen, ...passedScrn };
        }
      });
      return toReturn ? toReturn : screen;
    });
    scrns.forEach(async (s, idx) => {
      s.imageLocal = "";
      if (scrns[idx + 1]) {
        s.linkToNextScreen = scrns[idx + 1].id;
      }
      await updateDoc(doc(db, screenDBKey, s.id), { ...s });
    });
    set((state) => ({
      ...state,
      screens: updatedScreens,
    }));
  },
}));

export default useScreenStore;
