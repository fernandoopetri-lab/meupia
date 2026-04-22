import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Map, Maximize, Wheat, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const PlotManager = ({ user, onSelectPlot, propertyIdFilter }) => {
  const { toast } = useToast();
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlot, setEditingPlot] = useState(null);
  const [properties, setProperties] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    area: '',
    location_description: '',
    current_crop: '',
    status: 'active',
    property_id: '',
  });

  const fetchProperties = useCallback(async () => {
    if (!user?.id) return;
    
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching properties:', error);
    } else {
      setProperties(Array.isArray(data) ? data : []);
    }
  }, [user?.id]);

  const fetchPlots = useCallback(async () => {
    if (!user?.id) {
      setPlots([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    
    // Fetch all plots with property information
    const { data, error } = await supabase
      .from('plots')
      .select('*, properties(name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Erro", description: "Não foi possível carregar os talhões.", variant: "destructive" });
      setPlots([]);
    } else {
      setPlots(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  }, [user?.id, toast]);

  useEffect(() => {
    fetchPlots();
    fetchProperties();
  }, [fetchPlots, fetchProperties]);

  const resetForm = () => {
    setFormData({ 
      name: '', 
      area: '', 
      location_description: '', 
      current_crop: '', 
      status: 'active',
      property_id: propertyIdFilter || '',
    });
    setEditingPlot(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.area || !formData.property_id) {
      toast({ title: "Erro", description: "Nome, área e propriedade do talhão são obrigatórios.", variant: "destructive" });
      return;
    }

    const plotData = {
      user_id: user.id,
      property_id: parseInt(formData.property_id),
      name: formData.name,
      area: parseFloat(formData.area),
      location_description: formData.location_description,
      current_crop: formData.current_crop,
      status: formData.status,
    };

    let error;
    if (editingPlot) {
      const { error: updateError } = await supabase.from('plots').update(plotData).eq('id', editingPlot.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('plots').insert(plotData);
      error = insertError;
    }

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso!", description: `Talhão ${editingPlot ? 'atualizado' : 'adicionado'} com sucesso.` });
      resetForm();
      fetchPlots();
    }
  };

  const handleEdit = (e, plot) => {
    e.stopPropagation();
    setEditingPlot(plot);
    setFormData({
      name: plot.name,
      area: plot.area,
      location_description: plot.location_description || '',
      current_crop: plot.current_crop || '',
      status: plot.status,
      property_id: plot.property_id,
    });
    setShowForm(true);
  };

  const handleDelete = async (e, plotId) => {
    e.stopPropagation();
    const { error } = await supabase.from('plots').delete().eq('id', plotId);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso!", description: "Talhão removido com sucesso." });
      fetchPlots();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Gerenciar Talhões</h2>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary">
          <Plus className="w-5 h-5 mr-2" /> Adicionar Talhão
        </Button>
      </div>

      {/* Informational Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Map className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-1">Dica: Como adicionar novos talhões</h3>
            <p className="text-sm text-blue-700">
              Para registrar novos talhões, acesse a tela de <span className="font-semibold">Propriedades</span>, selecione uma propriedade e adicione seus talhões. 
              Aqui você pode visualizar e gerenciar todos os seus talhões cadastrados.
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="chart-container">
            <h3 className="text-xl font-semibold text-slate-700 mb-4">{editingPlot ? 'Editar Talhão' : 'Novo Talhão'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Propriedade*</label>
                  <select 
                    value={formData.property_id} 
                    onChange={(e) => setFormData(p => ({ ...p, property_id: e.target.value }))} 
                    className="input-field" 
                    required
                  >
                    <option value="">Selecione uma propriedade</option>
                    {properties.map(prop => (
                      <option key={prop.id} value={prop.id}>{prop.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nome do Talhão*</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Talhão 01" className="input-field" required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Área (em hectares)*</label>
                  <input type="number" step="0.1" value={formData.area} onChange={(e) => setFormData(p => ({ ...p, area: e.target.value }))} placeholder="Ex: 50" className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Cultura Atual</label>
                  <input type="text" value={formData.current_crop} onChange={(e) => setFormData(p => ({ ...p, current_crop: e.target.value }))} placeholder="Ex: Soja" className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))} className="input-field">
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                    <option value="fallow">Pousio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Descrição da Localização</label>
                  <input type="text" value={formData.location_description} onChange={(e) => setFormData(p => ({ ...p, location_description: e.target.value }))} placeholder="Ex: Próximo ao rio" className="input-field" />
                </div>
              </div>
              <div className="flex space-x-3">
                <Button type="submit" className="btn-primary">{editingPlot ? 'Atualizar' : 'Salvar'}</Button>
                <Button type="button" onClick={resetForm} className="px-6 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all">Cancelar</Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="text-center py-12">Carregando talhões...</div>
      ) : plots.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plots.map((plot, index) => (
            <motion.div 
              key={plot.id} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: index * 0.1 }} 
              className="wallet-card group cursor-pointer"
              onClick={() => onSelectPlot(plot.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-yellow-100">
                  <Wheat className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => handleEdit(e, plot)} className="p-2 text-slate-400 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={(e) => handleDelete(e, plot.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-700 truncate">{plot.name}</h3>
              <div className="flex items-center text-sm text-slate-600 mt-2 mb-3">
                <MapPin className="w-4 h-4 mr-1.5" />
                <span className="truncate">{plot.properties?.name || 'Propriedade não encontrada'}</span>
              </div>
              <div className="flex items-center text-sm text-slate-500 space-x-4">
                <div className="flex items-center"><Maximize className="w-4 h-4 mr-1.5" /><span>{plot.area} ha</span></div>
                {plot.current_crop && <div className="flex items-center"><Wheat className="w-4 h-4 mr-1.5" /><span>{plot.current_crop}</span></div>}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 wallet-card">
          <Wheat className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-600 mb-2">Nenhum talhão cadastrado</h3>
          <p className="text-slate-500 mb-6">Adicione seu primeiro talhão clicando no botão acima ou através da tela de Propriedades.</p>
          <Button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-5 h-5 mr-2" />Adicionar Talhão</Button>
        </motion.div>
      )}
    </div>
  );
};

export default PlotManager;