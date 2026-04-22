import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, XCircle, Clock, HelpCircle } from 'lucide-react';

const AccessStatusBadge = ({ status, reason }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          label: 'Ativo',
          color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: CheckCircle2
        };
      case 'trial':
        return {
          label: 'Em Teste',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Clock
        };
      case 'restricted':
        return {
          label: 'Restrito',
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: AlertTriangle
        };
      case 'blocked':
        return {
          label: 'Bloqueado',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle
        };
      case 'trial_expired':
        return {
          label: 'Teste Expirado',
          color: 'bg-slate-100 text-slate-800 border-slate-200',
          icon: Clock
        };
      default:
        return {
          label: status || 'Desconhecido',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: HelpCircle
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div 
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}
      title={reason || config.label}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </div>
  );
};

export default AccessStatusBadge;