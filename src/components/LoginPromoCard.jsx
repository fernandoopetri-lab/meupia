import React from 'react';
import { Check, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPromoCard = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-8 max-w-sm w-full mx-auto border border-white/20"
    >
      <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
        Comece seu teste grátis agora
      </h3>
      
      <ul className="space-y-4 mb-6">
        <li className="flex items-start gap-3">
          <div className="mt-1 bg-emerald-100 rounded-full p-1 shrink-0">
            <Check className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-gray-600 text-sm leading-snug">
            Lance despesas por texto, áudio ou foto
          </span>
        </li>
        <li className="flex items-start gap-3">
          <div className="mt-1 bg-emerald-100 rounded-full p-1 shrink-0">
            <Check className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-gray-600 text-sm leading-snug">
            Receba relatórios claros e fáceis
          </span>
        </li>
        <li className="flex items-start gap-3">
          <div className="mt-1 bg-emerald-100 rounded-full p-1 shrink-0">
            <Check className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-gray-600 text-sm leading-snug">
            30 dias grátis para testar
          </span>
        </li>
      </ul>

      <div className="border-t border-gray-200 pt-4 flex items-center justify-center gap-2 text-gray-500">
        <Lock className="w-4 h-4 text-emerald-600" />
        <span className="text-xs font-medium">
          Seus dados são protegidos com criptografia.
        </span>
      </div>
    </motion.div>
  );
};

export default LoginPromoCard;