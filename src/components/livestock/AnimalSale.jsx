import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox";
import { DollarSign, Calendar, User, Wallet, Tag, Search, Hash, Dna, VenetianMask } from 'lucide-react';

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
        <p>Valor Total: <span className="font-bold text-emerald-600">R$ {Number(totalValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></p>
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

const AnimalSale = ({ user, onDataChange }) => {
  const { toast } = useToast();
  const [allAnimals, setAllAnimals] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAnimals, setSelectedAnimals] = useState([]);
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  
  const [formData, setFormData] = useState({
    total_value: '',
    unit_value: '',
    sale_date: new Date().toISOString().split('T')[0],
    buyer: '',
    wallet_id: '',
    category_id: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [animalRes, walletRes, catRes] = await Promise.all([
      supabase.from('livestock').select('id, ear_tag_id, breed, sex, birth_date').eq('user_id', user.id).eq('status', 'ativo'),
      supabase.from('wallets').select('id, name, type').eq('user_id', user.id),
      supabase.from('categories').select('id, name').eq('user_id', user.id).eq('type', 'income').eq('status', 'active'),
    ]);

    if (animalRes.error) toast({ title: "Erro", description: "Falha ao buscar animais.", variant: "destructive" });
    else setAllAnimals(animalRes.data);

    if (walletRes.error) toast({ title: "Erro", description: "Falha ao buscar carteiras.", variant: "destructive" });
    else setWallets(walletRes.data);

    if (catRes.error) toast({ title: "Erro", description: "Falha ao buscar categorias.", variant: "destructive" });
    else setCategories(catRes.data);

    setLoading(false);
  }, [user.id, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleValueChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    const quantity = selectedAnimals.length;
    const totalValue = parseFloat(newFormData.total_value) || 0;
    const unitValue = parseFloat(newFormData.unit_value) || 0;

    if (quantity > 0) {
      if (field === 'total_value' && totalValue > 0) {
        newFormData.unit_value = (totalValue / quantity).toFixed(2);
      } else if (field === 'unit_value' && unitValue > 0) {
        newFormData.total_value = (unitValue * quantity).toFixed(2);
      }
    }
    setFormData(newFormData);
  };

  const handleToggleAnimal = (animalId) => {
    const newSelected = selectedAnimals.includes(animalId)
      ? selectedAnimals.filter(id => id !== animalId)
      : [...selectedAnimals, animalId];
    setSelectedAnimals(newSelected);
  };

  const handleWalletChange = (e) => {
    const value = e.target.value;
    setFormData(p => ({ ...p, wallet_id: value }));
    if (value === 'a_prazo') {
      setShowInstallmentModal(true);
    }
  };

  const updateAnimalStatus = async () => {
    const statusDetails = { sale_date: formData.sale_date, sale_value: formData.unit_value, buyer: formData.buyer };
    const { error: animalError } = await supabase.from('livestock').update({ status: 'vendido', status_details: statusDetails }).in('id', selectedAnimals);
    if (animalError) {
      toast({ title: "Erro no Rebanho", description: `Os animais não puderam ser atualizados. ${animalError.message}`, variant: "destructive" });
      return false;
    }
    const saleEvents = selectedAnimals.map(animalId => ({ animal_id: animalId, user_id: user.id, event_type: 'venda', event_date: formData.sale_date, details: statusDetails }));
    await supabase.from('livestock_events').insert(saleEvents);
    return true;
  };

  const resetAndFetch = () => {
    setFormData({ total_value: '', unit_value: '', sale_date: new Date().toISOString().split('T')[0], buyer: '', wallet_id: '', category_id: '' });
    setSelectedAnimals([]);
    fetchData();
    onDataChange();
    setLoading(false);
  };

  const handleInstallmentSubmit = async ({ installments, firstDueDate }) => {
    setShowInstallmentModal(false);
    setLoading(true);

    const { category_id } = formData;
    if (!category_id) {
        toast({ title: "Erro", description: "Por favor, selecione uma categoria para a receita.", variant: "destructive" });
        setLoading(false);
        return;
    }

    if (!await updateAnimalStatus()) {
        setLoading(false);
        return;
    }

    const { total_value } = formData;
    const installmentAmount = parseFloat(total_value) / installments;

    const receivables = [];
    const installmentGroupId = crypto.randomUUID();
    for (let i = 0; i < installments; i++) {
        const dueDate = new Date(firstDueDate);
        dueDate.setMonth(dueDate.getMonth() + i);
        receivables.push({
            user_id: user.id, type: 'receivable',
            description: `Parcela ${i + 1}/${installments} - Venda de ${selectedAnimals.length} animal(is)`,
            amount: installmentAmount, due_date: dueDate.toISOString().split('T')[0],
            wallet_id: wallets[0].id, category_id, status: 'pending', paid_amount: 0,
            installment_group_id: installmentGroupId
        });
    }

    const { error: receivablesError } = await supabase.from('payables_receivables').insert(receivables);

    if (receivablesError) {
        toast({ title: "Erro no Parcelamento", description: `Venda registrada, mas falha ao criar parcelas: ${receivablesError.message}`, variant: "destructive" });
    } else {
        toast({ title: "Sucesso!", description: `Venda registrada e ${installments} contas a receber foram criadas.` });
    }
    
    resetAndFetch();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { total_value, sale_date, wallet_id, category_id } = formData;

    if (selectedAnimals.length === 0) {
      toast({ title: "Erro", description: "Selecione pelo menos um animal para vender.", variant: "destructive" });
      return;
    }
    if (!total_value || !sale_date || !wallet_id || !category_id) {
      toast({ title: "Erro", description: "Preencha todos os campos de venda.", variant: "destructive" });
      return;
    }
    
    if (wallet_id === 'a_prazo') {
        setShowInstallmentModal(true);
        return;
    }

    setLoading(true);

    if (!await updateAnimalStatus()) {
        setLoading(false);
        return;
    }

    const { error: transactionError } = await supabase.from('transactions').insert({
      user_id: user.id, wallet_id, type: 'income', amount: total_value,
      description: `Venda de ${selectedAnimals.length} animal(is)`, category_id, date: sale_date,
    });

    if (transactionError) {
      toast({ title: "Erro Financeiro", description: transactionError.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    
    const destWallet = wallets.find(w => w.id == wallet_id);
    if (destWallet && destWallet.type !== 'credit') {
        const { data: walletData } = await supabase.from('wallets').select('balance').eq('id', wallet_id).single();
        const newBalance = parseFloat(walletData.balance) + parseFloat(total_value);
        await supabase.from('wallets').update({ balance: newBalance }).eq('id', wallet_id);
    }

    toast({ title: "Sucesso!", description: `${selectedAnimals.length} animal(is) vendido(s) com sucesso. Lançamento de receita criado.` });
    resetAndFetch();
  };

  const getAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let ageYears = today.getFullYear() - birth.getFullYear();
    let ageMonths = today.getMonth() - birth.getMonth();
    if (ageMonths < 0 || (ageMonths === 0 && today.getDate() < birth.getDate())) {
        ageYears--;
        ageMonths += 12;
    }
    return `${ageYears}a ${ageMonths}m`;
  };

  const filteredAnimals = allAnimals.filter(animal =>
    animal.ear_tag_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <DollarSign className="w-8 h-8 text-emerald-600" />
        <h2 className="text-2xl font-bold text-slate-800">Registrar Venda de Animais</h2>
      </div>

      <motion.form onSubmit={handleSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 chart-container flex flex-col">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">1. Selecione os Animais</h3>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Buscar por brinco..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input-field pl-10" />
          </div>
          <div className="flex-grow overflow-y-auto space-y-2 pr-2 border rounded-lg p-2">
            {loading ? <p>Carregando...</p> : filteredAnimals.map(animal => (
              <div key={animal.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-slate-50">
                <Checkbox id={`animal-${animal.id}`} checked={selectedAnimals.includes(animal.id)} onCheckedChange={() => handleToggleAnimal(animal.id)} className="mt-1"/>
                <label htmlFor={`animal-${animal.id}`} className="flex-grow">
                  <p className="font-semibold text-slate-800 flex items-center"><Hash className="w-4 h-4 mr-1 text-slate-400" /> {animal.ear_tag_id}</p>
                  <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                    <p className="flex items-center"><Dna className="w-3 h-3 mr-1.5 text-slate-400" />{animal.breed || 'N/A'}</p>
                    <p className="flex items-center capitalize"><VenetianMask className="w-3 h-3 mr-1.5 text-slate-400" />{animal.sex} - {getAge(animal.birth_date)}</p>
                  </div>
                </label>
              </div>
            ))}
            {!loading && filteredAnimals.length === 0 && <p className="text-sm text-slate-500 text-center py-4">Nenhum animal ativo encontrado.</p>}
          </div>
          <p className="text-sm text-slate-600 mt-2 font-medium">{selectedAnimals.length} animal(is) selecionado(s).</p>
        </div>

        <div className="lg:col-span-2 chart-container space-y-6">
          <h3 className="text-lg font-semibold text-slate-700">2. Detalhes da Venda</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <label className="flex items-center text-sm font-medium text-slate-700 mb-2"><Calendar className="w-4 h-4 mr-2" /> Data da Venda*</label>
              <input type="date" value={formData.sale_date} onChange={(e) => setFormData(p => ({ ...p, sale_date: e.target.value }))} className="input-field" required />
            </div>
            <div>
              <label className="flex items-center text-sm font-medium text-slate-700 mb-2"><User className="w-4 h-4 mr-2" /> Comprador</label>
              <input type="text" value={formData.buyer} onChange={(e) => setFormData(p => ({ ...p, buyer: e.target.value }))} placeholder="Nome do comprador" className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center text-sm font-medium text-slate-700 mb-2"><Wallet className="w-4 h-4 mr-2" /> Carteira de Destino*</label>
              <select value={formData.wallet_id} onChange={handleWalletChange} className="input-field" required>
                <option value="">Selecione</option>
                {wallets.filter(w => w.type !== 'credit').map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                <option value="a_prazo">A Prazo (Gerar Contas a Receber)</option>
              </select>
            </div>
            <div>
              <label className="flex items-center text-sm font-medium text-slate-700 mb-2"><Tag className="w-4 h-4 mr-2" /> Categoria da Receita*</label>
              <select value={formData.category_id} onChange={(e) => setFormData(p => ({ ...p, category_id: e.target.value }))} className="input-field" required>
                <option value="">Selecione</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={loading} className="btn-primary w-full md:w-auto">
              {loading ? 'Registrando...' : 'Registrar Venda'}
            </Button>
          </div>
        </div>
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

export default AnimalSale;