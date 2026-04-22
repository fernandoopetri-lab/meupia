import { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { logError } from '@/utils/errorLogger';

export const useSessionValidation = (signOut) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isSessionValid, setIsSessionValid] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const validateSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (!session) {
          if (isMounted) setIsSessionValid(false);
          return;
        }

        // Token existence implies validity for now. Backend handles expiry.
        if (isMounted) setIsSessionValid(true);

      } catch (error) {
        logError('Session validation failed', error);
        if (error.message?.includes('refresh_token_not_found') || error.status === 401) {
          await signOut();
        }
        if (isMounted) setIsSessionValid(false);
      } finally {
        if (isMounted) setIsValidating(false);
      }
    };

    validateSession();

    return () => {
      isMounted = false;
    };
  }, [signOut]);

  return { isValidating, isSessionValid };
};