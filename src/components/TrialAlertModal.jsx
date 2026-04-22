import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { AlertTriangle, Clock } from 'lucide-react';

const TrialAlertModal = ({ isOpen, daysLeft, onClose, onSubscribe }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl"
      >
        <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
          <Clock className="w-8 h-8 text-yellow-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          ⏳ Seu período de teste está chegando ao fim!
        </h2>
        <p className="text-slate-600 mb-6">
          Faltam apenas <span className="font-bold">{daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}</span> para você continuar aproveitando todas as funcionalidades do Meu Pila.
        </p>
        <div className="flex flex-col gap-3">
          <Button onClick={onSubscribe} className="btn-primary w-full">Assinar agora</Button>
          <Button onClick={onClose} variant="ghost" className="w-full">Lembrar mais tarde</Button>
        </div>
      </motion.div>
    </div>
  );
};

export default TrialAlertModal;