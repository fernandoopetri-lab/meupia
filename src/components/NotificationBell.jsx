import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertTriangle, CheckCircle, Info, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { fetchWithRetry } from '@/utils/supabaseQueryHelper';
import { handleSupabaseError } from '@/utils/errorHandler';

const NotificationBell = ({ user, onNotificationClick }) => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    
    const { data, error } = await fetchWithRetry(
      () => supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20),
      { context: { functionName: 'fetchNotifications', table: 'notifications' } }
    );

    if (error) {
      handleSupabaseError(error, { functionName: 'fetchNotifications' }, true);
    } else if (data) {
      setNotifications(data);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchNotifications();

    if (!user) return;

    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          setNotifications(prev => [payload.new, ...prev]);
          toast({
            title: payload.new.title,
            description: payload.new.message,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchNotifications, toast]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = async (id) => {
    const { error } = await fetchWithRetry(
      () => supabase.from('notifications').update({ is_read: true }).eq('id', id),
      { maxRetries: 2, context: { functionName: 'handleMarkAsRead' } }
    );

    if (!error) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;

    const { error } = await fetchWithRetry(
      () => supabase.from('notifications').update({ is_read: true }).in('id', unreadIds),
      { maxRetries: 2, context: { functionName: 'handleMarkAllAsRead' } }
    );

    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    }
  };

  const handleNotificationItemClick = (notification) => {
    handleMarkAsRead(notification.id);
    if (notification.related_url) {
      onNotificationClick(notification.related_url);
    }
    setIsOpen(false);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 rounded-full hover:bg-slate-100 transition-colors">
        <Bell className="w-6 h-6 text-slate-600" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount}
          </motion.div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-50"
          >
            <div className="p-3 flex justify-between items-center border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Notificações</h3>
              {unreadCount > 0 && (
                <Button variant="link" size="sm" onClick={handleMarkAllAsRead} className="text-sm">
                  Marcar todas como lidas
                </Button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-8 text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin mb-2 text-lime-500" />
                  <p className="text-sm">Carregando...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center p-8 text-slate-500">
                  <Bell className="w-8 h-8 mx-auto mb-2" />
                  Nenhuma notificação por aqui.
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationItemClick(n)}
                    className={`p-3 flex items-start gap-3 border-b border-slate-100 cursor-pointer hover:bg-slate-50 ${!n.is_read ? 'bg-emerald-50' : ''}`}
                  >
                    <div className="mt-1">{getIcon(n.type)}</div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-slate-800">{n.title}</p>
                      <p className="text-xs text-slate-600">{n.message}</p>
                      <p className="text-xs text-slate-400 mt-1">{new Date(n.created_at).toLocaleString('pt-BR')}</p>
                    </div>
                    {!n.is_read && (
                      <button onClick={(e) => { e.stopPropagation(); handleMarkAsRead(n.id); }} title="Marcar como lida" className="p-1">
                        <Check className="w-4 h-4 text-slate-400 hover:text-emerald-500" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;