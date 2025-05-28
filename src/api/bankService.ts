import api from "./apiClient";
import { Bank } from "../types/api";

export const getBanks = async (): Promise<Bank[]> => {
  try {
    const response = await api.get("/banks");
    return response.data;
  } catch {
    throw new Error();
  }
};

export const getBanksByCountry = async (countryId: string): Promise<Bank[]> => {
  try {
    const response = await api.get("/banks", {
      params: { country_id: countryId },
    });
    const banks = response.data;
    return banks.filter((bank: Bank) => bank.country_id === countryId);
  } catch {
    throw new Error();
  }
};

export const getBankById = async (id: string): Promise<Bank> => {
  try {
    const response = await api.get(`/banks/${id}`);
    return response.data;
  } catch {
    throw new Error();
  }
};

export const createBank = async (bankData: {
  name: string;
  country_id: string;
}): Promise<Bank> => {
  try {
    const response = await api.post("/banks", bankData);
    return response.data;
  } catch {
    throw new Error();
  }
};

export const updateBank = async (
  id: string,
  bankData: {
    name: string;
    country_id: string;
  }
): Promise<Bank> => {
  try {
    const response = await api.put(`/banks/${id}`, bankData);
    return response.data;
  } catch {
    throw new Error();
  }
};

export const deleteBank = async (id: string): Promise<void> => {
  try {
    await api.delete(`/banks/${id}`);
  } catch {
    throw new Error();
  }
};
