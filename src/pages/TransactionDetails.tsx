import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Clock,
  XCircle,
} from "lucide-react";
import AppLayout from "../common/AppLayout";
import api from "../api/apiClient";
import { Transaction } from "../types/api";
import { usePreloadedDataStore } from "../stores/usePreloadedDataStore";

function TransactionDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { countries } = usePreloadedDataStore();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!id) {
        setError("ID de transacción no válido");
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/transactions/${id}`);
        if (response.data?.wallet_address) {
          response.data.wallet_address =
            response.data.wallet_address.toLowerCase();
        }
        const transactionData = response.data as Transaction;
        if (!transactionData.created_at) {
          transactionData.created_at = new Date().toISOString();
        }
        setTransaction(transactionData);
      } catch {
        setError("Error al cargar los detalles de la transacción");
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id]);

  if (loading) {
    return (
      <AppLayout showBackButton={false} showAccreditationTimes={false}>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="text-gray-600">
            Cargando detalles de la transacción...
          </p>
        </div>
      </AppLayout>
    );
  }

  if (error || !transaction) {
    return (
      <AppLayout showAccreditationTimes={false}>
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-start gap-3">
            <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium">
                {error || "No se pudo cargar la transacción"}
              </h3>
              <p className="text-sm mt-1">
                Por favor intenta nuevamente más tarde
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/welcome")}
            className="bg-indigo-600 text-white py-2.5 px-6 rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al inicio
          </button>
        </div>
      </AppLayout>
    );
  }

  const getCurrency = () => {
    const country = countries.find((c) => c.id === transaction.country_id);
    if (country && country.name.toLowerCase() === "colombia") return "COP";
    if (country && country.name.toLowerCase() === "venezuela") return "VES";
    if (transaction.currency_id === "1") return "COP";
    if (transaction.currency_id?.toLowerCase().includes("ves")) return "VES";
    return "VES";
  };

  const getStatusConfig = () => {
    const statusLower = transaction.state.toLowerCase();
    if (statusLower === "completed") {
      return {
        color: "bg-green-50 text-green-700",
        text: "Completada",
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      };
    }
    if (statusLower === "pending") {
      return {
        color: "bg-yellow-50 text-yellow-700",
        text: "Pendiente",
        icon: <Clock className="w-5 h-5 text-yellow-500" />,
      };
    }
    if (statusLower === "cancelled") {
      return {
        color: "bg-red-50 text-red-700",
        text: "Cancelada",
        icon: <XCircle className="w-5 h-5 text-red-500" />,
      };
    }
    return {
      color: "bg-gray-50 text-gray-700",
      text: transaction.state,
      icon: null,
    };
  };

  const formattedDate = transaction.created_at
    ? new Date(transaction.created_at).toLocaleString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone:
          countries
            .find((c) => c.id === transaction.country_id)
            ?.name.toLowerCase() === "colombia"
            ? "America/Bogota"
            : "America/Caracas",
      })
    : "Fecha no disponible";

  const statusConfig = getStatusConfig();

  return (
    <AppLayout showBackButton={false} showAccreditationTimes={false}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-gray-800">
            Detalles de la transacción
          </h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div
            className={`${statusConfig.color} px-6 py-3 flex items-center justify-between`}
          >
            <div className="flex items-center gap-2">
              {statusConfig.icon}
              <span className="text-sm font-medium">{statusConfig.text}</span>
            </div>
            <span className="text-xs opacity-80">
              #{transaction.id.substring(0, 8)}
            </span>
          </div>

          <div className="p-6 space-y-6">
            <div className="text-center">
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-gray-500 text-xs">{formattedDate}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Enviaste</span>
                <span>Recibiste</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-base">
                  {transaction.quantity.toLocaleString("es-ES", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 8,
                  })}{" "}
                  WLD
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400 mx-2" />
                <span className="font-medium text-base">
                  {transaction.amount_received.toLocaleString("es-ES", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  {getCurrency()}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-1">
                <span className="text-sm text-gray-500">Tasa de cambio</span>
                <span className="text-sm font-medium">
                  1 WLD ={" "}
                  {(transaction.amount_received / transaction.quantity).toFixed(
                    2
                  )}{" "}
                  {getCurrency()}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-sm text-gray-500">Estado</span>
                <span
                  className={`px极2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}
                >
                  {statusConfig.text}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/welcome")}
            className="flex-1 bg-gray-100 text-gray-800 py-2.5 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al inicio</span>
          </button>
          <button
            onClick={() => navigate("/", { replace: true })}
            className="flex-1 bg-indigo-600 text-white py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            Nueva transacción
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </AppLayout>
  );
}

export default TransactionDetails;
