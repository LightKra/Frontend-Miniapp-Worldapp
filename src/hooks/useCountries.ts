import { useEffect } from "react";
import { usePreloadedDataStore } from "../stores/usePreloadedDataStore";
import { getCountries } from "../api/countryService";

// Datos de respaldo en caso de que falle la API
const fallbackCountries = [
  { id: "1", name: "Colombia" },
  { id: "2", name: "Venezuela" },
];

export const useCountries = () => {
  const { countries, error, setCountries, setError, setLoading } =
    usePreloadedDataStore();

  useEffect(() => {
    const loadCountries = async () => {
      if (countries.length === 0) {
        setLoading(true);
        try {
          const data = await getCountries();
          if (data && data.length > 0) {
            setCountries(data);
            setError(null);
          } else {
            console.warn(
              "No se obtuvieron países de la API, usando datos de respaldo"
            );
            setCountries(fallbackCountries);
          }
        } catch (error) {
          console.error("Error cargando países:", error);
          setCountries(fallbackCountries);
          setError("No se pudieron cargar los países del servidor");
        } finally {
          setLoading(false);
        }
      }
    };

    loadCountries();
  }, [countries.length, setCountries, setError, setLoading]);

  return {
    countries: countries.length > 0 ? countries : fallbackCountries,
    error,
  };
};
