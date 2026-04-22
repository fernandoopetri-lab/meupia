import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, DollarSign, Calendar, Wallet, Tag, Repeat, Check, X, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const SubscriptionManager = ({ user, profile, wallets, categories, onDataChange }) => {
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  const defaultFormState = {
    name: '',
    amount: '',
    start_date: new Date().toISOString().split('T')[0],
    recurrence: 'monthly',
    wallet_id: '',
    category_id: '',
  };
  const [formData, setFormData] = useState(defaultFormState);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, wallets(name), categories(name)')
      .eq('user_id', user.id)
      .order('next_billing_date', { ascending: true });

    if (error) {
      toast({ title: "Erro ao buscar assinaturas", description: error.message, variant: "destructive" });
    } else {
      setSubscriptions(data);
    }
    setLoading(false);
  }, [user.id, toast]);

  useEffect(() => {
    if (!profile?.is_admin) {
        fetchSubscriptions();
        const subscriptionCategory = categories.find(c => c.name === 'Assinaturas' && c.type === 'expense');
        if (subscriptionCategory) {
          setFormData(prev => ({ ...prev, category_id: subscriptionCategory.id }));
        }
    } else {
        setLoading(false);
    }
  }, [fetchSubscriptions, categories, profile?.is_admin]);

  const resetForm = () => {
    const subscriptionCategory = categories.find(c => c.name === 'Assinaturas' && c.type === 'expense');
    setFormData({ ...defaultFormState, category_id: subscriptionCategory ? subscriptionCategory.id : '' });
    setShowForm(false);
    setEditingSubscription(null);
  };

  const handleEditClick = (subscription) => {
    setEditingSubscription(subscription);
    setFormData({
      name: subscription.name,
      amount: subscription.amount,
      start_date: subscription.next_billing_date, // We use next_billing_date as the reference start date for editing
      recurrence: subscription.recurrence,
      wallet_id: subscription.wallet_id,
      category_id: subscription.category_id,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.amount || !formData.start_date || !formData.wallet_id || !formData.category_id) {
      toast({ title: "Erro", description: "Por favor, preencha todos os campos.", variant: "destructive" });
      return;
    }

    const subscriptionData = {
      user_id: user.id,
      name: formData.name,
      amount: parseFloat(formData.amount),
      wallet_id: formData.wallet_id,
      category_id: formData.category_id,
      recurrence: formData.recurrence,
      next_billing_date: formData.start_date,
    };

    let error;
    if (editingSubscription) {
      const { error: updateError } = await supabase.from('subscriptions').update(subscriptionData).eq('id', editingSubscription.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('subscriptions').insert({ ...subscriptionData, status: 'active' });
      error = insertError;
    }

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso!", description: `Assinatura ${editingSubscription ? 'atualizada' : 'criada'} com sucesso.` });
      await fetchSubscriptions();
      if (onDataChange) await onDataChange();
      resetForm();
    }
  };

  const handleDelete = async (subscriptionId) => {
    const { error } = await supabase.from('subscriptions').delete().eq('id', subscriptionId);
    if (error) {
      toast({ title: "Erro ao deletar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso!", description: "Assinatura deletada." });
      fetchSubscriptions();
    }
  };

  const toggleStatus = async (subscription) => {
    const newStatus = subscription.status === 'active' ? 'inactive' : 'active';
    const { error } = await supabase.from('subscriptions').update({ status: newStatus }).eq('id', subscription.id);
    if (error) {
      toast({ title: "Erro", description: "Não foi possível alterar o status.", variant: "destructive" });
    } else {
      toast({ title: "Sucesso!", description: `Assinatura ${newStatus === 'active' ? 'ativada' : 'desativada'}.` });
      fetchSubscriptions();
    }
  };

  if (profile?.is_admin) {
    return (
      <div className="chart-container text-center">
        <Crown className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
        <h3 className="text-xl font-bold text-slate-800">Acesso Administrativo</h3>
        <p className="text-slate-600 mt-2">Este usuário possui acesso administrativo vitalício. Nenhum plano é necessário.</p>
      </div>
    );
  }

  const expenseCategories = categories.filter(c => c.type === 'expense' && c.status === 'active');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-800">Gerenciar Plano</h3>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary"><Plus className="w-5 h-5 mr-2" /> Novo Plano</Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="chart-container">
            <h3 className="text-xl font-semibold text-slate-700 mb-4">{editingSubscription ? 'Editar' : 'Novo'} Plano</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nome</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Netflix" className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Valor</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData(p => ({ ...p, amount: e.target.value }))} placeholder="0,00" className="input-field pl-10" required />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Data de Início/Próxima Cobrança</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="date" value={formData.start_date} onChange={(e) => setFormData(p => ({ ...p, start_date: e.target.value }))} className="input-field pl-10" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Recorrência</label>
                  <div className="relative">
                    <Repeat className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <select value={formData.recurrence} onChange={(e) => setFormData(p => ({ ...p, recurrence: e.target.value }))} className="input-field pl-10" required>
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensal</option>
                      <option value="annually">Anual</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Forma de Pagamento</label>
                  <div className="relative">
                    <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <select value={formData.wallet_id} onChange={(e) => setFormData(p => ({ ...p, wallet_id: e.target.value }))} className="input-field pl-10" required>
                      <option value="">Selecione a carteira</option>
                      {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Categoria</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <select value={formData.category_id} onChange={(e) => setFormData(p => ({ ...p, category_id: e.target.value }))} className="input-field pl-10" required>
                      <option value="">Selecione a categoria</option>
                      {expenseCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button type="submit" className="btn-primary">{editingSubscription ? 'Atualizar' : 'Criar'}</Button>
                <Button type="button" onClick={resetForm} className="px-6 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all">Cancelar</Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {loading ? (
          <p>Carregando planos...</p>
        ) : subscriptions.length > 0 ? (
          subscriptions.map((sub, index) => (
            <motion.div key={sub.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="expense-item group">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${sub.status === 'active' ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                    <Repeat className={`w-6 h-6 ${sub.status === 'active' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-700">{sub.name}</h4>
                    <div className="flex items-center flex-wrap gap-x-2 text-sm text-slate-500">
                      <span>{sub.wallets?.name || 'Carteira deletada'}</span>
                      <span>•</span>
                      <span>Próx: {new Date(sub.next_billing_date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                       <span>•</span>
                      <span className="capitalize">{sub.recurrence === 'monthly' ? 'Mensal' : sub.recurrence === 'weekly' ? 'Semanal' : 'Anual'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <p className="text-lg font-bold text-red-500">R$ {parseFloat(sub.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <button onClick={() => toggleStatus(sub)} className={`p-2 rounded-full transition-colors ${sub.status === 'active' ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`}>
                    {sub.status === 'active' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                  </button>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex">
                    <button onClick={() => handleEditClick(sub)} className="p-2 text-slate-400 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(sub.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12 text-slate-500 chart-container">
            <Repeat className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold">Nenhum plano encontrado.</h3>
            <p>Adicione seu primeiro plano para começar.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionManager;