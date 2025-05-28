//src/routes/AppRoutes.tsx:
import { Routes, Route, Navigate } from "react-router";
import InitialForm from "../pages/InitialForm";
import PersonalInfo from "../pages/PersonalInfo";
import TransactionSummary from "../pages/TransactionSummary";
import TransactionDetails from "../pages/TransactionDetails";
import { MiniKitProvider } from "../common/MiniKitProvider";
import { WelcomeScreen } from "../components/WelcomeScreen";
import { useTransactionStore } from "../stores/transactionStore";
import { Suspense, useEffect, useState } from "react";

const RouteFallback = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-white">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
    <p className="text-gray-600">Cargando...</p>
  </div>
);

const RouteErrorBoundary = ({ children }: { children: React.ReactElement }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = () => {
      setHasError(true);
    };

    window.addEventListener("error", handleError);
    return () => {
      window.removeEventListener("error", handleError);
    };
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-red-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            ¡Algo salió mal!
          </h1>
          <p className="text-gray-700 mb-6">
            Se ha producido un error en la aplicación.
          </p>
          <button
            onClick={() => (window.location.href = "/welcome")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return children;
};

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { transaction } = useTransactionStore();
  return transaction.userId ? children : <Navigate to="/welcome" />;
};

function AppRoutes() {
  return (
    <MiniKitProvider appId="app_xxxxxxxxxxxxxxxxxx">
      <RouteErrorBoundary>
        <div className="min-h-screen bg-slate-60">
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/welcome" element={<WelcomeScreen />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <InitialForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/personal-info"
                element={
                  <ProtectedRoute>
                    <PersonalInfo />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/summary"
                element={
                  <ProtectedRoute>
                    <TransactionSummary />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transaction-details/:id"
                element={<TransactionDetails />}
              />
              <Route path="*" element={<Navigate to="/welcome" />} />
            </Routes>
          </Suspense>
        </div>
      </RouteErrorBoundary>
    </MiniKitProvider>
  );
}

export default AppRoutes;
