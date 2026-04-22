import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';

const PixPaymentForm = ({ onSubmit, isLoading }) => {
  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 text-emerald-400 text-sm">
        <div className="flex items-center gap-2 mb-2 font-medium">
            <Check className="w-4 h-4" />
            <span>Excelente escolha!</span>
        </div>
        O pagamento via Pix é instantâneo e libera seu acesso imediatamente após a confirmação.
      </div>

      <div className="space-y-4">
        <p className="text-gray-300 text-sm">
            Ao clicar em "Gerar Pix", criaremos um código exclusivo para sua transação. 
            Você terá 30 minutos para efetuar o pagamento.
        </p>

        <Button 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-base font-semibold"
            onClick={onSubmit}
            disabled={isLoading}
        >
            {isLoading ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando QR Code...
                </>
            ) : (
                'Gerar Pix para Pagamento'
            )}
        </Button>
      </div>
    </div>
  );
};

export default PixPaymentForm;