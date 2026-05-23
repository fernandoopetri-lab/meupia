import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MapPin, Edit2, Trash2, Maximize, Map, Loader2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
const PropertyManager = ({
  user,
  onSelectProperty
}) => {
  const {
    toast
  } = useToast();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    size: '',
    unit: 'hectares'
  });
  const fetchProperties = useCallback(async () => {
    if (!user?.id) {
      setProperties([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const {
      data,
      error
    } = await supabase.from('properties').select('*').eq('user_id', user.id).order('created_at', {
      ascending: false
    });
    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as propriedades.",
        variant: "destructive"
      });
      setProperties([]);
    } else {
      setProperties(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  }, [user?.id, toast]);
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);
  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      size: '',
      unit: 'hectares'
    });
    setEditingProperty(null);
    setShowForm(false);
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.name) {
      toast({
        title: "Erro",
        description: "O nome da propriedade é obrigatório.",
        variant: "destructive"
      });
      return;
    }
    const propertyData = {
      user_id: user.id,
      name: formData.name,
      location: formData.location,
      size: formData.size ? parseFloat(formData.size) : null,
      unit: formData.unit
    };
    let error;
    if (editingProperty) {
      const {
        error: updateError
      } = await supabase.from('properties').update(propertyData).eq('id', editingProperty.id);
      error = updateError;
    } else {
      const {
        error: insertError
      } = await supabase.from('properties').insert(propertyData);
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
        description: `Propriedade ${editingProperty ? 'atualizada' : 'adicionada'} com sucesso.`
      });
      resetForm();
      fetchProperties();
    }
  };
  const handleEdit = (e, property) => {
    e.stopPropagation();
    setEditingProperty(property);
    setFormData({
      name: property.name,
      location: property.location || '',
      size: property.size || '',
      unit: property.unit || 'hectares'
    });
    setShowForm(true);
  };
  const handleDelete = async (e, propertyId) => {
    e.stopPropagation();
    const {
      error
    } = await supabase.from('properties').delete().eq('id', propertyId);
    if (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sucesso!",
        description: "Propriedade removida com sucesso."
      });
      fetchProperties();
    }
  };
  const safeProperties = Array.isArray(properties) ? properties : [];
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="heading-premium">Gerenciar Propriedades</h2>
          <p className="subheading-premium">Organize seus talhões e áreas produtivas.</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="btn-premium">
          <Plus className="w-4 h-4 mr-2" /> Adicionar Propriedade
        </Button>
      </div>
    
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="card-modern relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-lime-500/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-slate-800">{editingProperty ? 'Editar' : 'Nova'} Propriedade</h3>
                <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-6 h-6"/></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nome da Fazenda / Propriedade</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Fazenda Boa Esperança" className="input-modern pl-12" required />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Localização (Cidade/Estado)</label>
                    <div className="relative">
                      <Map className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input type="text" value={formData.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} placeholder="Ex: Anápolis, GO" className="input-modern pl-12" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Área Total</label>
                    <div className="relative">
                      <Maximize className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input type="number" step="0.1" value={formData.size} onChange={e => setFormData(p => ({ ...p, size: e.target.value }))} placeholder="Ex: 150" className="input-modern pl-12" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Unidade de Medida</label>
                    <select value={formData.unit} onChange={e => setFormData(p => ({ ...p, unit: e.target.value }))} className="input-modern bg-white appearance-none cursor-pointer">
                      <option value="hectares">Hectares (ha)</option>
                      <option value="alqueires">Alqueires</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="btn-premium flex-1 py-7">
                    <Check className="w-5 h-5 mr-2" />
                    {editingProperty ? 'Salvar Alterações' : 'Confirmar Cadastro'}
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
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Carregando propriedades...</p>
        </div>
      ) : safeProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeProperties.map((prop, index) => (
            <motion.div 
              key={prop.id} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: index * 0.1 }} 
              className="card-modern group cursor-pointer hover:bg-slate-50/80 transition-all" 
              onClick={() => onSelectProperty(prop.id)}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-lime-50 border border-lime-100 shadow-sm transition-transform group-hover:scale-110">
                  <MapPin className="w-7 h-7 text-lime-600" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                  <button onClick={e => handleEdit(e, prop)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={e => handleDelete(e, prop.id)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 truncate mb-4 group-hover:text-lime-700 transition-colors">{prop.name}</h3>
              
              <div className="space-y-3 pt-4 border-t border-slate-100">
                {prop.location && (
                  <div className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <Map className="w-4 h-4 mr-2 text-slate-300" />
                    <span>{prop.location}</span>
                  </div>
                )}
                {prop.size && (
                  <div className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <Maximize className="w-4 h-4 mr-2 text-slate-300" />
                    <span>{prop.size} {prop.unit}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-modern py-20 text-center">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-10 h-10 text-slate-200" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Nenhuma propriedade cadastrada</h3>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">Cadastre suas fazendas e talhões para ter um controle preciso de sua produção e custos.</p>
          <Button onClick={() => setShowForm(true)} className="btn-premium px-10">
            <Plus className="w-5 h-5 mr-2" /> Adicionar Minha Primeira Fazenda
          </Button>
        </motion.div>
      )}
    </div>;
};
export default PropertyManager;