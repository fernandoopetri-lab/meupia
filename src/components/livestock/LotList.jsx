
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Layers, Info, Loader2, Users, X, Check } from 'lucide-react';
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
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="card-modern relative overflow-hidden mb-8">
      <div className="absolute top-0 right-0 w-64 h-64 bg-lime-500/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-bold text-slate-800">{editingLot ? 'Editar' : 'Novo'} Lote</h3>
          <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-6 h-6"/></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nome do Lote</label>
            <div className="relative">
              <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input type="text" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Lote de Verão 2024" className="input-modern pl-12" required />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Descrição / Observações</label>
            <textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Informações detalhadas sobre a origem ou manejo deste lote..." className="input-modern min-h-[120px] pt-4 resize-none"></textarea>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" className="btn-premium flex-1 py-7">
              <Check className="w-5 h-5 mr-2" />
              {editingLot ? 'Salvar Alterações' : 'Confirmar Lote'}
            </Button>
            <Button type="button" variant="ghost" onClick={resetForm} className="px-8 rounded-2xl font-bold text-slate-500">Cancelar</Button>
          </div>
        </form>
      </div>
    </motion.div>
  );

  if (isEmbedded) {
    return formContent;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="heading-premium">Gerenciar Lotes</h2>
          <p className="subheading-premium">Organize seus animais em grupos de manejo.</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="btn-premium">
          <Plus className="w-4 h-4 mr-2" /> Novo Lote
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
              className="card-modern group cursor-pointer hover:bg-slate-50/80 transition-all !p-5 flex flex-col justify-between min-h-[220px]"
            >
              <div>
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-lime-50 border border-lime-100 shadow-sm transition-transform group-hover:scale-110">
                    <Layers className="w-7 h-7 text-lime-600" />
                  </div>
                  <div className="flex items-center text-blue-600 bg-blue-50 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-blue-100 shadow-sm shadow-blue-900/5">
                    <Users className="w-3.5 h-3.5 mr-2"/>
                    {lot.animal_count} Cabeças
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 truncate group-hover:text-lime-700 transition-colors">{lot.name}</h3>
                
                <div className="mt-3 text-xs font-medium text-slate-400 line-clamp-2 leading-relaxed">
                  {lot.description ? lot.description : "Sem observações adicionais."}
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-5 border-t border-slate-100">
                <span className="text-[10px] font-black text-lime-600 uppercase tracking-[0.15em] flex items-center opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0">
                  Gerenciar <Info className="w-3.5 h-3.5 ml-1"/>
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                  <button onClick={(e) => {e.stopPropagation(); handleEdit(lot)}} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={(e) => {e.stopPropagation(); handleDelete(lot.id)}} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-modern py-20 text-center">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Layers className="w-10 h-10 text-slate-200" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Nenhum lote criado</h3>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">Organize seu rebanho criando lotes de manejo. Isso facilita o controle de custos e produção.</p>
          <Button onClick={() => setShowForm(true)} className="btn-premium px-10">
            <Plus className="w-5 h-5 mr-2" /> Criar Meu Primeiro Lote
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default LotList;
