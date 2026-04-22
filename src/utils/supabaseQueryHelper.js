
import { handleSupabaseError } from './errorHandler';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Wraps a Supabase query with exponential backoff retry and timeout logic.
 * 
 * @param {Function} queryBuilderFn - Function returning a Supabase query promise
 * @param {Object} options - Configuration options
 * @returns {Promise<{data: any, error: any}>}
 */
export const fetchWithRetry = async (
  queryBuilderFn, 
  options = { maxRetries: 3, timeoutMs: 8000, context: {} }
) => {
  let attempt = 0;
  const { maxRetries = 3, timeoutMs = 8000, context = {} } = options;

  while (attempt <= maxRetries) {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Supabase query timeout')), timeoutMs)
      );

      const response = await Promise.race([queryBuilderFn(), timeoutPromise]);

      if (response && response.error) {
        throw response.error;
      }

      return { data: response.data, count: response.count, error: null };
    } catch (error) {
      attempt++;
      const isTimeout = error.message === 'Supabase query timeout';
      const isNetworkError = error.message?.includes('fetch') || error.message?.includes('Failed to fetch');
      const isServerError = error.code === '503' || error.code === '504';

      if (attempt > maxRetries || (!isTimeout && !isNetworkError && !isServerError)) {
        handleSupabaseError(error, { ...context, attempt, finalFailure: true }, false);
        return { data: null, error };
      }

      const backoffTime = Math.pow(2, attempt - 1) * 1000;
      console.warn(`[Supabase Query Retry] Attempt ${attempt} failed. Retrying in ${backoffTime}ms...`, error.message);
      await delay(backoffTime);
    }
  }

  return { data: null, error: new Error('Max retries exceeded') };
};
