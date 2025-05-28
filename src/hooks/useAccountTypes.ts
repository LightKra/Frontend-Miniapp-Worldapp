import { useState, useEffect } from "react";
import { getAccountTypes } from "../api/accountTypeService";

interface AccountType {
  id: string;
  name: string;
  country_id?: string;
}

export const useAccountTypes = (countryId: string) => {
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccountTypes = async () => {
      if (!countryId) {
        setAccountTypes([]);
        return;
      }

      try {
        const response = await getAccountTypes(countryId);
        const filteredTypes = response.filter(
          (type: AccountType) =>
            !type.country_id || type.country_id === countryId
        );
        setAccountTypes(filteredTypes);
      } catch {
        setError("Error al cargar los tipos de cuenta");
        setAccountTypes([]);
      }
    };

    fetchAccountTypes();
  }, [countryId]);

  return { accountTypes, error };
};
