import { type SupabaseClient } from "@supabase/supabase-js";

import { type Database } from "@/types/database.types";

/** Supabase client typed with the application database schema. */
export type TypedSupabaseClient = SupabaseClient<Database>;
