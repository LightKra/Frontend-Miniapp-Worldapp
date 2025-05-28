import api from "./apiClient";

export interface BalanceResponse {
  total: number;
}

interface ApiError {
  response?: {
    status: number;
    data: {
      message?: string;
    };
  };
  request?: unknown;
  message: string;
}

export const getWalletBalance = async (
  wallet: string
): Promise<BalanceResponse> => {
  if (!wallet) {
    throw new Error("La dirección de la wallet es requerida");
  }

  try {
    const response = await api.get(`/worldscan/user/balance/${wallet}`);

    if (response.status !== 200) {
      throw new Error(
        `Error al obtener el balance: ${response.status} ${response.statusText}`
      );
    }

    return response.data;
  } catch (error: unknown) {
    const apiError = error as ApiError;
    if (apiError.response) {
      throw new Error(
        `Error del servidor: ${apiError.response.status} - ${
          apiError.response.data.message || "Intenta de nuevo"
        }`
      );
    } else if (apiError.request) {
      throw new Error("Error de red. Verifica tu conexión e intenta de nuevo.");
    } else {
      throw new Error(`Error: ${apiError.message}`);
    }
  }
};
