import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useForm } from "../hooks/useForm";
import { useExchangeRates } from "../hooks/useExchangeRates";
import { useBanks } from "../hooks/useBanks";
import { useCountries } from "../hooks/useCountries";
import { TransactionFormData } from "../types/transaction";
import { validateInitialForm, hasErrors } from "../utils/validation";
import { useTransactionStore } from "../stores/transactionStore";
import { usePreloadedDataStore } from "../stores/usePreloadedDataStore";
import AppLayout from "../common/AppLayout";
import { getWalletBalance } from "../api/worldscanService";
import { checkServerAvailability } from "../api/apiClient";

const initialState: TransactionFormData = {
  country: "Colombia",
  amount: "",
  receives: "0",
  paymentMethod: "bank_transfer",
  fullName: "",
  email: "",
  phone: "",
  documentType: "",
  documentNumber: "",
  accountType: "",
  accountNumber: "",
  worldId: "",
  userId: "",
  bankId: "",
};

function InitialForm() {
  const navigate = useNavigate();
  const {
    exchangeRates,
    loading: ratesLoading,
    error: ratesError,
    fetchRates,
  } = useExchangeRates();
  const { formData, handleChange, handleSubmit } =
    useForm<TransactionFormData>(initialState);
  const { countries, error: countriesError } = useCountries();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { setTransaction, transaction } = useTransactionStore();
  const { walletBalance, isLoading: preloadLoading } = usePreloadedDataStore();
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (!transaction?.userId || !transaction?.worldId) {
      navigate("/");
    }
  }, [transaction, navigate]);

  const selectedCountry = countries.find(
    (country) => country.name.toLowerCase() === formData.country.toLowerCase()
  );
  const countryId = selectedCountry?.id || "";
  const { banks } = useBanks(countryId);

  const parseInputNumber = (value: string): number => {
    const cleanValue = value.replace(/[^\d.,]/g, "").replace(",", ".");
    const parsedValue = parseFloat(cleanValue);
    return isNaN(parsedValue) ? 0 : Number(parsedValue.toFixed(8)); // redondeo exacto
  };

  const formatWLDNumber = (value: number): string => {
    return value
      .toLocaleString("es-ES", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 8,
        useGrouping: false,
      })
      .replace(".", ",");
  };

  const formatLocalCurrencyNumber = (value: number): string => {
    const parts = value.toFixed(2).split(".");
    let integerPart = parts[0];
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    const decimalPart = parts[1] || "00";
    return `${integerPart},${decimalPart}`;
  };

  const calculateReceives = async (
    amount: string,
    country: string
  ): Promise<string> => {
    if (!amount || !country) {
      return "0,00";
    }

    const amountNum = parseInputNumber(amount);
    if (amountNum < 0) {
      setErrors((prev) => ({
        ...prev,
        amount: "Por favor, ingresa un monto válido mayor o igual a 0.",
      }));
      return "0,00";
    }

    try {
      const rates = await fetchRates(amountNum);
      if (!rates || typeof rates !== "object") {
        setErrors((prev) => ({
          ...prev,
          receives: "No se pudieron obtener las tasas de cambio.",
        }));
        return "0,00";
      }

      const rateKey = country === "Colombia" ? "wild_to_cop" : "wild_to_ves";
      const rate = rates[rateKey];
      if (!rate) {
        setErrors((prev) => ({
          ...prev,
          receives: `Ingresa el monto en WLD para ver la conversión a ${country}`,
        }));
        return "0,00";
      }

      const receives = rate;
      const roundedReceives = Number(receives.toFixed(2));
      setErrors((prev) => ({ ...prev, amount: "", receives: "" }));
      return formatLocalCurrencyNumber(roundedReceives);
    } catch {
      setErrors((prev) => ({
        ...prev,
        receives: "Error al calcular el monto a recibir.",
      }));
      return "0,00";
    }
  };

  const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  const debouncedInputValue = useDebounce(inputValue, 300);

  useEffect(() => {
    const updateReceives = async () => {
      if (!debouncedInputValue) {
        handleChange({
          target: { name: "receives", value: "0,00" },
        } as React.ChangeEvent<HTMLInputElement>);
        return;
      }

      const numericValue = parseInputNumber(debouncedInputValue);
      const receives = await calculateReceives(
        numericValue.toString(),
        formData.country
      );
      handleChange({
        target: { name: "receives", value: receives },
      } as React.ChangeEvent<HTMLInputElement>);
    };
    updateReceives();
  }, [debouncedInputValue, formData.country]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    if (!/^[0-9]*[,.]?[0-9]*$/.test(rawValue) && rawValue !== "") {
      return;
    }

    setInputValue(rawValue);
    const numericValue = parseInputNumber(rawValue);

    if (numericValue < 0.01) {
      setErrors((prev) => ({
        ...prev,
        amount: "El monto mínimo debe ser 0,01 WLD",
      }));
      return;
    }

    if (numericValue > walletBalance) {
      setErrors((prev) => ({
        ...prev,
        amount: "No tienes saldo suficiente",
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        amount: "",
      }));
    }

    const amountForStore = numericValue.toString().replace(",", ".");
    handleChange({
      target: { name: "amount", value: amountForStore },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const handleAmountBlur = () => {
    if (!inputValue) {
      setInputValue("0");
      handleChange({
        target: { name: "amount", value: "0" },
      } as React.ChangeEvent<HTMLInputElement>);
      handleChange({
        target: { name: "receives", value: "0,00" },
      } as React.ChangeEvent<HTMLInputElement>);
      return;
    }

    const numericValue = parseInputNumber(inputValue);
    if (numericValue > walletBalance) {
      setErrors((prev) => ({
        ...prev,
        amount: "No tienes saldo suficiente",
      }));
    }

    const formattedValue = formatWLDNumber(numericValue);
    setInputValue(formattedValue);
    const amountForStore = numericValue.toString().replace(",", ".");
    handleChange({
      target: { name: "amount", value: amountForStore },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const handleMaxClick = async () => {
    if (!transaction.worldId) {
      setErrors((prev) => ({
        ...prev,
        amount:
          "No se encontró la dirección de la wallet. Por favor, autentícate nuevamente.",
      }));
      return;
    }

    const walletRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!walletRegex.test(transaction.worldId)) {
      setErrors((prev) => ({
        ...prev,
        amount: "La dirección de la wallet no es válida.",
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, amount: "" }));
    setIsLoading(true);

    try {
      const isServerAvailable = await checkServerAvailability();
      if (!isServerAvailable) {
        setErrors((prev) => ({
          ...prev,
          amount: "El servidor no está disponible. Intenta de nuevo más tarde.",
        }));
        return;
      }

      const balanceResponse = await getWalletBalance(transaction.worldId);
      if (balanceResponse.total < 0.01) {
        setErrors((prev) => ({
          ...prev,
          amount: "Tu saldo es menor al mínimo requerido (0,01 WLD)",
        }));
        setIsLoading(false);
        return;
      }

      const formattedTotal = Number(balanceResponse.total.toFixed(8));
      usePreloadedDataStore.setState({ walletBalance: formattedTotal });
      const amountForStore = formattedTotal.toString();
      const displayValue = formatWLDNumber(formattedTotal);
      setInputValue(displayValue);
      setTransaction({ amount: amountForStore });
      handleChange({
        target: { name: "amount", value: amountForStore },
      } as React.ChangeEvent<HTMLInputElement>);
      const receives = await calculateReceives(
        amountForStore,
        formData.country
      );
      handleChange({
        target: { name: "receives", value: receives },
      } as React.ChangeEvent<HTMLInputElement>);
    } catch {
      setErrors((prev) => ({
        ...prev,
        amount: "No se pudo obtener el saldo de la wallet. Intenta de nuevo.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCountryChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newCountry = e.target.value;
    handleChange(e);
    handleChange({
      target: { name: "bankId", value: "" },
    } as React.ChangeEvent<HTMLInputElement>);
    const currentAmount = formData.amount || "0";
    const receives = await calculateReceives(currentAmount, newCountry);
    handleChange({
      target: { name: "receives", value: receives },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const getCurrencyLabel = () => {
    if (formData.country === "Colombia") return "COP";
    if (formData.country === "Venezuela") return "VES";
    return "Moneda no soportada";
  };

  const onSubmit = () => {
    const validationErrors = validateInitialForm(formData);
    const amountNum = parseInputNumber(formData.amount);

    if (amountNum < 0.01) {
      validationErrors.amount = "El monto mínimo debe ser 0,01 WLD";
    }

    if (amountNum > walletBalance) {
      validationErrors.amount = "No tienes saldo suficiente";
    }

    const receivesNum = parseInputNumber(
      formData.receives.replace(".", "").replace(",", ".")
    );
    if (receivesNum <= 0) {
      validationErrors.receives = "El monto a recibir debe ser mayor a 0";
    }

    if (!formData.bankId) {
      validationErrors.bankId = "Debes seleccionar un banco";
    }

    setErrors(validationErrors);
    if (!hasErrors(validationErrors)) {
      const selectedCountry = countries.find(
        (country) =>
          country.name.toLowerCase() === formData.country.toLowerCase()
      );
      setTransaction({
        country: formData.country,
        country_id: selectedCountry?.id || "",
        bankId: formData.bankId,
        amount: formData.amount,
        receives: formData.receives,
      });
      navigate("/personal-info");
    }
  };
  //solo aqui cambie para mayor precision por caso los redondeos con el minimo de la regla y no se active el boton de continuar
  const isSubmitDisabled = () => {
    const amountNum = Number(formData.amount);
    if (!formData.bankId) return true;
    if (amountNum < 0.009999) return true;
    if (typeof walletBalance === "number" && amountNum > walletBalance)
      return true;
    if (ratesLoading || !exchangeRates) return true;
    return false;
  };

  if (preloadLoading) {
    return (
      <AppLayout showBackButton={false}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (countriesError) {
    return (
      <AppLayout showBackButton={false}>
        <div className="p-6">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{countriesError}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-indigo-600 text-white font-medium py-3 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showBackButton={false}>
      {ratesLoading && <p>Cargando tasas de cambio...</p>}
      {ratesError && (
        <p className="text-red-500">
          {ratesError}. No pudimos conectar con el servidor de tasas de cambio.
          Por favor, reinicia la app e inténtalo nuevamente. Estamos trabajando
          para solucionarlo.
        </p>
      )}

      <form onSubmit={(e) => handleSubmit(e, onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecciona el país:
          </label>
          <select
            name="country"
            className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.country}
            onChange={handleCountryChange}
            required
          >
            <option value="">Seleccionar país</option>
            {countries.map((country) => (
              <option key={country.id} value={country.name}>
                {country.name}
              </option>
            ))}
          </select>
          {errors.country && (
            <p className="text-red-500 text-sm mt-1">{errors.country}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Envías (WLD):
          </label>
          <div className="relative">
            <input
              type="text"
              name="amount"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-24"
              placeholder="0,0"
              value={inputValue}
              onChange={handleAmountChange}
              onBlur={handleAmountBlur}
              required
            />
            <button
              type="button"
              onClick={handleMaxClick}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !transaction.worldId}
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                "MAX"
              )}
            </button>
          </div>
          {errors.amount && (
            <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recibes ({getCurrencyLabel()}):
          </label>
          <div className="relative">
            <input
              type="text"
              name="receives"
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 pr-16"
              placeholder="0,00"
              value={formData.receives ? formData.receives : "0,00"}
              readOnly
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              {getCurrencyLabel()}
            </span>
          </div>
          {errors.receives && (
            <p className="text-red-500 text-sm mt-1">{errors.receives}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecciona un banco:
          </label>
          <select
            name="bankId"
            className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.bankId}
            onChange={handleChange}
            required
            disabled={!formData.country}
          >
            <option value="">Seleccionar banco</option>
            {banks.map((bank) => (
              <option key={bank.id} value={bank.id}>
                {bank.name}
              </option>
            ))}
          </select>
          {errors.bankId && (
            <p className="text-red-500 text-sm mt-1">{errors.bankId}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={isSubmitDisabled()}
        >
          Continuar
        </button>
      </form>
    </AppLayout>
  );
}

export default InitialForm;
