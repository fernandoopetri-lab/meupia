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
  Loader2,
  X,
  Check
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
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-50 border border-blue-100 shadow-sm transition-transform group-hover:scale-110">
              <ArrowRightLeft className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">{transaction.description}</h4>
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                <span className="flex items-center bg-slate-50 px-2 py-0.5 rounded-md">{sourceWallet?.name || 'Origem'}</span>
                <ArrowRightLeft className="w-3 h-3 text-slate-300" />
                <span className="flex items-center bg-slate-50 px-2 py-0.5 rounded-md">{destWallet?.name || 'Destino'}</span>
                <span className="text-slate-300 mx-1">•</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(transaction.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-black text-blue-600 tracking-tight">
              <span className="text-xs font-bold text-blue-400 mr-1">R$</span>
              {parseFloat(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${transaction.type === 'income' ? 'bg-lime-50 border border-lime-100' : 'bg-red-50 border border-red-100'}`}>
            {transaction.type === 'income' ? <TrendingUp className="w-5 h-5 text-lime-600" /> : <TrendingDown className="w-5 h-5 text-red-500" />}
          </div>
          <div>
            <h4 className="font-bold text-slate-800 leading-tight group-hover:text-slate-900 transition-colors">{transaction.description}</h4>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">
              <span className={`px-2 py-0.5 rounded-md ${transaction.type === 'income' ? 'bg-lime-100/50 text-lime-700' : 'bg-red-100/50 text-red-700'}`}>{transaction.categories?.name || transaction.category}</span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center bg-slate-50 px-2 py-0.5 rounded-md">{getWalletName(transaction.wallet_id)}</span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(transaction.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className={`text-lg font-black tracking-tight ${transaction.type === 'income' ? 'text-lime-600' : 'text-red-500'}`}>
              <span className="text-xs font-bold opacity-70 mr-0.5">{transaction.type === 'income' ? '+' : '-'} R$</span>
              {parseFloat(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <button 
            onClick={() => handleEditClick(transaction)} 
            className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="heading-premium">Lançamentos</h2>
          <p className="subheading-premium">Gestão completa de receitas, despesas e transferências.</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="btn-premium">
          <Plus className="w-4 h-4 mr-2" /> Novo Lançamento
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="card-modern relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-lime-500/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-slate-800">{editingTransaction ? 'Editar' : 'Novo'} Lançamento</h3>
                <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-6 h-6"/></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button" 
                    onClick={() => setFormData(prev => ({ ...prev, type: 'expense', category_id: '' }))} 
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${formData.type === 'expense' ? 'border-red-500 bg-red-50/50 shadow-inner' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                  >
                    <div className={`p-3 rounded-xl mb-2 ${formData.type === 'expense' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-slate-100 text-slate-400'}`}>
                      <TrendingDown className="w-5 h-5" />
                    </div>
                    <span className={`text-sm font-bold uppercase tracking-widest ${formData.type === 'expense' ? 'text-red-700' : 'text-slate-400'}`}>Despesa</span>
                  </button>
                  
                  <button 
                    type="button" 
                    onClick={() => setFormData(prev => ({ ...prev, type: 'income', category_id: '' }))} 
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${formData.type === 'income' ? 'border-lime-500 bg-lime-50/50 shadow-inner' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                  >
                    <div className={`p-3 rounded-xl mb-2 ${formData.type === 'income' ? 'bg-lime-500 text-white shadow-lg shadow-lime-500/20' : 'bg-slate-100 text-slate-400'}`}>
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <span className={`text-sm font-bold uppercase tracking-widest ${formData.type === 'income' ? 'text-lime-700' : 'text-slate-400'}`}>Receita</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Valor do Lançamento</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))} placeholder="0,00" className="input-modern pl-12 text-lg font-bold" required />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Forma de Pagamento / Conta</label>
                    <select value={formData.wallet_id} onChange={(e) => setFormData(prev => ({ ...prev, wallet_id: e.target.value }))} className="input-modern bg-white appearance-none cursor-pointer" required>
                      <option value="">Selecione uma conta...</option>
                      {wallets.map(wallet => (
                        <option key={wallet.id} value={wallet.id}>{wallet.name} {wallet.type !== 'credit' ? `(R$ ${parseFloat(wallet.balance).toLocaleString('pt-BR')})` : '(Cartão)'}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Categoria</label>
                    <div className="relative">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
                      <select value={formData.category_id} onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))} className="input-modern pl-12 bg-white appearance-none cursor-pointer" required>
                        <option value="">Selecione uma categoria...</option>
                        {activeCategories.map(category => (<option key={category.id} value={category.id}>{category.name}</option>))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Data da Transação</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input type="date" value={formData.date} onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))} className="input-modern pl-12" required />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Descrição</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-4 w-5 h-5 text-slate-300" />
                    <textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="Ex: Mercado semanal, Aluguel, Venda de produção..." rows={2} className="input-modern pl-12 pt-3 resize-none h-24" required />
                  </div>
                </div>

                {!editingTransaction && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Recorrência / Parcelamento</label>
                    <div className="relative">
                      <Repeat className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input type="number" min="1" value={formData.installments} onChange={(e) => setFormData(prev => ({ ...prev, installments: e.target.value }))} placeholder="Quantidade de parcelas" className="input-modern pl-12" />
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={isSubmitting} className="btn-premium flex-1 py-7">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Check className="w-5 h-5 mr-2" />}
                    {editingTransaction ? 'Salvar Alterações' : 'Confirmar Lançamento'}
                  </Button>
                  <Button type="button" variant="ghost" disabled={isSubmitting} onClick={resetForm} className="px-8 rounded-2xl font-bold text-slate-500">Cancelar</Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="card-modern !p-3">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Buscar por descrição ou categoria..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-modern pl-12 border-transparent bg-slate-50 focus:bg-white h-12" />
          </div>
          <div className="flex p-1 bg-slate-100 rounded-xl overflow-x-auto custom-scrollbar">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'income', label: 'Receitas' },
              { id: 'expense', label: 'Despesas' },
              { id: 'transfer', label: 'Transferências' }
            ].map(type => (
              <button 
                key={type.id}
                onClick={() => setFilterType(type.id)} 
                className={`flex-1 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${filterType === type.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredTransactions.map((transaction, index) => (
          <motion.div 
            key={transaction.id} 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: index * 0.03 }} 
            className="card-modern group hover:bg-slate-50/80 !p-4 !px-6"
          >
            {renderTransactionItem(transaction)}
          </motion.div>
        ))}
      </div>

      {filteredTransactions.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-modern py-20 text-center">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-slate-200" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">{searchTerm || filterType !== 'all' ? 'Nenhum resultado encontrado' : 'Nenhum lançamento ainda'}</h3>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">{searchTerm || filterType !== 'all' ? 'Não encontramos lançamentos para os filtros aplicados. Tente ajustar sua busca.' : 'Comece a organizar suas finanças agora mesmo adicionando seu primeiro lançamento.'}</p>
          {!searchTerm && filterType === 'all' && (
            <Button onClick={() => { resetForm(); setShowForm(true); }} className="btn-premium px-10">
              <Plus className="w-5 h-5 mr-2" /> Fazer Meu Primeiro Lançamento
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default TransactionManager;