import { MiniKit } from "@worldcoin/minikit-js";

export interface TransactionFormData {
  country: string;
  amount: string;
  receives: string;
  paymentMethod: string;
  bankId: string;
  fullName: string;
  email: string;
  phone: string;
  documentType: string;
  documentNumber: string;
  accountType: string;
  accountNumber: string;
  worldId: string;
  userId: string;
}

export interface TransactionPayload {
  user_id: string;
  quantity: number;
  amount_received: number;
  currency_id: string;
  country_id: string;
  document_type_id: string;
  document_number: string;
  bank_id: string;
  account_number: string;
  account_type_id: string;
  state: string;
}

export interface CheckboxState {
  age: boolean;
  terms: boolean;
  privacy: boolean;
  [key: string]: boolean;
}

declare global {
  interface Window {
    MiniKit?: typeof MiniKit;
  }
}
