import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { ShoppingCart, DollarSign, Hash, Calendar, MapPin, User, FileText, Wallet, Tag } from 'lucide-react';

const InstallmentModal = ({ isOpen, onClose, onSubmit, totalValue }) => {
  const [installments, setInstallments] = useState(1);
  const [firstDueDate, setFirstDueDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (installments < 1) {
      alert("O número de parcelas deve ser ao menos 1.");
      return;
    }
    onSubmit({ installments, firstDueDate });
  };

  const installmentValue = totalValue > 0 && installments > 0 ? (totalValue / installments).toFixed(2) : '0.00';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
        <h3 className="text-xl font-bold text-slate-800">Configurar Parcelamento</h3>
        <p>Valor Total: <span className="font-bold text-red-600">R$ {Number(totalValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></p>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Número de Parcelas</label>
          <input type="number" min="1" value={installments} onChange={e => setInstallments(parseInt(e.target.value, 10))} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Vencimento da 1ª Parcela</label>
          <input type="date" value={firstDueDate} onChange={e => setFirstDueDate(e.target.value)} className="input-field" />
        </div>
        <div className="p-3 bg-slate-50 rounded-lg text-center">
          <p className="text-slate-600">{installments}x de <span className="font-bold text-slate-800">R$ {Number(installmentValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></p>
        </div>
        <div className="flex gap-3 pt-4">
          <Button onClick={onClose} className="w-full bg-slate-200 text-slate-700 hover:bg-slate-300">Cancelar</Button>
          <Button onClick={handleSubmit} className="w-full btn-primary">Confirmar Parcelamento</Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const AnimalPurchase = ({ user, onDataChange }) => {
  const { toast } = useToast();
  const [properties, setProperties] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const [formData, setFormData] = useState({
    quantity: 1,
    total_value: '',
    unit_value: '',
    purchase_date: new Date().toISOString().split('T')[0],
    supplier: '',
    property_id: '',
    wallet_id: '',
    category_id: '',
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [propRes, walletRes, catRes] = await Promise.all([
        supabase.from('properties').select('id, name').eq('user_id', user.id),
        supabase.from('wallets').select('id, name, type').eq('user_id', user.id),
        supabase.from('categories').select('id, name').eq('user_id', user.id).eq('type', 'expense').eq('status', 'active'),
      ]);

      if (propRes.error) toast({ title: "Erro", description: "Falha ao buscar propriedades.", variant: "destructive" });
      else setProperties(propRes.data);

      if (walletRes.error) toast({ title: "Erro", description: "Falha ao buscar carteiras.", variant: "destructive" });
      else setWallets(walletRes.data);
      
      if (catRes.error) toast({ title: "Erro", description: "Falha ao buscar categorias.", variant: "destructive" });
      else setCategories(catRes.data);

      setLoading(false);
    };
    fetchData();
  }, [user.id, toast]);

  const handleValueChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    const quantity = parseFloat(newFormData.quantity) || 0;
    const totalValue = parseFloat(newFormData.total_value) || 0;
    const unitValue = parseFloat(newFormData.unit_value) || 0;

    if (quantity > 0) {
      if (field === 'total_value' && totalValue > 0) {
        newFormData.unit_value = (totalValue / quantity).toFixed(2);
      } else if (field === 'unit_value' && unitValue > 0) {
        newFormData.total_value = (unitValue * quantity).toFixed(2);
      } else if (field === 'quantity' && quantity > 0) {
        if (unitValue > 0) {
          newFormData.total_value = (unitValue * quantity).toFixed(2);
        } else if (totalValue > 0) {
          newFormData.unit_value = (totalValue / quantity).toFixed(2);
        }
      }
    }
    setFormData(newFormData);
  };

  const handleWalletChange = (e) => {
    const value = e.target.value;
    setFormData(p => ({ ...p, wallet_id: value }));
    if (value === 'a_prazo') {
      setShowInstallmentModal(true);
    }
  };

  const createAnimals = async () => {
    const { quantity, purchase_date, property_id, supplier, unit_value } = formData;
    const animalsToCreate = Array.from({ length: quantity }, () => ({
      user_id: user.id,
      ear_tag_id: `COMPRA-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase(),
      status: 'ativo',
      property_id,
      notes: `Comprado em ${new Date(purchase_date).toLocaleDateString('pt-BR')}. Fornecedor: ${supplier || 'N/A'}. Valor: R$ ${unit_value}`,
    }));

    const { data: newAnimals, error: animalError } = await supabase.from('livestock').insert(animalsToCreate).select();

    if (animalError) {
      toast({ title: "Erro no Rebanho", description: `Os animais não puderam ser criados. ${animalError.message}`, variant: "destructive" });
      return null;
    }

    const purchaseEvents = newAnimals.map(animal => ({
        animal_id: animal.id, user_id: user.id, event_type: 'compra', event_date: purchase_date,
        details: { supplier, unit_value, total_value: formData.total_value, quantity, notes: formData.notes }
    }));
    await supabase.from('livestock_events').insert(purchaseEvents);
    
    return newAnimals;
  };

  const handleInstallmentSubmit = async ({ installments, firstDueDate }) => {
    setShowInstallmentModal(false);
    setLoading(true);

    const { category_id } = formData;
    if (!category_id) {
        toast({ title: "Erro", description: "Por favor, selecione uma categoria para a despesa.", variant: "destructive" });
        setLoading(false);
        return;
    }

    const newAnimals = await createAnimals();
    if (!newAnimals) {
        setLoading(false);
        return;
    }

    const { total_value, quantity } = formData;
    const installmentAmount = parseFloat(total_value) / installments;

    const payables = [];
    const installmentGroupId = crypto.randomUUID();
    for (let i = 0; i < installments; i++) {
        const dueDate = new Date(firstDueDate);
        dueDate.setMonth(dueDate.getMonth() + i);
        payables.push({
            user_id: user.id, type: 'payable',
            description: `Parcela ${i + 1}/${installments} - Compra de ${quantity} animal(is)`,
            amount: installmentAmount, due_date: dueDate.toISOString().split('T')[0],
            wallet_id: wallets[0].id, category_id, status: 'pending', paid_amount: 0,
            installment_group_id: installmentGroupId
        });
    }

    const { error: payablesError } = await supabase.from('payables_receivables').insert(payables);

    if (payablesError) {
        toast({ title: "Erro no Parcelamento", description: `Animais criados, mas falha ao gerar parcelas: ${payablesError.message}`, variant: "destructive" });
    } else {
        toast({ title: "Sucesso!", description: `${quantity} animal(is) comprado(s) e ${installments} contas a pagar foram criadas.` });
    }
    
    resetAndFetch();
  };

  const resetAndFetch = () => {
    setFormData({
      quantity: 1, total_value: '', unit_value: '', purchase_date: new Date().toISOString().split('T')[0],
      supplier: '', property_id: '', wallet_id: '', category_id: '', notes: '',
    });
    onDataChange();
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { quantity, total_value, purchase_date, property_id, wallet_id, category_id } = formData;

    if (!quantity || !total_value || !purchase_date || !property_id || !wallet_id || !category_id) {
      toast({ title: "Erro", description: "Preencha todos os campos obrigatórios.", variant: "destructive" });
      return;
    }
    
    if (wallet_id === 'a_prazo') {
        setShowInstallmentModal(true);
        return;
    }

    setLoading(true);

    const newAnimals = await createAnimals();
    if (!newAnimals) {
        setLoading(false);
        return;
    }

    const { error: transactionError } = await supabase.from('transactions').insert({
      user_id: user.id, wallet_id, type: 'expense', amount: total_value,
      description: `Compra de ${quantity} animal(is)`, category_id, date: purchase_date,
    });

    if (transactionError) {
      toast({ title: "Erro Financeiro", description: transactionError.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    
    const sourceWallet = wallets.find(w => w.id == wallet_id);
    if (sourceWallet && sourceWallet.type !== 'credit') {
        const { data: walletData } = await supabase.from('wallets').select('balance').eq('id', wallet_id).single();
        const newBalance = parseFloat(walletData.balance) - parseFloat(total_value);
        await supabase.from('wallets').update({ balance: newBalance }).eq('id', wallet_id);
    }

    toast({ title: "Sucesso!", description: `${quantity} animal(is) comprado(s) e adicionado(s) ao rebanho. Lançamento financeiro criado.` });
    resetAndFetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <ShoppingCart className="w-8 h-8 text-emerald-600" />
        <h2 className="text-2xl font-bold text-slate-800">Registrar Compra de Animais</h2>
      </div>

      <motion.form onSubmit={handleSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="chart-container space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="flex items-center text-sm font-medium text-slate-700 mb-2"><Hash className="w-4 h-4 mr-2" /> Quantidade*</label>
            <input type="number" min="1" value={formData.quantity} onChange={(e) => handleValueChange('quantity', e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="flex items-center text-sm font-medium text-slate-700 mb-2"><DollarSign className="w-4 h-4 mr-2" /> Valor Total (R$)*</label>
            <input type="number" step="0.01" value={formData.total_value} onChange={(e) => handleValueChange('total_value', e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="flex items-center text-sm font-medium text-slate-700 mb-2"><DollarSign className="w-4 h-4 mr-2" /> Valor Unitário (R$)</label>
            <input type="number" step="0.01" value={formData.unit_value} onChange={(e) => handleValueChange('unit_value', e.target.value)} className="input-field" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center text-sm font-medium text-slate-700 mb-2"><Calendar className="w-4 h-4 mr-2" /> Data da Compra*</label>
            <input type="date" value={formData.purchase_date} onChange={(e) => setFormData(p => ({ ...p, purchase_date: e.target.value }))} className="input-field" required />
          </div>
          <div>
            <label className="flex items-center text-sm font-medium text-slate-700 mb-2"><User className="w-4 h-4 mr-2" /> Fornecedor</label>
            <input type="text" value={formData.supplier} onChange={(e) => setFormData(p => ({ ...p, supplier: e.target.value }))} placeholder="Nome do vendedor" className="input-field" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="flex items-center text-sm font-medium text-slate-700 mb-2"><MapPin className="w-4 h-4 mr-2" /> Propriedade de Destino*</label>
            <select value={formData.property_id} onChange={(e) => setFormData(p => ({ ...p, property_id: e.target.value }))} className="input-field" required>
              <option value="">Selecione</option>
              {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="flex items-center text-sm font-medium text-slate-700 mb-2"><Wallet className="w-4 h-4 mr-2" /> Forma de Pagamento*</label>
            <select value={formData.wallet_id} onChange={handleWalletChange} className="input-field" required>
              <option value="">Selecione</option>
              {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              <option value="a_prazo">A Prazo (Gerar Contas a Pagar)</option>
            </select>
          </div>
          <div>
            <label className="flex items-center text-sm font-medium text-slate-700 mb-2"><Tag className="w-4 h-4 mr-2" /> Categoria da Despesa*</label>
            <select value={formData.category_id} onChange={(e) => setFormData(p => ({ ...p, category_id: e.target.value }))} className="input-field" required>
              <option value="">Selecione</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        
        <div>
          <label className="flex items-center text-sm font-medium text-slate-700 mb-2"><FileText className="w-4 h-4 mr-2" /> Observações</label>
          <textarea value={formData.notes} onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))} rows="3" className="input-field"></textarea>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading} className="btn-primary w-full md:w-auto">
            {loading ? 'Registrando...' : 'Registrar Compra'}
          </Button>
        </div>
        <p className="text-xs text-slate-500 text-center">Ao registrar, os animais serão adicionados ao rebanho com um brinco temporário.</p>
      </motion.form>
      <InstallmentModal 
        isOpen={showInstallmentModal}
        onClose={() => setShowInstallmentModal(false)}
        onSubmit={handleInstallmentSubmit}
        totalValue={formData.total_value}
      />
    </div>
  );
};

export default AnimalPurchase;