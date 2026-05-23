import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, DollarSign, Calendar, Wallet, Tag, Repeat, Check, X, Crown, Loader2 } from 'lucide-react';
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
      <div className="card-modern py-20 text-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-amber-500/5 pointer-events-none" />
        <div className="relative z-10">
          <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-yellow-100 shadow-sm transition-transform group-hover:scale-110">
            <Crown className="w-10 h-10 text-yellow-600" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-2">Acesso Administrativo Premium</h3>
          <p className="text-slate-500 max-w-sm mx-auto font-medium">Este usuário possui acesso vitalício e ilimitado a todas as funcionalidades do Meu Pila.</p>
        </div>
      </div>
    );
  }

  const expenseCategories = categories.filter(c => c.type === 'expense' && c.status === 'active');

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="heading-premium">Gestão de Planos</h3>
          <p className="subheading-premium">Controle seus custos fixos e assinaturas recorrentes.</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="btn-premium">
          <Plus className="w-4 h-4 mr-2" /> Novo Plano
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="card-modern relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-lime-500/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-slate-800">{editingSubscription ? 'Editar' : 'Novo'} Plano</h3>
                <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-6 h-6"/></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nome da Assinatura / Plano</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Netflix, Internet, Aluguel" className="input-modern" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Valor do Pagamento</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData(p => ({ ...p, amount: e.target.value }))} placeholder="0,00" className="input-modern pl-12" required />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Próximo Vencimento</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input type="date" value={formData.start_date} onChange={(e) => setFormData(p => ({ ...p, start_date: e.target.value }))} className="input-modern pl-12" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Frequência</label>
                    <div className="relative">
                      <Repeat className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <select value={formData.recurrence} onChange={(e) => setFormData(p => ({ ...p, recurrence: e.target.value }))} className="input-modern pl-12 appearance-none bg-white" required>
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensal</option>
                        <option value="annually">Anual</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Origem do Dinheiro</label>
                    <div className="relative">
                      <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <select value={formData.wallet_id} onChange={(e) => setFormData(p => ({ ...p, wallet_id: e.target.value }))} className="input-modern pl-12 appearance-none bg-white" required>
                        <option value="">Selecione uma carteira...</option>
                        {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Categoria de Gasto</label>
                    <div className="relative">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <select value={formData.category_id} onChange={(e) => setFormData(p => ({ ...p, category_id: e.target.value }))} className="input-modern pl-12 appearance-none bg-white" required>
                        <option value="">Selecione uma categoria...</option>
                        {expenseCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="btn-premium flex-1 py-7">
                    <Check className="w-5 h-5 mr-2" />
                    {editingSubscription ? 'Salvar Alterações' : 'Confirmar Plano'}
                  </Button>
                  <Button type="button" variant="ghost" onClick={resetForm} className="px-8 rounded-2xl font-bold text-slate-500">Cancelar</Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-lime-500 mb-4" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Carregando planos...</p>
          </div>
        ) : subscriptions.length > 0 ? (
          subscriptions.map((sub, index) => (
            <motion.div 
              key={sub.id} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: index * 0.05 }} 
              className="card-modern !p-5 group hover:bg-slate-50/80 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center space-x-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm transition-transform group-hover:scale-110 ${
                    sub.status === 'active' 
                      ? 'bg-lime-50 border-lime-100' 
                      : 'bg-slate-50 border-slate-100'
                  }`}>
                    <Repeat className={`w-7 h-7 ${sub.status === 'active' ? 'text-lime-600' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">{sub.name}</h4>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                      <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <Wallet className="w-3 h-3 mr-1.5 text-slate-300" />
                        {sub.wallets?.name || 'N/D'}
                      </div>
                      <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <Calendar className="w-3 h-3 mr-1.5 text-slate-300" />
                        Vence: {new Date(sub.next_billing_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex items-center text-[10px] font-black text-lime-600 uppercase tracking-widest bg-lime-50 px-2 py-0.5 rounded-md">
                        {sub.recurrence === 'monthly' ? 'Mensal' : sub.recurrence === 'weekly' ? 'Semanal' : 'Anual'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Custo</p>
                    <p className="text-2xl font-black text-red-500 tracking-tight">
                      <span className="text-sm font-bold opacity-60 mr-1">R$</span>
                      {parseFloat(sub.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleStatus(sub)} 
                      className={`p-3 rounded-xl transition-all shadow-sm ${
                        sub.status === 'active' 
                          ? 'bg-lime-50 text-lime-600 hover:bg-lime-100' 
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                      title={sub.status === 'active' ? 'Pausar' : 'Ativar'}
                    >
                      {sub.status === 'active' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                    </button>
                    
                    <div className="flex gap-1">
                      <button onClick={() => handleEditClick(sub)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit2 className="w-5 h-5" /></button>
                      <button onClick={() => handleDelete(sub.id)} className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-modern py-20 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Repeat className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Nenhum plano ativo</h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">Organize seus gastos recorrentes (Streaming, Internet, Aluguel) em um só lugar para nunca mais perder o controle.</p>
            <Button onClick={() => setShowForm(true)} className="btn-premium px-10">
              <Plus className="w-5 h-5 mr-2" /> Adicionar Meu Primeiro Plano
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionManager;