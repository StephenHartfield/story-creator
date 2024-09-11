import { create } from "zustand";
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db, storage } from "../../firebaseConfig";
import useScreenStore from "./ScreenStore";

export interface Reply {
    id: string;
    order: number;
    text?: string;
    screenId: string;
    linkToSectionId?: string;
    requirements: Requirement[];
    effects: Requirement[];
}

export interface Requirement {
    addedAs: 'requirement' | 'effect' | undefined;
    type: 'currency' | 'item' | undefined;
    value: number | boolean | undefined;
    keyWord: string;
    greaterThan?: boolean;
}

export const repliesDBKey = 'replies';

interface ReplyState {
    repliesMap: { [screenId: string]: Reply[] };
    initRepliesByScreenId: (projectId: string) => Promise<void>;
    getRepliesByScreenId: (screenId: string) => Promise<Reply[]>;
    emptyReplies: () => void;
    addReply: (newReply: any) => void;
    deleteReply: (id: string, screenId: string) => Promise<void>;
    updateReplyOrder: (r: Reply, idx: number) => Promise<void>;
    updateReply: (reply: Reply, update?: boolean) => Promise<void>;
}

const useReplyStore = create<ReplyState>((set, get) => ({
    repliesMap: {},
    initRepliesByScreenId: async (screenId: string) => {
        if (!get().repliesMap.hasOwnProperty(screenId)) {
            try {
                const q = query(collection(db, repliesDBKey), where("screenId", "==", screenId));
                const querySnapshot = await getDocs(q);
                const repliesList = querySnapshot.docs.map((doc) => {
                    return ({
                        id: doc.id,
                        ...doc.data(),
                    })
                }) as Reply[];
                set((state) => ({
                    ...state,
                    repliesMap: { ...state.repliesMap, [screenId]: repliesList }
                }))
            } catch (e) {
                console.error(e);
            }
        }
    },
    getRepliesByScreenId: async (screenId: string) => {
        if (get().repliesMap.hasOwnProperty(screenId)) {
            const sorted = get().repliesMap[screenId].sort((a, b) => a.order - b.order);
            console.log( sorted );
            return sorted;
        } else {
            useScreenStore.getState().initRepliesForWholeChapter(screenId);
            await get().initRepliesByScreenId(screenId);
            if (get().repliesMap.hasOwnProperty(screenId)) {
                const sorted = get().repliesMap[screenId].sort((a, b) => a.order - b.order);
                return sorted;
            } else {
                return [];
            }
        }
    },
    emptyReplies: () => {
        set((state) => ({
            ...state,
            repliesMap: {}
        }))
    },
    addReply: async (newReply: any) => {
        const replyData = await addDoc(collection(db, repliesDBKey), newReply);
        set((state) => {
            console.log(state.repliesMap[newReply.screenId]);
            console.log(state.repliesMap);
            return{
            ...state,
            repliesMap: { ...state.repliesMap, [newReply.screenId]: [...state.repliesMap[newReply.screenId], { ...newReply, id: replyData.id }] }
        }})
    },
    deleteReply: async (id: string, screenId: string) => {
        try {
            const replyRef = doc(db, repliesDBKey, id);
            await deleteDoc(replyRef);
            const { repliesMap } = get();
            const replyList = [...repliesMap[screenId]];
            const filtered = replyList.filter(s => s.id !== id);
            if (filtered.length) {
                filtered.forEach(async (s, idx) => await get().updateReplyOrder(s, idx));
            }
            set((state) => ({
                ...state,
                repliesMap: { ...state.repliesMap, screenId: filtered }
            }))
            console.log(`Reply ${id} deleted.`);
        } catch (e) {
            console.error(e);
        }
    },
    updateReplyOrder: async (r: Reply, idx: number) => {
        r.order = idx + 1;
        await get().updateReply(r);
    },
    updateReply: async (reply: Reply, update?: boolean) => {
        const { repliesMap } = get();
        const replyList = [...repliesMap[reply.screenId]];
        const updated = replyList.map(repl =>
            repl.id === reply.id ? { ...repl, ...reply } : repl
        );
        set((state) => ({
            ...state,
            repliesMap: { ...state.repliesMap, [reply.screenId]: updated }
        }))
        if(update) {
            await updateDoc(doc(db, repliesDBKey, reply.id), { ...reply });
        }
    }
}));

export default useReplyStore;