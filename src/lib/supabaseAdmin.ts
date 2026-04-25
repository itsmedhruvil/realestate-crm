import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export function getSupabaseAdmin() {
  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL.");
  }

  if (!supabaseServiceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY. Add the Supabase service-role key as a server-only env var.");
  }

  if (!supabaseServiceRoleKey.startsWith("sb_secret_") && !supabaseServiceRoleKey.startsWith("eyJ")) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY does not look like a Supabase service-role key.");
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
