import React, { useState, useEffect } from 'react';
import { Copy, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';

const PixQRCodeDisplay = ({ qr_code_image_url, copy_paste_code, expires_at }) => {
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!expires_at) return;

    const interval = setInterval(() => {
      const now = new Date();
      const expiration = new Date(expires_at);
      const diff = expiration - now;

      if (diff <= 0) {
        setTimeLeft('Expirado');
        setIsExpired(true);
        clearInterval(interval);
      } else {
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expires_at]);

  const handleCopy = () => {
    navigator.clipboard.writeText(copy_paste_code);
    toast({
      title: "Código copiado!",
      description: "Cole no app do seu banco para pagar.",
      className: "bg-emerald-500 text-white border-none"
    });
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="pt-6 space-y-6">
        <div className="text-center space-y-2">
          <h3 className="font-semibold text-white">Escaneie o QR Code</h3>
          <p className="text-sm text-gray-400">Abra o app do seu banco e escolha pagar com Pix</p>
        </div>

        <div className="flex justify-center bg-white p-4 rounded-lg w-fit mx-auto shadow-lg shadow-emerald-500/10">
          {qr_code_image_url ? (
            <img src={qr_code_image_url} alt="QR Code Pix" className="w-48 h-48 object-contain" />
          ) : (
            <div className="w-48 h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
              QR Code Indisponível
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="text-center text-sm text-gray-400">Ou copie e cole o código abaixo:</div>
          <div className="flex gap-2">
            <code className="flex-1 bg-gray-900 p-3 rounded-md text-xs text-gray-300 font-mono break-all border border-gray-700 max-h-24 overflow-y-auto">
              {copy_paste_code}
            </code>
            <Button 
              size="icon" 
              variant="secondary" 
              className="shrink-0 h-auto"
              onClick={handleCopy}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className={`flex items-center justify-center gap-2 text-sm font-medium ${isExpired ? 'text-red-400' : 'text-emerald-400'}`}>
          <Clock className="w-4 h-4" />
          <span>{isExpired ? 'Código Expirado' : `Expira em: ${timeLeft}`}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PixQRCodeDisplay;