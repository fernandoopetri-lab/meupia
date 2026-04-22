import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { logAdminAction } from '@/utils/auditLog';

const SystemSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [activePlans, setActivePlans] = useState([]);
  const [settings, setSettings] = useState({
    default_plan_id: '',
    trial_duration_days: '14'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch active plans for dropdown
      const { data: plansData, error: plansError } = await supabase
        .from('plans')
        .select('id, name')
        .eq('status', 'active');
        
      if (plansError) throw plansError;
      setActivePlans(plansData || []);

      // Fetch current settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('system_settings')
        .select('*');

      if (settingsError) throw settingsError;

      const newSettings = { ...settings };
      settingsData.forEach(item => {
        if (newSettings.hasOwnProperty(item.key)) {
          newSettings[item.key] = item.value;
        }
      });
      setSettings(newSettings);

    } catch (error) {
      console.error('Error fetching system settings:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar configurações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value: String(value),
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('system_settings')
        .upsert(updates, { onConflict: 'key' });

      if (error) throw error;

      await logAdminAction(user.id, 'update_system_settings', null, { settings });

      toast({ title: "Configurações salvas com sucesso!" });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar configurações.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Configurações Globais</h2>
        <p className="text-gray-400 text-sm">Ajustes gerais do sistema e comportamento padrão.</p>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="default_plan_id" className="text-gray-200">Plano Padrão de Cadastro</Label>
            <select
              id="default_plan_id"
              name="default_plan_id"
              value={settings.default_plan_id}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Selecione um plano...</option>
              {activePlans.map(plan => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">
              Este plano será atribuído automaticamente a novos usuários que não selecionarem uma opção específica durante o cadastro.
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="trial_duration_days" className="text-gray-200">Duração do Período de Teste (Dias)</Label>
            <Input
              id="trial_duration_days"
              name="trial_duration_days"
              type="number"
              min="1"
              value={settings.trial_duration_days}
              onChange={handleChange}
              className="bg-gray-700 border-gray-600 text-white"
            />
            <p className="text-xs text-gray-500">
              Define quantos dias de acesso gratuito novos usuários recebem ao se cadastrar.
            </p>
          </div>

          <div className="pt-4 flex justify-end">
            <Button 
              type="submit" 
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>
              ) : (
                <><Save className="w-4 h-4 mr-2" /> Salvar Alterações</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SystemSettings;