import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useForm } from "../hooks/useForm";
import { useCountries } from "../hooks/useCountries";
import { useDocumentTypes } from "../hooks/useDocumentTypes";
import { useAccountTypes } from "../hooks/useAccountTypes";
import { TransactionFormData } from "../types/transaction";
import { validatePersonalInfo, hasErrors } from "../utils/validation";
import { useTransactionStore } from "../stores/transactionStore";
import { updateUser, getUserByWalletAddress } from "../api/userService";
import AppLayout from "../common/AppLayout";
import { usePreloadedDataStore } from "../stores/usePreloadedDataStore";

const initialState: TransactionFormData = {
  country: "",
  amount: "0",
  receives: "0",
  paymentMethod: "",
  bankId: "",
  fullName: "",
  email: "",
  phone: "",
  documentType: "",
  documentNumber: "",
  accountType: "",
  accountNumber: "",
  worldId: "",
  userId: "",
};

function PersonalInfo() {
  const navigate = useNavigate();
  const { formData, handleChange, handleSubmit, setFormData } =
    useForm<TransactionFormData>(initialState);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(true);
  const [worldId, setWorldId] = useState<string | null>(null);
  const { setTransaction, transaction } = useTransactionStore();
  const { currentUser, isUserDataInitialized, setUserDataInitialized } =
    usePreloadedDataStore();

  const { countries } = useCountries();
  const selectedCountry = countries.find(
    (country) =>
      country.name.toLowerCase() === (transaction?.country || "").toLowerCase()
  );
  const countryId = selectedCountry?.id || "";
  const { accountTypes } = useAccountTypes(countryId);
  const { documentTypes } = useDocumentTypes(countryId);

  useEffect(() => {
    if (!transaction?.country || !transaction?.bankId || !transaction?.userId) {
      navigate("/");
    }
  }, [transaction, navigate]);

  useEffect(() => {
    const authenticateWithMiniKit = async () => {
      if (transaction.worldId) {
        setWorldId(transaction.worldId);
        return;
      }
      if (!window.MiniKit || !window.MiniKit.isInstalled()) {
        setApiError("MiniKit no está instalado.");
        navigate("/");
        return;
      }
      try {
        const authResponse = (await window.MiniKit.commands.walletAuth({
          nonce: "123456",
        })) as {
          success?: boolean;
          credential?: { sub: string };
          world_id?: string;
        };
        const userWorldId =
          authResponse?.credential?.sub || authResponse?.world_id;
        if (!userWorldId) throw new Error();
        setWorldId(userWorldId);
        setTransaction({ ...transaction, worldId: userWorldId });
      } catch {
        setApiError("Error al autenticar con MiniKit");
        navigate("/");
      }
    };
    authenticateWithMiniKit();
  }, [setTransaction, transaction, navigate]);

  useEffect(() => {
    const checkExistingUser = async () => {
      if (!transaction.worldId) return;
      try {
        const user = await getUserByWalletAddress(transaction.worldId);
        const isNew = !user || (!user.name && !user.email && !user.phone);
        setIsNewUser(isNew);
        if (user && !isNew) {
          setFormData((prev) => ({
            ...prev,
            fullName: user.name || prev.fullName,
            email: user.email || prev.email,
            phone: user.phone?.replace(/^\+\d{2}/, "") || prev.phone,
          }));
        }
      } catch {
        setApiError("Error al verificar usuario");
      }
    };
    checkExistingUser();
  }, [transaction.worldId, setFormData]);

  useEffect(() => {
    if (currentUser && !isUserDataInitialized) {
      setFormData((prev) => ({
        ...prev,
        fullName: currentUser.name || prev.fullName,
        email: currentUser.email || prev.email,
        phone: currentUser.phone?.replace(/^\+\d{2}/, "") || prev.phone,
        documentType: transaction.documentType || prev.documentType,
        documentNumber: transaction.documentNumber || prev.documentNumber,
        accountType: transaction.accountType || prev.accountType,
        accountNumber: transaction.accountNumber || prev.accountNumber,
      }));
      setUserDataInitialized(true);
    }
  }, [
    currentUser,
    isUserDataInitialized,
    transaction,
    setFormData,
    setUserDataInitialized,
  ]);

  const onSubmit = async () => {
    const validationErrors = validatePersonalInfo(formData);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    if (!worldId || !transaction.userId) {
      setApiError("Falta información del usuario.");
      return;
    }

    setIsLoading(true);
    setApiError(null);

    try {
      const country = transaction.country?.toLowerCase();
      if (!country) throw new Error();

      const countryMap: { [key: string]: { iso: string; phoneCode: string } } =
        {
          colombia: { iso: "COL", phoneCode: "+57" },
          venezuela: { iso: "VEN", phoneCode: "+58" },
        };

      const countryData = countryMap[country];
      if (!countryData) throw new Error();

      const userData = {
        name: formData.fullName,
        email: formData.email,
        phone: `${countryData.phoneCode}${formData.phone.replace(/\D/g, "")}`,
        country: countryData.iso,
        document_type_id: formData.documentType,
        document_number: formData.documentNumber,
        account_type_id: formData.accountType,
        account_number: formData.accountNumber,
        bank_id: transaction.bankId,
        wallet_address: worldId,
      };

      await updateUser(transaction.userId, userData);

      const updatedTransaction = {
        ...transaction,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        documentType: formData.documentType,
        documentNumber: formData.documentNumber,
        accountType: formData.accountType,
        accountNumber: formData.accountNumber,
        worldId,
        userId: transaction.userId,
        country: transaction.country,
        bankId: transaction.bankId,
        amount: transaction.amount,
        receives: transaction.receives,
      };

      setTransaction(updatedTransaction);

      setSuccessMessage(
        isNewUser ? "Usuario registrado" : "Usuario actualizado"
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      navigate("/summary");
    } catch {
      setApiError("Error al procesar el usuario");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <form onSubmit={(e) => handleSubmit(e, onSubmit)} className="space-y-6">
        {apiError && <p className="text-red-500 text-sm mb-4">{apiError}</p>}
        {successMessage && (
          <p className="text-green-500 text-sm mb-4">{successMessage}</p>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre completo
          </label>
          <input
            type="text"
            name="fullName"
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={formData.fullName}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Correo electrónico
          </label>
          <input
            type="email"
            name="email"
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono
          </label>
          <input
            type="tel"
            name="phone"
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={formData.phone}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de documento
          </label>
          <select
            name="documentType"
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={formData.documentType}
            onChange={handleChange}
            required
            disabled={isLoading}
          >
            <option value="">Seleccionar tipo</option>
            {documentTypes.map((docType) => (
              <option key={docType.id} value={docType.id}>
                {docType.name}
              </option>
            ))}
          </select>
          {errors.documentType && (
            <p className="text-red-500 text-sm mt-1">{errors.documentType}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Número de documento
          </label>
          <input
            type="text"
            name="documentNumber"
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={formData.documentNumber}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          {errors.documentNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.documentNumber}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de cuenta
          </label>
          <select
            name="accountType"
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={formData.accountType}
            onChange={handleChange}
            required
            disabled={isLoading}
          >
            <option value="">Seleccionar tipo</option>
            {accountTypes.map((accountType) => (
              <option key={accountType.id} value={accountType.id}>
                {accountType.name}
              </option>
            ))}
          </select>
          {errors.accountType && (
            <p className="text-red-500 text-sm mt-1">{errors.accountType}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Número de cuenta
          </label>
          <input
            type="text"
            name="accountNumber"
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={formData.accountNumber}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          {errors.accountNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.accountNumber}</p>
          )}
        </div>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-1/2 bg-gray-500 text-white py-3 rounded-xl"
            disabled={isLoading}
          >
            Regresar
          </button>
          <button
            type="submit"
            className="w-1/2 bg-indigo-600 text-white py-3 rounded-xl"
            disabled={isLoading || !worldId}
          >
            {isLoading
              ? "Procesando..."
              : isNewUser
              ? "Registrar"
              : "Actualizar"}
          </button>
        </div>
      </form>
    </AppLayout>
  );
}

export default PersonalInfo;
