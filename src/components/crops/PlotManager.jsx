import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Map, Maximize, Wheat, MapPin, Loader2, X, Check } from 'lucide-react';
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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="heading-premium">Gerenciar Talhões</h2>
          <p className="subheading-premium">Controle detalhado de suas áreas de cultivo.</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="btn-premium">
          <Plus className="w-4 h-4 mr-2" /> Adicionar Talhão
        </Button>
      </div>

      {/* Informational Message */}
      <div className="bg-lime-50/50 border border-lime-100 rounded-3xl p-6 relative overflow-hidden group">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-lime-500/5 rounded-full blur-2xl group-hover:bg-lime-500/10 transition-colors" />
        <div className="flex items-start relative z-10">
          <div className="p-3 bg-lime-500 text-white rounded-2xl shadow-lg shadow-lime-500/20 mr-4">
            <Map className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-lime-900 uppercase tracking-widest mb-1">Como adicionar novos talhões</h3>
            <p className="text-sm text-lime-700/80 leading-relaxed max-w-2xl">
              Você pode registrar novos talhões aqui ou diretamente na tela de <span className="font-bold text-lime-800 underline decoration-lime-300 underline-offset-2">Propriedades</span> ao selecionar uma fazenda. Isso ajuda a manter sua produção organizada por localidade.
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="card-modern relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-lime-500/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-slate-800">{editingPlot ? 'Editar' : 'Novo'} Talhão</h3>
                <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-6 h-6"/></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Fazenda / Propriedade</label>
                    <select 
                      value={formData.property_id} 
                      onChange={(e) => setFormData(p => ({ ...p, property_id: e.target.value }))} 
                      className="input-modern bg-white appearance-none cursor-pointer" 
                      required
                    >
                      <option value="">Selecione uma propriedade...</option>
                      {properties.map(prop => (
                        <option key={prop.id} value={prop.id}>{prop.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Identificação (Nome)</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input type="text" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Talhão Sul 01" className="input-modern pl-12" required />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Área Total (Hectares)</label>
                    <div className="relative">
                      <Maximize className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input type="number" step="0.1" value={formData.area} onChange={(e) => setFormData(p => ({ ...p, area: e.target.value }))} placeholder="Ex: 50.0" className="input-modern pl-12" required />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Cultura / Cultivo Atual</label>
                    <div className="relative">
                      <Wheat className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input type="text" value={formData.current_crop} onChange={(e) => setFormData(p => ({ ...p, current_crop: e.target.value }))} placeholder="Ex: Soja, Milho, Trigo..." className="input-modern pl-12" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Situação / Status</label>
                    <select value={formData.status} onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))} className="input-modern bg-white appearance-none cursor-pointer">
                      <option value="active">Produtivo (Ativo)</option>
                      <option value="inactive">Inativo</option>
                      <option value="fallow">Em Pousio</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Descrição / Ponto de Referência</label>
                    <input type="text" value={formData.location_description} onChange={(e) => setFormData(p => ({ ...p, location_description: e.target.value }))} placeholder="Ex: Ao lado da sede" className="input-modern" />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="btn-premium flex-1 py-7">
                    <Check className="w-5 h-5 mr-2" />
                    {editingPlot ? 'Salvar Alterações' : 'Confirmar Talhão'}
                  </Button>
                  <Button type="button" variant="ghost" onClick={resetForm} className="px-8 rounded-2xl font-bold text-slate-500">Cancelar</Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-lime-500 mb-4" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Carregando talhões...</p>
        </div>
      ) : plots.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plots.map((plot, index) => (
            <motion.div 
              key={plot.id} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: index * 0.1 }} 
              className="card-modern group cursor-pointer hover:bg-slate-50/80 transition-all !p-5"
              onClick={() => onSelectPlot(plot.id)}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-lime-50 border border-lime-100 shadow-sm transition-transform group-hover:scale-110">
                  <Wheat className="w-7 h-7 text-lime-600" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                  <button onClick={(e) => handleEdit(e, plot)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={(e) => handleDelete(e, plot.id)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 truncate mb-1 group-hover:text-lime-700 transition-colors">{plot.name}</h3>
              <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
                <MapPin className="w-3 h-3 mr-1 text-slate-300" />
                <span className="truncate">{plot.properties?.name || 'Fazenda N/D'}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-5 border-t border-slate-100">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tamanho</p>
                  <div className="flex items-center text-sm font-black text-slate-700">
                    <Maximize className="w-3.5 h-3.5 mr-1.5 text-slate-300" />
                    <span>{plot.area} ha</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Cultivo</p>
                  <div className="flex items-center text-sm font-black text-lime-600">
                    <Wheat className="w-3.5 h-3.5 mr-1.5 text-lime-500/50" />
                    <span className="truncate">{plot.current_crop || 'Vazio'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-modern py-20 text-center">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wheat className="w-10 h-10 text-slate-200" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Nenhum talhão cadastrado</h3>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">Comece organizando sua fazenda em talhões para ter um controle detalhado de cada área de plantio.</p>
          <Button onClick={() => setShowForm(true)} className="btn-premium px-10">
            <Plus className="w-5 h-5 mr-2" /> Adicionar Meu Primeiro Talhão
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default PlotManager;