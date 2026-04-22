import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Save, RefreshCw, Check, AlertCircle, Zap, Globe } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

const WebhookConfigForm = ({ webhook, onSave }) => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      url: '',
      token: '',
      is_active: true,
      events: ['user.created']
    }
  });
  
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatingToken, setGeneratingToken] = useState(false);
  const { toast } = useToast();

  const watchedEvents = watch('events');

  useEffect(() => {
    if (webhook) {
      setValue('url', webhook.url);
      setValue('token', webhook.token);
      setValue('is_active', webhook.is_active);
      // Assuming 'event' column is a comma-separated string for now, or just 'user.created'
      const events = webhook.event ? webhook.event.split(',') : ['user.created'];
      setValue('events', events);
    }
  }, [webhook, setValue]);

  const handleGenerateToken = async () => {
    setGeneratingToken(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-webhook-token');
      if (error) throw error;
      if (data?.token) {
        setValue('token', data.token);
        toast({
          title: "Token gerado",
          description: "Novo token de segurança gerado com sucesso.",
        });
      }
    } catch (error) {
      console.error('Error generating token:', error);
      toast({
        title: "Erro",
        description: "Falha ao gerar token.",
        variant: "destructive"
      });
    } finally {
      setGeneratingToken(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Validate URL format
      try {
        const url = new URL(data.url);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          throw new Error('Protocolo inválido');
        }
      } catch (e) {
        throw new Error('URL inválida. Certifique-se de incluir http:// ou https://');
      }

      const eventString = data.events.join(',');
      const payload = {
        url: data.url,
        token: data.token,
        is_active: data.is_active,
        event: eventString,
        user_id: (await supabase.auth.getUser()).data.user.id
      };

      let result;
      if (webhook?.id) {
        result = await supabase
          .from('webhooks')
          .update(payload)
          .eq('id', webhook.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('webhooks')
          .insert(payload)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      toast({
        title: "Configuração salva",
        description: "Webhook atualizado com sucesso.",
      });
      
      if (onSave) onSave(result.data);

    } catch (error) {
      console.error('Error saving webhook:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleEvent = (eventName) => {
    const currentEvents = watchedEvents || [];
    const newEvents = currentEvents.includes(eventName)
      ? currentEvents.filter(e => e !== eventName)
      : [...currentEvents, eventName];
    setValue('events', newEvents);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          Configuração do Webhook
        </h3>
        <div className="flex items-center gap-2">
           <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={watch('is_active')}
              onChange={(e) => setValue('is_active', e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            <span className="ml-3 text-sm font-medium text-slate-700">{watch('is_active') ? 'Ativo' : 'Inativo'}</span>
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
        {/* URL Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">URL de Destino</label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              {...register('url', { required: 'URL é obrigatória' })}
              className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 border-slate-200 text-slate-900 placeholder:text-slate-400"
              placeholder="https://sua-api.com/webhook"
            />
          </div>
          {errors.url && <p className="text-sm text-red-500 mt-1">{errors.url.message}</p>}
          <p className="text-xs text-slate-500">
            Este webhook será acionado sempre que um novo usuário for criado.
          </p>
        </div>

        {/* Token Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Token de Segurança (Secret)</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showToken ? "text" : "password"}
                {...register('token')}
                className="w-full pl-4 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 border-slate-200 text-slate-900 placeholder:text-slate-400"
                placeholder="Token secreto"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              type="button"
              onClick={handleGenerateToken}
              disabled={generatingToken}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {generatingToken ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Gerar
            </button>
          </div>
        </div>

        {/* Events Checkbox List */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">Eventos Gatilho</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: 'user.created', label: 'Novo Usuário Criado', default: true },
              { id: 'user.updated', label: 'Usuário Atualizado', default: false },
              { id: 'subscription.updated', label: 'Assinatura Atualizada', default: false },
              { id: 'payment.confirmed', label: 'Pagamento Confirmado', default: false }
            ].map((evt) => (
              <div 
                key={evt.id}
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                  (watchedEvents || []).includes(evt.id) 
                    ? 'border-emerald-200 bg-emerald-50' 
                    : 'border-slate-200 hover:border-emerald-200'
                }`}
                onClick={() => toggleEvent(evt.id)}
              >
                <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${
                  (watchedEvents || []).includes(evt.id)
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'bg-white border-slate-300'
                }`}>
                  {(watchedEvents || []).includes(evt.id) && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
                <span className={`text-sm ${(watchedEvents || []).includes(evt.id) ? 'text-emerald-900 font-medium' : 'text-slate-600'}`}>
                  {evt.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-6 rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-70"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Configurações
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WebhookConfigForm;