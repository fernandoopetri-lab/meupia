import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Activity, User, Clock, Loader2, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

const AuditLogs = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('admin_audit_logs')
      .select('id, created_at, action, details, admin_user_id, target_user_id')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      toast({ title: "Erro ao buscar logs", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    
    const userIds = new Set();
    data.forEach(log => {
        if(log.admin_user_id) userIds.add(log.admin_user_id);
        if(log.target_user_id) userIds.add(log.target_user_id);
    });

    if (userIds.size > 0) {
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, name')
            .in('id', Array.from(userIds));

        if (profilesError) {
             toast({ title: "Erro ao buscar nomes dos usuários", description: profilesError.message, variant: "destructive" });
        } else {
            const profileMap = new Map();
            profiles.forEach(p => profileMap.set(p.id, p.name));

            const enrichedLogs = data.map(log => ({
                ...log,
                admin_name: profileMap.get(log.admin_user_id) || 'Admin Desconhecido',
                target_name: profileMap.get(log.target_user_id) || 'Usuário Desconhecido'
            }));
            setLogs(enrichedLogs);
        }
    } else {
        setLogs(data);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const formatAction = (action, details, targetName) => {
    switch (action) {
      case 'block_user': 
        return <>Bloqueou o acesso do usuário <span className="font-bold text-red-400">{targetName}</span>.</>;
      case 'unblock_user': 
        return <>Desbloqueou o acesso do usuário <span className="font-bold text-green-400">{targetName}</span>.</>;
      case 'change_plan': 
        return (
          <>
            Alterou plano de <span className="font-bold text-yellow-400">{targetName}</span>: 
            <span className="ml-1 text-gray-400">{details?.old_plan || 'N/A'}</span>
            <ArrowRight className="inline mx-1 w-3 h-3 text-emerald-500" />
            <span className="text-white">{details?.new_plan}</span>
          </>
        );
      case 'delete_user': 
        return <>Excluiu permanentemente a conta de <span className="font-bold text-red-500">{targetName}</span>.</>;
      case 'extend_trial':
        return <>Estendeu o teste de <span className="font-bold text-blue-400">{targetName}</span> por <span className="text-white">{details?.days_added} dias</span>.</>;
      case 'restart_trial':
        return <>Reiniciou o período de teste de <span className="font-bold text-blue-400">{targetName}</span>.</>;
      case 'toggle_account_status':
        return (
            <>
                Alterou status de <span className="font-bold text-yellow-400">{targetName}</span>:
                <span className="ml-1 text-gray-400">{details?.old_status}</span>
                <ArrowRight className="inline mx-1 w-3 h-3 text-emerald-500" />
                <span className="text-white">{details?.new_status}</span>
            </>
        );
      case 'password_reset':
        return <>Solicitou redefinição de senha para <span className="font-bold text-purple-400">{targetName}</span> ({details?.method === 'link' ? 'via Link' : 'Senha Temp.'}).</>;
      default: 
        return <>{action.replace(/_/g, ' ')} <span className="font-bold text-yellow-400">{targetName}</span>.</>;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Logs de Auditoria</h1>
      
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-white">Atividades Recentes do Sistema</h3>
        </div>
        <div className="space-y-2 p-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex justify-center items-center py-8"><Loader2 className="h-6 w-6 animate-spin text-emerald-400" /> <span className="ml-2 text-gray-400">Carregando logs...</span></div>
          ) : logs.length > 0 ? (
            logs.map((log, index) => (
              <motion.div 
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start space-x-4 p-4 rounded-lg bg-gray-800/40 border border-gray-700/50 hover:bg-gray-800/70 transition-colors"
              >
                <div className="p-3 bg-gray-700/50 rounded-full shrink-0">
                  <Activity className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-medium text-gray-200">
                    <span className="text-emerald-400 font-semibold mr-1">{log.admin_name}</span> 
                    {formatAction(log.action, log.details, log.target_name)}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                    <span className="flex items-center"><User className="w-3 h-3 mr-1" />Admin ID: {log.admin_user_id?.substring(0,8)}...</span>
                    <span className="flex items-center"><Clock className="w-3 h-3 mr-1" />{format(new Date(log.created_at), 'dd/MM/yyyy HH:mm')}</span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-center py-8 text-gray-500">Nenhum log de auditoria encontrado.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;