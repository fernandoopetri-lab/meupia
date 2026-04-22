
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { X, Search, Hash, Loader2 } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";

const AddAnimalToLotModal = ({ user, lotId, onCancel, onSuccess }) => {
  const { toast } = useToast();
  const [animals, setAnimals] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAvailableAnimals = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('livestock')
        .select('id, ear_tag_id, breed, sex')
        .eq('user_id', user.id)
        .eq('status', 'ativo')
        .or(`lot_id.neq.${lotId},lot_id.is.null`);
      
      if (error) {
        toast({ title: "Erro", description: "Não foi possível carregar os animais disponíveis.", variant: "destructive" });
      } else {
        setAnimals(data || []);
      }
      setLoading(false);
    };

    fetchAvailableAnimals();
  }, [user.id, lotId, toast]);

  const handleToggle = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(animalId => animalId !== id) : [...prev, id]
    );
  };

  const handleConfirm = async () => {
    if (selectedIds.length === 0) {
      toast({ title: "Aviso", description: "Selecione pelo menos um animal.", variant: "default" });
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from('livestock')
      .update({ lot_id: lotId })
      .in('id', selectedIds)
      .eq('user_id', user.id);

    if (error) {
      toast({ title: "Erro", description: "Falha ao adicionar animais ao lote.", variant: "destructive" });
    } else {
      toast({ title: "Sucesso!", description: `${selectedIds.length} animal(is) adicionado(s) ao lote.` });
      onSuccess();
    }
    setSaving(false);
  };

  const filteredAnimals = animals.filter(a => 
    a.ear_tag_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[85vh] flex flex-col shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-800">Adicionar Animais</h3>
          <Button variant="ghost" size="icon" onClick={onCancel}><X className="w-5 h-5" /></Button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por brinco..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="input-field pl-10 bg-slate-50 border-slate-200"
          />
        </div>

        {loading ? (
          <div className="flex-grow flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : filteredAnimals.length > 0 ? (
          <div className="flex-grow overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {filteredAnimals.map(animal => (
              <div 
                key={animal.id} 
                className={`flex items-center justify-between p-3 rounded-xl border transition-colors cursor-pointer ${selectedIds.includes(animal.id) ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100 hover:bg-slate-50'}`}
                onClick={() => handleToggle(animal.id)}
              >
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id={`animal-${animal.id}`}
                    checked={selectedIds.includes(animal.id)}
                    onCheckedChange={() => handleToggle(animal.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div>
                    <label htmlFor={`animal-${animal.id}`} className="text-sm font-bold text-slate-800 cursor-pointer flex items-center">
                      <Hash className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {animal.ear_tag_id}
                    </label>
                    <p className="text-xs text-slate-500 capitalize">{animal.breed || 'Sem raça'} • {animal.sex}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <Hash className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">Nenhum animal disponível</p>
            <p className="text-slate-400 text-sm mt-1">Todos os seus animais já estão neste lote ou não correspondem à busca.</p>
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onCancel} disabled={saving} className="w-full sm:w-auto">Cancelar</Button>
          <Button onClick={handleConfirm} disabled={saving || selectedIds.length === 0} className="btn-primary w-full sm:w-auto">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Adicionar Selecionados ({selectedIds.length})
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AddAnimalToLotModal;
