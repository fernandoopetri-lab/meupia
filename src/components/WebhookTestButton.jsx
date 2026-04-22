import React, { useState } from 'react';
import { Send, CheckCircle2, XCircle, Copy, Loader2, Play } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const WebhookTestButton = ({ webhook }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleTest = async () => {
    if (!webhook || !webhook.url) {
      toast({
        title: "Webhook não configurado",
        description: "Configure e salve o webhook antes de testar.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setResult(null);
    setOpen(true);

    try {
      // Simulate user data
      const mockUserData = {
        id: "00000000-0000-0000-0000-000000000000",
        email: "teste@exemplo.com",
        name: "Usuário de Teste",
        account_type: "pessoal",
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase.functions.invoke('trigger-webhook', {
        body: {
          event_type: 'user.created.test',
          user_data: mockUserData,
          webhook_config: webhook
        }
      });

      if (error) throw error;
      setResult(data);

    } catch (error) {
      setResult({
        success: false,
        error: error.message || "Erro desconhecido ao testar webhook"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "Resposta copiada para a área de transferência."
    });
  };

  return (
    <>
      <button
        onClick={handleTest}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-medium text-sm transition-colors border border-indigo-200"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
        Testar Envio
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Teste de Webhook</DialogTitle>
            <DialogDescription>
              Enviando payload de teste para {webhook?.url}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-3">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                <p className="text-sm text-slate-500">Aguardando resposta do servidor...</p>
              </div>
            ) : result ? (
              <div className={`rounded-lg border p-4 ${result.success ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center gap-3 mb-3">
                  {result.success ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                  <div>
                    <h4 className={`font-semibold ${result.success ? 'text-emerald-800' : 'text-red-800'}`}>
                      {result.success ? 'Sucesso!' : 'Falha no envio'}
                    </h4>
                    <p className="text-xs text-slate-600">
                      Status HTTP: {result.status || 'N/A'}
                    </p>
                  </div>
                </div>

                {result.error && (
                   <div className="mt-2 text-sm text-red-700 bg-red-100 p-2 rounded">
                     <strong>Erro:</strong> {result.error}
                   </div>
                )}
                
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-slate-500">Resposta JSON</span>
                    <button 
                      onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}
                      className="text-xs flex items-center gap-1 text-slate-500 hover:text-slate-800"
                    >
                      <Copy className="w-3 h-3" /> Copiar
                    </button>
                  </div>
                  <pre className="bg-slate-900 text-slate-50 p-3 rounded-md text-xs overflow-auto max-h-40">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WebhookTestButton;