
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Wallet, CreditCard, Banknote, Smartphone, Edit2, Trash2, DollarSign, Calendar, FileText, ArrowRightLeft, Check, Loader2, Bug, RefreshCw, X, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import InvestmentManager from '@/components/InvestmentManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { banks } from '@/data/banks';
import { fetchWithRetry } from '@/utils/supabaseQueryHelper';
import { handleSupabaseError } from '@/utils/errorHandler';

const WalletManager = ({ user, profile, initialWallets, onDataChange, categories }) => {
  const { toast } = useToast();
  const [wallets, setWallets] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWallet, setEditingWallet] = useState(null);
  const [selectedCreditCard, setSelectedCreditCard] = useState(null);
  const [creditCardInvoices, setCreditCardInvoices] = useState([]);
  const [showPayInvoiceModal, setShowPayInvoiceModal] = useState(false);
  const [invoiceToPay, setInvoiceToPay] = useState(null);
  const [paymentSources, setPaymentSources] = useState([{ wallet_id: '', amount: '' }]);
  const [cardInvoiceTotals, setCardInvoiceTotals] = useState({});
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [transferFormData, setTransferFormData] = useState({ source_wallet_id: '', destination_wallet_id: '', amount: '', date: new Date().toISOString().split('T')[0] });
  
  // Statement State
  const [selectedWalletForStatement, setSelectedWalletForStatement] = useState(null);
  const [statementTransactions, setStatementTransactions] = useState([]);
  const [statementLoading, setStatementLoading] = useState(false);
  
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  const [statementStartDate, setStatementStartDate] = useState(firstDay);
  const [statementEndDate, setStatementEndDate] = useState(lastDay);
  const [statementInitialBalance, setStatementInitialBalance] = useState(0);
  const [statementFinalBalance, setStatementFinalBalance] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDebugModal, setShowDebugModal] = useState(false);
  const [debugData, setDebugData] = useState(null);
  const [debugLoading, setDebugLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'cash', balance: '', color: '#10b981', closing_day: '', due_day: '', bank: '' });

  // Debugging Data Flow
  useEffect(() => {
    console.log('[WalletManager] initialWallets received:', initialWallets?.length || 0);
    if (initialWallets) {
      setWallets(initialWallets);
    }
  }, [initialWallets]);

  const fetchCardInvoiceTotals = useCallback(async () => {
    if (!initialWallets || initialWallets.length === 0) return;
    const creditCards = initialWallets.filter(w => w.type === 'credit');
    if (creditCards.length === 0) return;

    console.log('[WalletManager] Fetching card invoice totals for:', creditCards.map(c => c.id));
    const { data, error } = await fetchWithRetry(
      () => supabase.from('transactions').select('wallet_id, amount, invoice_date, fatura_id').in('wallet_id', creditCards.map(c => c.id)).eq('type', 'expense'),
      { context: { functionName: 'fetchCardInvoiceTotals' } }
    );
    
    if (error) {
      console.error('[WalletManager] Error fetching card totals:', error);
      handleSupabaseError(error, { functionName: 'fetchCardInvoiceTotals' }, false);
      return;
    }

    const totals = creditCards.reduce((acc, card) => {
      const cardTransactions = data.filter(t => t.wallet_id === card.id);
      const currentInvoiceDate = new Date();
      const invoiceMonth = currentInvoiceDate.getMonth();
      const invoiceYear = currentInvoiceDate.getFullYear();
      
      const currentMonthTx = cardTransactions.filter(t => {
        if (!t.invoice_date) return false;
        const transactionInvoiceDate = new Date(t.invoice_date + 'T00:00:00');
        return transactionInvoiceDate.getMonth() === invoiceMonth && transactionInvoiceDate.getFullYear() === invoiceYear;
      });
      
      const total = currentMonthTx.reduce((sum, t) => sum + t.amount, 0);
      acc[card.id] = { total, txCount: currentMonthTx.length, faturaId: currentMonthTx[0]?.fatura_id };
      return acc;
    }, {});
    
    console.log('[WalletManager] Card Totals calculated:', totals);
    setCardInvoiceTotals(totals);
  }, [initialWallets]);

  useEffect(() => {
    fetchCardInvoiceTotals();
  }, [initialWallets, fetchCardInvoiceTotals]);

  const fetchInvoices = useCallback(async (card) => {
    if (!card) return;
    const cardId = card.id;
    const cardName = card.name;
    console.log('[WalletManager] Fetching invoices for card:', cardId);
    
    const [expensesRes, paymentsRes] = await Promise.all([
      fetchWithRetry(() => supabase.from('transactions').select('amount, invoice_date').eq('wallet_id', cardId).eq('type', 'expense'), { context: { functionName: 'fetchInvoices_expenses' } }),
      fetchWithRetry(() => supabase.from('transactions').select('amount, description').like('description', `Pagamento Fatura ${cardName} - %`).eq('type', 'transfer'), { context: { functionName: 'fetchInvoices_payments' } })
    ]);
    
    if (expensesRes.error) { 
      console.error('[WalletManager] Error fetching invoices:', expensesRes.error);
      handleSupabaseError(expensesRes.error, { functionName: 'fetchInvoices' }); 
      return; 
    }

    const expensesData = expensesRes.data || [];
    const paymentsData = paymentsRes.data || [];

    const invoices = expensesData.reduce((acc, transaction) => {
      if (!transaction.invoice_date) return acc;
      const invoiceMonth = new Date(transaction.invoice_date + 'T00:00:00').toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
      if (!acc[invoiceMonth]) acc[invoiceMonth] = { total: 0, paid: 0 };
      acc[invoiceMonth].total += transaction.amount;
      return acc;
    }, {});

    paymentsData.forEach(payment => {
      // Escape special characters in card name for regex
      const escapedCardName = cardName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const match = payment.description.match(new RegExp(`Pagamento Fatura ${escapedCardName} - (.+)`));
      if (match && match[1]) {
         const monthStr = match[1];
         if (invoices[monthStr]) {
           invoices[monthStr].paid += payment.amount;
         }
      }
    });

    const monthsMap = { 'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3, 'maio': 4, 'junho': 5, 'julho': 6, 'agosto': 7, 'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11 };
    const parseMonthYear = (str) => {
       const parts = str.toLowerCase().split(' de ');
       if (parts.length !== 2) return new Date();
       return new Date(parseInt(parts[1]), monthsMap[parts[0]], 1);
    };

    const formattedInvoices = Object.entries(invoices).map(([month, data]) => {
       let status = 'pending';
       if (data.paid >= data.total - 0.05) status = 'paid';
       else if (data.paid > 0) status = 'partial';
       return { month, total: data.total, paid: data.paid, status };
    }).sort((a, b) => parseMonthYear(b.month) - parseMonthYear(a.month));

    setCreditCardInvoices(formattedInvoices);
  }, []);

  useEffect(() => { if (selectedCreditCard) fetchInvoices(selectedCreditCard); }, [selectedCreditCard, fetchInvoices]);

  const fetchStatement = useCallback(async () => {
    if (!selectedWalletForStatement || !statementStartDate || !statementEndDate) return;
    console.log('[WalletManager] Fetching statement for wallet:', selectedWalletForStatement.id);
    setStatementLoading(true);

    const { data: balanceData, error: balanceError } = await fetchWithRetry(
      () => supabase.rpc('get_balance_on_date', { p_wallet_id: selectedWalletForStatement.id, p_date: statementStartDate }),
      { context: { functionName: 'get_balance_on_date' } }
    );
    
    if (balanceError) { 
      console.error('[WalletManager] Error fetching statement balance:', balanceError);
      setStatementInitialBalance(0); 
    } else { 
      setStatementInitialBalance(balanceData); 
    }

    const { data, error } = await fetchWithRetry(
      () => supabase.from('transactions').select('*, categories(name)').or(`wallet_id.eq.${selectedWalletForStatement.id},source_wallet_id.eq.${selectedWalletForStatement.id},destination_wallet_id.eq.${selectedWalletForStatement.id}`).gte('date', statementStartDate).lte('date', statementEndDate).order('date', { ascending: false }),
      { context: { functionName: 'fetchStatement' } }
    );
    
    if (error) { 
      console.error('[WalletManager] Error fetching statement transactions:', error);
      handleSupabaseError(error, { functionName: 'fetchStatement' }); 
      setStatementTransactions([]); 
      setStatementFinalBalance(balanceData || 0); 
    } else {
      console.log(`[WalletManager] Loaded ${data?.length} transactions for statement`);
      setStatementTransactions(data);
      let finalBalance = balanceData || 0;
      data.forEach(t => {
        if (t.type === 'income' || (t.type === 'transfer' && t.destination_wallet_id === selectedWalletForStatement.id)) finalBalance += t.amount;
        else if (t.type === 'expense' || (t.type === 'transfer' && t.source_wallet_id === selectedWalletForStatement.id)) finalBalance -= t.amount;
      });
      setStatementFinalBalance(finalBalance);
    }
    setStatementLoading(false);
  }, [selectedWalletForStatement, statementStartDate, statementEndDate]);

  useEffect(() => { if (selectedWalletForStatement) fetchStatement(); }, [selectedWalletForStatement, statementStartDate, statementEndDate, fetchStatement]);

  const handleDebugFatura = async (faturaId) => {
      if (!faturaId) {
          toast({ title: "Erro", description: "Nenhuma fatura vinculada identificada para este mês.", variant: "destructive" });
          return;
      }
      setDebugLoading(true);
      setShowDebugModal(true);
      const { data, error } = await supabase.rpc('get_fatura_details', { p_fatura_id: faturaId });
      
      if (error) {
          handleSupabaseError(error);
          setDebugData({ error: error.message });
      } else {
          setDebugData(data);
      }
      setDebugLoading(false);
  };

  const handleRecalculateFatura = async (faturaId) => {
       if (!faturaId) return;
       setIsSubmitting(true);
       const { data, error } = await supabase.rpc('recalcular_saldo_fatura', { p_fatura_id: faturaId });
       if (error) {
           toast({ title: "Erro ao recalcular", description: error.message, variant: "destructive" });
       } else {
           toast({ title: "Sucesso", description: `Fatura recalculada. Novo saldo: R$ ${data}` });
           fetchCardInvoiceTotals();
           if (showDebugModal) handleDebugFatura(faturaId);
       }
       setIsSubmitting(false);
  };

  const walletTypes = [{ id: 'cash', label: 'Dinheiro', icon: Banknote }, { id: 'pix', label: 'PIX', icon: Smartphone }, { id: 'debit', label: 'Débito', icon: Wallet }];
  
  const handleBankSelect = (e) => { 
    const bankId = e.target.value;
    const selectedBank = banks.find(b => b.id === bankId);
    setFormData(prev => ({ ...prev, bank: bankId, color: selectedBank?.color || prev.color, name: prev.name || selectedBank?.name || '' })); 
  };
  
  const resetForm = () => { setFormData({ name: '', type: 'cash', balance: '', color: '#10b981', closing_day: '', due_day: '', bank: '' }); setShowAddForm(false); setEditingWallet(null); };

  const parseWalletColor = (colorString) => {
    try { if (colorString && colorString.startsWith('{')) { const parsed = JSON.parse(colorString); return { hex: parsed.hex, bank: parsed.bank }; } } catch (e) {}
    return { hex: colorString, bank: null };
  };

  const handleSubmit = async (e, isCreditCard) => {
    e.preventDefault();
    if (!formData.name) { toast({ title: "Erro", description: "Por favor, preencha o nome.", variant: "destructive" }); return; }
    if (isCreditCard && (!formData.closing_day || !formData.due_day)) { toast({ title: "Erro", description: "Para cartões, dias de fechamento e vencimento são obrigatórios.", variant: "destructive" }); return; }

    setIsSubmitting(true);
    let colorToSave = formData.color;
    if (formData.bank) { try { colorToSave = JSON.stringify({ bank: formData.bank, hex: formData.color }); } catch (err) { colorToSave = formData.color; } }

    const walletData = { 
      user_id: user.id, 
      name: formData.name, 
      type: isCreditCard ? 'credit' : formData.type, 
      balance: formData.balance ? parseFloat(formData.balance) : 0, 
      color: colorToSave, 
      closing_day: isCreditCard ? parseInt(formData.closing_day) : null, 
      due_day: isCreditCard ? parseInt(formData.due_day) : null 
    };

    let error;
    try {
      if (editingWallet) { 
        console.log('[WalletManager] Updating wallet:', editingWallet.id);
        const res = await supabase.from('wallets').update(walletData).eq('id', editingWallet.id); 
        error = res.error; 
      } else { 
        console.log('[WalletManager] Creating new wallet');
        const res = await supabase.from('wallets').insert(walletData); 
        error = res.error; 
      }

      if (error) throw error;
      
      toast({ title: "Sucesso!", description: `${isCreditCard ? 'Cartão' : 'Carteira'} salvo(a) com sucesso.` }); 
      if (onDataChange) await onDataChange(); 
      resetForm();
    } catch (err) {
      console.error('[WalletManager] Error submitting wallet:', err);
      handleSupabaseError(err, { functionName: 'handleSubmitWallet' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEdit = (wallet) => { 
    const { hex, bank } = parseWalletColor(wallet.color); 
    setFormData({ name: wallet.name, type: wallet.type, balance: wallet.balance.toString(), color: hex || '#10b981', closing_day: wallet.closing_day || '', due_day: wallet.due_day || '', bank: bank || '' }); 
    setEditingWallet(wallet); 
    setShowAddForm(true); 
  };
  
  const handleDelete = async (walletId) => { 
    if(!window.confirm("Tem certeza que deseja excluir? Isso não apagará as transações, mas removerá a carteira/cartão.")) return;
    try {
      console.log('[WalletManager] Deleting wallet:', walletId);
      const { error } = await supabase.from('wallets').delete().eq('id', walletId); 
      if (error) throw error;
      toast({ title: "Sucesso!", description: "Item deletado com sucesso." }); 
      if (onDataChange) await onDataChange();
    } catch (err) {
      console.error('[WalletManager] Error deleting wallet:', err);
      handleSupabaseError(err, { functionName: 'deleteWallet' });
    }
  };
  
  const getWalletVisuals = (wallet) => {
    const { hex, bank } = parseWalletColor(wallet.color);
    const bankData = banks.find(b => b.id === bank);
    const typeIcon = walletTypes.find(t => t.id === wallet.type)?.icon || (wallet.type === 'credit' ? CreditCard : Wallet);
    return { color: hex || '#10b981', bankData, Icon: typeIcon };
  };

  const handleShowInvoiceHistory = (card) => setSelectedCreditCard(card);
  const handleCloseInvoiceHistory = () => { setSelectedCreditCard(null); setCreditCardInvoices([]); };
  
  const handlePayInvoiceClick = (card, specificInvoice = null) => { 
    if (specificInvoice) {
        if (specificInvoice.total - specificInvoice.paid <= 0) {
            toast({ title: "Informação", description: "Fatura já está paga.", variant: "default" });
            return;
        }
        setInvoiceToPay({ card, month: specificInvoice.month, total: specificInvoice.total - specificInvoice.paid });
        setShowPayInvoiceModal(true);
        return;
    }

    const data = cardInvoiceTotals[card.id] || { total: 0 }; 
    if (data.total <= 0) { toast({ title: "Informação", description: "Não há fatura em aberto para este cartão no mês atual." }); return; } 
    const currentMonth = new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' }); 
    setInvoiceToPay({ card, month: currentMonth, total: data.total }); 
    setShowPayInvoiceModal(true); 
  };
  
  const handlePaymentSourceChange = (index, field, value) => { const newSources = [...paymentSources]; newSources[index][field] = value; setPaymentSources(newSources); };
  const addPaymentSource = () => setPaymentSources([...paymentSources, { wallet_id: '', amount: '' }]);

  const handleExecutePayment = async () => { 
    setIsSubmitting(true);
    try {
      const totalSources = paymentSources.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
      if (Math.abs(totalSources - invoiceToPay.total) > 0.01) {
        toast({ title: "Erro", description: "A soma dos pagamentos deve ser igual ao total da fatura.", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }

      for (const source of paymentSources) {
        if (!source.wallet_id || !source.amount) continue;
        const sourceWallet = wallets.find(w => w.id === parseInt(source.wallet_id));
        if (sourceWallet && parseFloat(sourceWallet.balance) < parseFloat(source.amount)) {
            toast({ title: "Erro", description: `Saldo insuficiente na carteira ${sourceWallet.name}.`, variant: "destructive" });
            setIsSubmitting(false);
            return;
        }
      }

      const invoiceCategory = categories?.find(c => c.name === 'Pagamento de Fatura' && c.type === 'transfer');
      let categoryId = invoiceCategory?.id;

      if (!categoryId) {
        const { data: newCat } = await supabase.from('categories').insert({ user_id: user.id, name: 'Pagamento de Fatura', type: 'transfer', status: 'active' }).select().single();
        categoryId = newCat?.id;
      }

      for (const source of paymentSources) {
        if (!source.wallet_id || !source.amount) continue;
        await supabase.from('transactions').insert({
          user_id: user.id,
          type: 'transfer',
          amount: parseFloat(source.amount),
          description: `Pagamento Fatura ${invoiceToPay.card.name} - ${invoiceToPay.month}`,
          category_id: categoryId,
          date: new Date().toISOString().split('T')[0],
          source_wallet_id: parseInt(source.wallet_id),
          destination_wallet_id: null
        });
      }

      toast({ title: "Sucesso", description: "Fatura paga com sucesso!" });
      setShowPayInvoiceModal(false);
      setPaymentSources([{ wallet_id: '', amount: '' }]);
      if (onDataChange) await onDataChange();
    } catch (error) {
      console.error('[WalletManager] Error executing payment:', error);
      handleSupabaseError(error, { functionName: 'handleExecutePayment' });
    }
    setIsSubmitting(false);
  };

  const handleTransferSubmit = async (e) => { 
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { source_wallet_id, destination_wallet_id, amount, date } = transferFormData;
      if (!source_wallet_id || !destination_wallet_id || !amount || !date) {
        toast({ title: "Erro", description: "Preencha todos os campos.", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }

      if (source_wallet_id === destination_wallet_id) {
        toast({ title: "Erro", description: "A conta de origem e destino devem ser diferentes.", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }

      const sourceWallet = wallets.find(w => w.id === parseInt(source_wallet_id));
      if (sourceWallet && parseFloat(sourceWallet.balance) < parseFloat(amount)) {
        toast({ title: "Erro", description: "Saldo insuficiente na conta de origem.", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }

      const transferCategory = categories?.find(c => c.name === 'Transferência' && c.type === 'transfer');
      let categoryId = transferCategory?.id;

      if (!categoryId) {
        const { data: newCat } = await supabase.from('categories').insert({ user_id: user.id, name: 'Transferência', type: 'transfer', status: 'active' }).select().single();
        categoryId = newCat?.id;
      }

      await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'transfer',
        amount: parseFloat(amount),
        description: `Transferência entre contas`,
        category_id: categoryId,
        date: date,
        source_wallet_id: parseInt(source_wallet_id),
        destination_wallet_id: parseInt(destination_wallet_id)
      });

      toast({ title: "Sucesso!", description: "Transferência realizada com sucesso." });
      setShowTransferForm(false);
      setTransferFormData({ source_wallet_id: '', destination_wallet_id: '', amount: '', date: new Date().toISOString().split('T')[0] });
      if (onDataChange) await onDataChange();
    } catch(err) {
       console.error('[WalletManager] Error submitting transfer:', err);
       handleSupabaseError(err, { functionName: 'handleTransferSubmit' });
    }
    setIsSubmitting(false);
  };

  const standardWallets = wallets.filter(w => w.type !== 'credit');
  const creditCards = wallets.filter(w => w.type === 'credit');

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="heading-premium">Gerenciar Finanças</h2>
          <p className="subheading-premium">Controle suas contas, cartões e investimentos.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={() => setShowTransferForm(true)} className="flex-1 sm:flex-none btn-secondary">
            <ArrowRightLeft className="w-4 h-4 mr-2" /> Transferir
          </Button>
          <Button onClick={() => { resetForm(); setShowAddForm(true); }} className="flex-1 sm:flex-none btn-premium">
            <Plus className="w-4 h-4 mr-2" /> Adicionar Conta
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="wallets" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-100/50 p-1 rounded-2xl mb-8">
          <TabsTrigger value="wallets" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900">
            <Wallet className="w-4 h-4 mr-2" /> Carteiras
          </TabsTrigger>
          <TabsTrigger value="credit_cards" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900">
            <CreditCard className="w-4 h-4 mr-2" /> Cartões
          </TabsTrigger>
          <TabsTrigger value="investments" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900">
            <TrendingUp className="w-4 h-4 mr-2" /> Investimentos
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="wallets" className="mt-4 focus:outline-none">
          {standardWallets.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
               <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-4" />
               <p className="text-slate-500 mb-4">Nenhuma carteira cadastrada.</p>
               <Button onClick={() => { resetForm(); setShowAddForm(true); }} className="btn-primary"><Plus className="w-4 h-4 mr-2"/> Adicionar Carteira</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {standardWallets.map(wallet => {
                const { color, bankData, Icon } = getWalletVisuals(wallet);
                return (
                  <motion.div 
                    key={wallet.id} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    whileHover={{ y: -5 }} 
                    className="card-modern group"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center relative shadow-inner group-hover:scale-105 transition-transform duration-300" style={{ backgroundColor: `${color}15` }}>
                          {bankData?.logo ? (
                            <img src={bankData.logo} alt={bankData.name} className="w-8 h-8 object-contain" />
                          ) : (
                            <Icon className="w-7 h-7" style={{ color }} />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-800 leading-tight">{wallet.name}</h3>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">
                            {walletTypes.find(t=>t.id===wallet.type)?.label || wallet.type}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <button onClick={(e) => { e.stopPropagation(); handleEdit(wallet); }} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-xl hover:bg-blue-50" title="Editar"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(wallet.id); }} className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 rounded-xl hover:bg-red-50" title="Excluir"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="mb-6">
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Saldo Atual</p>
                      <p className="text-3xl font-black text-slate-900 tracking-tight">
                        <span className="text-lg font-bold text-slate-400 mr-1">R$</span>
                        {parseFloat(wallet.balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      onClick={() => setSelectedWalletForStatement(wallet)} 
                      className="w-full rounded-xl text-lime-600 hover:text-lime-700 hover:bg-lime-50 font-bold text-xs uppercase tracking-wider border border-transparent hover:border-lime-100 py-6"
                    >
                      <FileText className="w-4 h-4 mr-2"/> Ver Extrato Completo
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="credit_cards" className="mt-4 focus:outline-none">
          {creditCards.length === 0 ? (
             <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
               <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
               <p className="text-slate-500 mb-4">Nenhum cartão de crédito cadastrado.</p>
               <Button onClick={() => { resetForm(); setFormData(p=>({...p, type:'credit'})); setShowAddForm(true); }} className="btn-primary"><Plus className="w-4 h-4 mr-2"/> Adicionar Cartão</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {creditCards.map(card => {
                const { color, bankData, Icon } = getWalletVisuals(card);
                const invoiceData = cardInvoiceTotals[card.id] || { total: 0, txCount: 0, faturaId: null };
                return (
                  <motion.div 
                    key={card.id} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    whileHover={{ y: -5 }} 
                    className="card-modern group relative overflow-hidden"
                  >
                    {/* Background decoration for credit card */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-red-500/10 transition-colors duration-500" />
                    
                    <div className="flex items-start justify-between mb-6 relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center relative shadow-inner group-hover:scale-105 transition-transform duration-300" style={{ backgroundColor: `${color}15` }}>
                          {bankData?.logo ? (
                            <img src={bankData.logo} alt={bankData.name} className="w-8 h-8 object-contain" />
                          ) : (
                            <Icon className="w-7 h-7" style={{ color }} />
                          )}
                        </div>
                        <div>
                           <h3 className="text-lg font-bold text-slate-800 leading-tight">{card.name}</h3>
                           <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                             <span className="flex items-center bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100" title="Dia de Fechamento"><Calendar className="w-3 h-3 mr-1" /> Fecha: {card.closing_day}</span>
                             <span className="flex items-center bg-red-50 text-red-500 px-2 py-0.5 rounded-md border border-red-100" title="Dia de Vencimento"><Calendar className="w-3 h-3 mr-1" /> Vence: {card.due_day}</span>
                           </div>
                        </div>
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                          {profile?.is_admin && <button onClick={() => handleDebugFatura(invoiceData.faturaId)} className="p-2 text-slate-400 hover:text-purple-600 bg-slate-50 rounded-xl" title="Debug Fatura"><Bug className="w-4 h-4" /></button>}
                          <button onClick={() => handleEdit(card)} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-xl" title="Editar"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(card.id)} className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 rounded-xl" title="Excluir"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    
                    <div className="mb-6 bg-red-50/50 p-5 rounded-2xl border border-red-100 relative z-10 group-hover:bg-red-50 transition-colors">
                      <p className="text-[10px] text-red-400 uppercase tracking-widest font-bold mb-1">Fatura Atual</p>
                      <p className="text-3xl font-black text-red-600 tracking-tight">
                        <span className="text-lg font-bold text-red-400 mr-1">R$</span>
                        {invoiceData.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>

                    <div className="flex gap-3 relative z-10">
                      <Button variant="outline" onClick={() => handleShowInvoiceHistory(card)} className="flex-1 rounded-xl font-bold text-xs uppercase tracking-wider py-5 border-slate-200">Faturas</Button>
                      <Button onClick={() => handlePayInvoiceClick(card)} className="flex-1 btn-premium bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider py-5 shadow-red-900/10" disabled={invoiceData.total <= 0}>Pagar</Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="investments" className="mt-4 focus:outline-none">
          <InvestmentManager user={user} wallets={standardWallets} categories={categories} onDataChange={onDataChange} />
        </TabsContent>
      </Tabs>

      <AnimatePresence>
        {/* Add/Edit Form Modal */}
        {showAddForm && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-white/20">
               <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      {formData.type === 'credit' ? <CreditCard className="w-5 h-5 text-lime-600"/> : <Wallet className="w-5 h-5 text-lime-600"/>}
                      {editingWallet ? 'Editar' : 'Nova'} {formData.type === 'credit' ? 'Cartão' : 'Conta'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Preencha os detalhes abaixo</p>
                  </div>
                  <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-all"><X className="w-5 h-5"/></button>
               </div>
               <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                 <form id="wallet-form" onSubmit={(e) => handleSubmit(e, formData.type === 'credit')} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Tipo de Conta</label>
                      <select value={formData.type} onChange={(e) => setFormData(p => ({ ...p, type: e.target.value }))} className="input-modern bg-white appearance-none cursor-pointer" disabled={editingWallet}>
                        {walletTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                        <option value="credit">Cartão de Crédito</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Nome ou Apelido</label>
                      <input type="text" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Conta Corrente Principal" className="input-modern" required />
                    </div>
                    {formData.type !== 'credit' && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Saldo Inicial</label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5"/>
                          <input type="number" step="0.01" value={formData.balance} onChange={(e) => setFormData(p => ({ ...p, balance: e.target.value }))} placeholder="0,00" className="input-modern pl-11" />
                        </div>
                      </div>
                    )}
                    {formData.type === 'credit' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Dia Fechamento</label>
                          <input type="number" min="1" max="31" value={formData.closing_day} onChange={(e) => setFormData(p => ({ ...p, closing_day: e.target.value }))} placeholder="Ex: 5" className="input-modern" required={formData.type === 'credit'} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Dia Vencimento</label>
                          <input type="number" min="1" max="31" value={formData.due_day} onChange={(e) => setFormData(p => ({ ...p, due_day: e.target.value }))} placeholder="Ex: 10" className="input-modern" required={formData.type === 'credit'} />
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Instituição Financeira</label>
                      <select value={formData.bank} onChange={handleBankSelect} className="input-modern bg-white appearance-none cursor-pointer">
                        <option value="">Personalizada (Sem banco)</option>
                        {banks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Cor de Destaque</label>
                      <div className="flex items-center gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                         <input type="color" value={formData.color} onChange={(e) => setFormData(p => ({ ...p, color: e.target.value, bank: '' }))} className="w-12 h-12 p-1 rounded-xl cursor-pointer border-none shadow-sm" />
                         <div className="space-y-0.5">
                            <p className="text-sm font-bold text-slate-700">Cor Personalizada</p>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Usada para identificação visual rápida</p>
                         </div>
                      </div>
                    </div>
                 </form>
               </div>
               <div className="p-8 border-t border-slate-100 flex justify-end gap-4 bg-slate-50/50">
                 <Button variant="ghost" onClick={() => setShowAddForm(false)} className="rounded-xl font-bold text-slate-500">Cancelar</Button>
                 <Button type="submit" form="wallet-form" disabled={isSubmitting} className="btn-premium px-10">
                    {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Check className="w-4 h-4 mr-2"/>}
                    {editingWallet ? 'Salvar Alterações' : 'Criar Conta'}
                 </Button>
               </div>
             </motion.div>
           </motion.div>
        )}

        {/* Transfer Form Modal */}
        {showTransferForm && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-white/20">
               <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><ArrowRightLeft className="w-5 h-5 text-blue-600"/> Transferir Saldo</h3>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Entre contas do Meu Pila</p>
                  </div>
                  <button onClick={() => setShowTransferForm(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-all"><X className="w-5 h-5"/></button>
               </div>
               <div className="p-8">
                 <form id="transfer-form" onSubmit={handleTransferSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">De (Origem)</label>
                      <select value={transferFormData.source_wallet_id} onChange={(e) => setTransferFormData(p => ({ ...p, source_wallet_id: e.target.value }))} className="input-modern bg-white appearance-none cursor-pointer" required>
                        <option value="">Selecione a conta de origem</option>
                        {standardWallets.map(w => <option key={w.id} value={w.id}>{w.name} (Saldo: R$ {w.balance.toLocaleString('pt-BR')})</option>)}
                      </select>
                    </div>
                    <div className="flex justify-center -my-2 relative z-10">
                      <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm text-slate-300">
                        <ArrowRightLeft className="w-4 h-4 rotate-90" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Para (Destino)</label>
                      <select value={transferFormData.destination_wallet_id} onChange={(e) => setTransferFormData(p => ({ ...p, destination_wallet_id: e.target.value }))} className="input-modern bg-white appearance-none cursor-pointer" required>
                        <option value="">Selecione a conta de destino</option>
                        {standardWallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Valor</label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5"/>
                          <input type="number" step="0.01" min="0.01" value={transferFormData.amount} onChange={(e) => setTransferFormData(p => ({ ...p, amount: e.target.value }))} placeholder="0,00" className="input-modern pl-11" required/>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Data</label>
                        <input type="date" value={transferFormData.date} onChange={(e) => setTransferFormData(p => ({ ...p, date: e.target.value }))} className="input-modern" required/>
                      </div>
                    </div>
                 </form>
               </div>
               <div className="p-8 border-t border-slate-100 flex justify-end gap-4 bg-slate-50/50">
                 <Button variant="ghost" onClick={() => setShowTransferForm(false)} className="rounded-xl font-bold text-slate-500">Cancelar</Button>
                 <Button type="submit" form="transfer-form" disabled={isSubmitting} className="btn-premium bg-blue-600 hover:bg-blue-700 shadow-blue-900/10 px-10">
                    {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <ArrowRightLeft className="w-4 h-4 mr-2"/>}
                    Transferir Agora
                 </Button>
               </div>
             </motion.div>
           </motion.div>
        )}

        {/* Statement / Transaction List Modal */}
        {selectedWalletForStatement && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
                <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-2xl p-0 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                    <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                        <div>
                          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><FileText className="w-6 h-6 text-emerald-600"/> Extrato: {selectedWalletForStatement.name}</h3>
                          <p className="text-sm text-slate-500 mt-1">Histórico completo de transações</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedWalletForStatement(null)} className="rounded-full hover:bg-slate-200"><X className="w-5 h-5"/></Button>
                    </div>

                    <div className="p-8 border-b border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] px-1">Data Inicial</label>
                            <input type="date" value={statementStartDate} onChange={e => setStatementStartDate(e.target.value)} className="input-modern h-10 bg-white" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] px-1">Data Final</label>
                            <input type="date" value={statementEndDate} onChange={e => setStatementEndDate(e.target.value)} className="input-modern h-10 bg-white" />
                          </div>
                        </div>
                        <Button onClick={fetchStatement} className="btn-premium px-8 h-10 w-full sm:w-auto">Filtrar Extrato</Button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                        {statementLoading ? (
                            <div className="flex flex-col items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-4" /><p className="text-slate-500">Buscando transações...</p></div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                  <span className="font-medium text-slate-600">Saldo Anterior ({new Date(statementStartDate).toLocaleDateString('pt-BR')})</span>
                                  <span className="font-bold text-slate-800">R$ {parseFloat(statementInitialBalance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                                
                                {statementTransactions.length > 0 ? (
                                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                                                <tr>
                                                    <th className="px-4 py-3 font-medium">Data</th>
                                                    <th className="px-4 py-3 font-medium">Descrição</th>
                                                    <th className="px-4 py-3 font-medium">Categoria</th>
                                                    <th className="px-4 py-3 font-medium text-right">Valor</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {statementTransactions.map(t => {
                                                    const isIncome = t.type === 'income' || (t.type === 'transfer' && t.destination_wallet_id === selectedWalletForStatement.id);
                                                    return (
                                                        <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                                                            <td className="px-4 py-3 whitespace-nowrap text-slate-600">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                                                            <td className="px-4 py-3 font-medium text-slate-800">{t.description}</td>
                                                            <td className="px-4 py-3 text-slate-500">
                                                                <span className="bg-slate-100 px-2 py-1 rounded-md text-xs">{t.categories?.name || (t.type === 'transfer' ? 'Transferência' : 'Geral')}</span>
                                                            </td>
                                                            <td className={`px-4 py-3 text-right font-bold whitespace-nowrap ${isIncome ? 'text-emerald-600' : 'text-red-500'}`}>
                                                                {isIncome ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                                        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3"/>
                                        <p className="text-slate-500">Nenhuma transação no período.</p>
                                    </div>
                                )}
                                
                                <div className="flex justify-between items-center bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-sm">
                                  <span className="font-medium text-emerald-800">Saldo Final ({new Date(statementEndDate).toLocaleDateString('pt-BR')})</span>
                                  <span className="font-bold text-xl text-emerald-700">R$ {parseFloat(statementFinalBalance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        )}

        {/* Invoice Modal */}
        {selectedCreditCard && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
               <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="text-xl font-bold text-slate-800">Faturas: {selectedCreditCard.name}</h3>
                  <button onClick={handleCloseInvoiceHistory} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"><X className="w-5 h-5"/></button>
               </div>
               <div className="p-6 max-h-[60vh] overflow-y-auto">
                 {creditCardInvoices.length > 0 ? (
                   <div className="space-y-3">
                     {creditCardInvoices.map((invoice) => (
                       <div key={invoice.month} className={`flex flex-col p-4 bg-white border ${invoice.status === 'paid' ? 'border-emerald-200 shadow-emerald-500/5' : 'border-slate-200'} rounded-xl transition-colors`}>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="font-medium capitalize text-slate-700">{invoice.month}</span>
                              {invoice.status === 'paid' && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border border-emerald-200">Paga</span>}
                              {invoice.status === 'partial' && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border border-yellow-200">Parcial</span>}
                              {invoice.status === 'pending' && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border border-red-200">Pendente</span>}
                            </div>
                            <span className={`font-bold ${invoice.status === 'paid' ? 'text-emerald-600' : 'text-red-500'}`}>R$ {invoice.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                          {invoice.status !== 'paid' && (
                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
                              <span className="text-xs text-slate-500 font-medium">
                                {invoice.paid > 0 ? `Restante: R$ ${(invoice.total - invoice.paid).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'A pagar'}
                              </span>
                              <Button onClick={() => { handleCloseInvoiceHistory(); handlePayInvoiceClick(selectedCreditCard, invoice); }} size="sm" className="bg-red-600 hover:bg-red-700 text-white text-xs h-8 px-4 font-bold rounded-lg shadow-red-900/10">
                                Pagar Fatura
                              </Button>
                            </div>
                          )}
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="text-center py-8 text-slate-500">Nenhuma fatura encontrada para este cartão.</div>
                 )}
               </div>
             </motion.div>
           </motion.div>
        )}

        {/* Pay Invoice Modal */}
        {showPayInvoiceModal && invoiceToPay && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
               <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-red-50">
                  <h3 className="text-xl font-bold text-red-800">Pagar Fatura</h3>
                  <button onClick={() => setShowPayInvoiceModal(false)} className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-100 transition-colors"><X className="w-5 h-5"/></button>
               </div>
               <div className="p-6">
                 <div className="mb-6 text-center">
                    <p className="text-sm text-slate-500 mb-1">{invoiceToPay.card.name} - {invoiceToPay.month}</p>
                    <p className="text-4xl font-bold text-slate-800">R$ {invoiceToPay.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                 </div>
                 
                 <div className="space-y-4">
                    <p className="text-sm font-medium text-slate-700 border-b border-slate-100 pb-2">De onde sairá o dinheiro?</p>
                    {paymentSources.map((source, index) => (
                      <div key={index} className="flex gap-2 items-start bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div className="flex-1 space-y-3">
                          <select value={source.wallet_id} onChange={(e) => handlePaymentSourceChange(index, 'wallet_id', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-emerald-500 bg-white">
                            <option value="">Selecione a conta</option>
                            {standardWallets.map(w => <option key={w.id} value={w.id}>{w.name} (R$ {w.balance})</option>)}
                          </select>
                          <div className="relative">
                             <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4"/>
                             <input type="number" step="0.01" value={source.amount} onChange={(e) => handlePaymentSourceChange(index, 'amount', e.target.value)} placeholder="0.00" className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-emerald-500"/>
                          </div>
                        </div>
                        {index > 0 && (
                          <button onClick={() => setPaymentSources(s => s.filter((_, i) => i !== index))} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                        )}
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addPaymentSource} className="w-full text-emerald-600 border-emerald-200 hover:bg-emerald-50 mt-2"><Plus className="w-4 h-4 mr-2"/> Adicionar outra conta origem</Button>
                 </div>
               </div>
               <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                 <Button variant="outline" onClick={() => setShowPayInvoiceModal(false)} className="rounded-xl">Cancelar</Button>
                 <Button onClick={handleExecutePayment} disabled={isSubmitting} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
                    {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Check className="w-4 h-4 mr-2"/>} Pagar Fatura
                 </Button>
               </div>
             </motion.div>
           </motion.div>
        )}

        {/* Debug Modal */}
        {showDebugModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-xl overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Bug className="w-5 h-5 text-purple-600"/> Debug de Fatura</h3>
                        <Button variant="ghost" size="icon" onClick={() => setShowDebugModal(false)} className="rounded-full hover:bg-slate-200"><X className="w-5 h-5"/></Button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        {debugLoading ? (
                            <div className="flex flex-col items-center py-12"><Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-4" /><p className="text-slate-500">Coletando dados...</p></div>
                        ) : debugData?.error ? (
                            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">{debugData.error}</div>
                        ) : debugData ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Fatura ID</p>
                                        <p className="font-mono font-bold text-slate-800">{debugData.fatura.id}</p>
                                    </div>
                                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Saldo Atual (DB)</p>
                                        <p className="font-mono font-bold text-blue-800 text-xl">R$ {debugData.fatura.saldo_atual}</p>
                                    </div>
                                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                                        <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">Soma Real (Transações)</p>
                                        <p className="font-mono font-bold text-purple-800 text-xl">R$ {debugData.calculated_sum}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Transações Vinculadas</p>
                                        <p className="font-mono font-bold text-slate-800">{debugData.transaction_count}</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-slate-700 mb-3 border-b border-slate-200 pb-2">Lista de Transações</h4>
                                    <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl bg-white shadow-sm">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-500">
                                                <tr>
                                                    <th className="p-3 font-medium">Data</th>
                                                    <th className="p-3 font-medium">Descrição</th>
                                                    <th className="p-3 font-medium text-right">Valor</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {debugData.transactions.map(tx => (
                                                    <tr key={tx.id} className="hover:bg-slate-50">
                                                        <td className="p-3 text-slate-600 whitespace-nowrap">{tx.date}</td>
                                                        <td className="p-3 font-medium text-slate-800">{tx.description}</td>
                                                        <td className={`p-3 text-right font-bold whitespace-nowrap ${tx.type === 'expense' ? 'text-red-500' : 'text-emerald-500'}`}>
                                                            R$ {tx.amount}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {debugData.transactions.length === 0 && (
                                                    <tr><td colSpan={3} className="p-4 text-center text-slate-500">Nenhuma transação encontrada</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                    
                    {debugData && !debugData.error && (
                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                            <Button onClick={() => handleRecalculateFatura(debugData.fatura.id)} disabled={isSubmitting} className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white">
                                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                                Forçar Recálculo de Saldo
                            </Button>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WalletManager;
