// src/auth/ProtectedRoute.tsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import { Alert } from "@/components/ui/alert";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) => {
  const { user, role, loading } = useAuth();
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

  // 🆕 NUEVO: Timeout para detectar loading infinito
  useEffect(() => {
    if (!loading) {
      setShowTimeoutWarning(false);
      return;
    }

    // Si después de 10 segundos sigue cargando, mostrar advertencia
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn("⚠️ Protected route loading timeout - posible problema de conexión");
        setShowTimeoutWarning(true);
      }
    }, 10000); // 10 segundos

    return () => clearTimeout(timeoutId);
  }, [loading]);

  // Loading state mejorado con timeout warning
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 max-w-md px-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900"></div>
          
          {showTimeoutWarning && (
            <Alert variant="warning" className="mt-4">
              La carga está tomando más tiempo del esperado. 
              Verifica tu conexión a internet o intenta recargar la página.
            </Alert>
          )}

          {showTimeoutWarning && (
            <button
              onClick={() => window.location.reload()}
              className="btn btn-outline mt-2"
            >
              Recargar página
            </button>
          )}
        </div>
      </div>
    );
  }

  // Redirigir a login si no hay usuario autenticado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirigir a dashboard si no es admin y la ruta requiere admin
  if (requireAdmin && role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};