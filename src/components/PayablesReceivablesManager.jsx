import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Calendar, DollarSign, Tag, Wallet, CheckCircle, TrendingDown, TrendingUp, ArrowRightLeft, Eye, MoreVertical, AlertTriangle, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const PayablesReceivablesManager = ({ user, wallets, categories, onDataChange }) => {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  
  // Payment States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [itemToPay, setItemToPay] = useState(null);
  const [paymentFormData, setPaymentFormData] = useState({ 
    amount: '', 
    wallet_id: '', 
    payment_date: new Date().toISOString().split('T')[0] 
  });

  // History States
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [editingPayment, setEditingPayment] = useState(null);
  
  // Search State
  const [searchTerm, setSearchTerm] = useState('');

  // Global Action & Delete States
  const [showActionOptions, setShowActionOptions] = useState(false);
  const [actionItem, setActionItem] = useState(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const defaultFormState = {
    type: 'payable', 
    description: '', 
    amount: '', 
    due_date: new Date().toISOString().split('T')[0],
    wallet_id: '', 
    category_id: '',
  };
  const [formData, setFormData] = useState(defaultFormState);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('payables_receivables')
      .select('*, wallets(name), categories(name)')
      .eq('user_id', user.id)
      .order('due_date', { ascending: true });

    if (error) {
      toast({ 
        title: "Erro", 
        description: "Não foi possível carregar as contas.", 
        variant: "destructive" 
      });
    } else {
      setItems(data);
    }
    setLoading(false);
  }, [user.id, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setFormData({ ...defaultFormState, type: 'payable' });
    setEditingItem(null);
    setShowForm(false);
  };

  const resetPaymentForm = () => {
    setItemToPay(null);
    setShowPaymentModal(false);
    setEditingPayment(null);
    setPaymentFormData({ 
      amount: '', 
      wallet_id: '', 
      payment_date: new Date().toISOString().split('T')[0] 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { description, amount, due_date, wallet_id, category_id } = formData;
    
    if (!description || !amount || !due_date || !wallet_id || !category_id) {
      toast({ 
        title: "Erro", 
        description: "Preencha todos os campos obrigatórios.", 
        variant: "destructive" 
      });
      return;
    }

    const amountFloat = parseFloat(amount);
    
    if (editingItem && amountFloat < editingItem.paid_amount) {
       toast({ 
        title: "Erro", 
        description: `O novo valor não pode ser menor que o valor já pago (R$ ${editingItem.paid_amount.toFixed(2)}).`, 
        variant: "destructive" 
      });
      return;
    }

    let newStatus = 'pending';
    if (editingItem) {
        if (editingItem.paid_amount >= amountFloat) {
            newStatus = editingItem.type === 'payable' ? 'paid' : 'received';
        } else if (editingItem.paid_amount > 0) {
            newStatus = 'partial';
        } else {
            newStatus = 'pending';
        }
    }

    const itemData = {
      user_id: user.id, 
      type: formData.type, 
      description, 
      amount: amountFloat,
      due_date, 
      wallet_id: parseInt(wallet_id), 
      category_id: parseInt(category_id), 
      status: editingItem ? newStatus : 'pending', 
    };

    let error;
    if (editingItem) {
      const { error: updateError } = await supabase
        .from('payables_receivables')
        .update({ 
            ...itemData, 
            paid_amount: editingItem.paid_amount 
        })
        .eq('id', editingItem.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('payables_receivables')
        .insert({ ...itemData, paid_amount: 0 });
      error = insertError;
    }

    if (error) {
      toast({ 
        title: "Erro", 
        description: error.message, 
        variant: "destructive" 
      });
    } else {
      toast({ 
        title: "Sucesso!", 
        description: `Conta ${editingItem ? 'atualizada' : 'adicionada'} com sucesso.` 
      });
      resetForm();
      fetchData();
      if (onDataChange) onDataChange();
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      type: item.type, 
      description: item.description, 
      amount: item.amount,
      due_date: item.due_date, 
      wallet_id: item.wallet_id, 
      category_id: item.category_id,
    });
    setShowForm(true);
  };

  const handleDelete = async (itemId) => {
    const { error } = await supabase
      .from('payables_receivables')
      .delete()
      .eq('id', itemId);
      
    if (error) {
      toast({ 
        title: "Erro", 
        description: "Não foi possível excluir a conta. Verifique se não há pagamentos vinculados.", 
        variant: "destructive" 
      });
    } else {
      toast({ 
        title: "Sucesso!", 
        description: "Conta excluída." 
      });
      fetchData();
      if (onDataChange) onDataChange();
    }
  };
  
  const confirmDelete = async () => {
    if (itemToDelete) {
        await handleDelete(itemToDelete.id);
        setShowDeleteAlert(false);
        setItemToDelete(null);
        setShowActionOptions(false); // Also close action menu if open
    }
  };

  const handleOpenPaymentModal = (item, payment = null) => {
    setItemToPay(item);
    if (payment) {
      setEditingPayment(payment);
      setPaymentFormData({ 
        amount: payment.amount, 
        wallet_id: payment.wallet_id, 
        payment_date: payment.payment_date 
      });
    } else {
      const remainingAmount = item.amount - item.paid_amount;
      setPaymentFormData({ 
        amount: remainingAmount.toFixed(2), 
        wallet_id: item.wallet_id || '', 
        payment_date: new Date().toISOString().split('T')[0] 
      });
    }
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    const { amount, wallet_id, payment_date } = paymentFormData;
    const paymentAmount = parseFloat(amount);

    if (!paymentAmount || !wallet_id || !payment_date) {
      toast({ 
        title: "Erro", 
        description: "Preencha todos os campos.", 
        variant: "destructive" 
      });
      return;
    }

    const remainingAmount = itemToPay.amount - itemToPay.paid_amount;
    
    if (!editingPayment && paymentAmount > remainingAmount) {
      toast({ 
        title: "Erro", 
        description: "O valor do pagamento não pode ser maior que o valor restante.", 
        variant: "destructive" 
      });
      return;
    }

    try {
      const newPaidAmount = itemToPay.paid_amount + paymentAmount;
      const newStatus = newPaidAmount >= itemToPay.amount ? 
        (itemToPay.type === 'payable' ? 'paid' : 'received') : 
        'partial';

      const { error } = await supabase.rpc('process_payment', {
        p_account_id: itemToPay.id,
        p_wallet_id: parseInt(wallet_id),
        p_amount: paymentAmount,
        p_payment_date: payment_date,
        p_user_id: user.id,
        p_new_status: newStatus,
        p_new_paid_amount: newPaidAmount
      });

      if (error) throw error;

      toast({ 
        title: "Sucesso!", 
        description: `${itemToPay.type === 'payable' ? 'Pagamento' : 'Recebimento'} registrado com sucesso.` 
      });
      
      resetPaymentForm();
      fetchData();
      if (onDataChange) onDataChange();
      
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({ 
        title: "Erro", 
        description: error.message || "Não foi possível processar o pagamento.", 
        variant: "destructive" 
      });
    }
  };

  const handleShowHistory = async (itemId) => {
    const item = items.find(i => i.id === itemId);
    setItemToPay(item);
    
    const { data, error } = await supabase
      .from('payable_receivable_payments')
      .select('*, wallets(name)')
      .eq('payable_receivable_id', itemId)
      .order('payment_date', { ascending: false });
      
    if (error) {
      toast({ 
        title: "Erro", 
        description: "Não foi possível carregar o histórico.", 
        variant: "destructive" 
      });
      return;
    }
    
    setPaymentHistory(data);
    setShowHistoryModal(true);
  };

  const handleDeletePayment = async (payment) => {
    try {
      const { data: paymentData, error: fetchError } = await supabase
        .from('payable_receivable_payments')
        .select('*, payables_receivables(type)')
        .eq('id', payment.id)
        .single();

      if (fetchError) throw fetchError;

      if (paymentData.transaction_id) {
        const { error: transactionError } = await supabase
          .from('transactions')
          .delete()
          .eq('id', paymentData.transaction_id);

        if (transactionError) throw transactionError;

        const multiplier = paymentData.payables_receivables.type === 'payable' ? 1 : -1;
        const { error: walletError } = await supabase
          .from('wallets')
          .update({ 
            balance: supabase.raw(`balance + ${payment.amount * multiplier}`) 
          })
          .eq('id', payment.wallet_id);

        if (walletError) throw walletError;
      }

      const { error: deleteError } = await supabase
        .from('payable_receivable_payments')
        .delete()
        .eq('id', payment.id);

      if (deleteError) throw deleteError;

      const newPaidAmount = itemToPay.paid_amount - payment.amount;
      const newStatus = newPaidAmount <= 0 ? 'pending' : 'partial';

      const { error: updateError } = await supabase
        .from('payables_receivables')
        .update({
          paid_amount: newPaidAmount,
          status: newStatus,
          paid_at: null
        })
        .eq('id', itemToPay.id);

      if (updateError) throw updateError;

      toast({ 
        title: "Sucesso!", 
        description: "Pagamento excluído com sucesso." 
      });

      handleShowHistory(itemToPay.id);
      fetchData();
      if (onDataChange) onDataChange();

    } catch (error) {
      console.error('Error deleting payment:', error);
      toast({ 
        title: "Erro", 
        description: "Não foi possível excluir o pagamento.", 
        variant: "destructive" 
      });
    }
  };
  
  const getStatusBadge = (item) => {
    const isOverdue = new Date(item.due_date) < new Date() && item.status === 'pending';
    
    if (isOverdue) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Vencido
        </span>
      );
    }
    
    switch (item.status) {
      case 'paid':
      case 'received':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">
            Liquidado
          </span>
        );
      case 'partial':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">
            Parcial
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
            Pendente
          </span>
        );
    }
  };

  // NEW: Handler for card click
  const handleCardClick = (item, e) => {
    // Do not open if clicking buttons/actions
    if (e.target.closest('button') || e.target.closest('[role="menuitem"]')) {
        return;
    }
    
    setActionItem(item);
    setShowActionOptions(true);
  };

  const filteredItems = items.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const isMatch = (
      item.description.toLowerCase().includes(searchLower) ||
      (item.categories?.name && item.categories.name.toLowerCase().includes(searchLower))
    );
    
    if (activeTab === 'paid') {
      return (item.status === 'paid' || item.status === 'received') && isMatch;
    }
    return (item.status === 'pending' || item.status === 'partial') && isMatch;
  });

  const renderList = (type) => {
    const listItems = filteredItems.filter(item => item.type === type);
    
    return (
      <div className="space-y-3">
        {listItems.length > 0 ? listItems.map((item, index) => {
          const remaining = item.amount - item.paid_amount;
          const isOverdue = new Date(item.due_date) < new Date() && item.status === 'pending';
          
          return (
            <motion.div 
              key={item.id} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: index * 0.05 }} 
              onClick={(e) => handleCardClick(item, e)}
              className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all duration-200 group cursor-pointer active:scale-[0.99]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    type === 'receivable' ? 'bg-emerald-100' : 'bg-red-100'
                  }`}>
                    {type === 'receivable' ? (
                      <TrendingUp className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <TrendingDown className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-700">{item.description}</h4>
                    <div className="flex items-center flex-wrap gap-x-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {item.categories?.name || 'N/A'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Vence: {new Date(item.due_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      isOverdue ? 'text-red-600' : 
                      (type === 'receivable' ? 'text-emerald-600' : 'text-slate-700')
                    }`}>
                      R$ {parseFloat(item.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    {item.status === 'partial' && (
                      <p className="text-xs text-slate-500">
                        Restante: R$ {remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    )}
                  </div>
                  {getStatusBadge(item)}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 opacity-50 group-hover:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {item.status !== 'paid' && item.status !== 'received' && (
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleOpenPaymentModal(item); }}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          {type === 'payable' ? 'Pagar' : 'Receber'}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleShowHistory(item.id); }}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Pagamentos
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(item); }}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Editar Conta
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={(e) => { e.stopPropagation(); setItemToDelete(item); setShowDeleteAlert(true); }}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir Conta
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </motion.div>
          );
        }) : (
          <p className="text-slate-500 text-center py-4">Nenhuma conta para exibir.</p>
        )}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Contas a Pagar e Receber</h2>
        <Button 
          onClick={() => { resetForm(); setShowForm(true); }} 
          className="bg-lime-500 hover:bg-lime-600 text-white"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nova Conta
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Buscar por descrição ou categoria..." 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500" 
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="paid">Liquidadas</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4">
          {loading ? (
            <div className="text-center py-12">Carregando...</div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3 text-red-600">A Pagar</h3>
                {renderList('payable')}
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3 text-emerald-600">A Receber</h3>
                {renderList('receivable')}
              </div>
            </div>
          )}
        </TabsContent>
        <TabsContent value="paid" className="mt-4">
          {loading ? (
            <div className="text-center py-12">Carregando...</div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3 text-slate-600">Contas Pagas</h3>
                {renderList('payable')}
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3 text-slate-600">Contas Recebidas</h3>
                {renderList('receivable')}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Action Modal (Floating Window) */}
      <Dialog open={showActionOptions} onOpenChange={setShowActionOptions}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-center">Opções da Conta</DialogTitle>
            <DialogDescription className="text-center">
               {actionItem?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
             {actionItem?.status !== 'paid' && actionItem?.status !== 'received' && (
                <Button 
                    onClick={() => { setShowActionOptions(false); handleOpenPaymentModal(actionItem); }}
                    className="bg-lime-500 hover:bg-lime-600 text-white h-12 text-lg"
                >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    {actionItem?.type === 'payable' ? 'Registrar Pagamento' : 'Registrar Recebimento'}
                </Button>
             )}
             
             <Button variant="outline" onClick={() => { setShowActionOptions(false); handleShowHistory(actionItem.id); }} className="h-12 text-base justify-start pl-4">
                 <Eye className="w-5 h-5 mr-3" />
                 Ver Histórico de Pagamentos
             </Button>
             
             <Button variant="outline" onClick={() => { setShowActionOptions(false); handleEdit(actionItem); }} className="h-12 text-base justify-start pl-4">
                 <Edit2 className="w-5 h-5 mr-3" />
                 Editar Detalhes da Conta
             </Button>
             
             <Button 
                variant="ghost" 
                onClick={() => { setItemToDelete(actionItem); setShowDeleteAlert(true); }}
                className="h-12 text-base text-red-600 hover:text-red-700 hover:bg-red-50 justify-start pl-4"
             >
                 <Trash2 className="w-5 h-5 mr-3" />
                 Excluir Conta
             </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog (Global) */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta ação não pode ser desfeita e excluirá a conta "{itemToDelete?.description}" permanentemente.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                    Excluir
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {itemToPay?.type === 'payable' ? 'Registrar Pagamento' : 'Registrar Recebimento'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do {itemToPay?.type === 'payable' ? 'pagamento' : 'recebimento'}
            </DialogDescription>
          </DialogHeader>
          
          {itemToPay && (
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Descrição:</span>
                  <span className="font-semibold">{itemToPay.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Valor Total:</span>
                  <span className="font-bold text-slate-800">
                    R$ {parseFloat(itemToPay.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Pago até agora:</span>
                  <span className="font-semibold text-emerald-600">
                    R$ {parseFloat(itemToPay.paid_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="text-sm text-slate-600">Restante:</span>
                  <span className="font-bold text-red-600">
                    R$ {(itemToPay.amount - itemToPay.paid_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Valor do Pagamento *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={paymentFormData.amount}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Carteira *</label>
                <select
                  value={paymentFormData.wallet_id}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, wallet_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
                  required
                >
                  <option value="">Selecione uma carteira</option>
                  {wallets.map(wallet => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.name} - R$ {parseFloat(wallet.balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Data do Pagamento *</label>
                <Input
                  type="date"
                  value={paymentFormData.payment_date}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, payment_date: e.target.value })}
                  required
                />
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetPaymentForm}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-lime-500 hover:bg-lime-600 text-white"
                >
                  Confirmar {itemToPay.type === 'payable' ? 'Pagamento' : 'Recebimento'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment History Modal */}
      <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Histórico de Pagamentos</DialogTitle>
            <DialogDescription>
              {itemToPay?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {paymentHistory.length > 0 ? (
              paymentHistory.map((payment, index) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-slate-50 p-4 rounded-lg flex justify-between items-center border border-slate-100"
                >
                  <div className="space-y-1">
                    <p className="font-bold text-slate-700">
                      R$ {parseFloat(payment.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-slate-600 flex items-center gap-1">
                      <Wallet className="w-3 h-3" />
                      {payment.wallets?.name || 'Carteira não encontrada'}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(payment.payment_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Pagamento?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação reverterá o pagamento e atualizará o saldo da carteira.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeletePayment(payment)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-200 rounded-lg">
                <p>Nenhum pagamento registrado ainda.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Form Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Editar Conta' : 'Nova Conta'}
            </DialogTitle>
            <DialogDescription>
              {editingItem ? 'Faça as alterações necessárias nos dados da conta.' : 'Preencha os dados para criar uma nova conta.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
                required
              >
                <option value="payable">A Pagar</option>
                <option value="receivable">A Receber</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição *</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: Aluguel, Venda de produto"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Valor *</label>
              <Input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Data de Vencimento *</label>
              <Input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Carteira *</label>
              <select
                value={formData.wallet_id}
                onChange={(e) => setFormData({ ...formData, wallet_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
                required
              >
                <option value="">Selecione uma carteira</option>
                {wallets.map(wallet => (
                  <option key={wallet.id} value={wallet.id}>{wallet.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria *</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
                required
              >
                <option value="">Selecione uma categoria</option>
                {categories
                  .filter(cat => cat.type === (formData.type === 'payable' ? 'expense' : 'income'))
                  .map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
              </select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-lime-500 hover:bg-lime-600 text-white">
                {editingItem ? 'Salvar Alterações' : 'Adicionar Conta'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PayablesReceivablesManager;