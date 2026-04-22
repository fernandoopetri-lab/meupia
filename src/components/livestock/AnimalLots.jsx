
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { X, Layers, ChevronsRight } from 'lucide-react';

const AnimalLots = ({ user, animal, onDataChange }) => {
  const { toast } = useToast();
  const [allLots, setAllLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedLotId, setSelectedLotId] = useState('');
  const [currentLot, setCurrentLot] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [animalRes, lotsRes] = await Promise.all([
      // Fetch the animal's current lot ID
      supabase.from('livestock').select('lot_id').eq('id', animal.id).single(),
      // Fetch available lots from the livestock_lots table
      supabase.from('livestock_lots').select('id, name, description').eq('user_id', user.id)
    ]);

    if (lotsRes.error) {
      toast({ title: "Erro", description: "Não foi possível carregar os lotes disponíveis.", variant: "destructive" });
      setAllLots([]);
    } else {
      setAllLots(lotsRes.data || []);
    }
    
    if (!animalRes.error && animalRes.data.lot_id) {
       // Fetch the specific lot details
       const { data: lotData } = await supabase.from('livestock_lots').select('id, name').eq('id', animalRes.data.lot_id).single();
       if (lotData) {
         setCurrentLot({
             id: lotData.id,
             name: lotData.name
         });
       } else {
         setCurrentLot(null);
       }
    } else {
       setCurrentLot(null);
    }
    
    setLoading(false);
  }, [animal.id, user.id, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAssignToLot = async () => {
    if (!selectedLotId) {
      toast({ title: "Erro", description: "Selecione um lote.", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from('livestock').update({
      lot_id: selectedLotId
    }).eq('id', animal.id).eq('user_id', user.id);

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso!", description: "Animal atualizado com sucesso." });
      setShowAssignForm(false);
      setSelectedLotId('');
      fetchData();
      if (onDataChange) onDataChange();
    }
  };
  
  const handleRemoveFromLot = async () => {
    const { error } = await supabase.from('livestock').update({
      lot_id: null
    }).eq('id', animal.id).eq('user_id', user.id);

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso!", description: "Animal removido do lote." });
      fetchData();
      if (onDataChange) onDataChange();
    }
  };

  return (
    <div className="chart-container space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setShowAssignForm(true)}><ChevronsRight className="w-4 h-4 mr-2" /> Atribuir a Lote</Button>
        {currentLot && <Button onClick={handleRemoveFromLot} variant="destructive"><X className="w-4 h-4 mr-2" /> Remover do Lote</Button>}
      </div>

      <AnimatePresence>
        {showAssignForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4 border rounded-lg mt-4">
            <h4 className="font-semibold mb-2">Atribuir a um Lote</h4>
            <div className="flex gap-2">
              <select value={selectedLotId} onChange={e => setSelectedLotId(e.target.value)} className="input-field flex-grow">
                <option value="">Selecione um lote</option>
                {allLots.map(lot => <option key={lot.id} value={lot.id}>{lot.name}</option>)}
              </select>
              <Button onClick={handleAssignToLot}>Salvar</Button>
              <Button variant="ghost" onClick={() => setShowAssignForm(false)}>Cancelar</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h3 className="text-lg font-semibold text-slate-700 mb-4">Lote Atual</h3>
        {loading ? (
          <p>Carregando...</p>
        ) : currentLot ? (
          <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <Layers className="w-5 h-5 text-emerald-600" />
                <div className="flex-grow">
                  <p className="font-semibold">{currentLot.name}</p>
                </div>
              </div>
          </div>
        ) : (
          <p className="text-center text-slate-500 py-4">Este animal não está em nenhum lote.</p>
        )}
      </div>
    </div>
  );
};

export default AnimalLots;
