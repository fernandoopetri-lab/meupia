
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Hash, AlertCircle, Loader2 } from 'lucide-react';
import AddAnimalToLotModal from './AddAnimalToLotModal';

const AnimalsByLotList = ({ user, lotId }) => {
  const { toast } = useToast();
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const fetchAnimals = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('livestock')
      .select('*')
      .eq('lot_id', lotId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Erro", description: "Falha ao carregar animais do lote.", variant: "destructive" });
    } else {
      setAnimals(data || []);
    }
    setLoading(false);
  }, [lotId, user.id, toast]);

  useEffect(() => {
    fetchAnimals();
  }, [fetchAnimals]);

  const handleRemoveFromLot = async (animalId) => {
    setRemovingId(animalId);
    const { error } = await supabase
      .from('livestock')
      .update({ lot_id: null })
      .eq('id', animalId)
      .eq('user_id', user.id);

    if (error) {
      toast({ title: "Erro", description: "Não foi possível remover o animal do lote.", variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: "Animal removido do lote." });
      setAnimals(prev => prev.filter(a => a.id !== animalId));
    }
    setRemovingId(null);
  };

  const handleAddSuccess = () => {
    setShowAddModal(false);
    fetchAnimals();
  };

  return (
    <div className="mt-8 space-y-4">
      <AnimatePresence>
        {showAddModal && (
          <AddAnimalToLotModal
            user={user}
            lotId={lotId}
            onCancel={() => setShowAddModal(false)}
            onSuccess={handleAddSuccess}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-xl font-bold text-slate-800 flex items-center">
          Animais no Lote <span className="ml-3 px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-sm">{animals.length}</span>
        </h3>
        <Button onClick={() => setShowAddModal(true)} className="btn-primary w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Adicionar Animais
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : animals.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {animals.map((animal, idx) => (
            <motion.div
              key={animal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Hash className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-lg leading-tight">{animal.ear_tag_id}</p>
                    <p className="text-xs text-slate-500 capitalize">{animal.breed || 'N/A'} • {animal.sex}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleRemoveFromLot(animal.id)}
                  disabled={removingId === animal.id}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                >
                  {removingId === animal.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                  Remover do Lote
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-lg font-medium text-slate-700">Lote Vazio</h4>
          <p className="text-slate-500 mt-1 mb-4">Este lote ainda não possui nenhum animal vinculado.</p>
          <Button onClick={() => setShowAddModal(true)} variant="outline" className="bg-white">
            <Plus className="w-4 h-4 mr-2" /> Adicionar Primeiro Animal
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default AnimalsByLotList;
