// src/modules/user/forms/UserExpenseForm.tsx
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowDownCircle } from "lucide-react";
import { ROUTES } from "@/lib/constants/routes";
import AppHeader from "@/components/header/AppHeader";
import MovementForm from "@/components/forms/MovementForm";

export default function UserExpenseForm() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <div className="container-mobile py-6 md:py-8">
        {/* Header del formulario */}
        <div className="mb-6">
          <button
            onClick={() => navigate(ROUTES.USER_ENTRY)}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 touch-target"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm md:text-base">Volver</span>
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-expense/10 flex items-center justify-center">
              <ArrowDownCircle className="w-6 h-6 text-expense" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Registrar Egreso
            </h1>
          </div>
          <p className="text-muted-foreground text-sm md:text-base">
            Completa los datos de tu salida de dinero
          </p>
        </div>

        {/* Formulario de egreso */}
        <MovementForm type="expense" />
      </div>
    </div>
  );
}