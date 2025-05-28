import { usePreloadedDataStore } from "../stores/usePreloadedDataStore";

export const useBanks = (countryId: string) => {
  const { banks, error } = usePreloadedDataStore();

  const filteredBanks = countryId
    ? banks.filter((bank) => bank.country_id === countryId)
    : [];

  return {
    banks: filteredBanks,
    error:
      filteredBanks.length === 0 && countryId
        ? "No hay bancos disponibles para este país"
        : error,
  };
};
