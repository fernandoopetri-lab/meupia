import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';

const EVENTS = [
  'mousedown', 
  'mousemove', 
  'keydown', 
  'scroll', 
  'touchstart', 
  'click', 
  'wheel'
];

export function useSessionTimeout(timeoutDuration = 30 * 60 * 1000) { // Default 30 minutes
  const { user, signOut } = useAuth();
  const [isTimedOut, setIsTimedOut] = useState(false);
  const timerRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  const handleLogout = useCallback(async () => {
    if (user) {
      try {
        await signOut();
      } catch (error) {
        console.error("Error during timeout logout:", error);
      } finally {
        setIsTimedOut(true);
      }
    }
  }, [user, signOut]);

  const resetTimer = useCallback(() => {
    if (!user) return;
    
    lastActivityRef.current = Date.now();
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    timerRef.current = setTimeout(handleLogout, timeoutDuration);
  }, [user, timeoutDuration, handleLogout]);

  // Check session validity periodically to catch refresh token errors early
  useEffect(() => {
    if (!user) return;

    const checkSessionValidity = async () => {
      // Prevent checks if offline to avoid error loops
      if (!navigator.onLine) return;

      try {
        // Validate token existence before making request
        const hasToken = Object.keys(localStorage).some(key => 
          key.startsWith('sb-') && key.endsWith('-auth-token')
        );

        if (!hasToken) {
          await handleLogout();
          return;
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
           console.error("Session check failed:", error);
           if (error.message?.includes('refresh_token_not_found') || 
               error.message?.includes('Invalid Refresh Token') ||
               error.message?.includes('JWT expired')) {
             // Token is invalid, force logout immediately to prevent infinite loops
             await handleLogout();
           }
        } else if (!session) {
           // No session found
           await handleLogout();
        }
      } catch (err) {
        console.error("Unexpected error checking session:", err);
        // Only logout on critical auth errors, not network glitches
        if (err.message?.includes('JWT') || err.message?.includes('token')) {
            await handleLogout();
        }
      }
    };

    // Check every 5 minutes
    const intervalId = setInterval(checkSessionValidity, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [user, handleLogout]);

  useEffect(() => {
    if (!user) return;

    // Initial timer start
    resetTimer();

    const handleActivity = () => {
      // Throttle resets to max once per second to improve performance
      if (Date.now() - lastActivityRef.current > 1000) {
        resetTimer();
      }
    };

    // Listen for user activity
    EVENTS.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      EVENTS.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [user, resetTimer]);

  const resetTimeoutState = () => {
    setIsTimedOut(false);
  };

  return { isTimedOut, resetTimeoutState };
}