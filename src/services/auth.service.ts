// src/services/auth.service.ts
import { supabaseClient } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { AUTH_ERRORS, USER_ROLES } from "@/lib/constants/auth";

export interface SignUpData {
  email: string;
  password: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface UserRole {
  user_id: string;
  role: "admin" | "user";
  display_name: string | null;
  created_at: string;
}

export interface UserProfile {
  userId: string;
  email: string;
  role: "admin" | "user";
  displayName: string;
}

// Helper para manejar errores de Supabase
const handleAuthError = (error: any): never => {
  console.error("Auth error:", error);
  
  const errorMap: Record<string, string> = {
    "Invalid login credentials": AUTH_ERRORS.INVALID_CREDENTIALS,
    "Email not confirmed": AUTH_ERRORS.EMAIL_NOT_CONFIRMED,
    "User not found": AUTH_ERRORS.USER_NOT_FOUND,
    "Password should be at least 6 characters": AUTH_ERRORS.WEAK_PASSWORD,
    "User already registered": AUTH_ERRORS.EMAIL_ALREADY_REGISTERED,
    "captcha verification process failed": AUTH_ERRORS.CAPTCHA_FAILED,
  };

  const message = errorMap[error.message] || AUTH_ERRORS.UNEXPECTED_ERROR;
  throw new Error(message);
};

// Helper para esperar un tiempo
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper para extraer nombre del email
const extractNameFromEmail = (email: string): string => {
  const username = email.split('@')[0];
  // Capitalizar la primera letra
  return username.charAt(0).toUpperCase() + username.slice(1);
};

export const authService = {
  // Sign up con email y password
  async signUp({ email, password }: SignUpData) {
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) handleAuthError(error);

      // El rol se asigna automáticamente con el trigger assign_default_role
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Sign in con email y password
  async signIn({ email, password }: SignInData) {
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) handleAuthError(error);
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Sign in con Google
  async signInWithGoogle() {
    try {
      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) handleAuthError(error);
    } catch (error) {
      throw error;
    }
  },

  // Sign out
  async signOut() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) handleAuthError(error);
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    return user;
  },

  // Get user role - MODIFICADO PARA LANZAR ERROR SI NO EXISTE
  async getUserRole(userId: string): Promise<"admin" | "user"> {
    try {
      const { data, error } = await supabaseClient
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      // Si hay error o no hay data, el usuario no existe en user_roles
      if (error || !data) {
        console.error("User role not found:", error);
        throw new Error("USER_NOT_IN_ROLES");
      }

      return (data.role as "admin" | "user") || USER_ROLES.USER;
    } catch (error) {
      console.error("Error fetching user role:", error);
      throw error; // Re-lanzamos el error para que AuthProvider lo maneje
    }
  },

  // NUEVO: Obtener perfil completo del usuario (role + display_name)
  async getUserProfile(userId: string, userEmail: string): Promise<UserProfile> {
    try {
      const { data, error } = await supabaseClient
        .from("user_roles")
        .select("role, display_name")
        .eq("user_id", userId)
        .single();

      if (error || !data) {
        console.error("User profile not found:", error);
        throw new Error("USER_NOT_IN_ROLES");
      }

      // Si display_name es null, extraer del email como fallback
      const displayName = data.display_name || extractNameFromEmail(userEmail);

      return {
        userId,
        email: userEmail,
        role: (data.role as "admin" | "user") || USER_ROLES.USER,
        displayName,
      };
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  },

  // Validar que el usuario existe en user_roles CON RETRY
  async validateUserExists(userId: string, maxRetries = 5, delayMs = 500): Promise<boolean> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const { data, error } = await supabaseClient
          .from("user_roles")
          .select("user_id")
          .eq("user_id", userId)
          .single();

        if (!error && data !== null) {
          console.log(`✅ Usuario encontrado en user_roles (intento ${attempt + 1})`);
          return true;
        }

        // Si no es el último intento, esperar antes de reintentar
        if (attempt < maxRetries - 1) {
          console.log(`⏳ Usuario no encontrado, reintentando en ${delayMs}ms... (intento ${attempt + 1}/${maxRetries})`);
          await sleep(delayMs);
        }
      } catch (error) {
        console.error(`Error en intento ${attempt + 1}:`, error);
        if (attempt < maxRetries - 1) {
          await sleep(delayMs);
        }
      }
    }

    console.warn(`❌ Usuario no encontrado después de ${maxRetries} intentos`);
    return false;
  },

  // Reset password
  async resetPassword(email: string) {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) handleAuthError(error);
  },

  // Update password
  async updatePassword(newPassword: string) {
    const { error } = await supabaseClient.auth.updateUser({
      password: newPassword,
    });

    if (error) handleAuthError(error);
  },
};