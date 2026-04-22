import React from 'react';
import { Check, Lock } from 'lucide-react';

const SignUpCard = () => {
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full relative z-10 border border-slate-100">
      <h3 className="text-xl font-bold text-slate-800 mb-6">
        Comece seu teste grátis!
      </h3>

      <ul className="space-y-3 mb-4">
        <li className="flex items-start gap-3">
          <div className="mt-0.5 bg-emerald-100 rounded-full p-1 shrink-0">
            <Check className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-slate-600 text-sm leading-snug">
            Lance despesas por texto, áudio ou foto
          </span>
        </li>
        <li className="flex items-start gap-3">
          <div className="mt-0.5 bg-emerald-100 rounded-full p-1 shrink-0">
            <Check className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-slate-600 text-sm leading-snug">
            Receba relatórios claros e fáceis
          </span>
        </li>
      </ul>

      <div className="border-t border-slate-100 pt-3 flex items-center gap-2 text-slate-500">
        <Lock className="w-4 h-4 shrink-0 text-emerald-600" />
        <span className="text-xs font-medium">
          Você não será cobrado durante o período de teste.
        </span>
      </div>
    </div>
  );
};

export default SignUpCard;