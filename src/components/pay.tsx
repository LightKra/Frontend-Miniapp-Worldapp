import {
  MiniKit,
  tokenToDecimals,
  Tokens,
  PayCommandInput,
} from "@worldcoin/minikit-js";
import { useTransactionStore } from "../stores/transactionStore";
import { usePreloadedDataStore } from "../stores/usePreloadedDataStore";
import { AUTH_TOKEN } from "../utils/authToken";

const sendPayment = async () => {
  try {
    const { transaction } = useTransactionStore.getState();
    const { walletBalance } = usePreloadedDataStore.getState();
    const amount = transaction.amount?.replace(",", ".") || "0";
    const numericAmount = parseFloat(amount);
    const numericBalance = Number(walletBalance);

    if (numericAmount > numericBalance) {
      throw new Error();
    }

    if (isNaN(numericAmount)) {
      throw new Error();
    }

    const tokenAmount = tokenToDecimals(numericAmount, Tokens.WLD).toString();
    const res = await fetch(
      `https://backend-app-production.up.railway.app/api/v1/nonce-payment`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error();
    }

    const data = await res.json();
    if (!data.id) {
      throw new Error();
    }

    const payload: PayCommandInput = {
      reference: data.id,
      to: "0xa2f329cb66feac2925a94caefe20ef0b0b0f3e40",
      tokens: [
        {
          symbol: Tokens.WLD,
          token_amount: tokenAmount,
        },
      ],
      description: "ENVIAR MONEDAS",
    };

    if (MiniKit.isInstalled()) {
      return await MiniKit.commandsAsync.pay(payload);
    }
    throw new Error();
  } catch {
    throw new Error();
  }
};

export const handlePay = async () => {
  try {
    if (!MiniKit.isInstalled()) {
      throw new Error();
    }

    const sendPaymentResponse = await sendPayment();
    const response = sendPaymentResponse?.finalPayload;
    if (!response) {
      throw new Error();
    }

    if (response.status === "success") {
      const res = await fetch(
        `https://backend-app-production.up.railway.app/api/v1/confirm-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AUTH_TOKEN}`,
          },
          credentials: "include",
          body: JSON.stringify({ payload: response }),
        }
      );

      if (!res.ok) {
        throw new Error();
      }

      const payment = await res.json();
      if (payment.success) {
        return payment;
      }
      throw new Error();
    }
    throw new Error();
  } catch {
    throw new Error();
  }
};
