import api from "./apiClient";
import { Country } from "../types/api";

export const getCountries = async (): Promise<Country[]> => {
  try {
    const response = await api.get("/countries");
    return response.data;
  } catch {
    throw new Error();
  }
};

export const getCountryById = async (id: string): Promise<Country> => {
  try {
    const response = await api.get(`/countries/${id}`);
    return response.data;
  } catch {
    throw new Error();
  }
};

export const createCountry = async (countryData: {
  name: string;
}): Promise<Country> => {
  try {
    const response = await api.post("/countries", countryData);
    return response.data;
  } catch {
    throw new Error();
  }
};
