
import { useCallback, useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';

/**
 * A hook that wraps fetch calls to handle authentication errors globally.
 * It monitors for 401 responses and triggers the session expiration workflow.
 * Includes robust retry logic for transient network errors.
 */
export function useAuthenticatedFetch() {
  const { signOut, session } = useAuth();
  const [authError, setAuthError] = useState(false);
  const abortControllerRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const authenticatedFetch = useCallback(async (url, options = {}) => {
    const MAX_RETRIES = 3;
    const INITIAL_BACKOFF = 500; // ms

    let attempt = 0;
    let lastError;

    // Create a new AbortController for this request if one isn't provided
    const controller = new AbortController();
    const signal = options.signal || controller.signal;
    abortControllerRef.current = controller;

    while (attempt <= MAX_RETRIES) {
      try {
        // Pre-flight check: Ensure we have a valid session before making the request
        if (session && !session.access_token) {
           const { data: { session: currentSession }, error } = await supabase.auth.getSession();
           
           if (error || !currentSession) {
              console.warn('No valid session found before fetch. Aborting.');
              await signOut();
              setAuthError(true);
              return new Response(null, { status: 401, statusText: 'Unauthorized' });
           }
        }

        const fetchOptions = {
          ...options,
          signal,
          headers: {
            ...options.headers,
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
          }
        };

        const response = await fetch(url, fetchOptions);

        if (response.status === 401) {
          console.warn('401 Unauthorized detected. Invalidating session.');
          await signOut();
          setAuthError(true);
          return response;
        }

        if (response.ok || (response.status < 500 && response.status !== 429)) {
          return response;
        }

        throw new Error(`Request failed with status ${response.status}`);

      } catch (error) {
        lastError = error;
        
        if (error.name === 'AbortError') {
          throw error;
        }
        
        if (error.message?.includes('refresh_token_not_found') || error.message?.includes('Invalid Refresh Token')) {
           await signOut();
           setAuthError(true);
           throw error;
        }

        attempt++;
        if (attempt > MAX_RETRIES) break;

        const delay = INITIAL_BACKOFF * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    console.error('Max retries reached for authenticated fetch:', lastError);
    throw lastError;

  }, [signOut, session]);

  const clearAuthError = useCallback(() => {
    setAuthError(false);
    window.location.href = '/';
  }, []);

  return {
    authenticatedFetch,
    authError,
    clearAuthError
  };
}
