// src/modules/user/forms/UserExpenseForm.tsx
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowDownCircle } from "lucide-react";
import { ROUTES } from "@/lib/constants/routes";
import AppHeader from "@/components/header/AppHeader";
import { Button } from "@/components/ui/button";

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

        {/* Card del formulario */}
        <div className="card max-w-2xl mx-auto">
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-expense/10 flex items-center justify-center mx-auto mb-4">
              <ArrowDownCircle className="w-8 h-8 text-expense" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Formulario de Egreso
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              El formulario se implementará próximamente
            </p>
            <Button
              variant="outline"
              onClick={() => navigate(ROUTES.USER_ENTRY)}
            >
              Regresar a selección
            </Button>
          </div>
        </div>

        {/* 
          TODO: Implementar formulario con los siguientes campos:
          - Monto (amount): numeric, requerido
          - Categoría (category_id): select de categories WHERE type IN ('expense', 'both')
          - Fuente (source_id): select de sources WHERE type IN ('expense', 'both')
          - Proyecto (project_id): select opcional de projects WHERE active = true
          - Descripción (description): textarea opcional
          
          El formulario debe:
          1. Validar que el monto sea mayor a 0
          2. Cargar categorías y fuentes desde Supabase
          3. Enviar datos con type = 'expense' y created_by = user.id
          4. Mostrar feedback de éxito/error
          5. Redirigir a una vista de confirmación o listado
        */}
      </div>
    </div>
  );
}