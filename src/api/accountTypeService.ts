import api from "./apiClient";
import { AccountType } from "../types/api";

export const getAccountTypes = async (
  countryId?: string
): Promise<AccountType[]> => {
  try {
    const response = await api.get("/accounts-type", {
      params: countryId ? { country_id: countryId } : undefined,
    });
    return Array.isArray(response.data) ? response.data : [];
  } catch {
    throw new Error();
  }
};

export const getAccountTypeById = async (id: string): Promise<AccountType> => {
  try {
    const response = await api.get(`/accounts-type/${id}`);
    return response.data;
  } catch {
    throw new Error();
  }
};

export const createAccountType = async (accountTypeData: {
  name: string;
}): Promise<AccountType> => {
  try {
    const response = await api.post("/accounts-type", accountTypeData);
    return response.data;
  } catch {
    throw new Error();
  }
};

export const updateAccountType = async (
  id: string,
  accountTypeData: {
    name: string;
  }
): Promise<AccountType> => {
  try {
    const response = await api.put(`/accounts-type/${id}`, accountTypeData);
    return response.data;
  } catch {
    throw new Error();
  }
};

export const deleteAccountType = async (id: string): Promise<void> => {
  try {
    await api.delete(`/accounts-type/${id}`);
  } catch {
    throw new Error();
  }
};
