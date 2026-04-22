import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, LogOut, RefreshCw, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const AccessRestrictedModal = ({ status, reason }) => {
  const { signOut } = useAuth();

  const getMessage = () => {
    switch (status) {
      case 'blocked':
        return {
          title: 'Acesso Bloqueado',
          description: reason || 'Sua conta foi suspensa temporariamente. Entre em contato com o administrador.',
          icon: <Lock className="w-12 h-12 text-red-500" />,
          color: 'bg-red-500',
          action: 'Contact Support'
        };
      case 'trial_expired':
        return {
          title: 'Período de Teste Finalizado',
          description: 'Seu período de teste de 30 dias acabou. Assine um plano para continuar aproveitando todos os recursos.',
          icon: <RefreshCw className="w-12 h-12 text-yellow-500" />,
          color: 'bg-yellow-500',
          action: 'Subscribe'
        };
      case 'plan_expired':
        return {
          title: 'Assinatura Expirada',
          description: 'Sua assinatura venceu. Renove agora para restaurar seu acesso imediatamente.',
          icon: <RefreshCw className="w-12 h-12 text-orange-500" />,
          color: 'bg-orange-500',
          action: 'Renew'
        };
      default:
        return {
          title: 'Acesso Restrito',
          description: reason || 'Você não tem permissão para acessar esta área.',
          icon: <Lock className="w-12 h-12 text-gray-500" />,
          color: 'bg-gray-500',
          action: 'Logout'
        };
    }
  };

  const content = getMessage();

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-gray-900/90 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className={`h-2 ${content.color.replace('bg-', 'bg-gradient-to-r from-').replace('500', '400 to-') + content.color.replace('bg-', '')}`} />
        
        <div className="p-8 text-center">
          <div className={`mx-auto w-20 h-20 rounded-full ${content.color} bg-opacity-10 flex items-center justify-center mb-6`}>
            {content.icon}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {content.title}
          </h2>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            {content.description}
          </p>
          
          <div className="space-y-3">
             {status !== 'blocked' && (
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-lg font-medium">
                    {content.action === 'Subscribe' ? 'Escolher Plano' : 'Renovar Agora'}
                </Button>
             )}
             
             {status === 'blocked' && (
                <Button variant="outline" className="w-full border-gray-300 hover:bg-gray-50 py-6 text-gray-700">
                    <MessageSquare className="w-5 h-5 mr-2" /> Falar com Suporte
                </Button>
             )}

            <Button 
                variant="ghost" 
                onClick={signOut} 
                className="w-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <LogOut className="w-4 h-4 mr-2" /> Sair da conta
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AccessRestrictedModal;