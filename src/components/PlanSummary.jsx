import { Check, Calendar, Info, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/formatCurrency';

const PlanSummary = ({ plan, billingPeriod }) => {
  if (!plan) return null;

  // Assuming plan.price is monthly. Calculate based on billingPeriod if needed.
  // Assuming the backend returns the correct amount for the session.
  const displayPrice = billingPeriod === 'yearly' ? plan.price * 12 : plan.price;
  const periodLabel = billingPeriod === 'yearly' ? 'Anual' : 'Mensal';

  const benefits = plan.access_rules?.benefits || [];
  
  // Safe access to trial info
  const trialDays = plan.access_rules?.trial_days || 0;

  return (
    <div className="card-modern !bg-slate-900 border-slate-800 h-full relative overflow-hidden group">
      {/* Decorative Gradient Background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-lime-500/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none group-hover:bg-lime-500/15 transition-colors" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none" />

      <div className="relative z-10 p-2">
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-lime-400" />
              <h3 className="text-2xl font-black text-white tracking-tight">{plan.name}</h3>
            </div>
            <p className="text-sm font-medium text-slate-400 leading-relaxed">{plan.description}</p>
          </div>
          {trialDays > 0 && (
            <Badge className="bg-lime-500/10 text-lime-400 border-lime-500/20 hover:bg-lime-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              {trialDays} dias grátis
            </Badge>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-6 border border-white/5">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Investimento</p>
            <div className="flex items-baseline text-white">
              <span className="text-4xl font-black tracking-tighter">
                <span className="text-lg font-bold opacity-50 mr-1">R$</span>
                {displayPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-slate-500 font-bold ml-2 text-sm">/ {periodLabel.toLowerCase()}</span>
            </div>
          </div>

          <div className="space-y-4 px-2">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">O que está incluso no seu acesso:</h4>
            <ul className="space-y-3">
              {benefits.length > 0 ? benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3 text-sm font-medium text-slate-300 group/item">
                  <div className="p-1 bg-lime-500/10 rounded-lg group-hover/item:bg-lime-500/20 transition-colors">
                    <Check className="w-3.5 h-3.5 text-lime-400" />
                  </div>
                  <span>{benefit}</span>
                </li>
              )) : (
                <li className="text-sm text-slate-500 italic flex items-center gap-2">
                   <Info className="w-4 h-4" />
                   Detalhes do plano não disponíveis.
                </li>
              )}
            </ul>
          </div>

          <div className="bg-blue-500/5 backdrop-blur-sm rounded-2xl p-5 border border-blue-500/10">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-black text-white uppercase tracking-widest">Resumo da Cobrança</p>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Você será cobrado <strong className="text-white font-bold">{formatCurrency(displayPrice)}</strong> pelo período {periodLabel.toLowerCase()}. 
                  {billingPeriod === 'yearly' ? ' Renovação automática anualmente para garantir seu acesso contínuo.' : ' Renovação automática mensalmente com flexibilidade total.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanSummary;