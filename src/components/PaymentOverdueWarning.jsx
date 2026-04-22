import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const PaymentOverdueWarning = ({ daysRemaining }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      className="relative z-30 bg-red-600 text-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-500">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm sm:text-base">
                Pagamento Pendente
              </p>
              <p className="text-xs sm:text-sm text-white/90">
                Seu acesso será bloqueado em {daysRemaining} dias se o pagamento não for identificado.
              </p>
            </div>
          </div>
          
          <Button 
            size="sm"
            className="w-full sm:w-auto bg-white text-red-600 hover:bg-red-50 font-bold border-none"
            onClick={() => navigate('/settings?tab=subscription')}
          >
            Regularizar Agora
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default PaymentOverdueWarning;