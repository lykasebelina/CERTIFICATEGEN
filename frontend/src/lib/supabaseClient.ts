


<<<<<<< HEAD
// src/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";
=======
// src/lib/supabaseClient.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";
>>>>>>> fc3e88fcbd0a45183e91a5abd415c1c25b49290b

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

<<<<<<< HEAD
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
=======
if (!supabaseUrl || !supabaseAnonKey) {

    throw new Error('Missing Supabase environment variables');
}

//export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

>>>>>>> fc3e88fcbd0a45183e91a5abd415c1c25b49290b
