import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { autenticacion } from "../api/auth";
import { useTransactionStore } from "../stores/transactionStore";
import { usePreloadedDataStore } from "../stores/usePreloadedDataStore";

export const WelcomeScreen = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const { setTransaction, resetTransaction } = useTransactionStore();
  const clearAllData = usePreloadedDataStore((state) => state.clearAllData)

  const handleAuth = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    setShowScanner(true);
    setShowSuccess(false);

    try {
      resetTransaction();
      const authData = await autenticacion();
      if (!authData?.userId) {
        throw new Error();
      }
      setTransaction({
        userId: authData.userId,
        worldId: authData.wallet_address,
      });
      setShowSuccess(true);
      setTimeout(() => navigate("/"), 1500);
    } catch {
      setError("Error de autenticación");
    } finally {
      setIsLoading(false);
      setShowScanner(false);
    }
  }, [navigate, setTransaction, resetTransaction]);

  useEffect(()=>{
    clearAllData();
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="bg-white rounded-xl p-6 shadow-2xl z-10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                ¡Autenticación Exitosa!
              </h3>
              <p className="mt-2 text-sm text-gray-500">Redirigiendo...</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-center">
          <h1 className="text-3xl font-bold text-white">Bienvenido</h1>
          <p className="text-indigo-100 mt-2">
            Autenticación segura
          </p>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            {showScanner ? (
              <div className="relative w-32 h-32 mx-auto mb-4">
                {/* Anillo animado */}
                <div
                  className="absolute inset-0 border-4 border-purple-500 rounded-full"
                  style={{
                    animation: "rotate-scan 2s linear infinite",
                  }}
                ></div>

                {/* Fondo circular */}
                <div className="absolute inset-2 bg-indigo-100 rounded-full"></div>

                {/* Huella con efecto pulse */}
                <div
                  className="relative flex items-center justify-center w-full h-full text-indigo-600"
                  style={{
                    animation: "pulse-scan 1.5s ease-in-out infinite",
                  }}
                >
                  <svg
                    className="w-16 h-16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                    />
                  </svg>
                </div>
              </div>
            ) : (
              <div className="w-32 h-32 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                  />
                </svg>
              </div>
            )}

            <h2 className="text-xl font-semibold text-gray-800">
              Autentícate para continuar
            </h2>
            <p className="text-gray-600 mt-2">
              Usa tu wallet de World App para verificar tu identidad
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 mr-2 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleAuth}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                Autenticando...
              </>
            ) : (
              <>
                Autenticar con World App
                <svg
                  className="ml-2 w-5 h-5 animate-bounce"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </>
            )}
          </button>
        </div>

        <div className="bg-gray-50 px-6 py-4 text-center">
          <p className="text-xs text-gray-500">
            Al continuar, aceptas nuestros{" "}
            <a
              href="https://www.cosmosinvestments.com.co/terminos-y-condiciones/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 underline"
            >
              Términos de Servicio
            </a>{" "}
            y{" "}
            <a
              href="https://www.cosmosinvestments.com.co/politica-de-privacidad/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 underline"
            >
              Política de Privacidad
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
