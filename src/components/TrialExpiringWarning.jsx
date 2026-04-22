import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const TrialExpiringWarning = ({ daysLeft, type = 'trial' }) => {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  if (!isVisible) return null;

  const isUrgent = daysLeft <= 3;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className={`relative z-30 ${isUrgent ? 'bg-orange-600' : 'bg-blue-600'} text-white overflow-hidden`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${isUrgent ? 'bg-orange-500' : 'bg-blue-500'}`}>
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-sm sm:text-base">
                  {type === 'trial' 
                    ? `Seu período de teste termina em ${daysLeft} dias.` 
                    : `Sua assinatura expira em ${daysLeft} dias.`}
                </p>
                <p className="text-xs sm:text-sm text-white/80 hidden sm:block">
                  Não perca o acesso às suas ferramentas de gestão financeira.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button 
                size="sm"
                variant="secondary"
                className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100 font-medium"
                onClick={() => navigate('/checkout')}
              >
                {type === 'trial' ? 'Assinar Agora' : 'Renovar Plano'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <button 
                onClick={() => setIsVisible(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TrialExpiringWarning;