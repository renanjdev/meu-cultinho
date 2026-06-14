/**
 * services/supabase.ts — Supabase client (web + native).
 *
 * Credentials come from EXPO_PUBLIC_* env vars (see .env.example). The anon key
 * is safe to ship in the client bundle; Row Level Security protects the data.
 */
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail loudly in dev so a missing .env.local is obvious, not a silent 401.
  console.warn(
    '[supabase] EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY ausentes. ' +
      'Copie .env.example para .env.local e preencha com os dados do seu projeto Supabase.',
  );
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/** O login do app é por "usuário"; o Supabase Auth usa e-mail. Mapeamos para um
 *  e-mail interno sintético (mesma ideia do plano original). */
export const INTERNAL_EMAIL_DOMAIN = 'meucultinho.app';
export const usernameToEmail = (u: string) => `${u.trim().toLowerCase()}@${INTERNAL_EMAIL_DOMAIN}`;
export const emailToUsername = (e: string) => e.replace(`@${INTERNAL_EMAIL_DOMAIN}`, '');
