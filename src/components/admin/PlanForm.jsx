import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { logAdminAction } from '@/utils/auditLog';

const PlanForm = ({ isOpen, onClose, planToEdit, onSuccess }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    plan_type: 'personal',
    user_limit: 1,
    status: 'active',
    access_rules: {
      financial_reports: false,
      rural_module: false,
      livestock: false,
      multiple_users: false,
      advanced_support: false
    }
  });

  useEffect(() => {
    if (planToEdit) {
      setFormData({
        name: planToEdit.name,
        description: planToEdit.description || '',
        price: planToEdit.price,
        plan_type: planToEdit.plan_type,
        user_limit: planToEdit.user_limit,
        status: planToEdit.status,
        access_rules: {
          financial_reports: false,
          rural_module: false,
          livestock: false,
          multiple_users: false,
          advanced_support: false,
          ...planToEdit.access_rules
        }
      });
    } else {
      // Reset for new plan
      setFormData({
        name: '',
        description: '',
        price: '',
        plan_type: 'personal',
        user_limit: 1,
        status: 'active',
        access_rules: {
          financial_reports: true,
          rural_module: false,
          livestock: false,
          multiple_users: false,
          advanced_support: false
        }
      });
    }
  }, [planToEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRuleChange = (key, checked) => {
    setFormData(prev => ({
      ...prev,
      access_rules: {
        ...prev.access_rules,
        [key]: checked
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        plan_type: formData.plan_type,
        user_limit: parseInt(formData.user_limit),
        status: formData.status,
        access_rules: formData.access_rules,
        updated_at: new Date().toISOString()
      };

      if (planToEdit) {
        const { error } = await supabase
          .from('plans')
          .update(payload)
          .eq('id', planToEdit.id);

        if (error) throw error;
        
        await logAdminAction(user.id, 'update_plan', null, { 
          plan_id: planToEdit.id, 
          plan_name: formData.name 
        });
        
        toast({ title: "Plano atualizado com sucesso!" });
      } else {
        const { data, error } = await supabase
          .from('plans')
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        
        await logAdminAction(user.id, 'create_plan', null, { 
          plan_id: data.id, 
          plan_name: formData.name 
        });

        toast({ title: "Novo plano criado com sucesso!" });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({ 
        title: "Erro ao salvar plano", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {planToEdit ? 'Editar Plano' : 'Novo Plano'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-900">Nome do Plano</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-900"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="plan_type" className="text-gray-900">Tipo de Sistema</Label>
              <select
                id="plan_type"
                name="plan_type"
                value={formData.plan_type}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-900"
              >
                <option value="personal">Pessoal</option>
                <option value="familiar">Familiar</option>
                <option value="rural">Rural</option>
                <option value="trial">Trial / Teste</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="text-gray-900">Preço (R$)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                required
                className="dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user_limit" className="text-gray-900">Limite de Usuários</Label>
              <Input
                id="user_limit"
                name="user_limit"
                type="number"
                min="1"
                value={formData.user_limit}
                onChange={handleChange}
                required
                className="dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-gray-900">Status</Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-900"
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-900">Descrição</Label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-900"
            />
          </div>

          <div className="space-y-3 pt-2">
            <Label className="text-base text-gray-900">Regras de Acesso e Funcionalidades</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border rounded-lg dark:border-gray-600">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="rule-reports" 
                  checked={formData.access_rules.financial_reports}
                  onCheckedChange={(c) => handleRuleChange('financial_reports', c)}
                />
                <Label htmlFor="rule-reports" className="text-gray-900">Relatórios Financeiros</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="rule-rural" 
                  checked={formData.access_rules.rural_module}
                  onCheckedChange={(c) => handleRuleChange('rural_module', c)}
                />
                <Label htmlFor="rule-rural" className="text-gray-900">Módulo Rural</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="rule-livestock" 
                  checked={formData.access_rules.livestock}
                  onCheckedChange={(c) => handleRuleChange('livestock', c)}
                />
                <Label htmlFor="rule-livestock" className="text-gray-900">Módulo Rebanho</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="rule-users" 
                  checked={formData.access_rules.multiple_users}
                  onCheckedChange={(c) => handleRuleChange('multiple_users', c)}
                />
                <Label htmlFor="rule-users" className="text-gray-900">Múltiplos Usuários</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="rule-support" 
                  checked={formData.access_rules.advanced_support}
                  onCheckedChange={(c) => handleRuleChange('advanced_support', c)}
                />
                <Label htmlFor="rule-support" className="text-gray-900">Suporte Avançado</Label>
              </div>
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading} className="dark:bg-transparent dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Salvar Plano'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default PlanForm;