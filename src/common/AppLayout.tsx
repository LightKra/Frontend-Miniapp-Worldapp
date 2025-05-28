import React from "react";
import { useNavigate } from "react-router";
import { WhatsappIcon } from "../pages/icons/WhatsappIcon";
import { ArrowLeft } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  showAccreditationTimes?: boolean;
}

function AppLayout({
  children,
  showBackButton = true,
  showAccreditationTimes = true,
}: AppLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md mx-auto p-6 relative">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
            <div className="flex items-center justify-center relative">
              {showBackButton && (
                <button
                  onClick={() => navigate(-1)}
                  className="absolute left-0 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  aria-label="Regresar"
                >
                  <ArrowLeft className="w-6 h-6 text-white" />
                </button>
              )}
              <h1 className="text-3xl font-bold text-center text-white">
                Crypto Cash
              </h1>
            </div>
          </div>

          <div className="p-6">
            {showAccreditationTimes && (
              <div className="bg-indigo-50 rounded-xl p-6 mb-8 border border-indigo-100">
                <h2 className="text-xl font-semibold mb-4 text-indigo-900">
                  Tiempos de Acreditación
                </h2>
                <p className="text-sm mb-3 text-indigo-700">
                  De lunes a sábado (9:00 a.m. - 6:00 p.m. hora Colombia), los
                  cambios son inmediatos sin embargo pueden tardar hasta 30
                  minutos.
                </p>
                <p className="text-sm text-indigo-700">
                  Fuera de ese horario, domingos y festivos, la acreditación se
                  realizará al siguiente día hábil.
                </p>
              </div>
            )}

            {children}
          </div>
        </div>

        <div className="fixed right-8 bottom-8 z-50">
          <WhatsappIcon />
        </div>
      </div>
    </div>
  );
}

export default AppLayout;
