import { useState, useEffect } from "react";
import { getBankById } from "../../api/bankService";

export const useBankName = (bankId: string) => {
  const [bankName, setBankName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBankName = async () => {
      if (!bankId) {
        setBankName("");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const bank = await getBankById(bankId);
        setBankName(bank.name);
      } catch {
        setError("Error al cargar el nombre del banco.");
        setBankName("No especificado");
      } finally {
        setLoading(false);
      }
    };

    fetchBankName();
  }, [bankId]);

  return { bankName, loading, error };
};
