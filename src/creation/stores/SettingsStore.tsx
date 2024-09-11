import { create } from "zustand";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";

export interface Setting {
    id: string;
    projectId: string;
    timeForRepliesToDisplay?: number;
    autoAdvances?: boolean;
    showCurrencies?: string[];
    timeToAnswer?: number;
    defaultBackground?: string;
    screenId?: string;
    chapterId?: string;
}

export const settingDBKey = 'settings';

interface SettingsState {
    settings: Setting[];
    initSettings: (projectId: string) => Promise<boolean>;
    emptySettings: () => void;
    getSettingByChapterId: (chapterId: string) => Setting | undefined;
    getSettingByScreenId: (screenId: string) => Setting | undefined;
    updateOrAddSetting: (data: any, id: string | undefined) => Promise<void>;
    deleteSetting: (id: string) => Promise<void>;
}

const useSettingStore = create<SettingsState>((set, get) => ({
    settings: [],
    initSettings: async (projectId: string) => {
        try {
            const q = query(collection(db, settingDBKey), where("projectId", "==", projectId));
            const querySnapshot = await getDocs(q);
            const settingsList = querySnapshot.docs.map((doc) => {
                return ({
                    id: doc.id,
                    ...doc.data(),
                })
            }) as Setting[];
            set((state) => ({
                ...state,
                settings: settingsList
            }))
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    },
    emptySettings: () => {
        set((state) => ({
            ...state,
            settings: []
        }))
    },
    getSettingByChapterId: (chapterId: string) => {
        return get().settings.find(s => s.chapterId === chapterId);
    },
    getSettingByScreenId: (screenId: string) => {
        return get().settings.find(s => s.screenId === screenId);
    },
    updateOrAddSetting: async(data: any, id: string | undefined) => {
        if (id) {
            const updatedSettings = get().settings.map(setting =>
                setting.id === id ? { ...setting, ...data } : setting
            );
            set((state) => ({
                ...state,
                settings: updatedSettings
            }))
            await updateDoc(doc(db, settingDBKey, id), data);
        } else {
            const setData = await addDoc(collection(db, settingDBKey), data);
            set((state) => ({
                ...state,
                settings: [...state.settings, { ...data, id: setData.id }]
            }))
        }
    },
    deleteSetting: async (id: string) => {
        try {
            const settingRef = doc(db, settingDBKey, id);
            await deleteDoc(settingRef);
            const { settings } = get();
            const filtered = settings.filter(s => s.id !== id);
            set((state) => ({
                ...state,
                settings: filtered
            }))
        } catch (e) {
            console.error(e);
        }
    },
}));

export default useSettingStore;