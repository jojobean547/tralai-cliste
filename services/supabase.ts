import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};
const SUPABASE_URL: string = extra.supabaseUrl ?? '';
const SUPABASE_ANON_KEY: string = extra.supabaseAnonKey ?? '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);