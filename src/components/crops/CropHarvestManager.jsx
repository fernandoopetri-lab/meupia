import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Package, Edit2, Trash2, Calendar, Wheat, Archive, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
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

const CropHarvestManager = ({ user, onDataChange, preselectedHarvestId, onBack }) => {
  const { toast } = useToast();
  const [cropHarvests, setCropHarvests] = useState([]);
  const [harvests, setHarvests] = useState([]);
  const [silos, setSilos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(!!preselectedHarvestId);
  const [editingHarvest, setEditingHarvest] = useState(null);
  const [formData, setFormData] = useState({
    harvest_id: preselectedHarvestId || '',
    silo_id: '',
    harvest_date: new Date().toISOString().split('T')[0],
    total_production: '',
    production_unit: 'sacas',
  });

  const productionUnits = ['sacas', 'toneladas', 'kg'];

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const [cropHarvestsRes, harvestsRes, silosRes] = await Promise.all([
      supabase.from('crop_harvests').select('*, harvests(id, name, crop_name, plots(name)), silos(id, name)').eq('user_id', user.id).order('harvest_date', { ascending: false }),
      supabase.from('harvests').select('id, name, crop_name, plots!inner(id, name, area, status)').eq('user_id', user.id).eq('plots.status', 'ativo').eq('status', 'plantado'),
      supabase.from('silos').select('id, name').eq('user_id', user.id)
    ]);

    if (cropHarvestsRes.error) toast({ title: "Erro", description: "Não foi possível carregar as colheitas.", variant: "destructive" });
    else setCropHarvests(cropHarvestsRes.data);

    if (harvestsRes.error) toast({ title: "Erro", description: "Não foi possível carregar as safras.", variant: "destructive" });
    else setHarvests(harvestsRes.data);

    if (silosRes.error) toast({ title: "Erro", description: "Não foi possível carregar os silos.", variant: "destructive" });
    else setSilos(silosRes.data);

    setLoading(false);
  }, [user?.id, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setFormData({ harvest_id: preselectedHarvestId || '', silo_id: '', harvest_date: new Date().toISOString().split('T')[0], total_production: '', production_unit: 'sacas' });
    setEditingHarvest(null);
    if (preselectedHarvestId && onBack) {
        onBack();
    } else {
        setShowForm(false);
    }
  };

  const updateSiloStock = async (siloId, grainType, quantity, unit, operation = 'add') => {
    const { data: existingStock, error: fetchError } = await supabase
      .from('silo_stock')
      .select('*')
      .eq('silo_id', siloId)
      .eq('grain_type', grainType)
      .maybeSingle();

    if (fetchError) {
      throw new Error(`Falha ao buscar estoque: ${fetchError.message}`);
    }

    const quantityChange = operation === 'add' ? parseFloat(quantity) : -parseFloat(quantity);

    if (existingStock) {
      const newQuantity = parseFloat(existingStock.quantity) + quantityChange;
      const { error: updateError } = await supabase
        .from('silo_stock')
        .update({ quantity: newQuantity })
        .eq('id', existingStock.id);
      if (updateError) throw new Error(`Falha ao atualizar estoque: ${updateError.message}`);
    } else if (operation === 'add') {
      const { error: insertError } = await supabase
        .from('silo_stock')
        .insert({ user_id: user.id, silo_id: siloId, grain_type: grainType, quantity: quantityChange, unit: unit });
      if (insertError) throw new Error(`Falha ao criar estoque: ${insertError.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requiredFields = ['harvest_id', 'silo_id', 'harvest_date', 'total_production'];
    if (requiredFields.some(field => !formData[field])) {
      toast({ title: "Erro", description: "Por favor, preencha todos os campos obrigatórios.", variant: "destructive" });
      return;
    }

    const selectedHarvest = harvests.find(h => h.id === parseInt(formData.harvest_id)) || editingHarvest?.harvests;
    if (!selectedHarvest || !selectedHarvest.plots?.area) {
        toast({ title: "Erro", description: "A safra selecionada não tem uma área definida para calcular a produtividade.", variant: "destructive" });
        return;
    }

    const productionPerHectare = parseFloat(formData.total_production) / selectedHarvest.plots.area;

    const harvestData = {
      user_id: user.id,
      harvest_id: formData.harvest_id,
      silo_id: formData.silo_id,
      harvest_date: formData.harvest_date,
      total_production: parseFloat(formData.total_production),
      production_unit: formData.production_unit,
      production_per_hectare: productionPerHectare,
    };

    try {
      if (editingHarvest) {
        await updateSiloStock(editingHarvest.silo_id, editingHarvest.harvests.crop_name, editingHarvest.total_production, editingHarvest.production_unit, 'subtract');
        const { error: updateError } = await supabase.from('crop_harvests').update(harvestData).eq('id', editingHarvest.id);
        if (updateError) throw updateError;
        await updateSiloStock(formData.silo_id, selectedHarvest.crop_name, formData.total_production, formData.production_unit, 'add');
        toast({ title: "Sucesso!", description: "Colheita atualizada com sucesso." });
      } else {
        const { error: insertError } = await supabase.from('crop_harvests').insert(harvestData);
        if (insertError) throw insertError;
        await updateSiloStock(formData.silo_id, selectedHarvest.crop_name, formData.total_production, formData.production_unit, 'add');
        const { error: updateHarvestError } = await supabase.from('harvests').update({ status: 'colhido' }).eq('id', formData.harvest_id);
        if (updateHarvestError) throw updateHarvestError;
        toast({ title: "Sucesso!", description: `Colheita registrada e safra atualizada para "Colhido".` });
      }
      resetForm();
      if (onDataChange) onDataChange();
      else fetchData();
    } catch (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const handleEdit = (harvest) => {
    setEditingHarvest(harvest);
    setFormData({
      harvest_id: harvest.harvest_id,
      silo_id: harvest.silo_id,
      harvest_date: harvest.harvest_date,
      total_production: harvest.total_production,
      production_unit: harvest.production_unit,
    });
    setShowForm(true);
  };

  const handleDelete = async (harvest) => {
    try {
      await updateSiloStock(harvest.silo_id, harvest.harvests.crop_name, harvest.total_production, harvest.production_unit, 'subtract');
      const { error } = await supabase.from('crop_harvests').delete().eq('id', harvest.id);
      if (error) throw error;
      toast({ title: "Sucesso!", description: "Registro de colheita excluído e estoque atualizado." });
      if (onDataChange) onDataChange();
      else fetchData();
    } catch (error) {
      toast({ title: "Erro", description: `Não foi possível excluir o registro: ${error.message}`, variant: "destructive" });
    }
  };

  const getHarvestDisplayName = (h) => {
    return `${h.plots.name} - ${h.name ? `${h.name} - ${h.crop_name}` : h.crop_name}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Registrar Colheitas</h2>
        {!preselectedHarvestId && (
            <Button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary">
                <Plus className="w-5 h-5 mr-2" /> Registrar Colheita
            </Button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="chart-container">
            <h3 className="text-xl font-semibold text-slate-700 mb-4">{editingHarvest ? 'Editar Colheita' : 'Nova Colheita'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Safra Vinculada*</label>
                  <select value={formData.harvest_id} onChange={(e) => setFormData(p => ({ ...p, harvest_id: e.target.value }))} className="input-field" required disabled={!!editingHarvest || !!preselectedHarvestId}>
                    <option value="">Selecione a safra</option>
                    {editingHarvest && <option key={editingHarvest.harvests.id} value={editingHarvest.harvests.id}>{getHarvestDisplayName(editingHarvest.harvests)}</option>}
                    {harvests.map(h => <option key={h.id} value={h.id}>{getHarvestDisplayName(h)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Silo de Destino*</label>
                  <select value={formData.silo_id} onChange={(e) => setFormData(p => ({ ...p, silo_id: e.target.value }))} className="input-field" required>
                    <option value="">Selecione o silo</option>
                    {silos.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Data da Colheita*</label>
                  <input type="date" value={formData.harvest_date} onChange={(e) => setFormData(p => ({ ...p, harvest_date: e.target.value }))} className="input-field" required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex gap-2">
                    <div className="flex-grow">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Produção Total*</label>
                        <input type="number" step="0.01" value={formData.total_production} onChange={(e) => setFormData(p => ({ ...p, total_production: e.target.value }))} placeholder="Ex: 5000" className="input-field" required />
                    </div>
                    <div className="w-1/3">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Unidade</label>
                        <select value={formData.production_unit} onChange={(e) => setFormData(p => ({ ...p, production_unit: e.target.value }))} className="input-field">
                            {productionUnits.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Produção por Hectare</label>
                    <div className="input-field bg-slate-100">
                        {formData.harvest_id && formData.total_production ? 
                            (parseFloat(formData.total_production) / ((harvests.find(h => h.id === parseInt(formData.harvest_id)) || editingHarvest?.harvests)?.plots.area || 1)).toFixed(2)
                            : '0.00'
                        } {formData.production_unit}/ha
                    </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button type="submit" className="btn-primary">{editingHarvest ? 'Atualizar' : 'Salvar'}</Button>
                <Button type="button" onClick={resetForm} className="px-6 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all">Cancelar</Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {!preselectedHarvestId && (loading ? (
        <div className="text-center py-12">Carregando...</div>
      ) : cropHarvests.length > 0 ? (
        <div className="space-y-4">
          {cropHarvests.map((ch, index) => (
            <motion.div key={ch.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="chart-container p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-semibold text-slate-700">Colheita de {ch.harvests?.name ? `${ch.harvests.name} - ${ch.harvests.crop_name}` : ch.harvests?.crop_name || 'N/A'}</h4>
                  <div className="flex items-center text-sm text-slate-500 mt-1">
                    <Wheat className="w-4 h-4 mr-2" />
                    <span>{ch.harvests?.plots?.name || 'N/A'}</span>
                    <span className="mx-2">→</span>
                    <Archive className="w-4 h-4 mr-2" />
                    <span>{ch.silos?.name || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(ch)} className="h-8 w-8" title="Editar"><Edit2 className="w-4 h-4" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" title="Excluir"><Trash2 className="w-4 h-4" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Isso excluirá permanentemente este registro de colheita e o estoque correspondente será removido do silo.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(ch)} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                <div className="flex items-center text-slate-600"><Calendar className="w-4 h-4 mr-2 text-emerald-500" /><div><p className="font-medium">Data</p><p>{new Date(ch.harvest_date).toLocaleDateString('pt-BR')}</p></div></div>
                <div className="flex items-center text-slate-600"><Package className="w-4 h-4 mr-2 text-blue-500" /><div><p className="font-medium">Produção Total</p><p>{ch.total_production} {ch.production_unit}</p></div></div>
                <div className="flex items-center text-slate-600"><Maximize className="w-4 h-4 mr-2 text-purple-500" /><div><p className="font-medium">Produtividade</p><p>{parseFloat(ch.production_per_hectare).toFixed(2)} {ch.production_unit}/ha</p></div></div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-600 mb-2">Nenhuma colheita registrada</h3>
          <p className="text-slate-500 mb-6">Clique no botão acima para registrar sua primeira colheita.</p>
          <Button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-5 h-5 mr-2" />Registrar Colheita</Button>
        </motion.div>
      ))}
    </div>
  );
};

export default CropHarvestManager;