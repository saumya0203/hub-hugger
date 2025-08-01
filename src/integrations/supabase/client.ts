// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://viylghcmvnrtciulhjxq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpeWxnaGNtdm5ydGNpdWxoanhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5ODk3NTYsImV4cCI6MjA2OTU2NTc1Nn0.Bl4aCWzWSFpk9PC0y5QkJfMjb_kawZ-RV4cFikQVbAQ";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});