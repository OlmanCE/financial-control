import { supabaseClient } from "./supabaseClient";

export async function testSupabaseConnection() {
  console.log("🔍 Probando conexión a Supabase...");

  try {
    const { data, error } = await supabaseClient.from("categories").select("*").limit(1);

    if (error) {
      console.error("❌ Supabase error:", error.message);
    } else {
      console.log("✅ Supabase conectado correctamente. Ejemplo de data:", data);
    }
  } catch (err) {
    console.error("💥 Error inesperado:", err);
  }
}
