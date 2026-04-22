import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Beaker, Edit2, Trash2, Calendar, Package, DollarSign, User, Wheat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const InputsManager = ({ user, onDataChange, preselectedHarvestId, onBack }) => {
  const { toast } = useToast();
  const [inputs, setInputs] = useState([]);
  const [harvests, setHarvests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(!!preselectedHarvestId);
  const [editingInput, setEditingInput] = useState(null);
  const [formData, setFormData] = useState({
    harvest_id: preselectedHarvestId || '',
    input_type: 'Fertilizante',
    product_name: '',
    quantity: '',
    measurement_unit: 'kg',
    application_date: new Date().toISOString().split('T')[0],
    cost: '',
    responsible: ''
  });

  const inputTypes = ['Fertilizante', 'Defensivo', 'Corretivo', 'Adubação', 'Outro'];
  const measurementUnits = ['kg', 'litros', 'sacas', 'toneladas', 'unidades'];

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const [inputsRes, harvestsRes] = await Promise.all([
      supabase.from('inputs').select('*, harvests(name, crop_name, plots(name))').eq('user_id', user.id).order('application_date', { ascending: false }),
      supabase.from('harvests').select('id, name, crop_name, plots!inner(name)').eq('user_id', user.id).order('planting_date', { ascending: false })
    ]);

    if (inputsRes.error) {
      toast({ title: "Erro", description: "Não foi possível carregar os insumos.", variant: "destructive" });
    } else {
      setInputs(inputsRes.data);
    }

    if (harvestsRes.error) {
      toast({ title: "Erro", description: "Não foi possível carregar as safras.", variant: "destructive" });
    } else {
      setHarvests(harvestsRes.data);
    }
    setLoading(false);
  }, [user?.id, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setFormData({
      harvest_id: preselectedHarvestId || '',
      input_type: 'Fertilizante',
      product_name: '',
      quantity: '',
      measurement_unit: 'kg',
      application_date: new Date().toISOString().split('T')[0],
      cost: '',
      responsible: ''
    });
    setEditingInput(null);
    if (preselectedHarvestId && onBack) {
        onBack();
    } else {
        setShowForm(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requiredFields = ['harvest_id', 'product_name', 'quantity', 'cost', 'application_date'];
    for (const field of requiredFields) {
        if (!formData[field]) {
            toast({ title: "Erro", description: "Por favor, preencha todos os campos obrigatórios.", variant: "destructive" });
            return;
        }
    }

    const inputData = {
      user_id: user.id,
      ...formData,
      quantity: parseFloat(formData.quantity),
      cost: parseFloat(formData.cost),
    };

    let error;
    if (editingInput) {
      const { error: updateError } = await supabase.from('inputs').update(inputData).eq('id', editingInput.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('inputs').insert(inputData);
      error = insertError;
    }

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso!", description: `Insumo ${editingInput ? 'atualizado' : 'registrado'} com sucesso.` });
      if (onDataChange) onDataChange();
      else fetchData();
      resetForm();
    }
  };

  const handleEdit = (input) => {
    setEditingInput(input);
    setFormData({
      harvest_id: input.harvest_id,
      input_type: input.input_type,
      product_name: input.product_name,
      quantity: input.quantity,
      measurement_unit: input.measurement_unit,
      application_date: input.application_date,
      cost: input.cost,
      responsible: input.responsible || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (inputId) => {
    const { error } = await supabase.from('inputs').delete().eq('id', inputId);
    if (error) {
      toast({ title: "Erro", description: "Não foi possível excluir o insumo.", variant: "destructive" });
    } else {
      toast({ title: "Sucesso!", description: "Insumo excluído." });
      if (onDataChange) onDataChange();
      else fetchData();
    }
  };

  const getHarvestDisplayName = (h) => {
    return `${h.plots.name} - ${h.name ? `${h.name} - ${h.crop_name}` : h.crop_name}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Gerenciar Insumos</h2>
        {!preselectedHarvestId && (
            <Button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary">
                <Plus className="w-5 h-5 mr-2" /> Registrar Aplicação
            </Button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="chart-container">
            <h3 className="text-xl font-semibold text-slate-700 mb-4">{editingInput ? 'Editar Aplicação' : 'Nova Aplicação de Insumo'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Safra Vinculada*</label>
                  <select value={formData.harvest_id} onChange={(e) => setFormData(p => ({ ...p, harvest_id: e.target.value }))} className="input-field" required disabled={!!preselectedHarvestId}>
                    <option value="">Selecione a safra</option>
                    {harvests.map(h => <option key={h.id} value={h.id}>{getHarvestDisplayName(h)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Data da Aplicação*</label>
                  <input type="date" value={formData.application_date} onChange={(e) => setFormData(p => ({ ...p, application_date: e.target.value }))} className="input-field" required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Insumo*</label>
                  <select value={formData.input_type} onChange={(e) => setFormData(p => ({ ...p, input_type: e.target.value }))} className="input-field" required>
                    {inputTypes.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nome do Produto/Insumo*</label>
                  <input type="text" value={formData.product_name} onChange={(e) => setFormData(p => ({ ...p, product_name: e.target.value }))} placeholder="Ex: Ureia, Glifosato" className="input-field" required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Quantidade*</label>
                  <input type="number" step="0.01" value={formData.quantity} onChange={(e) => setFormData(p => ({ ...p, quantity: e.target.value }))} placeholder="Ex: 100" className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Unidade de Medida*</label>
                  <select value={formData.measurement_unit} onChange={(e) => setFormData(p => ({ ...p, measurement_unit: e.target.value }))} className="input-field" required>
                    {measurementUnits.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Custo Total (R$)*</label>
                  <input type="number" step="0.01" value={formData.cost} onChange={(e) => setFormData(p => ({ ...p, cost: e.target.value }))} placeholder="Ex: 2500.00" className="input-field" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Responsável pela Aplicação</label>
                <input type="text" value={formData.responsible} onChange={(e) => setFormData(p => ({ ...p, responsible: e.target.value }))} placeholder="Ex: João da Silva" className="input-field" />
              </div>
              <div className="flex space-x-3">
                <Button type="submit" className="btn-primary">{editingInput ? 'Atualizar' : 'Salvar'}</Button>
                <Button type="button" onClick={resetForm} className="px-6 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all">Cancelar</Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {!preselectedHarvestId && (loading ? (
        <div className="text-center py-12">Carregando...</div>
      ) : inputs.length > 0 ? (
        <div className="space-y-4">
          {inputs.map((input, index) => (
            <motion.div key={input.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="chart-container p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-semibold text-slate-700">{input.product_name} <span className="text-base font-normal text-slate-500">({input.input_type})</span></h4>
                  <div className="flex items-center text-sm text-slate-500 mt-1">
                    <Wheat className="w-4 h-4 mr-2" />
                    <span>{getHarvestDisplayName(input.harvests)}</span>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(input)} className="h-8 w-8" title="Editar"><Edit2 className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(input.id)} className="h-8 w-8 text-red-500 hover:text-red-600" title="Excluir"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                <div className="flex items-center text-slate-600"><Calendar className="w-4 h-4 mr-2 text-emerald-500" /><div><p className="font-medium">Aplicação</p><p>{new Date(input.application_date).toLocaleDateString('pt-BR')}</p></div></div>
                <div className="flex items-center text-slate-600"><Package className="w-4 h-4 mr-2 text-blue-500" /><div><p className="font-medium">Quantidade</p><p>{input.quantity} {input.measurement_unit}</p></div></div>
                <div className="flex items-center text-slate-600"><DollarSign className="w-4 h-4 mr-2 text-red-500" /><div><p className="font-medium">Custo</p><p>R$ {parseFloat(input.cost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div></div>
                {input.responsible && <div className="flex items-center text-slate-600"><User className="w-4 h-4 mr-2 text-purple-500" /><div><p className="font-medium">Responsável</p><p>{input.responsible}</p></div></div>}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
          <Beaker className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-600 mb-2">Nenhuma aplicação registrada</h3>
          <p className="text-slate-500 mb-6">Clique no botão acima para registrar sua primeira aplicação de insumo.</p>
          <Button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-5 h-5 mr-2" />Registrar Aplicação</Button>
        </motion.div>
      ))}
    </div>
  );
};

export default InputsManager;