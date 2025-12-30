// src/auth/AuthProvider.tsx
import { createContext, useEffect, useState, useRef } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { authService, type UserProfile } from "@/services/auth.service";
import { Toast } from "@/components/ui/toast";
import { AUTH_MESSAGES } from "@/lib/constants/auth";

interface AuthContextType {
  user: User | null;
  role: "admin" | "user" | null;
  displayName: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"admin" | "user" | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeactivatedAlert, setShowDeactivatedAlert] = useState(false);
  
  // 🆕 NUEVO: Ref para evitar race conditions
  const isInitializing = useRef(false);

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
    setDisplayName(null);
    setShowDeactivatedAlert(false);
  };

  // Helper para cargar el perfil del usuario
  const loadUserProfile = async (sessionUser: User): Promise<UserProfile | null> => {
    try {
      // Validar que el usuario existe en user_roles CON RETRY
      const userExists = await authService.validateUserExists(sessionUser.id);
      
      if (!userExists) {
        console.warn("Usuario no existe en user_roles después de reintentos");
        return null;
      }

      // Obtener perfil completo (role + display_name)
      const profile = await authService.getUserProfile(sessionUser.id, sessionUser.email || "");
      return profile;
    } catch (error) {
      console.error("Error cargando perfil:", error);
      return null;
    }
  };

  useEffect(() => {
    // 🆕 NUEVO: Prevenir inicializaciones múltiples
    if (isInitializing.current) {
      console.log("⏸️ Auth ya está inicializando, saltando...");
      return;
    }

    // Check active sessions and sets the user
    const initializeAuth = async () => {
      isInitializing.current = true;
      
      try {
        // 🆕 NUEVO: Timeout de seguridad para la inicialización
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Auth initialization timeout")), 15000);
        });

        const authPromise = (async () => {
          const {
            data: { session },
          } = await supabaseClient.auth.getSession();

          if (session?.user) {
            const profile = await loadUserProfile(session.user);
            
            if (!profile) {
              await clearSession(true);
              return;
            }

            setUser(session.user);
            setRole(profile.role);
            setDisplayName(profile.displayName);
            setShowDeactivatedAlert(false);
          } else {
            setShowDeactivatedAlert(false);
          }
        })();

        // Race entre la autenticación y el timeout
        await Promise.race([authPromise, timeoutPromise]);
        
      } catch (error) {
        console.error("Error initializing auth:", error);
        setShowDeactivatedAlert(false);
        
        // Si hay timeout, forzar loading a false
        if (error instanceof Error && error.message.includes("timeout")) {
          console.error("⚠️ Auth timeout - forzando salida del loading state");
        }
      } finally {
        setLoading(false);
        isInitializing.current = false;
      }
    };

    initializeAuth();

    // Listen for changes on auth state (sign in, sign out, etc.)
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      console.log("🔐 Auth state change:", event);
      
      // 🆕 NUEVO: Manejar evento de signed out explícitamente
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setRole(null);
        setDisplayName(null);
        setShowDeactivatedAlert(false);
        setLoading(false);
        return;
      }

      // 🆕 NUEVO: Agregar timeout también aquí
      if (session?.user) {
        try {
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Profile load timeout")), 10000);
          });

          const profilePromise = loadUserProfile(session.user);
          const profile = await Promise.race([profilePromise, timeoutPromise]) as UserProfile | null;
          
          if (!profile) {
            await clearSession(true);
            setLoading(false);
            return;
          }

          setUser(session.user);
          setRole(profile.role);
          setDisplayName(profile.displayName);
          setShowDeactivatedAlert(false);
        } catch (error) {
          console.error("Error en auth state change:", error);
          setUser(null);
          setRole(null);
          setDisplayName(null);
        }
      } else {
        setUser(null);
        setRole(null);
        setDisplayName(null);
        setShowDeactivatedAlert(false);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      isInitializing.current = false;
    };
  }, []);

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    setRole(null);
    setDisplayName(null);
    setShowDeactivatedAlert(false);
  };

  return (
    <AuthContext.Provider value={{ user, role, displayName, loading, signOut }}>
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