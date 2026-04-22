
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Layers, Users, Plus, X, Hash, Search } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";

const ManageAnimalsModal = ({ user, lot, animalsInLot, onCancel, onUpdate }) => {
  const { toast } = useToast();
  const [allAnimals, setAllAnimals] = useState([]);
  const [selectedAnimals, setSelectedAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAllAnimals = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('livestock')
        .select('id, ear_tag_id')
        .eq('user_id', user.id)
        .eq('status', 'ativo');
      
      if (error) {
        toast({ title: "Erro", description: "Não foi possível carregar os animais.", variant: "destructive" });
        setAllAnimals([]);
      } else {
        setAllAnimals(data || []);
        // animalsInLot is an array of livestock objects that are currently in the lot
        const currentAnimalIds = animalsInLot.map(a => a.id);
        setSelectedAnimals(currentAnimalIds);
      }
      setLoading(false);
    };
    fetchAllAnimals();
  }, [user.id, toast, animalsInLot]);

  const handleToggleAnimal = (animalId) => {
    setSelectedAnimals(prev =>
      prev.includes(animalId) ? prev.filter(id => id !== animalId) : [...prev, animalId]
    );
  };

  const handleUpdate = async () => {
    const currentAnimalIds = animalsInLot.map(a => a.id);
    const animalsToAdd = selectedAnimals.filter(id => !currentAnimalIds.includes(id));
    const animalsToRemove = currentAnimalIds.filter(id => !selectedAnimals.includes(id));

    // Direct updates to livestock.lot_id field (referencing livestock_lots)
    const toAddPromises = animalsToAdd.map(livestock_id =>
      supabase.from('livestock')
        .update({ lot_id: lot.id })
        .eq('id', livestock_id)
        .eq('user_id', user.id)
    );
    
    const toRemovePromises = animalsToRemove.map(livestock_id =>
      supabase.from('livestock')
        .update({ lot_id: null })
        .eq('id', livestock_id)
        .eq('user_id', user.id)
    );

    const results = await Promise.all([...toAddPromises, ...toRemovePromises]);
    const errors = results.filter(res => res.error);

    if (errors.length > 0) {
      toast({ title: "Erro", description: "Ocorreram erros ao atualizar os animais do lote.", variant: "destructive" });
      console.error(errors);
    } else {
      toast({ title: "Sucesso!", description: "Lote atualizado com sucesso." });
      onUpdate();
    }
  };

  const filteredAnimals = (allAnimals || []).filter(animal =>
    animal.ear_tag_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-800">Gerenciar Animais no Lote</h3>
          <Button variant="ghost" size="icon" onClick={onCancel}><X className="w-5 h-5" /></Button>
        </div>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por brinco..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        {loading ? (
          <p>Carregando animais...</p>
        ) : (
          <div className="flex-grow overflow-y-auto space-y-2 pr-2">
            {filteredAnimals.map(animal => (
              <div key={animal.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50">
                <Checkbox
                  id={`animal-${animal.id}`}
                  checked={selectedAnimals.includes(animal.id)}
                  onCheckedChange={() => handleToggleAnimal(animal.id)}
                />
                <label htmlFor={`animal-${animal.id}`} className="flex items-center text-sm font-medium text-slate-700 cursor-pointer">
                  <Hash className="w-4 h-4 mr-2 text-slate-400" />
                  {animal.ear_tag_id}
                </label>
              </div>
            ))}
          </div>
        )}
        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button onClick={handleUpdate}>Salvar Alterações</Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const LotDetails = ({ user, lotId, onBack, onDataChange }) => {
  const { toast } = useToast();
  const [lot, setLot] = useState(null);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showManageModal, setShowManageModal] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [lotRes, animalsRes] = await Promise.all([
      // Fetch from livestock_lots
      supabase.from('livestock_lots').select('*').eq('id', lotId).eq('user_id', user.id).single(),
      // Directly query livestock using the lot_id field
      supabase.from('livestock')
        .select('id, ear_tag_id, breed, sex')
        .eq('lot_id', lotId)
        .eq('user_id', user.id)
    ]);

    if (lotRes.error) {
      toast({ title: "Erro", description: "Lote não encontrado.", variant: "destructive" });
      onBack();
    } else {
      setLot(lotRes.data);
    }

    if (animalsRes.error) {
      toast({ title: "Erro", description: "Não foi possível carregar os animais do lote.", variant: "destructive" });
      setAnimals([]);
    } else {
      setAnimals(animalsRes.data || []);
    }
    setLoading(false);
  }, [lotId, toast, onBack, user.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateSuccess = () => {
    setShowManageModal(false);
    fetchData();
    if (onDataChange) onDataChange();
  };

  if (loading) {
    return <div className="text-center py-12">Carregando detalhes do lote...</div>;
  }

  if (!lot) {
    return <div className="text-center py-12">Lote não encontrado.</div>;
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {showManageModal && (
          <ManageAnimalsModal
            user={user}
            lot={lot}
            animalsInLot={animals}
            onCancel={() => setShowManageModal(false)}
            onUpdate={handleUpdateSuccess}
          />
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <Button onClick={onBack} variant="ghost"><ArrowLeft className="w-5 h-5 mr-2" /> Voltar para a lista de lotes</Button>
      </div>

      <div className="chart-container">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-2xl flex items-center justify-center mb-4 md:mb-0">
            <Layers className="w-12 h-12 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-800">{lot.name}</h2>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-slate-600">
              <span className="flex items-center capitalize"><Users className="w-4 h-4 mr-2" />{animals.length} Animais</span>
              {lot.description && (
                 <span className="flex items-center truncate max-w-md">{lot.description}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="chart-container">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-slate-700">Animais no Lote</h3>
          <Button onClick={() => setShowManageModal(true)} className="btn-primary"><Plus className="w-5 h-5 mr-2" /> Gerenciar Animais</Button>
        </div>
        {animals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="p-4 text-sm font-semibold text-slate-600">Brinco (ID)</th>
                  <th className="p-4 text-sm font-semibold text-slate-600">Raça</th>
                  <th className="p-4 text-sm font-semibold text-slate-600">Sexo</th>
                </tr>
              </thead>
              <tbody>
                {animals.map(item => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-800">{item.ear_tag_id || 'Animal Removido'}</td>
                    <td className="p-4 text-slate-600">{item.breed || '-'}</td>
                    <td className="p-4 text-slate-600 capitalize">{item.sex || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 wallet-card">
            <p className="text-slate-500">Nenhum animal neste lote.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LotDetails;
