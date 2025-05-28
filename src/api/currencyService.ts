import api from "./apiClient";
import { Currency } from "../types/api";

export const getCurrencies = async (): Promise<Currency[]> => {
  try {
    const response = await api.get("/currencies");
    return response.data;
  } catch {
    throw new Error();
  }
};

export const getCurrencyById = async (id: string): Promise<Currency> => {
  try {
    const response = await api.get(`/currencies/${id}`);
    return response.data;
  } catch {
    throw new Error();
  }
};
