
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Milk, Calendar, GitCommit, Users, Clock, Droplets, Divide, DollarSign, User, Package, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const MilkProductionForm = ({ user, cows, lots, onFormSubmit, onCancel }) => {
  const { toast } = useToast();
  const [type, setType] = useState('individual');
  const [formData, setFormData] = useState({
    animal_id: '',
    lot_id: '',
    event_date: new Date().toISOString().split('T')[0],
    quantity: '',
    shift: '',
    details: { notes: '' }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.event_date || !formData.quantity) {
      toast({ title: "Erro", description: "Data e Quantidade são obrigatórios.", variant: "destructive" });
      return;
    }
    if (type === 'individual' && !formData.animal_id) {
      toast({ title: "Erro", description: "Selecione uma vaca.", variant: "destructive" });
      return;
    }
    if (type === 'lote' && !formData.lot_id) {
      toast({ title: "Erro", description: "Selecione um lote.", variant: "destructive" });
      return;
    }
    onFormSubmit({ 
        ...formData, 
        event_type: 'producao_leite', 
        animal_id: type === 'lote' ? null : formData.animal_id,
        lot_id: type === 'individual' ? null : formData.lot_id,
    });
  };

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="chart-container">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-slate-700">Registrar Produção de Leite</h3>
        <Button variant="ghost" size="icon" onClick={onCancel}><X className="w-5 h-5" /></Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex space-x-2 p-1 bg-slate-100 rounded-lg">
          <Button type="button" onClick={() => setType('individual')} className={`flex-1 ${type === 'individual' ? 'btn-primary' : 'bg-transparent text-slate-600 hover:bg-white'}`}>Individual</Button>
          <Button type="button" onClick={() => setType('lote')} className={`flex-1 ${type === 'lote' ? 'btn-primary' : 'bg-transparent text-slate-600 hover:bg-white'}`}>Por Lote</Button>
        </div>

        {type === 'individual' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Vaca</label>
            <select value={formData.animal_id} onChange={(e) => setFormData(p => ({ ...p, animal_id: e.target.value, lot_id: '' }))} className="input-field" required>
              <option value="">Selecione a vaca</option>
              {cows.map(cow => (
                <option key={cow.id} value={cow.id}>Brinco: {cow.ear_tag_id} ({cow.breed})</option>
              ))}
            </select>
          </div>
        )}
        
        {type === 'lote' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Lote</label>
            <select value={formData.lot_id} onChange={(e) => setFormData(p => ({ ...p, lot_id: e.target.value, animal_id: '' }))} className="input-field" required>
              <option value="">Selecione o lote</option>
              {lots.map(lot => (
                <option key={lot.id} value={lot.id}>{lot.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Data da Produção</label>
            <input type="date" value={formData.event_date} onChange={(e) => setFormData(p => ({ ...p, event_date: e.target.value }))} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Quantidade (Litros)</label>
            <input type="number" step="0.1" value={formData.quantity} onChange={(e) => setFormData(p => ({ ...p, quantity: e.target.value }))} placeholder="Ex: 15.5" className="input-field" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Turno (Opcional)</label>
          <select value={formData.shift} onChange={(e) => setFormData(p => ({ ...p, shift: e.target.value }))} className="input-field">
            <option value="">Selecione o turno</option>
            <option value="manha">Manhã</option>
            <option value="tarde">Tarde</option>
            <option value="noite">Noite</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Observações</label>
          <textarea value={formData.details.notes} onChange={(e) => setFormData(p => ({ ...p, details: { notes: e.target.value } }))} rows="2" className="input-field"></textarea>
        </div>
        <div className="flex space-x-3 pt-4">
          <Button type="submit" className="btn-primary">Salvar Produção</Button>
          <Button type="button" onClick={onCancel} className="px-6 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all">Cancelar</Button>
        </div>
      </form>
    </motion.div>
  );
};

const MilkSaleForm = ({ user, onSaleSubmit, onCancel, totalProductionMonth, wallets, categories }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    sale_date: new Date().toISOString().split('T')[0],
    buyer: '',
    liters_sold: totalProductionMonth.toFixed(2),
    price_per_liter: '',
    payment_method: 'pix',
    destination_wallet_id: '',
    installments: 1,
  });

  const totalValue = (parseFloat(formData.liters_sold) || 0) * (parseFloat(formData.price_per_liter) || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.liters_sold || !formData.price_per_liter) {
      toast({ title: "Erro", description: "Quantidade e preço são obrigatórios.", variant: "destructive" });
      return;
    }
    if (formData.payment_method !== 'a_prazo' && !formData.destination_wallet_id) {
      toast({ title: "Erro", description: "Selecione uma carteira de destino.", variant: "destructive" });
      return;
    }
    onSaleSubmit({ ...formData, total_value: totalValue });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800">Registrar Venda de Leite</h3>
          <Button variant="ghost" size="icon" onClick={onCancel}><X className="w-5 h-5" /></Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-2">Data da Venda</label><input type="date" value={formData.sale_date} onChange={e => setFormData(p => ({ ...p, sale_date: e.target.value }))} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-2">Comprador</label><input type="text" value={formData.buyer} onChange={e => setFormData(p => ({ ...p, buyer: e.target.value }))} placeholder="Ex: Laticínios Bom Sabor" className="input-field" /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-2">Quantidade (Litros)</label><input type="number" step="0.01" value={formData.liters_sold} onChange={e => setFormData(p => ({ ...p, liters_sold: e.target.value }))} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-2">Preço por Litro (R$)</label><input type="number" step="0.01" value={formData.price_per_liter} onChange={e => setFormData(p => ({ ...p, price_per_liter: e.target.value }))} placeholder="Ex: 2.50" className="input-field" required /></div>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <p className="text-sm text-blue-700">Valor Total da Venda</p>
            <p className="text-2xl font-bold text-blue-800">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Forma de Pagamento</label>
            <select value={formData.payment_method} onChange={e => setFormData(p => ({ ...p, payment_method: e.target.value }))} className="input-field">
              {wallets.filter(w => w.type !== 'credit').map(w => <option key={w.id} value={w.type}>{w.name}</option>)}
              <option value="a_prazo">A Prazo</option>
            </select>
          </div>
          {formData.payment_method !== 'a_prazo' ? (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Carteira de Destino</label>
              <select value={formData.destination_wallet_id} onChange={e => setFormData(p => ({ ...p, destination_wallet_id: e.target.value }))} className="input-field" required>
                <option value="">Selecione a carteira</option>
                {wallets.filter(w => w.type !== 'credit').map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Número de Parcelas</label>
              <input type="number" min="1" value={formData.installments} onChange={e => setFormData(p => ({ ...p, installments: e.target.value }))} className="input-field" />
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <Button onClick={onCancel} className="w-full bg-slate-200 text-slate-700 hover:bg-slate-300">Cancelar</Button>
            <Button type="submit" className="w-full btn-primary">Confirmar Venda</Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const MilkProductionList = ({ user, onDataChange }) => {
  const { toast } = useToast();
  const [productions, setProductions] = useState([]);
  const [livestock, setLivestock] = useState([]);
  const [lots, setLots] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [period, setPeriod] = useState('month');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [productionsRes, livestockRes, lotsRes, walletsRes, categoriesRes] = await Promise.all([
      supabase.from('livestock_events').select('*, animal:animal_id(ear_tag_id, breed)').eq('user_id', user.id).eq('event_type', 'producao_leite').order('event_date', { ascending: false }),
      supabase.from('livestock').select('*').eq('user_id', user.id),
      supabase.from('livestock_lots').select('*').eq('user_id', user.id),
      supabase.from('wallets').select('*').eq('user_id', user.id),
      supabase.from('categories').select('*').eq('user_id', user.id),
    ]);

    if (productionsRes.error) toast({ title: "Erro", description: "Não foi possível carregar as produções.", variant: "destructive" });
    else {
      // Map lot names manually since livestock_events -> lots relationship might differ depending on schema
      const loadedLots = lotsRes.data || [];
      const mappedProductions = (productionsRes.data || []).map(p => {
        const lotInfo = p.lot_id ? loadedLots.find(l => l.id === p.lot_id) : null;
        return { ...p, lot: lotInfo };
      });
      setProductions(mappedProductions);
    }

    if (livestockRes.error) toast({ title: "Erro", description: "Não foi possível carregar o rebanho.", variant: "destructive" });
    else setLivestock(livestockRes.data);
    
    if (lotsRes.error) toast({ title: "Erro", description: "Não foi possível carregar os lotes.", variant: "destructive" });
    else setLots(lotsRes.data);

    if (walletsRes.error) toast({ title: "Erro", description: "Não foi possível carregar as carteiras.", variant: "destructive" });
    else setWallets(walletsRes.data);

    if (categoriesRes.error) toast({ title: "Erro", description: "Não foi possível carregar as categorias.", variant: "destructive" });
    else setCategories(categoriesRes.data);

    setLoading(false);
  }, [user.id, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFormSubmit = async (productionData) => {
    const { error } = await supabase.from('livestock_events').insert({ ...productionData, user_id: user.id, quantity: productionData.quantity });

    if (error) {
      toast({ title: "Erro ao registrar produção", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso!", description: "Produção de leite registrada." });
      setShowForm(false);
      fetchData();
      if (onDataChange) onDataChange();
    }
  };

  const handleSaleSubmit = async (saleData) => {
    const saleCategory = categories.find(c => c.name === 'Venda de Leite' && c.type === 'income');
    if (!saleCategory) {
      toast({ title: "Erro", description: "Categoria 'Venda de Leite' não encontrada. Crie-a na tela de Categorias.", variant: "destructive" });
      return;
    }

    let transaction_id = null;
    let payable_receivable_id = null;

    if (saleData.payment_method === 'a_prazo') {
      const installments = parseInt(saleData.installments) || 1;
      const installmentValue = saleData.total_value / installments;
      const receivablesToInsert = [];
      const installmentGroupId = crypto.randomUUID();
      const originalDueDate = new Date(saleData.sale_date + 'T00:00:00');

      for (let i = 0; i < installments; i++) {
        const dueDate = new Date(originalDueDate);
        dueDate.setMonth(originalDueDate.getMonth() + i + 1);
        receivablesToInsert.push({
          user_id: user.id,
          type: 'receivable',
          description: `Parcela ${i + 1}/${installments} - Venda de Leite para ${saleData.buyer || 'N/A'}`,
          amount: installmentValue,
          due_date: dueDate.toISOString().split('T')[0],
          category_id: saleCategory.id,
          status: 'pending',
          paid_amount: 0,
          installment_group_id: installmentGroupId,
        });
      }
      const { data: prData, error: prError } = await supabase.from('payables_receivables').insert(receivablesToInsert).select().single();
      if (prError) {
        toast({ title: "Erro ao criar contas a receber", description: prError.message, variant: "destructive" });
        return;
      }
      payable_receivable_id = prData.id;
    } else {
      const { data: txData, error: txError } = await supabase.from('transactions').insert({
        user_id: user.id,
        wallet_id: saleData.destination_wallet_id,
        type: 'income',
        amount: saleData.total_value,
        description: `Venda de ${saleData.liters_sold}L de leite para ${saleData.buyer || 'N/A'}`,
        category_id: saleCategory.id,
        date: saleData.sale_date,
      }).select().single();

      if (txError) {
        toast({ title: "Erro ao criar transação", description: txError.message, variant: "destructive" });
        return;
      }
      transaction_id = txData.id;

      const wallet = wallets.find(w => w.id === parseInt(saleData.destination_wallet_id));
      const newBalance = parseFloat(wallet.balance) + saleData.total_value;
      await supabase.from('wallets').update({ balance: newBalance }).eq('id', wallet.id);
    }

    const { error: saleError } = await supabase.from('milk_sales').insert({
      user_id: user.id,
      sale_date: saleData.sale_date,
      buyer: saleData.buyer,
      liters_sold: saleData.liters_sold,
      price_per_liter: saleData.price_per_liter,
      total_value: saleData.total_value,
      payment_method: saleData.payment_method,
      destination_wallet_id: saleData.destination_wallet_id || null,
      transaction_id,
      payable_receivable_id,
    });

    if (saleError) {
      toast({ title: "Erro ao registrar venda", description: saleError.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso!", description: "Venda de leite registrada com sucesso." });
      setShowSaleForm(false);
      fetchData();
      if (onDataChange) onDataChange();
    }
  };

  const cows = livestock.filter(animal => animal.sex === 'femea' && animal.status === 'ativo');

  const getFilteredProductions = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (period === 'today') {
      return productions.filter(p => new Date(p.event_date + 'T00:00:00').getTime() >= today.getTime());
    }
    if (period === 'week') {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      return productions.filter(p => new Date(p.event_date + 'T00:00:00').getTime() >= weekStart.getTime());
    }
    if (period === 'month') {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      return productions.filter(p => new Date(p.event_date + 'T00:00:00').getTime() >= monthStart.getTime());
    }
    return productions;
  };

  const filteredProductions = getFilteredProductions();
  const totalProduction = filteredProductions.reduce((sum, p) => sum + (p.quantity || 0), 0);
  
  const individualProductions = filteredProductions.filter(p => p.animal_id);
  const lotProductions = filteredProductions.filter(p => p.lot_id);

  const producingCowsCount = new Set(individualProductions.map(p => p.animal_id)).size;
  
  const totalCowsInLots = lotProductions.reduce((acc, p) => {
    const cowsInLot = livestock.filter(a => a.lot_id === p.lot_id && a.status === 'ativo').length;
    return acc + cowsInLot;
  }, 0);

  const totalAnimalsForAverage = producingCowsCount + totalCowsInLots;
  const averagePerCow = totalAnimalsForAverage > 0 ? totalProduction / totalAnimalsForAverage : 0;

  const totalProductionMonth = productions
    .filter(p => {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return new Date(p.event_date + 'T00:00:00').getTime() >= monthStart.getTime();
    })
    .reduce((sum, p) => sum + (p.quantity || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Controle de Produção de Leite</h2>
        <div className="flex gap-2">
          <Button onClick={() => setShowSaleForm(true)} className="btn-secondary">
            <DollarSign className="w-5 h-5 mr-2" /> Vender Produção
          </Button>
          <Button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus className="w-5 h-5 mr-2" /> Registrar Produção
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showForm && <MilkProductionForm user={user} cows={cows} lots={lots} onFormSubmit={handleFormSubmit} onCancel={() => setShowForm(false)} />}
        {showSaleForm && <MilkSaleForm user={user} onSaleSubmit={handleSaleSubmit} onCancel={() => setShowSaleForm(false)} totalProductionMonth={totalProductionMonth} wallets={wallets} categories={categories} />}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="chart-container">
            <p className="text-sm text-slate-500">Produção Total no Período</p>
            <p className="text-3xl font-bold text-emerald-600">{totalProduction.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Litros</p>
        </div>
        <div className="chart-container">
            <p className="text-sm text-slate-500">Média por Vaca (Lote + Individual)</p>
            <p className="text-3xl font-bold text-blue-600">{averagePerCow.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} L/vaca</p>
        </div>
      </div>
      
      <div className="chart-container">
        <div className="flex items-center space-x-2 p-1 bg-slate-100 rounded-lg">
            <Button size="sm" onClick={() => setPeriod('today')} className={`flex-1 ${period === 'today' ? 'btn-primary' : 'bg-transparent text-slate-600 hover:bg-white'}`}>Hoje</Button>
            <Button size="sm" onClick={() => setPeriod('week')} className={`flex-1 ${period === 'week' ? 'btn-primary' : 'bg-transparent text-slate-600 hover:bg-white'}`}>Semana</Button>
            <Button size="sm" onClick={() => setPeriod('month')} className={`flex-1 ${period === 'month' ? 'btn-primary' : 'bg-transparent text-slate-600 hover:bg-white'}`}>Mês</Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Carregando...</div>
      ) : filteredProductions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProductions.map((prod) => (
            <motion.div key={prod.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Milk className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-slate-800">{prod.animal ? `Brinco: ${prod.animal.ear_tag_id}` : `Lote: ${prod.lot?.name || 'N/A'}`}</p>
                            <p className="text-sm text-slate-500">{new Date(prod.event_date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                        </div>
                    </div>
                    <p className="text-lg font-bold text-emerald-600">{prod.quantity} L</p>
                </div>
                {(prod.shift || prod.details?.notes) && (
                    <div className="mt-3 pt-3 border-t border-slate-100 text-sm text-slate-500 space-y-1">
                        {prod.shift && <p className="capitalize flex items-center"><Clock className="w-4 h-4 mr-2"/>Turno: {prod.shift}</p>}
                        {prod.details?.notes && <p>Obs: {prod.details.notes}</p>}
                    </div>
                )}
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 chart-container">
          <Milk className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-600 mb-2">Nenhuma produção no período</h3>
          <p className="text-slate-500 mb-6">Altere o filtro ou registre uma nova produção de leite.</p>
          <Button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-5 h-5 mr-2" />Registrar Produção</Button>
        </motion.div>
      )}
    </div>
  );
};

export default MilkProductionList;
