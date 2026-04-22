import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!isOnline) return;

    let intervalId;
    const checkConnection = async () => {
      setIsChecking(true);
      try {
        // Simple lightweight query to check connection
        const { error } = await supabase.from('profiles').select('id').limit(1);
        if (error && (error.message.includes('fetch') || error.code === '503')) {
          setIsSupabaseConnected(false);
        } else {
          setIsSupabaseConnected(true);
        }
      } catch (err) {
        setIsSupabaseConnected(false);
      } finally {
        setIsChecking(false);
      }
    };

    if (!isSupabaseConnected) {
      intervalId = setInterval(checkConnection, 5000);
    } else {
      intervalId = setInterval(checkConnection, 30000); // Check less frequently when connected
    }

    return () => clearInterval(intervalId);
  }, [isOnline, isSupabaseConnected]);

  const showBanner = !isOnline || !isSupabaseConnected;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-center p-2 text-sm font-medium text-white shadow-md ${
            !isOnline ? 'bg-red-500' : 'bg-orange-500'
          }`}
        >
          {!isOnline ? (
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4" />
              <span>Você está offline. Verifique sua conexão com a internet.</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {isChecking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <WifiOff className="w-4 h-4" />
              )}
              <span>
                Conexão instável com o servidor. Tentando reconectar...
              </span>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NetworkStatus;