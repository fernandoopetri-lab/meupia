import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { handleSupabaseError } from '@/utils/errorHandler';
import { useRetryFetch } from '@/hooks/useRetryFetch';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();
  const { retryFetch } = useRetryFetch();

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const signOut = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const userId = data?.session?.user?.id;
      if (userId) {
        try {
          sessionStorage.removeItem(`last_access_updated_${userId}`);
        } catch (e) {}
      }
      await retryFetch(() => supabase.auth.signOut(), {
        maxRetries: 2,
        context: { functionName: 'signOut' }
      });
    } catch (error) {
      handleSupabaseError(error, { functionName: 'signOut' }, false);
    } finally {
      setUser(null);
      setSession(null);
    }
  }, [retryFetch]);

  const handleSession = useCallback((currentSession) => {
    setSession(currentSession);
    setUser(currentSession?.user ?? null);
    setLoading(false);
    setError(null);
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      const { data, error: sessionError } = await retryFetch(
        () => supabase.auth.getSession(),
        { maxRetries: 3, timeoutMs: 10000, context: { functionName: 'getSession' } }
      );
      
      if (sessionError) {
        handleSupabaseError(sessionError, { functionName: 'initializeAuth' }, false);
        if (mounted) {
          setError(sessionError);
          setLoading(false);
          if (sessionError.message?.includes('refresh_token_not_found') || sessionError.status === 401) {
            await signOut();
          }
        }
        return;
      }
      
      if (mounted) handleSession(data?.session);
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log(`[AUTH EVENT] ${event}`);
      
      if (mounted) {
        if (event === 'TOKEN_REFRESHED' && !currentSession) {
          handleSupabaseError(new Error('No session after token refresh'), { functionName: 'onAuthStateChange' }, false);
          await signOut();
        } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          handleSession(null);
        } else {
          handleSession(currentSession);
          
          if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && currentSession?.user) {
            try {
              const sessionKey = `last_access_updated_${currentSession.user.id}`;
              if (typeof window !== 'undefined' && window.sessionStorage && !sessionStorage.getItem(sessionKey)) {
                supabase
                  .from('profiles')
                  .update({ last_access_check_at: new Date().toISOString() })
                  .eq('id', currentSession.user.id)
                  .then(({ error: updateError }) => {
                    if (!updateError) {
                      try {
                        sessionStorage.setItem(sessionKey, 'true');
                      } catch (e) {}
                    } else {
                      console.error('Failed to update last_access_check_at on auth state change:', updateError);
                    }
                  });
              }
            } catch (e) {
              console.error('Error handling last_access_check_at update:', e);
            }
          }
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [handleSession, signOut, retryFetch]);

  const signUp = useCallback(async (email, password, options) => {
    try {
      const { data, error } = await retryFetch(
        () => supabase.auth.signUp({ email, password, options }),
        { maxRetries: 2, context: { functionName: 'signUp' } }
      );
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      handleSupabaseError(error, { functionName: 'signUp' }, true);
      return { data: null, error };
    }
  }, [retryFetch]);

  const signIn = useCallback(async (email, password) => {
    try {
      const { data, error } = await retryFetch(
        () => supabase.auth.signInWithPassword({ email, password }),
        { maxRetries: 2, context: { functionName: 'signIn' } }
      );
      if (error) throw error;
      // Atualiza o estado local imediatamente para evitar depender
      // apenas do evento assíncrono onAuthStateChange para redirecionar.
      if (data?.session) {
        handleSession(data.session);
      }
      return { data, error: null };
    } catch (error) {
      handleSupabaseError(error, { functionName: 'signIn' }, true);
      return { data: null, error };
    }
  }, [handleSession, retryFetch]);

  const value = useMemo(() => ({
    user, session, loading, error, signUp, signIn, signOut
  }), [user, session, loading, error, signUp, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};