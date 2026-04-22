import React, { useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save, PlugZap, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { logAdminAction } from '@/utils/auditLog';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const AsaasCredentials = ({ onUpdate }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    api_key: '',
    environment: 'sandbox'
  });
  
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTestConnection = async () => {
    if (!formData.api_key) {
      toast({ title: "Erro", description: "Informe a API Key para testar.", variant: "destructive" });
      return;
    }
    
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-asaas-connection', {
        body: formData
      });

      if (error) throw error;

      if (data.success) {
        toast({ title: "Sucesso", description: data.message });
      } else {
        toast({ title: "Falha na conexão", description: data.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Erro", description: error.message || "Erro ao testar conexão", variant: "destructive" });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.api_key) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('save-asaas-settings', {
        body: formData
      });

      if (error) throw error;

      if (data.success) {
        toast({ title: "Configurações salvas!", description: "A integração foi atualizada com sucesso." });
        setFormData(prev => ({ ...prev, api_key: '' })); // Clear key for security
        
        await logAdminAction(user.id, 'update_payment_settings', null, { 
            environment: formData.environment,
            provider: 'asaas'
        });
        
        if (onUpdate) onUpdate();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({ 
        title: "Erro ao salvar", 
        description: error.message || "Falha ao salvar configurações.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
            <PlugZap className="w-5 h-5 text-yellow-400" />
            Credenciais de API
        </CardTitle>
        <CardDescription className="text-gray-400">
          Configure as chaves de acesso para comunicação com o ASAAS.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-gray-200">Ambiente</Label>
            <select
              name="environment"
              value={formData.environment}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="sandbox">Sandbox (Testes)</option>
              <option value="production">Produção (Real)</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-200">API Key</Label>
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                name="api_key"
                value={formData.api_key}
                onChange={handleChange}
                placeholder="Ex: $aact_..."
                className="bg-gray-700 border-gray-600 text-white pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Sua chave será armazenada de forma segura e não será exibida novamente.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleTestConnection}
              disabled={testing || !formData.api_key}
              className="flex-1 border-gray-600 text-gray-200 hover:bg-gray-700 hover:text-white"
            >
              {testing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Testar Conexão'}
            </Button>
            
            <Button 
              type="submit" 
              disabled={loading || !formData.api_key}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Salvar</>}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AsaasCredentials;