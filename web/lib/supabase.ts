import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// If credentials are missing, we'll export a dummy object for dev
// This avoids errors during initialization, but real calls will still fail
// until we add more robust mocking if needed.
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createClient('https://mock-url.supabase.co', 'mock-key');
