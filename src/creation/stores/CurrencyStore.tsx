import { create } from "zustand";
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db, storage } from "../../firebaseConfig";
import { getDownloadURL, ref } from "firebase/storage";
import useScreenStore, { screenDBKey } from "./ScreenStore";

export interface Currency {
  displayName: string;
  keyWord: string;
  startingValue: number;
  projectId: string;
  id: string;
}

export const currencyDBKey = "currencies";

interface CurrencyState {
  currencies: Currency[];
  initCurrencies: (projectId: string) => Promise<boolean>;
  emptyCurrencies: () => void;
  addCurrency: (newCurrency: any) => void;
  deleteCurrency: (id: string) => Promise<void>;
}

const useCurrencyStore = create<CurrencyState>((set, get) => ({
  currencies: [],
  initCurrencies: async (projectId: string) => {
    try {
      const q = query(collection(db, currencyDBKey), where("projectId", "==", projectId));
      const querySnapshot = await getDocs(q);
      const currencyList = querySnapshot.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      }) as Currency[];
      set((state) => ({
        ...state,
        currencies: currencyList,
      }));
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  emptyCurrencies: () => {
    set((state) => ({
      ...state,
      currencies: [],
    }));
  },
  deleteCurrency: async (id: string) => {
    try {
      const currencyRef = doc(db, currencyDBKey, id);
      await deleteDoc(currencyRef);
      const { currencies } = get();
      const filtered = currencies.filter((s) => s.id !== id);
      set((state) => ({
        ...state,
        currencies: filtered,
      }));
      console.log(`Currency ${id} deleted.`);
    } catch (e) {
      console.error(e);
    }
  },
  addCurrency: async (newCurrency: any) => {
    const currencyData = await addDoc(collection(db, currencyDBKey), newCurrency);
    set((state) => ({
      ...state,
      currencies: [...state.currencies, { ...newCurrency, id: currencyData.id }],
    }));
  },
}));

export default useCurrencyStore;
