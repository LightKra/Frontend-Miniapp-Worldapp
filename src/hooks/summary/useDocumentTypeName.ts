import { useState, useEffect } from "react";
import { getDocumentTypeById } from "../../api/documentTypeService";

export const useDocumentTypeName = (documentTypeId: string) => {
  const [documentTypeName, setDocumentTypeName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocumentTypeName = async () => {
      if (!documentTypeId) {
        setDocumentTypeName("");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const docType = await getDocumentTypeById(documentTypeId);
        setDocumentTypeName(docType.name);
      } catch {
        setError("Error al cargar el nombre del tipo de documento.");
        setDocumentTypeName("No especificado");
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentTypeName();
  }, [documentTypeId]);

  return { documentTypeName, loading, error };
};
