import { supabase } from '@/lib/customSupabaseClient';
import { logError } from './errorLogger';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Wraps Supabase Edge Function calls with timeout and exponential backoff retry logic.
 * 
 * @param {string} functionName - Name of the edge function
 * @param {object} options - Invoke options (body, headers, etc.)
 * @param {number} maxRetries - Maximum number of retries (default: 3)
 * @param {number} timeoutMs - Timeout in milliseconds (default: 30000)
 * @returns {Promise<{data: any, error: any}>}
 */
export const invokeEdgeFunction = async (functionName, options = {}, maxRetries = 3, timeoutMs = 30000) => {
  let attempt = 0;
  
  while (attempt <= maxRetries) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      // We use standard supabase invoke, but abort signal is passed via fetch options if supported,
      // or we manually race it. Supabase SDK might not natively support signal in invoke yet, 
      // so we use Promise.race for the timeout.
      const invokePromise = supabase.functions.invoke(functionName, options);
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Edge function execution timed out')), timeoutMs)
      );

      const response = await Promise.race([invokePromise, timeoutPromise]);
      clearTimeout(timeoutId);

      if (response.error) {
        throw response.error;
      }

      return { data: response.data, error: null };
    } catch (error) {
      attempt++;
      const isTimeout = error.message === 'Edge function execution timed out';
      const isFetchError = error.name === 'FunctionsFetchError' || error.message?.includes('fetch');

      logError(`Edge function ${functionName} failed (Attempt ${attempt})`, error, null, { functionName, options });

      if (attempt > maxRetries || (!isTimeout && !isFetchError)) {
        return { data: null, error };
      }

      // Exponential backoff: 1s, 2s, 4s...
      const backoffTime = Math.pow(2, attempt - 1) * 1000;
      console.log(`Retrying ${functionName} in ${backoffTime}ms...`);
      await delay(backoffTime);
    }
  }
};