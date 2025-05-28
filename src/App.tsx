import { useEffect, useCallback } from "react";
import AppRoutes from "./routes/AppRoutes";
import { usePreloadedDataStore } from "./stores/usePreloadedDataStore";
import { getCountries } from "./api/countryService";
import { getBanksByCountry } from "./api/bankService";
import { getDocumentTypes } from "./api/documentTypeService";
import { getAccountTypes } from "./api/accountTypeService";
import { getExchangeRates } from "./api/exchangeRateApi";
import { getUserByWalletAddress } from "./api/userService";
import { useTransactionStore } from "./stores/transactionStore";
import { Country } from "./types/api";
import { getWalletBalance } from "./api/worldscanService";

function App() {
  const {
    countries,
    banks,
    documentTypes,
    accountTypes,
    currentUser,
    setCountries,
    setBanks,
    setDocumentTypes,
    setAccountTypes,
    setExchangeRates,
    setCurrentUser,
    setWalletBalance,
    setLoading,
    setError,
  } = usePreloadedDataStore();

  const { transaction } = useTransactionStore();

  const loadUserData = useCallback(async () => {
    if (transaction.worldId && !currentUser) {
      try {
        const [user, balance] = await Promise.all([
          getUserByWalletAddress(transaction.worldId),
          getWalletBalance(transaction.worldId),
        ]);
        setCurrentUser(user);
        setWalletBalance(balance.total);
        /*
      } catch {
        setError("Error al cargar datos del usuario");
        //setError(`${JSON.stringify(error)}`);
      }*/
      } catch (error) {
        console.error("Error cargando datos del usuario:", error);
        setError(`Error al cargar datos del usuario: ${String(error)}`);
      }
    }
  }, [
    transaction.worldId,
    currentUser,
    setCurrentUser,
    setWalletBalance,
    setError,
  ]);

  const loadBanks = useCallback(async (countries: Country[]) => {
    try {
      const banksByCountry = await Promise.all(
        countries.map((country) =>
          getBanksByCountry(country.id).catch(() => [])
        )
      );
      return banksByCountry.flat();
    } catch {
      return [];
    }
  }, []);

  const loadStaticData = useCallback(async () => {
    if (
      countries.length > 0 &&
      banks.length > 0 &&
      documentTypes.length > 0 &&
      accountTypes.length > 0
    ) {
      return;
    }

    setLoading(true);
    try {
      const [countriesData, documentTypesData, accountTypesData] =
        await Promise.all([
          countries.length ? Promise.resolve(countries) : getCountries(),
          documentTypes.length
            ? Promise.resolve(documentTypes)
            : getDocumentTypes(),
          accountTypes.length
            ? Promise.resolve(accountTypes)
            : getAccountTypes(),
        ]);

      const banksData =
        banks.length > 0 ? banks : await loadBanks(countriesData);
      const exchangeRatesData = await getExchangeRates(1);

      if (countries.length === 0) setCountries(countriesData);
      if (documentTypes.length === 0) setDocumentTypes(documentTypesData);
      if (accountTypes.length === 0) setAccountTypes(accountTypesData);
      if (banks.length === 0) setBanks(banksData);

      setExchangeRates(exchangeRatesData);
    } catch {
      setError("Error cargando datos iniciales");
    } finally {
      setLoading(false);
    }
  }, [
    countries,
    banks,
    documentTypes,
    accountTypes,
    setCountries,
    setBanks,
    setDocumentTypes,
    setAccountTypes,
    setExchangeRates,
    setLoading,
    setError,
    loadBanks,
  ]);

  useEffect(() => {
    const initializeApp = async () => {
      await Promise.all([loadStaticData(), loadUserData()]);
    };
    initializeApp();
  }, [loadStaticData, loadUserData]);

  return <AppRoutes />;
}

export default App;
