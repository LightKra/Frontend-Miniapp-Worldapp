import api from "./apiClient";
import { ExchangeRate, ExchangeRates } from "../types/exchangeRate";

export const getExchangeRates = async (
  amount: number = 1
): Promise<ExchangeRates> => {
  const [copResponse, vesResponse] = await Promise.all([
    api.get<ExchangeRate>(`/exchange-rates/colombia/${amount}`),
    api.get<ExchangeRate>(`/exchange-rates/venezuela/${amount}`),
  ]);

  return {
    wild_to_cop: copResponse.data.total,
    wild_to_ves: vesResponse.data.total,
  };
};
