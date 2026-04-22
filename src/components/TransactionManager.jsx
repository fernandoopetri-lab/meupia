import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  DollarSign,
  Tag,
  FileText,
  Search,
  Edit2,
  Repeat,
  ArrowRightLeft,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { fetchWithRetry } from '@/utils/supabaseQueryHelper';
import { handleSupabaseError } from '@/utils/errorHandler';

const TransactionManager = ({ user, profile, initialWallets, initialTransactions, initialCategories, onDataChange }) => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState(initialTransactions || []);
  const [wallets, setWallets] = useState(initialWallets || []);
  const [categories, setCategories] = useState(initialCategories || []);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const defaultFormState = {
    type: 'expense',
    amount: '',
    description: '',
    category_id: '',
    wallet_id: '',
    date: new Date().toISOString().split('T')[0],
    installments: 1,
  };
  const [formData, setFormData] = useState(defaultFormState);

  useEffect(() => {
    setTransactions(initialTransactions || []);
    setWallets(initialWallets || []);
    setCategories(initialCategories || []);
  }, [initialTransactions, initialWallets, initialCategories]);

  const handleEditClick = (transaction) => {
    if (transaction.type === 'transfer') {
      toast({
        title: "Ação não permitida",
        description: "Transferências não podem ser editadas. Por favor, exclua e crie uma nova.",
        variant: "destructive"
      });
      return;
    }

    const originalCategory = categories.find(c => c.id === transaction.category_id);
    if (originalCategory && originalCategory.status === 'inactive') {
      toast({
        title: "Atenção",
        description: `A categoria "${originalCategory.name}" está inativa. Por favor, escolha uma nova categoria ativa.`,
        variant: "destructive"
      });
    }

    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      description: transaction.description,
      category_id: (originalCategory && originalCategory.status === 'active') ? transaction.category_id : '',
      wallet_id: transaction.wallet_id,
      date: transaction.date,
      installments: 1, // Cannot edit installments
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description || !formData.category_id || !formData.wallet_id) {
      toast({ title: "Erro", description: "Por favor, preencha todos os campos.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    if (editingTransaction) {
      await handleUpdate();
    } else {
      await handleCreate();
    }
    setIsSubmitting(false);
  };

  const handleCreate = async () => {
    const amount = parseFloat(formData.amount);
    const walletId = parseInt(formData.wallet_id);
    const installments = parseInt(formData.installments) || 1;
    const selectedWallet = wallets.find(w => w.id === walletId);

    if (!selectedWallet) {
      toast({ title: "Erro", description: "Forma de pagamento não encontrada.", variant: "destructive" });
      return;
    }

    const transactionsToInsert = [];
    const originalDate = new Date(formData.date + 'T00:00:00'); // Ensure local timezone
    
    for (let i = 0; i < installments; i++) {
      const transactionDate = new Date(originalDate);
      transactionDate.setMonth(originalDate.getMonth() + i);

      transactionsToInsert.push({
        user_id: user.id,
        wallet_id: walletId,
        type: formData.type,
        amount,
        description: installments > 1 ? `${formData.description} (${i + 1}/${installments})` : formData.description,
        category_id: formData.category_id,
        date: transactionDate.toISOString().split('T')[0],
        installment_number: installments > 1 ? i + 1 : null,
        total_installments: installments > 1 ? installments : null,
        installment_of: null,
      });
    }

    const { data: inserted, error } = await fetchWithRetry(
      () => supabase.from('transactions').insert(transactionsToInsert).select(),
      { context: { functionName: 'insertTransactions' } }
    );

    if (error) {
      handleSupabaseError(error, { functionName: 'insertTransactions' });
      return;
    }

    if (installments > 1 && inserted && inserted.length > 0) {
      const firstTransactionId = inserted[0].id;
      const updates = inserted.map(t => ({ id: t.id, installment_of: firstTransactionId }));
      
      const { error: updateError } = await fetchWithRetry(
        () => supabase.from('transactions').upsert(updates, { onConflict: 'id' }),
        { context: { functionName: 'upsertTransactionInstallments' } }
      );

      if (updateError) {
        console.error("Erro ao vincular parcelas", updateError);
        // Even if this fails, the transactions were created, so we continue.
      }
    }

    if (selectedWallet.type !== 'credit') {
      const balanceChange = amount * (formData.type === 'income' ? 1 : -1);
      const newBalance = parseFloat(selectedWallet.balance) + balanceChange;
      
      await fetchWithRetry(
        () => supabase.from('wallets').update({ balance: newBalance }).eq('id', walletId),
        { context: { functionName: 'updateWalletBalance' } }
      );
    }
    
    toast({ title: "Sucesso!", description: `Lançamento(s) adicionado(s) com sucesso.` });
    await onDataChange();
    resetForm();
  };

  const handleUpdate = async () => {
    const amount = parseFloat(formData.amount);
    const walletId = parseInt(formData.wallet_id);
    
    const originalTransaction = transactions.find(t => t.id === editingTransaction.id);
    const originalAmount = parseFloat(originalTransaction.amount);
    const originalWallet = wallets.find(w => w.id === originalTransaction.wallet_id);
    const newWallet = wallets.find(w => w.id === walletId);

    const transactionData = {
      wallet_id: walletId,
      type: formData.type,
      amount,
      description: formData.description,
      category_id: formData.category_id,
      date: formData.date,
    };

    const { error } = await fetchWithRetry(
      () => supabase.from('transactions').update(transactionData).eq('id', editingTransaction.id),
      { context: { functionName: 'updateTransaction' } }
    );

    if (error) {
      handleSupabaseError(error, { functionName: 'updateTransaction' });
      return;
    }

    // Log changes
    const changes = {};
    for (const key in transactionData) {
      if (String(transactionData[key]) !== String(originalTransaction[key])) {
        changes[key] = { old: originalTransaction[key], new: transactionData[key] };
      }
    }
    if (Object.keys(changes).length > 0) {
      await fetchWithRetry(
        () => supabase.from('transaction_logs').insert({ transaction_id: editingTransaction.id, user_id: user.id, changes: changes }),
        { context: { functionName: 'insertTransactionLog' } }
      );
    }

    // Adjust wallet balances
    if (originalWallet.id === newWallet.id) {
      if (originalWallet.type !== 'credit') {
        const originalTypeMultiplier = originalTransaction.type === 'income' ? 1 : -1;
        const newTypeMultiplier = formData.type === 'income' ? 1 : -1;
        const balanceChange = (amount * newTypeMultiplier) - (originalAmount * originalTypeMultiplier);
        const newBalance = parseFloat(originalWallet.balance) + balanceChange;
        await fetchWithRetry(() => supabase.from('wallets').update({ balance: newBalance }).eq('id', originalWallet.id), { context: { functionName: 'updateBalance' } });
      }
    } else {
      if (originalWallet.type !== 'credit') {
        const oldWalletNewBalance = parseFloat(originalWallet.balance) + (originalAmount * (originalTransaction.type === 'income' ? -1 : 1));
        await fetchWithRetry(() => supabase.from('wallets').update({ balance: oldWalletNewBalance }).eq('id', originalWallet.id), { context: { functionName: 'updateBalanceOld' } });
      }
      if (newWallet.type !== 'credit') {
        const newWalletNewBalance = parseFloat(newWallet.balance) + (amount * (formData.type === 'income' ? 1 : -1));
        await fetchWithRetry(() => supabase.from('wallets').update({ balance: newWalletNewBalance }).eq('id', newWallet.id), { context: { functionName: 'updateBalanceNew' } });
      }
    }

    toast({ title: "Sucesso!", description: "Lançamento atualizado com sucesso." });
    await onDataChange();
    resetForm();
  };

  const resetForm = () => {
    setFormData(defaultFormState);
    setShowForm(false);
    setEditingTransaction(null);
  };

  const filteredTransactions = transactions.filter(transaction => {
    const categoryName = transaction.categories?.name || transaction.category || '';
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         categoryName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getWalletName = (walletId) => {
    const wallet = wallets.find(w => w.id === walletId);
    return wallet ? wallet.name : 'Desconhecida';
  };

  const activeCategories = categories.filter(c => c.status === 'active' && c.type === formData.type);

  const renderTransactionItem = (transaction) => {
    if (transaction.type === 'transfer') {
      const sourceWallet = wallets.find(w => w.id === transaction.source_wallet_id);
      const destWallet = wallets.find(w => w.id === transaction.destination_wallet_id);
      return (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-100">
              <ArrowRightLeft className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-700">{transaction.description}</h4>
              <div className="flex items-center space-x-2 text-sm text-slate-500">
                <span>{sourceWallet?.name || 'Origem'}</span>
                <ArrowRightLeft className="w-3 h-3" />
                <span>{destWallet?.name || 'Destino'}</span>
                <span>•</span>
                <span>{new Date(transaction.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>
          <p className="text-lg font-bold text-blue-600">
            R$ {parseFloat(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${transaction.type === 'income' ? 'bg-emerald-100' : 'bg-red-100'}`}>
            {transaction.type === 'income' ? <TrendingUp className="w-6 h-6 text-emerald-600" /> : <TrendingDown className="w-6 h-6 text-red-600" />}
          </div>
          <div>
            <h4 className="font-semibold text-slate-700">{transaction.description}</h4>
            <div className="flex items-center space-x-2 text-sm text-slate-500">
              <span>{transaction.categories?.name || transaction.category}</span>
              <span>•</span>
              <span>{getWalletName(transaction.wallet_id)}</span>
              <span>•</span>
              <span>{new Date(transaction.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <p className={`text-lg font-bold ${transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
            {transaction.type === 'income' ? '+' : '-'}R$ {parseFloat(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <button onClick={() => handleEditClick(transaction)} className="ml-4 p-2 text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"><Edit2 className="w-4 h-4" /></button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Lançamentos</h2>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary"><Plus className="w-5 h-5 mr-2" />Adicionar Lançamento</Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="chart-container">
            <h3 className="text-xl font-semibold text-slate-700 mb-4">{editingTransaction ? 'Editar' : 'Adicionar Novo'} Lançamento</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, type: 'expense', category_id: '' }))} className={`flex items-center justify-center p-3 rounded-xl border-2 transition-all ${formData.type === 'expense' ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <TrendingDown className="w-5 h-5 mr-2 text-red-600" />
                  <span className="font-medium text-red-700">Despesa</span>
                </button>
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, type: 'income', category_id: '' }))} className={`flex items-center justify-center p-3 rounded-xl border-2 transition-all ${formData.type === 'income' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <TrendingUp className="w-5 h-5 mr-2 text-emerald-600" />
                  <span className="font-medium text-emerald-700">Receita</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Valor</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))} placeholder="0,00" className="input-field pl-12" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Forma de Pagamento</label>
                  <select value={formData.wallet_id} onChange={(e) => setFormData(prev => ({ ...prev, wallet_id: e.target.value }))} className="input-field" required>
                    <option value="">Selecione uma opção</option>
                    {wallets.map(wallet => (
                      <option key={wallet.id} value={wallet.id}>{wallet.name} {wallet.type !== 'credit' ? `(R$ ${parseFloat(wallet.balance).toFixed(2)})` : '(Crédito)'}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Categoria</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <select value={formData.category_id} onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))} className="input-field pl-12" required>
                      <option value="">Selecione a categoria</option>
                      {activeCategories.map(category => (<option key={category.id} value={category.id}>{category.name}</option>))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Data</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="date" value={formData.date} onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))} className="input-field pl-12" required />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Descrição</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="Digite a descrição do lançamento" rows={2} className="input-field pl-12 resize-none" required />
                </div>
              </div>
              {!editingTransaction && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Recorrência (Parcelas)</label>
                  <div className="relative">
                    <Repeat className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="number" min="1" value={formData.installments} onChange={(e) => setFormData(prev => ({ ...prev, installments: e.target.value }))} className="input-field pl-12" />
                  </div>
                </div>
              )}
              <div className="flex space-x-3">
                <Button type="submit" disabled={isSubmitting} className="btn-primary">{isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}{editingTransaction ? 'Atualizar' : 'Adicionar'}</Button>
                <Button type="button" disabled={isSubmitting} onClick={resetForm} className="px-6 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all">Cancelar</Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="chart-container">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="text" placeholder="Buscar lançamentos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field pl-12" />
            </div>
          </div>
          <div className="flex space-x-2">
            <button onClick={() => setFilterType('all')} className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${filterType === 'all' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'}`}>Todas</button>
            <button onClick={() => setFilterType('income')} className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${filterType === 'income' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'}`}>Receitas</button>
            <button onClick={() => setFilterType('expense')} className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${filterType === 'expense' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'}`}>Despesas</button>
            <button onClick={() => setFilterType('transfer')} className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${filterType === 'transfer' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'}`}>Transferências</button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredTransactions.map((transaction, index) => (
          <motion.div key={transaction.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="expense-item group">
            {renderTransactionItem(transaction)}
          </motion.div>
        ))}
      </div>

      {filteredTransactions.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <TrendingUp className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-600 mb-2">{searchTerm || filterType !== 'all' ? 'Nenhum lançamento encontrado' : 'Nenhum lançamento ainda'}</h3>
          <p className="text-slate-500 mb-6">{searchTerm || filterType !== 'all' ? 'Tente ajustar sua busca ou filtros' : 'Adicione seu primeiro lançamento para começar'}</p>
          {!searchTerm && filterType === 'all' && <Button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary"><Plus className="w-5 h-5 mr-2" />Adicionar Primeiro Lançamento</Button>}
        </motion.div>
      )}
    </div>
  );
};

export default TransactionManager;