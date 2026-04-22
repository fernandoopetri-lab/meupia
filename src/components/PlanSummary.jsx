import React from 'react';
import { Check, Calendar, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card className="bg-gray-800 border-gray-700 h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold text-white">{plan.name}</CardTitle>
            <p className="text-sm text-gray-400">{plan.description}</p>
          </div>
          {trialDays > 0 && (
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20">
              {trialDays} dias grátis
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-baseline text-white">
          <span className="text-3xl font-bold">{formatCurrency(displayPrice)}</span>
          <span className="text-gray-400 ml-2">/ {periodLabel.toLowerCase()}</span>
        </div>

        <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-300 uppercase tracking-wider">O que está incluído:</h4>
            <ul className="space-y-2">
                {benefits.length > 0 ? benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                        <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span>{benefit}</span>
                    </li>
                )) : (
                    <li className="text-sm text-gray-500 italic">Detalhes do plano não disponíveis.</li>
                )}
            </ul>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="text-sm font-medium text-white">Resumo da Cobrança</p>
                    <p className="text-sm text-gray-400">
                        Você será cobrado <strong>{formatCurrency(displayPrice)}</strong> pelo período {periodLabel.toLowerCase()}. 
                        {billingPeriod === 'yearly' ? ' Renovação automática anualmente.' : ' Renovação automática mensalmente.'}
                    </p>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanSummary;