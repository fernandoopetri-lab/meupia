import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { CheckCircle2, XCircle, Loader2, Wifi, Server } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

const ConnectionStatus = ({ refreshTrigger }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-asaas-settings');
      if (error) throw error;
      setStatus(data);
    } catch (error) {
      console.error('Error fetching status:', error);
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
        </CardContent>
      </Card>
    );
  }

  const isConnected = status?.is_connected;

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
          <Wifi className="w-5 h-5" />
          Status da Conexão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-900/50 border border-gray-700">
          <div className="flex items-center gap-3">
            {isConnected ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            ) : (
              <XCircle className="w-8 h-8 text-red-500" />
            )}
            <div>
              <p className="font-medium text-white">
                {isConnected ? 'Conectado ao ASAAS' : 'Desconectado'}
              </p>
              <p className="text-sm text-gray-400">
                {isConnected 
                  ? 'A integração está ativa e operando.' 
                  : 'Configure suas credenciais para ativar.'}
              </p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
            isConnected 
              ? 'bg-emerald-900/20 text-emerald-400 border-emerald-800' 
              : 'bg-red-900/20 text-red-400 border-red-800'
          }`}>
            {isConnected ? 'ATIVO' : 'INATIVO'}
          </div>
        </div>

        {isConnected && (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-gray-700/30 border border-gray-700">
              <span className="text-xs text-gray-400 flex items-center gap-1 mb-1">
                <Server className="w-3 h-3" /> Ambiente
              </span>
              <p className="text-sm font-medium text-white capitalize">
                {status.environment}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-gray-700/30 border border-gray-700">
              <span className="text-xs text-gray-400 mb-1 block">
                Última Validação
              </span>
              <p className="text-sm font-medium text-white">
                {status.last_validation ? format(new Date(status.last_validation), 'dd/MM/yyyy HH:mm') : '-'}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConnectionStatus;