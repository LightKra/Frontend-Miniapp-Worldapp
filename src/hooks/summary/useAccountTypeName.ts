import { useState, useEffect } from "react";
import { getAccountTypeById } from "../../api/accountTypeService";

export const useAccountTypeName = (accountTypeId: string) => {
  const [accountTypeName, setAccountTypeName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccountTypeName = async () => {
      if (!accountTypeId) {
        setAccountTypeName("");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const accountType = await getAccountTypeById(accountTypeId);
        setAccountTypeName(accountType.name);
      } catch {
        setError("Error al cargar el nombre del tipo de cuenta.");
        setAccountTypeName("No especificado");
      } finally {
        setLoading(false);
      }
    };

    fetchAccountTypeName();
  }, [accountTypeId]);

  return { accountTypeName, loading, error };
};
