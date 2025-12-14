// src/auth/AuthProvider.tsx
import { createContext, useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { authService } from "@/services/auth.service";
import { Toast } from "@/components/ui/toast";
import { AUTH_MESSAGES } from "@/lib/constants/auth";

interface AuthContextType {
  user: User | null;
  role: "admin" | "user" | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"admin" | "user" | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeactivatedAlert, setShowDeactivatedAlert] = useState(false);

  // Función para limpiar la sesión con delay para mostrar el toast
  const clearSession = async (showToast = false) => {
    if (showToast) {
      setShowDeactivatedAlert(true);
      // Esperar 4 segundos para que el usuario lea el mensaje
      await new Promise(resolve => setTimeout(resolve, 4000));
    }
    
    await supabaseClient.auth.signOut();
    setUser(null);
    setRole(null);
    setShowDeactivatedAlert(false);
  };

  useEffect(() => {
    // Check active sessions and sets the user
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabaseClient.auth.getSession();

        if (session?.user) {
          // Validar que el usuario existe en user_roles CON RETRY
          // Esto espera hasta 2.5 segundos (5 intentos x 500ms) para que el trigger complete
          const userExists = await authService.validateUserExists(session.user.id);
          
          if (!userExists) {
            // Usuario no existe en la BD - mostrar alerta y cerrar sesión
            console.warn("Usuario no existe en user_roles después de reintentos, cerrando sesión...");
            await clearSession(true); // Mostrar toast y esperar
            setLoading(false);
            return;
          }

          try {
            const userRole = await authService.getUserRole(session.user.id);
            setUser(session.user);
            setRole(userRole);
            // IMPORTANTE: Resetear el estado del toast si el usuario es válido
            setShowDeactivatedAlert(false);
          } catch (error) {
            // Si falla getUserRole, significa que el usuario no existe
            console.error("Error obteniendo rol:", error);
            await clearSession(true); // Mostrar toast y esperar
          }
        } else {
          // No hay sesión, asegurar que el toast no se muestre
          setShowDeactivatedAlert(false);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setShowDeactivatedAlert(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for changes on auth state (sign in, sign out, etc.)
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Validar que el usuario existe CON RETRY
        const userExists = await authService.validateUserExists(session.user.id);
        
        if (!userExists) {
          await clearSession(true); // Mostrar toast y esperar
          setLoading(false);
          return;
        }

        try {
          const userRole = await authService.getUserRole(session.user.id);
          setUser(session.user);
          setRole(userRole);
          // Resetear el toast cuando hay sesión válida
          setShowDeactivatedAlert(false);
        } catch (error) {
          console.error("Error obteniendo rol en auth state change:", error);
          await clearSession(true); // Mostrar toast y esperar
        }
      } else {
        setUser(null);
        setRole(null);
        // Resetear el toast cuando no hay sesión
        setShowDeactivatedAlert(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    setRole(null);
    setShowDeactivatedAlert(false);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signOut }}>
      {/* Toast de cuenta desactivada */}
      {showDeactivatedAlert && (
        <Toast
          variant="error"
          title={AUTH_MESSAGES.ACCOUNT_DEACTIVATED_TITLE}
          description={AUTH_MESSAGES.ACCOUNT_DEACTIVATED_DESCRIPTION}
          onClose={() => setShowDeactivatedAlert(false)}
          duration={0} // No auto-cerrar, se cierra manualmente después del delay
        />
      )}
      {children}
    </AuthContext.Provider>
  );
};