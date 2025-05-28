import { useState } from "react";
import { getExchangeRates } from "../api/exchangeRateApi";
import { usePreloadedDataStore } from "../stores/usePreloadedDataStore";
import { ExchangeRates } from "../types/exchangeRate";

export const useExchangeRates = () => {
  const { exchangeRates: initialRates, error } = usePreloadedDataStore();
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(
    initialRates
  );
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchRates = async (amount: number): Promise<ExchangeRates | null> => {
    try {
      setLoading(true);
      setFetchError(null);
      const rates = await getExchangeRates(amount);
      setExchangeRates(rates);
      return rates;
    } catch {
      setFetchError(
        "Error al cargar las tasas de cambio. Por favor, intenta de nuevo."
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { exchangeRates, loading, error: error || fetchError, fetchRates };
};
