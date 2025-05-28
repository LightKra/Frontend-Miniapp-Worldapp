import { usePreloadedDataStore } from "../stores/usePreloadedDataStore";

export const useDocumentTypes = (countryId: string) => {
  const { documentTypes, error } = usePreloadedDataStore();

  const filteredDocumentTypes = countryId
    ? documentTypes.filter(
        (docType) =>
          docType.country_id.toLowerCase() === countryId.toLowerCase()
      )
    : [];

  return { documentTypes: filteredDocumentTypes, error };
};
