import { useState, useCallback } from 'react';
import { handleSupabaseError } from '@/utils/errorHandler';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const useRetryFetch = () => {
  const [isRetrying, setIsRetrying] = useState(false);

  const retryFetch = useCallback(async (
    operationFn,
    options = { maxRetries: 3, timeoutMs: 8000, context: {} }
  ) => {
    let attempt = 0;
    const { maxRetries = 3, timeoutMs = 8000, context = {} } = options;

    setIsRetrying(true);

    while (attempt <= maxRetries) {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
        );

        // Race the actual operation against the timeout
        const result = await Promise.race([operationFn(), timeoutPromise]);

        // If the operation returns an error object (like Supabase does), throw it to trigger retry
        if (result && result.error) {
          throw result.error;
        }

        setIsRetrying(false);
        return result;
      } catch (error) {
        attempt++;
        const isTimeout = error.message === 'Request timeout';
        const isNetworkError = error.message?.includes('fetch') || error.message?.includes('network');

        if (attempt > maxRetries || (!isTimeout && !isNetworkError && error.code !== '503' && error.code !== '504')) {
          setIsRetrying(false);
          handleSupabaseError(error, { ...context, attempt }, true);
          return { data: null, error };
        }

        const backoffTime = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
        console.warn(`[RETRY] Attempt ${attempt}/${maxRetries} failed. Retrying in ${backoffTime}ms...`, error);
        await delay(backoffTime);
      }
    }
    
    setIsRetrying(false);
    return { data: null, error: new Error('Max retries exceeded') };
  }, []);

  return { retryFetch, isRetrying };
};