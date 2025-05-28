import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { CheckCircle, XCircle } from "lucide-react";
import { useCheckboxGroup } from "../hooks/useCheckboxGroup";
import { useBankName } from "../hooks/summary/useBankName";
import { useDocumentTypeName } from "../hooks/summary/useDocumentTypeName";
import { useAccountTypeName } from "../hooks/summary/useAccountTypeName";
import { CheckboxState } from "../types/transaction";
import { useTransactionStore } from "../stores/transactionStore";
import { handlePay } from "../components/pay";
import AppLayout from "../common/AppLayout";
import api from "../api/apiClient";
import { usePreloadedDataStore } from "../stores/usePreloadedDataStore";
import { getCurrencies } from "../api/currencyService";

const initialCheckboxState: CheckboxState = {
  age: false,
  terms: false,
  privacy: false,
};

function TransactionSummary() {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { checkboxes, handleChange, areAllChecked } =
    useCheckboxGroup<CheckboxState>(initialCheckboxState);
  const { transaction } = useTransactionStore();
  const { countries, walletBalance } = usePreloadedDataStore();

  const { bankName } = useBankName(transaction.bankId || "");
  const { documentTypeName } = useDocumentTypeName(
    transaction.documentType || ""
  );
  const { accountTypeName } = useAccountTypeName(transaction.accountType || "");

  const transactionData = useMemo(
    () => ({
      fullName: transaction.fullName || "No especificado",
      email: transaction.email || "No especificado",
      phone: transaction.phone || "No especificado",
      documentNumber: transaction.documentNumber || "No especificado",
      country: transaction.country || "No especificado",
      amount: parseFloat(transaction.amount || "0").toLocaleString("es-ES", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 8,
        useGrouping: false,
      }),
      receives: transaction.receives || "0",
      accountNumber: transaction.accountNumber
        ? `**** ${transaction.accountNumber.slice(-4)}`
        : "No especificado",
    }),
    [transaction]
  );

  const areDataLoaded = useMemo(() => {
    if (!transaction.userId || !transaction.worldId) {
      navigate("/");
      return false;
    }

    const requiredFields = [
      "fullName",
      "email",
      "phone",
      "documentType",
      "documentNumber",
      "accountType",
      "accountNumber",
      "bankId",
      "country",
      "amount",
      "receives",
    ];

    return requiredFields.every(
      (field) => transaction[field as keyof typeof transaction]
    );
  }, [transaction, navigate]);

  const currency = useMemo(() => {
    return transaction.country?.toLowerCase() === "colombia"
      ? "COP"
      : transaction.country?.toLowerCase() === "venezuela"
      ? "VES"
      : "Moneda no soportada";
  }, [transaction.country]);

  const countryId = useMemo(() => {
    const country = countries.find(
      (c) => c.name.toLowerCase() === transaction.country?.toLowerCase()
    );
    return country?.id || "";
  }, [countries, transaction.country]);

  const getCurrencyId = useCallback(async () => {
    const currencyName = currency;
    const currencies = await getCurrencies();
    const currencyObj = currencies.find((c) => c.name === currencyName);
    if (!currencyObj) throw new Error("Moneda no encontrada");
    return currencyObj.id;
  }, [currency]);

  const handleConfirm = useCallback(async () => {
    if (!areAllChecked) {
      setApiError("Debes aceptar todos los términos para continuar.");
      setIsSuccess(false);
      return;
    }

    if (!transaction.userId || !transaction.worldId) {
      setApiError("No se encontró la información del usuario.");
      setIsSuccess(false);
      return;
    }

    setIsLoading(true);
    setApiError(null);
    setIsSuccess(null);

    try {
      const amountToSend = parseFloat(
        transaction.amount.replace(",", ".") || "0"
      );
      const amountReceived = parseFloat(
        transaction.receives.replace(/\./g, "").replace(",", ".") || "0"
      );

      if (Number(amountToSend.toFixed(8)) > Number(walletBalance.toFixed(8))) {
        setApiError("No tienes saldo suficiente.");
        setIsSuccess(false);
        return;
      }

      const [paymentResponse, currencyId] = await Promise.all([
        handlePay(),
        getCurrencyId(),
      ]);

      if (!paymentResponse?.success) throw new Error("Error en el pago");

      if (
        !transaction.accountNumber ||
        !/^\d+$/.test(transaction.accountNumber)
      ) {
        throw new Error("Número de cuenta inválido");
      }

      const transactionPayload = {
        user_id: transaction.userId,
        quantity: amountToSend,
        amount_received: amountReceived,
        currency_id: currencyId,
        country_id: countryId,
        country: transaction.country,
        document_type_id: transaction.documentType,
        document_number: transaction.documentNumber,
        bank_id: transaction.bankId,
        account_number: transaction.accountNumber,
        account_type_id: transaction.accountType,
        state: "completed",
      };

      const emailPayload = {
        user_name: transaction.fullName,
        user_email: transaction.email,
        user_phone: transaction.phone,
        wallet_address: transaction.worldId?.toLowerCase(),
        quantity: amountToSend,
        cryptoCurrency: "WLD",
        amount_received: amountReceived,
        fiatCurrency: currency,
        state: "Completada",
        document_type: documentTypeName || "No especificado",
        document_number: transaction.documentNumber,
        bank: bankName || "No especificado",
        country: transaction.country || "No especificado",
        account_number: transaction.accountNumber,
        account_type: accountTypeName || "No especificado",
      };

      const [transactionResponse] = await Promise.all([
        api.post("/transactions", {
          ...transactionPayload,
          emailData: emailPayload,
        }),
        api.post("/send-email", emailPayload),
      ]);

      if ([200, 201].includes(transactionResponse.status)) {
        setIsSuccess(true);
        usePreloadedDataStore.getState().clearTransactionData();
        const transactionId =
          transactionResponse.data?.id ||
          transactionResponse.data?.transaction_id ||
          transactionResponse.data?.data?.id;

        if (transactionId) {
          setTimeout(
            () => navigate(`/transaction-details/${transactionId}`),
            2000
          );
        }
      } else {
        throw new Error();
      }
    } catch {
      setApiError("Transacción NO exitosa");
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  }, [
    areAllChecked,
    transaction,
    walletBalance,
    documentTypeName,
    bankName,
    accountTypeName,
    countryId,
    currency,
    getCurrencyId,
    navigate,
  ]);

  return (
    <AppLayout showAccreditationTimes={false}>
      <div className="mb-8">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-t-2xl">
          <h2 className="text-xl font-semibold text-white">
            Resumen de la transacción
          </h2>
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-b-2xl space-y-4">
          {Object.entries({
            "Nombre completo": transactionData.fullName,
            "Correo electrónico": transactionData.email,
            Teléfono: transactionData.phone,
            "Tipo de documento": documentTypeName || "No especificado",
            "Número de documento": transactionData.documentNumber,
            País: transactionData.country,
            Envías: `${transactionData.amount} WLD`,
            Recibes: `${transactionData.receives} ${currency}`,
            Banco: bankName || "No especificado",
            "Tipo de cuenta": accountTypeName || "No especificado",
            "Número de cuenta": transactionData.accountNumber,
          }).map(([label, value]) => (
            <div key={label} className="flex justify-between">
              <span className="text-gray-600">{label}:</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 mb-8">
        {
          Object.entries({
            age: "Soy mayor de edad.",
            terms: "He leído y acepto los términos y condiciones",
            privacy:
              "He leído y autorizo el tratamiento de datos personales de acuerdo con la política de privacidad.",
          }).map(([name, text], index) => (
            <label key={name} className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name={name}
                className="mt-1"
                checked={checkboxes[name as keyof CheckboxState]}
                onChange={handleChange}
                disabled={isLoading}
              />
              {index === 0 && <span className="text-sm">{text}</span>}
              {
                index === 1 && 
                <span className="text-sm">
                  <a 
                  className="text-indigo-600 hover:text-indigo-800 underline"
                  href="https://www.cosmosinvestments.com.co/terminos-y-condiciones">
                    {text}
                  </a>  
                </span>
              }
              {
              index === 2 && 
                <span className="text-sm">
                  <a 
                  className="text-indigo-600 hover:text-indigo-800 underline"
                  href="https://www.cosmosinvestments.com.co/politica-de-privacidad">
                    {text}
                  </a>
                </span>
              }
            </label>
          ))
        }
      </div>

      {apiError && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-red-200 mb-4">
          <h3 className="text-red-600 font-semibold mb-2">
            Transacción NO exitosa
          </h3>
          <div className="text-red-500 text-sm">{apiError}</div>
        </div>
      )}

      {isSuccess !== null && (
        <div className="text-center space-y-4 mt-4" role="alert">
          {isSuccess ? (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <p className="text-xl font-semibold text-green-500">
                Transacción exitosa
              </p>
            </>
          ) : (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto" />
              <p className="text-xl font-semibold text-red-500">
                Transacción NO exitosa
              </p>
            </>
          )}
        </div>
      )}

      <div className="space-y-4 mt-4">
        <div className="flex gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            Regresar
          </button>
          <button
            onClick={handleConfirm}
            disabled={
              !areAllChecked ||
              isLoading ||
              !areDataLoaded ||
              !bankName ||
              !documentTypeName ||
              !accountTypeName
            }
            className="w-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? "Procesando..." : "Confirmar transacción"}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}

export default TransactionSummary;
