import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, TrendingUp, Briefcase, Wallet as Bank, Calendar, Percent, DollarSign, ChevronsRight, Download, FileText, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const InvestmentManager = ({ user, wallets = [], categories = [], onDataChange }) => {
  const { toast } = useToast();
  const [investments, setInvestments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showRedeemForm, setShowRedeemForm] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState(null);

  const defaultFormState = {
    investment_type: 'CDB',
    institution: '',
    initial_amount: '',
    application_date: new Date().toISOString().split('T')[0],
    yield_rate: '',
    yield_period: 'yearly',
    due_date: '',
    origin_wallet_id: '',
  };
  const [formData, setFormData] = useState(defaultFormState);

  const [redeemFormData, setRedeemFormData] = useState({
    amount: '',
    destination_wallet_id: '',
    date: new Date().toISOString().split('T')[0],
  });

  const investmentTypes = ['CDB', 'Tesouro Direto', 'Poupança', 'Fundos', 'Renda Variável', 'Outros'];

  const fetchData = useCallback(async () => {
    if (!user?.id) {
        setLoading(false);
        return;
    }
    setLoading(true);
    const [investmentsRes, transactionsRes] = await Promise.all([
      supabase.from('investments').select('*').eq('user_id', user.id).order('application_date', { ascending: false }),
      supabase.from('investment_transactions').select('*').eq('user_id', user.id)
    ]);

    if (investmentsRes.error) {
        toast({ title: "Erro", description: "Não foi possível carregar os investimentos.", variant: "destructive" });
        setInvestments([]);
    } else {
        setInvestments(Array.isArray(investmentsRes.data) ? investmentsRes.data : []);
    }

    if (transactionsRes.error) {
        toast({ title: "Erro", description: "Não foi possível carregar o histórico de investimentos.", variant: "destructive" });
        setTransactions([]);
    } else {
        setTransactions(Array.isArray(transactionsRes.data) ? transactionsRes.data : []);
    }

    setLoading(false);
  }, [user?.id, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const calculateCurrentValue = useCallback((investment) => {
    if (!investment) return 0;
    
    const { initial_amount, application_date, yield_rate, yield_period, current_balance } = investment;
    
    if (!initial_amount || !application_date || !yield_rate) {
      return current_balance || 0;
    }

    const now = new Date();
    const startDate = new Date(application_date);
    const diffTime = Math.abs(now - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let periods;
    if (yield_period === 'yearly') {
      periods = diffDays / 365.25;
    } else { // monthly
      periods = diffDays / 30.44;
    }

    const rate = parseFloat(yield_rate) / 100;
    const currentValue = parseFloat(initial_amount) * Math.pow((1 + rate), periods);
    
    return current_balance || currentValue;
  }, []);

  const investmentWithDetails = useMemo(() => {
    if (!Array.isArray(investments)) return [];
    
    return investments.map(inv => {
      const invTransactions = Array.isArray(transactions) 
        ? transactions.filter(t => t && t.investment_id === inv.id) 
        : [];
      
      const redemptions = invTransactions
        .filter(t => t && t.transaction_type === 'redemption')
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
      
      const currentValue = calculateCurrentValue(inv);
      const initialAmount = parseFloat(inv.initial_amount) || 0;
      const profit = currentValue - initialAmount + redemptions;
      
      return { ...inv, currentValue, profit, transactions: invTransactions };
    });
  }, [investments, transactions, calculateCurrentValue]);

  const resetForms = () => {
    setFormData(defaultFormState);
    setRedeemFormData({ amount: '', destination_wallet_id: '', date: new Date().toISOString().split('T')[0] });
    setShowForm(false);
    setShowRedeemForm(false);
    setSelectedInvestment(null);
  };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    const { initial_amount, origin_wallet_id } = formData;
    if (!initial_amount || !origin_wallet_id || !formData.institution || !formData.yield_rate) {
      toast({ title: "Erro", description: "Preencha todos os campos obrigatórios.", variant: "destructive" });
      return;
    }

    const amount = parseFloat(initial_amount);
    const originWallet = Array.isArray(wallets) 
      ? wallets.find(w => w && w.id === parseInt(origin_wallet_id)) 
      : null;

    if (!originWallet || parseFloat(originWallet.balance) < amount) {
      toast({ title: "Erro", description: "Saldo insuficiente na conta de origem.", variant: "destructive" });
      return;
    }

    const investmentData = {
      user_id: user.id,
      investment_type: formData.investment_type,
      institution: formData.institution,
      initial_amount: amount,
      current_balance: amount,
      application_date: formData.application_date,
      yield_rate: parseFloat(formData.yield_rate),
      yield_period: formData.yield_period,
      due_date: formData.due_date || null,
      origin_wallet_id: parseInt(origin_wallet_id),
      status: 'active',
    };

    const { data: newInvestment, error: invError } = await supabase.from('investments').insert(investmentData).select().single();
    if (invError) {
      toast({ title: "Erro", description: `Falha ao criar investimento: ${invError.message}`, variant: "destructive" });
      return;
    }

    const investmentTransactionData = {
      user_id: user.id,
      investment_id: newInvestment.id,
      transaction_type: 'application',
      amount: amount,
      transaction_date: formData.application_date,
      related_wallet_id: parseInt(origin_wallet_id),
    };
    
    const transferCategory = Array.isArray(categories) 
      ? categories.find(c => c && c.name === 'Transferência' && c.type === 'transfer') 
      : null;
    
    if (!transferCategory) {
        toast({ title: "Erro", description: "Categoria 'Transferência' não encontrada. Por favor, crie-a.", variant: "destructive" });
        await supabase.from('investments').delete().eq('id', newInvestment.id);
        return;
    }

    const transferTransactionData = {
      user_id: user.id,
      type: 'transfer',
      amount: amount,
      description: `Aplicação em ${formData.investment_type} - ${formData.institution}`,
      category_id: transferCategory.id,
      date: formData.application_date,
      source_wallet_id: parseInt(origin_wallet_id),
      destination_wallet_id: null,
    };

    const { error: transactionError } = await supabase.from('transactions').insert(transferTransactionData);
    if (transactionError) {
        toast({ title: "Erro", description: `Falha ao criar transação de transferência: ${transactionError.message}`, variant: "destructive" });
        await supabase.from('investments').delete().eq('id', newInvestment.id);
        return;
    }

    const { error: invTransactionError } = await supabase.from('investment_transactions').insert(investmentTransactionData);
    if (invTransactionError) {
        toast({ title: "Erro", description: `Falha ao registrar transação de investimento: ${invTransactionError.message}`, variant: "destructive" });
        await supabase.from('investments').delete().eq('id', newInvestment.id);
        await supabase.from('transactions').delete().match({ description: transferTransactionData.description, amount: transferTransactionData.amount, date: transferTransactionData.date });
        return;
    }

    const { error: walletUpdateError } = await supabase.from('wallets').update({ balance: parseFloat(originWallet.balance) - amount }).eq('id', originWallet.id);

    if (walletUpdateError) {
      toast({ title: "Erro Crítico", description: "Falha ao atualizar saldo da carteira. Contate o suporte.", variant: "destructive" });
    } else {
      toast({ title: "Sucesso!", description: "Investimento aplicado com sucesso." });
      resetForms();
      fetchData();
      if (onDataChange) onDataChange();
    }
  };

  const handleRedemptionSubmit = async (e) => {
    e.preventDefault();
    const { amount, destination_wallet_id, date } = redeemFormData;
    if (!amount || !destination_wallet_id) {
      toast({ title: "Erro", description: "Preencha todos os campos.", variant: "destructive" });
      return;
    }

    if (!selectedInvestment) {
      toast({ title: "Erro", description: "Investimento não selecionado.", variant: "destructive" });
      return;
    }

    const redeemAmount = parseFloat(amount);
    const currentBalance = parseFloat(selectedInvestment.current_balance) || 0;
    
    if (redeemAmount > currentBalance) {
      toast({ title: "Erro", description: "Valor de resgate excede o saldo atual do investimento.", variant: "destructive" });
      return;
    }

    const newBalance = currentBalance - redeemAmount;
    const newStatus = newBalance <= 0.01 ? 'redeemed' : 'active';

    const { error: updateError } = await supabase.from('investments').update({ current_balance: newBalance, status: newStatus }).eq('id', selectedInvestment.id);
    if (updateError) {
      toast({ title: "Erro", description: `Falha ao atualizar investimento: ${updateError.message}`, variant: "destructive" });
      return;
    }

    const transactionData = {
      user_id: user.id,
      investment_id: selectedInvestment.id,
      transaction_type: 'redemption',
      amount: redeemAmount,
      transaction_date: date,
      related_wallet_id: parseInt(destination_wallet_id),
    };

    const investmentCategory = Array.isArray(categories) 
      ? categories.find(c => c && c.name === 'Investimentos' && c.type === 'income') 
      : null;
    
    if (!investmentCategory) {
        toast({ title: "Erro", description: "Categoria 'Investimentos' para receitas não encontrada. Por favor, crie-a.", variant: "destructive" });
        await supabase.from('investments').update({ current_balance: selectedInvestment.current_balance, status: selectedInvestment.status }).eq('id', selectedInvestment.id);
        return;
    }

    const incomeTransactionData = {
      user_id: user.id,
      wallet_id: parseInt(destination_wallet_id),
      type: 'income',
      amount: redeemAmount,
      description: `Resgate de ${selectedInvestment.investment_type} - ${selectedInvestment.institution}`,
      category_id: investmentCategory.id,
      date: date,
    };

    const destinationWallet = Array.isArray(wallets) 
      ? wallets.find(w => w && w.id === parseInt(destination_wallet_id)) 
      : null;
    
    if (!destinationWallet) {
      toast({ title: "Erro", description: "Carteira de destino não encontrada.", variant: "destructive" });
      return;
    }
    
    await Promise.all([
      supabase.from('investment_transactions').insert(transactionData),
      supabase.from('transactions').insert(incomeTransactionData),
      supabase.from('wallets').update({ balance: parseFloat(destinationWallet.balance) + redeemAmount }).eq('id', destinationWallet.id)
    ]);

    toast({ title: "Sucesso!", description: "Resgate realizado com sucesso." });
    resetForms();
    fetchData();
    if (onDataChange) onDataChange();
  };

  const handleRedeemClick = (investment) => {
    setSelectedInvestment(investment);
    setShowRedeemForm(true);
  };

  const safeWallets = Array.isArray(wallets) ? wallets : [];

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="chart-container">
            <h3 className="text-xl font-semibold text-slate-700 mb-4">Nova Aplicação</h3>
            <form onSubmit={handleApplicationSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Investimento</label><select value={formData.investment_type} onChange={e => setFormData(p => ({ ...p, investment_type: e.target.value }))} className="input-field">{investmentTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Instituição Financeira*</label><input type="text" value={formData.institution} onChange={e => setFormData(p => ({ ...p, institution: e.target.value }))} placeholder="Ex: Banco XPTO" className="input-field" required /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Valor Aplicado*</label><input type="number" step="0.01" value={formData.initial_amount} onChange={e => setFormData(p => ({ ...p, initial_amount: e.target.value }))} placeholder="R$ 1.000,00" className="input-field" required /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Conta de Origem*</label><select value={formData.origin_wallet_id} onChange={e => setFormData(p => ({ ...p, origin_wallet_id: e.target.value }))} className="input-field" required><option value="">Selecione a conta</option>{safeWallets.map(w => <option key={w.id} value={w.id}>{w.name} (R$ {parseFloat(w.balance || 0).toFixed(2)})</option>)}</select></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Data da Aplicação*</label><input type="date" value={formData.application_date} onChange={e => setFormData(p => ({ ...p, application_date: e.target.value }))} className="input-field" required /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Taxa de Rendimento*</label><input type="number" step="0.01" value={formData.yield_rate} onChange={e => setFormData(p => ({ ...p, yield_rate: e.target.value }))} placeholder="Ex: 10.5" className="input-field" required /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Período</label><select value={formData.yield_period} onChange={e => setFormData(p => ({ ...p, yield_period: e.target.value }))} className="input-field"><option value="yearly">Anual (%)</option><option value="monthly">Mensal (%)</option></select></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Vencimento (Opcional)</label><input type="date" value={formData.due_date} onChange={e => setFormData(p => ({ ...p, due_date: e.target.value }))} className="input-field" /></div>
              </div>
              <div className="flex space-x-3"><Button type="submit" className="btn-primary">Aplicar</Button><Button type="button" onClick={resetForms} className="px-6 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all">Cancelar</Button></div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-end">
        <Button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-5 h-5 mr-2" /> Nova Aplicação</Button>
      </div>

      {loading ? <div className="text-center py-12">Carregando...</div> : investmentWithDetails.length > 0 ? (
        <div className="space-y-4">
          {investmentWithDetails.map((inv, index) => (
            <motion.div key={inv.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} 
              className="wallet-card group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-100"><Briefcase className="w-6 h-6 text-blue-600" /></div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-700">{inv.investment_type}</h3>
                    <p className="text-sm text-slate-500 flex items-center gap-2"><Landmark className="w-4 h-4" /> {inv.institution}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${inv.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{inv.status === 'active' ? 'Ativo' : 'Resgatado'}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                <div><p className="text-slate-500">Saldo Atual</p><p className="font-bold text-lg text-slate-800">R$ {parseFloat(inv.currentValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>
                <div><p className="text-slate-500">Rendimento</p><p className={`font-bold text-lg ${(inv.profit || 0) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>R$ {parseFloat(inv.profit || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>
                <div><p className="text-slate-500">Taxa</p><p className="font-semibold text-slate-700">{inv.yield_rate}% {inv.yield_period === 'yearly' ? 'a.a.' : 'a.m.'}</p></div>
                <div><p className="text-slate-500">Aplicação</p><p className="font-semibold text-slate-700">{new Date(inv.application_date + 'T00:00:00').toLocaleDateString('pt-BR')}</p></div>
              </div>
              {inv.status === 'active' && (
                <div className="flex justify-end mt-4">
                  <Button onClick={() => handleRedeemClick(inv)} size="sm" className="bg-red-500 hover:bg-red-600">Resgatar</Button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 wallet-card">
          <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-600 mb-2">Nenhum investimento registrado</h3>
          <p className="text-slate-500 mb-6">Comece a acompanhar suas aplicações financeiras.</p>
          <Button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-5 h-5 mr-2" />Fazer Primeira Aplicação</Button>
        </motion.div>
      )}

      <AnimatePresence>
        {showRedeemForm && selectedInvestment && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={resetForms}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
              <h3 className="text-xl font-bold text-slate-800">Resgatar Investimento</h3>
              <p>Saldo disponível para resgate: <span className="font-bold">R$ {parseFloat(selectedInvestment.current_balance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></p>
              <form onSubmit={handleRedemptionSubmit} className="space-y-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Valor do Resgate*</label><input type="number" step="0.01" max={selectedInvestment.current_balance} value={redeemFormData.amount} onChange={e => setRedeemFormData(p => ({ ...p, amount: e.target.value }))} className="input-field" required /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Conta de Destino*</label><select value={redeemFormData.destination_wallet_id} onChange={e => setRedeemFormData(p => ({ ...p, destination_wallet_id: e.target.value }))} className="input-field" required><option value="">Selecione a conta</option>{safeWallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Data do Resgate*</label><input type="date" value={redeemFormData.date} onChange={e => setRedeemFormData(p => ({ ...p, date: e.target.value }))} className="input-field" required /></div>
                <div className="flex space-x-3"><Button type="submit" className="btn-primary">Confirmar Resgate</Button><Button type="button" onClick={resetForms} className="px-6 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all">Cancelar</Button></div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InvestmentManager;