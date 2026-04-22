import React from 'react';
import { motion } from 'framer-motion';
import { Lock, CreditCard, HelpCircle, AlertTriangle, ArrowRight, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';

const AccessBlockedScreen = ({ accessInfo }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const isTrialExpired = accessInfo?.status === 'trial_expired';
  const isPaymentIssue = accessInfo?.status === 'blocked' && accessInfo?.reason?.toLowerCase().includes('pagamento');
  
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-red-900/10 blur-3xl" />
        <div className="absolute top-[20%] -right-[20%] w-[60%] h-[60%] rounded-full bg-orange-900/10 blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        <div className="bg-red-500/10 p-6 border-b border-red-500/20 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Acesso Bloqueado</h1>
          <p className="text-red-200">
            {accessInfo?.reason || 'Sua conta precisa de atenção para continuar.'}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {isTrialExpired ? (
            <div className="space-y-4">
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <h3 className="text-white font-medium flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  Período de Teste Finalizado
                </h3>
                <p className="text-sm text-slate-400">
                  Esperamos que você tenha gostado do Meu Pila! Para continuar gerenciando suas finanças, escolha um plano que melhor se adapta a você.
                </p>
              </div>
              <Button 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-lg"
                onClick={() => navigate('/checkout')}
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Assinar Agora
              </Button>
            </div>
          ) : isPaymentIssue ? (
            <div className="space-y-4">
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                 <h3 className="text-white font-medium flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Pagamento Pendente
                </h3>
                <p className="text-sm text-slate-400">
                  Detectamos uma pendência no seu pagamento. Regularize sua situação para restaurar o acesso imediato.
                </p>
              </div>
              <Button 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12"
                onClick={() => navigate('/settings?tab=subscription')}
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Regularizar Pagamento
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
               <p className="text-slate-400 text-sm">
                 Entre em contato com o suporte para entender o motivo do bloqueio e restaurar seu acesso.
               </p>
               <Button variant="outline" className="w-full border-slate-600 text-slate-200 hover:bg-slate-700">
                 <HelpCircle className="w-4 h-4 mr-2" />
                 Falar com Suporte
               </Button>
            </div>
          )}

          <div className="border-t border-slate-700 pt-4 mt-4">
            <Button 
              variant="ghost" 
              className="w-full text-slate-400 hover:text-white hover:bg-slate-700"
              onClick={signOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair da conta
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AccessBlockedScreen;