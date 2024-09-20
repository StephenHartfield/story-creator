import { create } from "zustand";
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db, storage } from "../../firebaseConfig";
import { getDownloadURL, ref } from "firebase/storage";
import useScreenStore from "./ScreenStore";
import useSettingStore from "./SettingsStore";

export interface Chapter {
  id: string;
  title: string;
  order: number;
  image?: string;
  imageLocal?: string;
}

export const chapterDBKey = "chapters";

interface ChapterState {
  chapters: Chapter[];
  initChapters: (projectId: string) => Promise<boolean>;
  emptyChapters: () => void;
  deleteChapter: (id: string) => Promise<void>;
  updateChapterOrder: (ch: Chapter, idx: number) => void;
  addChapter: (newChapter: Chapter) => Promise<string>;
  getChapterById: (id: string) => Promise<Chapter | undefined>;
  updateChapter: (c: Chapter) => Promise<void>;
}

const useChapterStore = create<ChapterState>((set, get) => ({
  chapters: [],
  initChapters: async (projectId: string): Promise<boolean> => {
    try {
      const q = query(collection(db, chapterDBKey), where("projectId", "==", projectId));
      const querySnapshot = await getDocs(q);
      const chaptersList = querySnapshot.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      }) as Chapter[];
      set((state) => ({
        ...state,
        chapters: chaptersList,
      }));
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  emptyChapters: () => {
    set((state) => ({
      ...state,
      chapters: [],
    }));
  },
  deleteChapter: async (id: string) => {
    const chapterRef = doc(db, chapterDBKey, id);
    await deleteDoc(chapterRef);
    const { chapters } = get();
    const filtered = chapters.filter((c) => c.id !== id);
    filtered.forEach(async (c, idx) => await get().updateChapterOrder(c, idx));
    set((state) => ({
      ...state,
      chapters: filtered,
    }));
    const settings = useSettingStore.getState().getSettingByChapterId(id);
    if (settings) {
      useSettingStore.getState().deleteSetting(settings.id);
    }
    const screens = useScreenStore.getState().getScreensByChapterIdSimple(id);
    screens.forEach(async (s) => {
      await useScreenStore.getState().deleteScreen(s.id, id);
    });
    console.log(`Chapter ${id} deleted.`);
  },
  updateChapterOrder: async (ch: Chapter, idx: number) => {
    ch.order = idx + 1;
    await updateDoc(doc(db, chapterDBKey, ch.id), { ...ch });
  },
  addChapter: async (newChapter: any): Promise<string> => {
    const addedChapter = await addDoc(collection(db, chapterDBKey), newChapter);
    set((state) => ({
      ...state,
      chapters: [...state.chapters, { ...newChapter, id: addedChapter.id }],
    }));
    return addedChapter.id;
  },
  getChapterById: async (id: string) => {
    const ch = get().chapters.find((chapter) => chapter.id === id);
    if (ch?.image) {
      const fileRef = ref(storage, ch.image);
      const url = await getDownloadURL(fileRef);
      return { ...ch, imageLocal: url };
    } else {
      return ch;
    }
  },
  updateChapter: async (c: Chapter) => {
    const updatedChapters = get().chapters.map((chapter) => (chapter.id === c.id ? { ...chapter, ...c } : chapter));
    set((state) => ({
      ...state,
      chapters: updatedChapters,
    }));
    await updateDoc(doc(db, chapterDBKey, c.id), { ...c });
  },
}));

export default useChapterStore;
