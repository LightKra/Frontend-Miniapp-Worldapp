import api from "./apiClient";
import { DocumentType } from "../types/api";

export const getDocumentTypes = async (): Promise<DocumentType[]> => {
  try {
    const response = await api.get("/documents-type");
    return response.data;
  } catch {
    throw new Error();
  }
};

export const getDocumentTypesByCountry = async (
  countryId: string
): Promise<DocumentType[]> => {
  try {
    const response = await api.get(`/documents-type?country_id=${countryId}`);
    return response.data;
  } catch {
    throw new Error();
  }
};

export const getDocumentTypeById = async (
  id: string
): Promise<DocumentType> => {
  try {
    const response = await api.get(`/documents-type/${id}`);
    return response.data;
  } catch {
    throw new Error();
  }
};
