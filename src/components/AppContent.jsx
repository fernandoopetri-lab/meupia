
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import AuthScreen from '@/pages/auth/AuthScreen';
import Dashboard from '@/components/Dashboard';
import OnboardingScreen from '@/components/OnboardingScreen';
import AdminPanel from '@/components/admin/AdminPanel';
import LandingPage from '@/components/LandingPage';
import PageRural from '@/pages/PageRural';
import PessoalPage from '@/pages/PessoalPage';
import SignUpPage from '@/pages/auth/SignUpPage';
import LoginPage from '@/pages/auth/LoginPage';
import CheckoutPage from '@/components/CheckoutPage';
import WebhooksPage from '@/components/WebhooksPage';
import SessionTimeoutModal from '@/components/SessionTimeoutModal';
import ProtectedAccessRoute from '@/components/ProtectedAccessRoute';
import ErrorBoundary from '@/components/ErrorBoundary';
import NetworkStatus from '@/components/NetworkStatus';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { useSessionValidation } from '@/hooks/useSessionValidation';
import { useRetryFetch } from '@/hooks/useRetryFetch';
import { fetchWithRetry } from '@/utils/supabaseQueryHelper';
import { handleSupabaseError } from '@/utils/errorHandler';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { checkAccessStatus } from '@/utils/checkUserAccess';
import { invokeEdgeFunction } from '@/utils/edgeFunctionHelper';

