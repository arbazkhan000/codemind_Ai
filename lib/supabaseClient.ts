import { createClient } from "@supabase/supabase-js";

// 1. Use empty string as fallback so it doesn't crash if keys are missing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// 2. Only create the client if the URL exists (Safety Check)
export const supabase = createClient(supabaseUrl, supabaseKey);
