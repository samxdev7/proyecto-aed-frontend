import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://gnotslrwwptblfoofgsx.supabase.co";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_R-yNJTs0N1M_Z1-taZQ1fg_R3m187W2";

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Inicia el flujo de autenticación OAuth con Google mediante Supabase Auth.
 * Redirige al proveedor de Google y configura la URL de retorno a /auth/callback.
 */
export async function iniciarSesionConGoogle(redir?: string | null): Promise<void> {
  if (typeof window === "undefined") return;

  const callbackUrl = new URL("/auth/callback", window.location.origin);
  if (redir && redir.startsWith("/")) {
    callbackUrl.searchParams.set("redir", redir);
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    throw error;
  }
}
