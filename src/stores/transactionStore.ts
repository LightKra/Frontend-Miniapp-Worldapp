import { create } from "zustand";

export interface TransactionFormData {
  country: string;
  amount: string;
  receives: string;
  paymentMethod: "bank_transfer";
  fullName: string;
  email: string;
  phone: string;
  documentType: string;
  documentNumber: string;
  accountType: string;
  accountNumber: string;
  worldId: string;
  userId: string;
  bankId: string;
  currency_id?: string;
  country_id?: string;
}

interface TransactionState {
  transaction: TransactionFormData & { bankName?: string };
  setTransaction: (
    data: Partial<TransactionFormData & { bankName?: string }>
  ) => void;
  resetTransaction: () => void;
}

const initialTransactionState: TransactionFormData = {
  country: "",
  amount: "0",
  receives: "0",
  paymentMethod: "bank_transfer",
  fullName: "",
  email: "",
  phone: "",
  documentType: "",
  documentNumber: "",
  accountType: "",
  accountNumber: "",
  worldId: "",
  userId: "",
  bankId: "",
  currency_id: "",
  country_id: "",
};

export const useTransactionStore = create<TransactionState>((set) => ({
  transaction: initialTransactionState,
  setTransaction: (data) =>
    set((state) => ({
      transaction: { ...state.transaction, ...data },
    })),
  resetTransaction: () =>
    set(() => ({
      transaction: initialTransactionState,
    })),
}));