function AppContent() {
  const { user, session, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [dashboardKey, setDashboardKey] = useState(0);
  const { toast } = useToast();
  const { retryFetch } = useRetryFetch();

  const { isTimedOut, resetTimeoutState } = useSessionTimeout(30 * 60 * 1000);
  const { authError, clearAuthError } = useAuthenticatedFetch();
  const { isValidating, isSessionValid } = useSessionValidation(signOut);

  const handleSessionExpirationClose = () => {
    if (isTimedOut) {
      resetTimeoutState();
      window.location.href = '/';
    }
    if (authError) clearAuthError();
  };

  const showExpirationModal = isTimedOut || authError;

  useEffect(() => {
    if (user && showAuth) {
      setShowAuth(false);
    }
  }, [user, showAuth]);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      if (!user) {
        if (isMounted) {
          setProfile(null);
          setProfileLoading(false);
        }
        return;
      }

      setShowAuth(false);
      setProfileLoading(true);
      
      try {
        if (!navigator.onLine) {
           if (isMounted) setProfileLoading(false);
           return;
        }

        const accessStatus = await checkAccessStatus(user.id);
        console.log("Access Status Checked:", accessStatus);

        const { data, error } = await fetchWithRetry(
          () => supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
          { maxRetries: 3, timeoutMs: 10000, context: { functionName: 'fetchProfile' } }
        );

        if (error) {
          throw error;
        }

        if (isMounted) {
          setProfile(data);
          
          if (data && !data.is_admin) {
             invokeEdgeFunction('generate-due-date-notifications').catch(e => console.error('Failed to generate notifications', e));
          }
        }
      } catch (error) {
        handleSupabaseError(error, { functionName: 'fetchProfile', userId: user?.id }, false);
        
        if (error.code === 'PGRST301' || error.message?.includes('JWT') || error.message?.includes('refresh_token_not_found')) {
            await signOut();
        }
        if (isMounted) setProfile(null);
      } finally {
        if (isMounted) setProfileLoading(false);
      }
    };

    if (!authLoading && !isValidating) {
        fetchProfile();
    }

    return () => {
      isMounted = false;
    };
  }, [user, authLoading, isValidating, signOut]);
  
  const handleOnboardingComplete = async (accountType) => {
    if (!user || !session) return;
    
    try {
      const createdAt = new Date(session.user.created_at);
      const expiresAt = new Date(createdAt);
      expiresAt.setDate(createdAt.getDate() + 15);
      const expiresAtISO = expiresAt.toISOString();

      const { data: existingProfile } = await fetchWithRetry(() => supabase.from('profiles').select('id').eq('id', user.id).maybeSingle());

      let data, error;

      if (!existingProfile) {
        const result = await fetchWithRetry(() => supabase.from('profiles').insert({
          id: user.id, name: user.user_metadata?.name || 'Usuário', account_type: accountType,
          plan_status: 'trial', plan_expires_at: expiresAtISO, trial_end_date: expiresAtISO
        }).select().single());
        data = result.data; error = result.error;
      } else {
        const result = await fetchWithRetry(() => supabase.from('profiles').update({ 
          account_type: accountType, plan_status: 'trial', 
          plan_expires_at: expiresAtISO, trial_end_date: expiresAtISO 
        }).eq('id', user.id).select().single());
        data = result.data; error = result.error;
      }

      if (error) {
        handleSupabaseError(error, { functionName: 'handleOnboardingComplete', userId: user.id });
      } else {
        setProfile(data);
      }
    } catch (error) {
      handleSupabaseError(error, { functionName: 'handleOnboardingComplete (unexpected)', userId: user.id });
    }
  };
  
  const handleProfileUpdate = (updatedProfile) => setProfile(prev => ({...prev, ...updatedProfile}));

  const isLoading = authLoading || isValidating || (user && profileLoading);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F9FB]">
        <Loader2 className="w-8 h-8 text-lime-500 animate-spin mb-4" />
        <p className="text-slate-500 text-sm">Validando conexão...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Helmet>
        <title>Meu Pila - Gestão Financeira Inteligente para o Campo e a Cidade</title>
        <meta name="description" content="Controle financeiro rural e pessoal. Simplifique sua vida financeira com o Meu Pila." />
      </Helmet>
      
      <NetworkStatus />

      {/* REMOVED DUPLICATE ROUTER WRAPPER HERE - ONLY USING ROUTES */}
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/create" element={user ? <Navigate to="/" replace /> : <SignUpPage />} />
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
          
          <Route path="/" element={
            user ? (
              <ProtectedAccessRoute>
                {profile?.is_admin ? (
                  <Dashboard key={`dashboard-${dashboardKey}`} user={user} profile={profile} onProfileUpdate={handleProfileUpdate} session={session} />
                ) : profile && !profile.account_type ? (
                  <OnboardingScreen onComplete={handleOnboardingComplete} />
                ) : profile ? (
                  <Dashboard key={`dashboard-${dashboardKey}`} user={user} profile={profile} onProfileUpdate={handleProfileUpdate} session={session} />
                ) : null}
              </ProtectedAccessRoute>
            ) : (
              <LandingPage onAuthClick={() => setShowAuth(true)} />
            )
          } />

          <Route path="/admin/*" element={
            user && profile?.is_admin ? (
              <ProtectedAccessRoute><AdminPanel user={user} profile={profile} /></ProtectedAccessRoute>
            ) : <Navigate to="/" replace />
          } />
          
          <Route path="/admin/webhooks" element={
            user && profile?.is_admin ? (
              <ProtectedAccessRoute><WebhooksPage /></ProtectedAccessRoute>
            ) : <Navigate to="/" replace />
          } />

          <Route path="/checkout" element={<ProtectedAccessRoute><CheckoutPage /></ProtectedAccessRoute>} />

          <Route path="/page-rural" element={<PageRural onAuthClick={() => user ? window.location.href = '/' : setShowAuth(true)} />} />
            <Route path="/rural" element={<PageRural onAuthClick={() => user ? window.location.href = '/' : setShowAuth(true)} />} />
            <Route path="/pessoal" element={<PessoalPage onAuthClick={() => user ? window.location.href = '/' : setShowAuth(true)} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <AnimatePresence>
          {showAuth && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowAuth(false)}>
              <div onClick={(e) => e.stopPropagation()}>
                <AuthScreen onAuthSuccess={() => setShowAuth(false)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <SessionTimeoutModal open={showExpirationModal} onClose={handleSessionExpirationClose} />
      </div>
      <Toaster />
    </ErrorBoundary>
  );
}

export default AppContent;
