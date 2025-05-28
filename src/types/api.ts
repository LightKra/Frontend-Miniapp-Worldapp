export interface User {
  id?: string;
  wallet_address: string;
  name: string;
  email: string;
  phone: string;
}

export interface Transaction {
  id: string;
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
  created_at?: string;
  updated_at?: string;
}

export interface Bank {
  id: string;
  name: string;
  country_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface Country {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface Currency {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface DocumentType {
  id: string;
  name: string;
  country_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface AccountType {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}
