import axios from "axios";
import { AUTH_TOKEN } from "../utils/authToken";

const API_BASE_URL = "https://backend-app-production.up.railway.app/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Authorization: `Bearer ${AUTH_TOKEN}`,
  },
  withCredentials: true,
});

export const checkServerAvailability = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(`${API_BASE_URL}/nonce`, {
      method: "GET",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    });
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
};

export default api;
