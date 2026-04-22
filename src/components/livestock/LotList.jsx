
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Layers, Info, Loader2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const LotList = ({ user, onSelectLot, onDataChange, onFilterByLot, onFormSubmit, onCancel, isEmbedded = false }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(isEmbedded);
  const [editingLot, setEditingLot] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const fetchLotsAndCounts = useCallback(async () => {
    setLoading(true);
    const { data: lotsData, error: lotsError } = await supabase
      .from('livestock_lots')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (lotsError) {
      toast({ title: "Erro ao carregar lotes", description: lotsError.message, variant: "destructive" });
      setLots([]);
    } else if (lotsData && lotsData.length > 0) {
      const lotsWithCounts = await Promise.all(lotsData.map(async (lot) => {
        const { count, error: countError } = await supabase
          .from('livestock')
          .select('id', { count: 'exact', head: true })
          .eq('lot_id', lot.id)
          .eq('user_id', user.id);
        
        if (countError) {
           console.error("Error fetching count for lot", lot.id, countError);
        }
        return {
          ...lot,
          animal_count: count || 0
        };
      }));
      setLots(lotsWithCounts);
    } else {
      setLots([]);
    }
    setLoading(false);
  }, [user.id, toast]);

  useEffect(() => {
    if (!isEmbedded) {
      fetchLotsAndCounts();
    } else {
      setLoading(false);
    }
  }, [fetchLotsAndCounts, isEmbedded]);

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingLot(null);
    if (isEmbedded) {
      if(onCancel) onCancel();
    } else {
      setShowForm(false);
    }
  };

  const handleEdit = (lot) => {
    setEditingLot(lot);
    setFormData({
      name: lot.name || '',
      description: lot.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (lotId) => {
    const { data: animalsInLot, error: animalError } = await supabase
      .from('livestock')
      .select('id')
      .eq('lot_id', lotId)
      .eq('user_id', user.id)
      .limit(1);

    if (animalError) {
        toast({ title: "Erro", description: "Não foi possível verificar os animais no lote.", variant: "destructive" });
        return;
    }
    
    if (animalsInLot && animalsInLot.length > 0) {
        toast({ title: "Ação bloqueada", description: "Não é possível excluir um lote que contém animais. Remova os animais do lote primeiro.", variant: "destructive" });
        return;
    }
      
    const { error } = await supabase.from('livestock_lots').delete().eq('id', lotId).eq('user_id', user.id);
    if (error) {
      toast({ title: "Erro ao excluir lote", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: "Lote excluído com sucesso." });
      fetchLotsAndCounts();
      if(onDataChange) onDataChange();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
        toast({ title: "Campos obrigatórios", description: "Nome do lote é obrigatório.", variant: "destructive" });
        return;
    }

    const lotData = {
      user_id: user.id,
      name: formData.name,
      description: formData.description || null
    };

    if (isEmbedded && onFormSubmit) {
      onFormSubmit(lotData);
      resetForm();
      return;
    }

    let error;
    if (editingLot) {
      const { error: updateError } = await supabase.from('livestock_lots').update(lotData).eq('id', editingLot.id).eq('user_id', user.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('livestock_lots').insert(lotData);
      error = insertError;
    }

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso!", description: `Lote ${editingLot ? 'atualizado' : 'criado'} com sucesso.` });
      resetForm();
      fetchLotsAndCounts();
      if(onDataChange) onDataChange();
    }
  };

  const safeLots = Array.isArray(lots) ? lots : [];

  const formContent = (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="chart-container mb-6">
      <h3 className="text-xl font-semibold text-slate-700 mb-4">{editingLot ? 'Editar Lote' : 'Novo Lote'}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Nome do Lote</label>
          <input type="text" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Lote de Verão" className="input-field" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Descrição</label>
          <textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Informações adicionais sobre o lote" className="input-field" rows="3"></textarea>
        </div>
        <div className="flex space-x-3">
          <Button type="submit" className="btn-primary">{editingLot ? 'Atualizar' : 'Salvar'}</Button>
          <Button type="button" onClick={resetForm} variant="outline">Cancelar</Button>
        </div>
      </form>
    </motion.div>
  );

  if (isEmbedded) {
    return formContent;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Gerenciar Lotes</h2>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary shadow-sm hover:shadow-md transition-all">
          <Plus className="w-5 h-5 mr-2" /> Novo Lote
        </Button>
      </div>

      <AnimatePresence>
        {showForm && formContent}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : safeLots.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeLots.map((lot, index) => (
            <motion.div 
              key={lot.id} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/lot/${lot.id}`)}
              className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-emerald-300 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-100 group-hover:bg-emerald-500 transition-colors">
                    <Layers className="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex items-center text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full text-sm font-semibold border border-blue-100">
                    <Users className="w-4 h-4 mr-2"/>
                    {lot.animal_count} Animais
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 truncate group-hover:text-emerald-700 transition-colors">{lot.name}</h3>
                <div className="mt-2 text-sm text-slate-500 h-10 overflow-hidden">
                  {lot.description ? (
                    <span className="line-clamp-2">{lot.description}</span>
                  ) : (
                    <span className="italic text-slate-400">Sem descrição detalhada.</span>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center mt-5 pt-4 border-t border-slate-100">
                <span className="text-sm font-medium text-emerald-600 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    Ver Animais <Info className="w-4 h-4 ml-1"/>
                </span>
                <div className="flex space-x-1">
                  <button onClick={(e) => {e.stopPropagation(); handleEdit(lot)}} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={(e) => {e.stopPropagation(); handleDelete(lot.id)}} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <Layers className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">Nenhum lote criado</h3>
          <p className="text-slate-500 mb-6">Crie seu primeiro lote para organizar seus animais de forma inteligente.</p>
          <Button onClick={() => setShowForm(true)} className="btn-primary shadow-md"><Plus className="w-5 h-5 mr-2" />Criar Meu Primeiro Lote</Button>
        </motion.div>
      )}
    </div>
  );
};

export default LotList;
