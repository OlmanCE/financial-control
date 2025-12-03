// src/auth/loginWithGoogle.ts
import { supabaseClient } from "@/lib/supabaseClient";

export const loginWithGoogle = async () => {
  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin, // vuelve después del login
    },
  });

  if (error) throw error;
};
