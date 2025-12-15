// src/modules/user/UserEntryChoice.tsx
import { useNavigate } from "react-router-dom";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { ROUTES } from "@/lib/constants/routes";
import AppHeader from "@/components/header/AppHeader";

export default function UserEntryChoice() {
  const navigate = useNavigate();

  const handleChoice = (type: "income" | "expense") => {
    if (type === "income") {
      navigate(ROUTES.USER_INCOME);
    } else {
      navigate(ROUTES.USER_EXPENSE);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <div className="container-mobile py-8 md:py-12">
        {/* Título de la pregunta */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            ¿Qué deseas registrar?
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Selecciona el tipo de movimiento que deseas agregar
          </p>
        </div>

        {/* Opciones de selección */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-2xl mx-auto">
          {/* Opción: Ingreso */}
          <button
            onClick={() => handleChoice("income")}
            className="card card-hover group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            {/* Fondo con gradiente sutil */}
            <div className="absolute inset-0 bg-gradient-to-br from-income/5 to-income/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative p-6 md:p-8 flex flex-col items-center text-center">
              {/* Icono */}
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-income/10 flex items-center justify-center mb-4 group-hover:bg-income/20 transition-colors duration-300">
                <ArrowUpCircle className="w-8 h-8 md:w-10 md:h-10 text-income" />
              </div>
              
              {/* Título */}
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                Ingreso
              </h2>
              
              {/* Descripción */}
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Registra tus entradas de dinero, salarios, ventas u otras ganancias
              </p>
              
              {/* Badge indicador */}
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-income/10 text-income rounded-full text-xs md:text-sm font-medium">
                <span>+</span>
                <span>Añadir ingreso</span>
              </div>
            </div>
          </button>

          {/* Opción: Egreso */}
          <button
            onClick={() => handleChoice("expense")}
            className="card card-hover group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            {/* Fondo con gradiente sutil */}
            <div className="absolute inset-0 bg-gradient-to-br from-expense/5 to-expense/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative p-6 md:p-8 flex flex-col items-center text-center">
              {/* Icono */}
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-expense/10 flex items-center justify-center mb-4 group-hover:bg-expense/20 transition-colors duration-300">
                <ArrowDownCircle className="w-8 h-8 md:w-10 md:h-10 text-expense" />
              </div>
              
              {/* Título */}
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                Egreso
              </h2>
              
              {/* Descripción */}
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Registra tus gastos, compras, pagos y otras salidas de dinero
              </p>
              
              {/* Badge indicador */}
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-expense/10 text-expense rounded-full text-xs md:text-sm font-medium">
                <span>-</span>
                <span>Añadir egreso</span>
              </div>
            </div>
          </button>
        </div>

        {/* Información adicional opcional */}
        <div className="mt-8 md:mt-12 text-center">
          <p className="text-xs md:text-sm text-muted-foreground">
            Podrás editar o eliminar tus registros más adelante
          </p>
        </div>
      </div>
    </div>
  );
}