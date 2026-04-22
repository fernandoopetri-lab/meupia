import React from 'react';
import { CreditCard, QrCode, Wallet } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const PaymentMethodSelector = ({ selectedMethod, onChange }) => {
  const methods = [
    {
      id: 'pix',
      title: 'Pix',
      description: 'Aprovação imediata. Escaneie o QR Code.',
      icon: QrCode
    },
    {
      id: 'credit_card',
      title: 'Cartão de Crédito',
      description: 'Até 12x. Aprovação em segundos.',
      icon: CreditCard
    },
    {
      id: 'debit_card',
      title: 'Cartão de Débito',
      description: 'Pagamento à vista. Seguro e rápido.',
      icon: Wallet
    }
  ];

  return (
    <div className="space-y-4">
      <Label className="text-base text-white">Escolha a forma de pagamento</Label>
      <RadioGroup 
        value={selectedMethod} 
        onValueChange={onChange}
        className="grid gap-4 sm:grid-cols-3"
      >
        {methods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;
          
          return (
            <div key={method.id}>
              <RadioGroupItem value={method.id} id={method.id} className="peer sr-only" />
              <Label
                htmlFor={method.id}
                className={cn(
                  "flex flex-col items-center justify-between rounded-md border-2 bg-gray-800 p-4 hover:bg-gray-700 hover:text-white peer-data-[state=checked]:border-emerald-500 [&:has([data-state=checked])]:border-emerald-500 cursor-pointer transition-all h-full text-center",
                  isSelected ? "border-emerald-500 bg-gray-700/50" : "border-gray-700 text-gray-400"
                )}
              >
                <Icon className={cn("mb-3 h-6 w-6", isSelected ? "text-emerald-500" : "text-gray-400")} />
                <div className="space-y-1">
                    <div className={cn("font-semibold", isSelected ? "text-white" : "text-gray-200")}>
                        {method.title}
                    </div>
                    <div className="text-xs text-gray-400 font-normal">
                        {method.description}
                    </div>
                </div>
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
};

export default PaymentMethodSelector;