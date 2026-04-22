import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Clock, HelpCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const TrialExpiredScreen = ({ setActiveTabInDashboard }) => {
  const { signOut } = useAuth();
  
  const handleGoToSubscription = () => {
    // This is a placeholder. A real implementation might use react-router or another method.
    // For now, we will simulate this by trying to change the state of the dashboard component.
    // Ideally this component would be rendered inside the dashboard layout to have access to its state.
    // Since it's in App.jsx, we just provide a placeholder.
    alert("Redirecionando para a página de planos... (funcionalidade simulada)");
  };
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-8 md:p-12 max-w-lg w-full shadow-lg"
      >
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <Clock className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-3">
          Seu período de teste expirou
        </h1>
        <p className="text-slate-600 mb-8">
          Para continuar gerenciando suas finanças com o Meu Pila, por favor, escolha um de nossos planos.
        </p>
        <div className="flex flex-col gap-4">
          <Button onClick={handleGoToSubscription} className="btn-primary w-full h-12 text-base">
            <ShieldCheck className="w-5 h-5 mr-2"/>
            Ativar Assinatura
          </Button>
          <Button onClick={signOut} variant="outline" className="w-full h-12 text-base">
            Sair
          </Button>
        </div>
         <div className="mt-8 text-sm text-slate-500">
            <p>Precisa de ajuda? <a href="#" onClick={(e) => { e.preventDefault(); alert('Contate o suporte! (simulado)'); }} className="text-emerald-600 font-semibold hover:underline">Fale com o suporte</a></p>
        </div>
      </motion.div>
    </div>
  );
};

export default TrialExpiredScreen;