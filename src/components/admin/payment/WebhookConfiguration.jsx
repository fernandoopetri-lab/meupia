import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Check, Copy, ExternalLink, Webhook } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const WebhookConfiguration = () => {
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUrl = async () => {
      try {
        const { data } = await supabase.functions.invoke('get-webhook-url');
        if (data?.webhook_url) {
          setWebhookUrl(data.webhook_url);
        }
      } catch (err) {
        console.error('Failed to get webhook url', err);
      } finally {
        setLoading(false);
      }
    };
    getUrl();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    toast({ title: "URL copiada!", description: "Cole no painel do ASAAS." });
    setTimeout(() => setCopied(false), 2000);
  };

  const events = [
    "PAYMENT_CONFIRMED",
    "PAYMENT_RECEIVED",
    "PAYMENT_OVERDUE",
    "SUBSCRIPTION_CREATED",
    "SUBSCRIPTION_UPDATED",
    "SUBSCRIPTION_DELETED"
  ];

  return (
    <Card className="bg-gray-800 border-gray-700 h-full">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
            <Webhook className="w-5 h-5 text-blue-400" />
            Configuração de Webhooks
        </CardTitle>
        <CardDescription className="text-gray-400">
          Receba atualizações automáticas de pagamentos e assinaturas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-200">URL do Endpoint</label>
          <div className="flex gap-2">
            <code className="flex-1 bg-gray-900 border border-gray-700 rounded-md p-3 text-sm text-gray-300 font-mono break-all">
              {loading ? 'Carregando...' : webhookUrl}
            </code>
            <Button 
                onClick={handleCopy} 
                variant="outline" 
                size="icon"
                className="shrink-0 border-gray-600 hover:bg-gray-700"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white border-b border-gray-700 pb-2">Instruções</h4>
            <ol className="list-decimal list-inside space-y-3 text-sm text-gray-300">
                <li>Acesse o <a href="https://www.asaas.com/configuracoes/integracao" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center">Painel do ASAAS <ExternalLink className="w-3 h-3 ml-1" /></a>.</li>
                <li>Vá em <strong>Configurações</strong> &gt; <strong>Integrações</strong>.</li>
                <li>Na aba <strong>Webhooks</strong>, clique em <strong>Configurar Webhook</strong>.</li>
                <li>Cole a URL acima no campo correspondente.</li>
                <li>Marque a opção "Fila de sincronização" para garantir a entrega.</li>
                <li>Selecione os seguintes eventos para monitorar:</li>
            </ol>
            
            <div className="grid grid-cols-2 gap-2 mt-2">
                {events.map(event => (
                    <div key={event} className="flex items-center text-xs text-gray-400 bg-gray-900/50 p-2 rounded border border-gray-700/50">
                        <Check className="w-3 h-3 mr-2 text-emerald-500" />
                        {event}
                    </div>
                ))}
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebhookConfiguration;