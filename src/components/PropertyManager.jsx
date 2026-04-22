import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MapPin, Edit2, Trash2, Maximize, Map } from 'lucide-react';
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
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-slate-800">Gerenciar Propriedades</h2>
      
        <Button onClick={() => {
        resetForm();
        setShowForm(true);
      }} className="btn-primary">
          <Plus className="w-5 h-5 mr-2" /> Adicionar Propriedade
        </Button>
    </div>
      <p className="text-slate-500">Clique na propriedade para continuar</p>
    
      <AnimatePresence>
        {showForm && <motion.div initial={{
        opacity: 0,
        height: 0
      }} animate={{
        opacity: 1,
        height: 'auto'
      }} exit={{
        opacity: 0,
        height: 0
      }} className="chart-container">
            <h3 className="text-xl font-semibold text-slate-700 mb-4">{editingProperty ? 'Editar Propriedade' : 'Nova Propriedade'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nome da Propriedade</label>
                  <input type="text" value={formData.name} onChange={e => setFormData(p => ({
                ...p,
                name: e.target.value
              }))} placeholder="Ex: Fazenda Boa Esperança" className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Localização</label>
                  <input type="text" value={formData.location} onChange={e => setFormData(p => ({
                ...p,
                location: e.target.value
              }))} placeholder="Ex: Anápolis, GO" className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tamanho</label>
                  <input type="number" step="0.1" value={formData.size} onChange={e => setFormData(p => ({
                ...p,
                size: e.target.value
              }))} placeholder="Ex: 150" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Unidade de Medida</label>
                  <select value={formData.unit} onChange={e => setFormData(p => ({
                ...p,
                unit: e.target.value
              }))} className="input-field">
                    <option value="hectares">Hectares</option>
                    <option value="alqueires">Alqueires</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button type="submit" className="btn-primary">{editingProperty ? 'Atualizar' : 'Salvar'}</Button>
                <Button type="button" onClick={resetForm} className="px-6 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all">Cancelar</Button>
              </div>
            </form>
          </motion.div>}
      </AnimatePresence>

      {loading ? <div className="text-center py-12">Carregando...</div> : safeProperties.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeProperties.map((prop, index) => <motion.div key={prop.id} initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: index * 0.1
      }} className="wallet-card group cursor-pointer" onClick={() => onSelectProperty(prop.id)}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-100">
                  <MapPin className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={e => handleEdit(e, prop)} className="p-2 text-slate-400 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={e => handleDelete(e, prop.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-700 truncate">{prop.name}</h3>
              <div className="flex items-center text-sm text-slate-500 space-x-4 mt-2">
                {prop.location && <div className="flex items-center"><Map className="w-4 h-4 mr-1.5" /><span>{prop.location}</span></div>}
                {prop.size && <div className="flex items-center"><Maximize className="w-4 h-4 mr-1.5" /><span>{prop.size} {prop.unit}</span></div>}
              </div>
            </motion.div>)}
        </div> : <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} className="text-center py-12 wallet-card">
          <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-600 mb-2">Nenhuma propriedade cadastrada</h3>
          <p className="text-slate-500 mb-6">Adicione sua primeira propriedade para começar.</p>
          <Button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-5 h-5 mr-2" />Adicionar Propriedade</Button>
        </motion.div>}
    </div>;
};
export default PropertyManager;