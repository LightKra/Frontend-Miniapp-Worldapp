import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Country, Bank, DocumentType, AccountType, User } from "../types/api";
import { ExchangeRates } from "../types/exchangeRate";

interface PreloadedDataState {
  countries: Country[];
  banks: Bank[];
  documentTypes: DocumentType[];
  accountTypes: AccountType[];
  exchangeRates: ExchangeRates | null;
  currentUser: User | null;
  walletBalance: number;
  isLoading: boolean;
  error: string | null;
  isUserDataInitialized: boolean;
  setCountries: (countries: Country[]) => void;
  setBanks: (banks: Bank[]) => void;
  setDocumentTypes: (documentTypes: DocumentType[]) => void;
  setAccountTypes: (accountTypes: AccountType[]) => void;
  setExchangeRates: (exchangeRates: ExchangeRates | null) => void;
  setCurrentUser: (user: User | null) => void;
  setWalletBalance: (balance: number) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setUserDataInitialized: (initialized: boolean) => void;
  clearTransactionData: () => void;
  clearAllData: () => void;
}

export const usePreloadedDataStore = create<PreloadedDataState>()(
  persist(
    (set) => ({
      countries: [],
      banks: [],
      documentTypes: [],
      accountTypes: [],
      exchangeRates: null,
      currentUser: null,
      walletBalance: 0,
      isLoading: false,
      error: null,
      isUserDataInitialized: false,
      setCountries: (countries) => set({ countries }),
      setBanks: (banks) => set({ banks }),
      setDocumentTypes: (documentTypes) => set({ documentTypes }),
      setAccountTypes: (accountTypes) => set({ accountTypes }),
      setExchangeRates: (exchangeRates) => set({ exchangeRates }),
      setCurrentUser: (user) => set({ currentUser: user }),
      setWalletBalance: (walletBalance) => set({ walletBalance }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setUserDataInitialized: (initialized) =>
        set({ isUserDataInitialized: initialized }),
      clearTransactionData: () =>
        set({
          walletBalance: 0,
          error: null,
          exchangeRates: null,
          currentUser: null,
          isUserDataInitialized: false,
        }),
      clearAllData: () => {
        localStorage.removeItem("preloaded-data");
        set({
          countries: [],
          banks: [],
          documentTypes: [],
          accountTypes: [],
          exchangeRates: null,
          currentUser: null,
          walletBalance: 0,
          isLoading: false,
          error: null,
          isUserDataInitialized: false,
        });
      },
    }),
    {
      name: "preloaded-data",
      partialize: (state) => ({
        countries: state.countries,
        banks: state.banks,
        documentTypes: state.documentTypes,
        accountTypes: state.accountTypes,
      }),
    }
  )
);
