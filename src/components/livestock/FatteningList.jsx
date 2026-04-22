import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Beef, Calendar, GitCommit, Scale, Edit2, Trash2, Users, Divide } from 'lucide-react';
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

const FatteningForm = ({ user, animals, onFormSubmit, onCancel, editingWeighing }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    animal_id: '',
    event_date: new Date().toISOString().split('T')[0],
    weight: '',
    details: { notes: '' }
  });

  useEffect(() => {
    if (editingWeighing) {
      setFormData({
        animal_id: editingWeighing.animal_id || '',
        event_date: editingWeighing.event_date || new Date().toISOString().split('T')[0],
        weight: editingWeighing.weight || '',
        details: editingWeighing.details || { notes: '' }
      });
    }
  }, [editingWeighing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.event_date || !formData.weight || !formData.animal_id) {
      toast({ title: "Erro", description: "Animal, Data e Peso são obrigatórios.", variant: "destructive" });
      return;
    }
    onFormSubmit({ ...formData, event_type: 'pesagem' });
  };

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="chart-container">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-slate-700">{editingWeighing ? 'Editar Pesagem' : 'Registrar Pesagem'}</h3>
        <Button variant="ghost" size="icon" onClick={onCancel}><X className="w-5 h-5" /></Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Animal</label>
          <select value={formData.animal_id} onChange={(e) => setFormData(p => ({ ...p, animal_id: e.target.value }))} className="input-field" required>
            <option value="">Selecione o animal</option>
            {animals.map(animal => (
              <option key={animal.id} value={animal.id}>Brinco: {animal.ear_tag_id} ({animal.breed})</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Data da Pesagem</label>
            <input type="date" value={formData.event_date} onChange={(e) => setFormData(p => ({ ...p, event_date: e.target.value }))} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Peso (Kg)</label>
            <input type="number" step="0.1" value={formData.weight} onChange={(e) => setFormData(p => ({ ...p, weight: e.target.value }))} placeholder="Ex: 450.5" className="input-field" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Observações</label>
          <textarea value={formData.details.notes} onChange={(e) => setFormData(p => ({ ...p, details: { notes: e.target.value } }))} rows="2" className="input-field"></textarea>
        </div>
        <div className="flex space-x-3 pt-4">
          <Button type="submit" className="btn-primary">{editingWeighing ? 'Atualizar Pesagem' : 'Salvar Pesagem'}</Button>
          <Button type="button" onClick={onCancel} className="px-6 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all">Cancelar</Button>
        </div>
      </form>
    </motion.div>
  );
};

const FatteningList = ({ user, onDataChange }) => {
  const { toast } = useToast();
  const [weighings, setWeighings] = useState([]);
  const [livestock, setLivestock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingWeighing, setEditingWeighing] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [weighingsRes, livestockRes] = await Promise.all([
      supabase.from('livestock_events').select('*, animal:animal_id(ear_tag_id, breed)').eq('user_id', user.id).eq('event_type', 'pesagem').order('event_date', { ascending: false }),
      supabase.from('livestock').select('*').eq('user_id', user.id).eq('status', 'ativo')
    ]);

    if (weighingsRes.error) {
      toast({ title: "Erro", description: "Não foi possível carregar as pesagens.", variant: "destructive" });
    } else {
      setWeighings(weighingsRes.data);
    }

    if (livestockRes.error) {
      toast({ title: "Erro", description: "Não foi possível carregar o rebanho.", variant: "destructive" });
    } else {
      setLivestock(livestockRes.data);
    }
    setLoading(false);
  }, [user.id, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFormSubmit = async (weighingData) => {
    const payload = {
        ...weighingData,
        user_id: user.id,
        weight: weighingData.weight
    };
    
    let error;
    if (editingWeighing) {
        const { error: updateError } = await supabase.from('livestock_events').update(payload).eq('id', editingWeighing.id);
        error = updateError;
    } else {
        const { error: insertError } = await supabase.from('livestock_events').insert(payload);
        error = insertError;
    }

    if (error) {
      toast({ title: "Erro ao registrar pesagem", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso!", description: `Pesagem ${editingWeighing ? 'atualizada' : 'registrada'}.` });
      setShowForm(false);
      setEditingWeighing(null);
      fetchData();
      if (onDataChange) onDataChange();
    }
  };

  const handleDelete = async (weighingId) => {
    const { error } = await supabase.from('livestock_events').delete().eq('id', weighingId);
    if (error) {
        toast({ title: "Erro", description: "Não foi possível excluir a pesagem.", variant: "destructive" });
    } else {
        toast({ title: "Sucesso!", description: "Pesagem excluída." });
        fetchData();
    }
  };

  const handleEdit = (weighing) => {
    setEditingWeighing(weighing);
    setShowForm(true);
  };

  const latestWeighings = weighings.reduce((acc, current) => {
    if (!acc[current.animal_id] || new Date(current.event_date) > new Date(acc[current.animal_id].event_date)) {
      acc[current.animal_id] = current;
    }
    return acc;
  }, {});

  const latestWeighingsArray = Object.values(latestWeighings);
  const totalAnimalsWeighed = latestWeighingsArray.length;
  const totalWeight = latestWeighingsArray.reduce((sum, w) => sum + (w.weight || 0), 0);
  const averageWeight = totalAnimalsWeighed > 0 ? totalWeight / totalAnimalsWeighed : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Controle de Engorda</h2>
        <Button onClick={() => { setEditingWeighing(null); setShowForm(true); }} className="btn-primary">
          <Plus className="w-5 h-5 mr-2" /> Registrar Pesagem
        </Button>
      </div>

      <AnimatePresence>
        {showForm && <FatteningForm user={user} animals={livestock} onFormSubmit={handleFormSubmit} onCancel={() => { setShowForm(false); setEditingWeighing(null); }} editingWeighing={editingWeighing} />}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="chart-container">
            <p className="text-sm text-slate-500 flex items-center"><Users className="w-4 h-4 mr-2"/> Animais Pesados (Última Pesagem)</p>
            <p className="text-3xl font-bold text-emerald-600">{totalAnimalsWeighed}</p>
        </div>
        <div className="chart-container">
            <p className="text-sm text-slate-500 flex items-center"><Divide className="w-4 h-4 mr-2"/> Média de Peso (Última Pesagem)</p>
            <p className="text-3xl font-bold text-blue-600">{averageWeight.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Kg</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Carregando...</div>
      ) : weighings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {weighings.map((w) => (
            <motion.div key={w.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm group">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                            <Beef className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-slate-800">{w.animal ? `Brinco: ${w.animal.ear_tag_id}` : 'N/A'}</p>
                            <p className="text-sm text-slate-500">{new Date(w.event_date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                        </div>
                    </div>
                    <p className="text-lg font-bold text-blue-600">{w.weight} Kg</p>
                </div>
                {w.details?.notes && (
                    <div className="mt-3 pt-3 border-t border-slate-100 text-sm text-slate-500 space-y-1">
                        <p>Obs: {w.details.notes}</p>
                    </div>
                )}
                <div className="flex justify-end items-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(w)}><Edit2 className="w-4 h-4 text-slate-400 hover:text-blue-600" /></Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta ação não pode ser desfeita. Isso excluirá permanentemente o registro de pesagem.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(w.id)} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 chart-container">
          <Beef className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-600 mb-2">Nenhuma pesagem registrada</h3>
          <p className="text-slate-500 mb-6">Comece registrando a primeira pesagem de um animal.</p>
          <Button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-5 h-5 mr-2" />Registrar Pesagem</Button>
        </motion.div>
      )}
    </div>
  );
};

export default FatteningList;