import React from 'react';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const CheckoutError = ({ error_message, error_code, onRetry }) => {
  return (
    <Card className="border-red-500/50 bg-red-900/10 max-w-md mx-auto mt-8">
      <CardContent className="pt-6 text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center border border-red-500/30">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-red-500">Erro no Processamento</h3>
          <p className="text-gray-300 text-sm">{error_message || "Ocorreu um erro inesperado. Por favor, tente novamente."}</p>
          {error_code && (
            <p className="text-xs text-gray-500 font-mono">Código: {error_code}</p>
          )}
        </div>

        <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-center">
          <Button 
            variant="outline" 
            className="border-red-500/20 text-red-400 hover:bg-red-900/20 hover:text-red-300 w-full sm:w-auto"
            onClick={() => window.location.href = '/admin?tab=plans'}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Planos
          </Button>
          
          <Button 
            className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
            onClick={onRetry}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CheckoutError;