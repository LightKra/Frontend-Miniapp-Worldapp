import { MiniKit } from "@worldcoin/minikit-js";
import { AUTH_TOKEN } from "../utils/authToken";

const API_BASE_URL = "https://backend-app-production.up.railway.app";

export interface User {
  id: string;
  wallet_address: string;
}

export const getNonce = async (): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/nonce`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error();
    }

    const data = await response.json();
    return data.nonce;
  } catch {
    throw new Error();
  }
};

export const signInWithWallet = async (nonce: string) => {
  const maxRetries = 2;
  let retryCount = 0;
  let lastError: Error | null = null;

  if (!window.MiniKit) {
    throw new Error();
  }

  const timeoutPromise = new Promise<never>((_, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error());
    }, 10000);
  });

  while (retryCount <= maxRetries) {
    try {
      if (!window.MiniKit) {
        throw new Error();
      }

      if (!nonce || typeof nonce !== "string") {
        throw new Error();
      }

      const result = await MiniKit.commandsAsync.walletAuth({
        nonce: nonce,
        requestId: "0",
        expirationTime: new Date(new Date().getTime() + 5 * 60 * 1000),
      });

      let extractedWalletAddress = "";
      const fullResultString = JSON.stringify(result);
      const walletRegex = /0x[a-fA-F0-9]{40}/;
      const walletMatches = fullResultString.match(walletRegex);
      if (walletMatches && walletMatches.length > 0) {
        extractedWalletAddress = walletMatches[0].toLowerCase();
      }

      if (result.finalPayload && !extractedWalletAddress) {
        const stringifiedPayload = JSON.stringify(result.finalPayload);
        const walletMatches = stringifiedPayload.match(walletRegex);
        if (walletMatches && walletMatches.length > 0) {
          extractedWalletAddress = walletMatches[0].toLowerCase();
        }

        const payload = result.finalPayload;
        if (typeof payload === "object") {
          const payloadObj = payload as Record<string, unknown>;
          if (
            payloadObj.credential &&
            typeof payloadObj.credential === "object"
          ) {
            const credential = payloadObj.credential as Record<string, unknown>;
            if (credential.sub && typeof credential.sub === "string") {
              extractedWalletAddress = credential.sub.toLowerCase();
            }
          }

          const possibleFieldNames = [
            "wallet_address",
            "walletAddress",
            "wallet",
            "address",
            "sub",
            "subject",
            "user",
            "userId",
            "id",
          ];

          for (const fieldName of possibleFieldNames) {
            const field = payloadObj[fieldName];
            if (field && typeof field === "string" && field.length > 8) {
              extractedWalletAddress =
                extractedWalletAddress || field.toLowerCase();
            }
          }
        }
      }

      const fetchPromise = fetch(`${API_BASE_URL}/api/v1/verify-login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AUTH_TOKEN}`,
        },
        body: JSON.stringify({
          nonce: nonce,
          payload: result.finalPayload,
          extractedWallet: extractedWalletAddress,
        }),
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]);

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();
      const formattedData = {
        userId: data.userId || data.user_id || data.id || "",
        wallet_address:
          data.wallet_address ||
          data.walletAddress ||
          data.wallet ||
          extractedWalletAddress ||
          "",
      };

      if (!formattedData.userId && !formattedData.wallet_address) {
        throw new Error();
      }

      return formattedData;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error();
      retryCount++;
      if (retryCount <= maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        continue;
      }
      throw new Error();
    }
  }

  throw lastError || new Error();
};
