import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { create } from "zustand";
import { db, storage } from "../../firebaseConfig";
import { getDownloadURL, ref } from "firebase/storage";
import { ReferRequirement } from "../screens/ReferenceRequirement";

export interface Reference {
  id: string;
  title: string;
  text: string;
  image?: string;
  imageLocal?: string;
  projectId: string;
  requirements: ReferRequirement[];
}

export const referenceDBKey = "references";

interface ReferenceState {
  references: Reference[];
  initReferences: (projectId: string) => Promise<boolean>;
  emptyReferences: () => void;
  deleteReference: (id: string) => Promise<void>;
  addReference: (newReference: Reference) => Promise<string>;
  getReferenceById: (id: string) => Promise<Reference | undefined>;
  updateReference: (key: string, value: any, id: string, save?: boolean) => void;
  saveReference: (r: Reference) => Promise<void>;
  updateReferences: (refs: Reference[]) => void;
}

const useReferenceStore = create<ReferenceState>((set, get) => ({
  references: [],
  initReferences: async (projectId: string): Promise<boolean> => {
    try {
      const q = query(collection(db, referenceDBKey), where("projectId", "==", projectId));
      const querySnapshot = await getDocs(q);
      const referencesList = querySnapshot.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      }) as Reference[];
      set((state) => ({
        ...state,
        references: referencesList,
      }));
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  emptyReferences: () => {
    set((state) => ({
      ...state,
      references: [],
    }));
  },
  deleteReference: async (id: string) => {
    const referenceRef = doc(db, referenceDBKey, id);
    await deleteDoc(referenceRef);
    const { references } = get();
    const filtered = references.filter((c) => c.id !== id);
    set((state) => ({
      ...state,
      references: filtered,
    }));
    console.log(`Reference ${id} deleted.`);
  },
  addReference: async (newReference: any): Promise<string> => {
    const addedReference = await addDoc(collection(db, referenceDBKey), newReference);
    set((state) => ({
      ...state,
      references: [...state.references, { ...newReference, id: addedReference.id }],
    }));
    return addedReference.id;
  },
  getReferenceById: async (id: string) => {
    const re = get().references.find((reference) => reference.id === id);
    if (re?.image) {
      const fileRef = ref(storage, re.image);
      const url = await getDownloadURL(fileRef);
      return { ...re, imageLocal: url };
    } else {
      return re;
    }
  },
  updateReference: async (key: string, value: any, id: string, save?: boolean) => {
    const updatedReferences = get().references.map((reference) => (reference.id === id ? { ...reference, [key]: value } : reference));
    set((state) => ({
      ...state,
      references: updatedReferences,
    }));
  },
  saveReference: async (r: Reference) => {
    await updateDoc(doc(db, referenceDBKey, r.id), { ...r });
  },
  updateReferences: (updatedRefs: Reference[]) => {
    set((state) => ({
      ...state,
      references: updatedRefs,
    }));
  },
}));

export default useReferenceStore;
