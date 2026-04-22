import { supabase } from '@/lib/customSupabaseClient';
import { fetchWithRetry } from '@/utils/supabaseQueryHelper';

export const signInUser = async (email, password) => {
  return await fetchWithRetry(
    () => supabase.auth.signInWithPassword({ email, password }),
    { maxRetries: 2, context: { functionName: 'signIn' } }
  );
};

export const signUpUser = async (email, password, options) => {
  return await fetchWithRetry(
    () => supabase.auth.signUp({ email, password, options }),
    { maxRetries: 2, context: { functionName: 'signUp' } }
  );
};

export const signOutUser = async () => {
  return await fetchWithRetry(
    () => supabase.auth.signOut(),
    { maxRetries: 2, context: { functionName: 'signOut' } }
  );
};

export const getSession = async () => {
  return await fetchWithRetry(
    () => supabase.auth.getSession(),
    { maxRetries: 3, timeoutMs: 10000, context: { functionName: 'getSession' } }
  );
};