import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2, AlertCircle, CheckCircle, Clock, Eye, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const WebhookLogs = ({ webhookId }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const pageSize = 10;

  useEffect(() => {
    if (webhookId) {
      fetchLogs();
    } else {
      setLoading(false);
      setLogs([]); // Ensure logs are reset if no webhookId
    }
  }, [webhookId, page]);

  const fetchLogs = async () => {
    if (!webhookId) return;
    
    try {
      setLoading(true);
      const { data, error, count } = await supabase
        .from('webhook_logs')
        .select('*', { count: 'exact' })
        .eq('webhook_id', webhookId)
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) {
        // Handle specific error case where resource might not be found gracefully
        console.error('Error fetching logs:', error);
        if (page === 0) setLogs([]);
        return;
      }

      if (page === 0) {
        setLogs(data || []);
      } else {
        setLogs(prev => [...prev, ...(data || [])]);
      }

      setHasMore((data || []).length === pageSize);
    } catch (error) {
      console.error('Unexpected error fetching logs:', error);
      if (page === 0) setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  if (!webhookId) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden h-full flex items-center justify-center p-12">
        <div className="text-center text-slate-500">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>Nenhum webhook configurado.</p>
          <p className="text-sm">Configure e salve um webhook para ver os logs de disparo.</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    if (status >= 200 && status < 300) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
          <CheckCircle className="w-3 h-3" /> Sucesso
        </span>
      );
    }
    if (status === 0) {
       return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          <Clock className="w-3 h-3" /> Timeout/Rede
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <AlertCircle className="w-3 h-3" /> Erro
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-lg font-bold text-slate-800">Histórico de Disparos</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-3">Data/Hora</th>
              <th className="px-6 py-3">Evento</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Cód. HTTP</th>
              <th className="px-6 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                    {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <code className="bg-slate-100 px-2 py-1 rounded text-xs">{log.event}</code>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(log.response_status)}
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-mono">
                    {log.response_status || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button 
                          className="text-emerald-600 hover:text-emerald-800 font-medium text-xs inline-flex items-center gap-1"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="w-3 h-3" /> Detalhes
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Detalhes do Webhook</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-2">
                           <div>
                             <h4 className="text-sm font-medium text-slate-700 mb-1">Payload Enviado</h4>
                             <pre className="bg-slate-900 text-slate-50 p-3 rounded-md text-xs overflow-auto max-h-40">
                                {JSON.stringify(log.payload, null, 2)}
                             </pre>
                           </div>
                           
                           {log.error_message && (
                             <div>
                               <h4 className="text-sm font-medium text-red-700 mb-1">Erro Retornado</h4>
                               <div className="bg-red-50 text-red-800 p-3 rounded-md text-xs border border-red-200">
                                 {log.error_message}
                               </div>
                             </div>
                           )}
                           
                           <div className="grid grid-cols-2 gap-4 text-sm">
                             <div>
                               <span className="text-slate-500">ID do Log:</span>
                               <p className="font-mono text-xs">{log.id}</p>
                             </div>
                             <div>
                               <span className="text-slate-500">Data:</span>
                               <p>{format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss")}</p>
                             </div>
                           </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                  {loading ? (
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Carregando...
                    </div>
                  ) : (
                    'Nenhum registro encontrado.'
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="p-4 border-t border-slate-100 text-center">
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={loading}
            className="text-emerald-600 hover:text-emerald-800 font-medium text-sm disabled:opacity-50"
          >
            {loading ? 'Carregando...' : 'Carregar mais'}
          </button>
        </div>
      )}
    </div>
  );
};

export default WebhookLogs;