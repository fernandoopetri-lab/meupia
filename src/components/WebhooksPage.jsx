import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2 } from 'lucide-react';
import WebhookConfigForm from './WebhookConfigForm';
import WebhookLogs from './WebhookLogs';
import WebhookTestButton from './WebhookTestButton';

const WebhooksPage = () => {
  const [webhook, setWebhook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWebhook();
  }, []);

  const fetchWebhook = async () => {
    try {
      // Use maybeSingle() instead of single() to avoid errors when no row exists
      // Alternatively, use select() and check array length
      const { data, error } = await supabase
        .from('webhooks')
        .select('*')
        .maybeSingle(); 
      
      if (error) {
        console.error('Error fetching webhook:', error);
      }
      
      if (data) {
        setWebhook(data);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (savedWebhook) => {
    setWebhook(savedWebhook);
  };

  return (
    <>
      <Helmet>
        <title>Webhooks | Admin Meu Pila</title>
      </Helmet>
      
      <div className="min-h-screen bg-slate-50 p-6 lg:p-10 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Integração Webhook</h1>
            <p className="text-slate-500 mt-1">
              Configure notificações automáticas para sistemas externos.
            </p>
          </div>
          {webhook && <WebhookTestButton webhook={webhook} />}
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Left Column: Configuration */}
            <div className="lg:col-span-1 space-y-6">
              <WebhookConfigForm webhook={webhook} onSave={handleSave} />
            </div>

            {/* Right Column: Logs */}
            <div className="lg:col-span-2">
              <WebhookLogs webhookId={webhook?.id} />
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default WebhooksPage;