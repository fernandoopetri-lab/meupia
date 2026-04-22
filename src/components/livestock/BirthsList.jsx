import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X, Baby, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const BirthForm = ({ user, mothers, onFormSubmit, onCancel }) => {
  const { toast } = useToast();
  const [birthDate, setBirthDate] = useState('');
  const [motherId, setMotherId] = useState('');
  const [notes, setNotes] = useState('');
  const [calves, setCalves] = useState([{ ear_tag_id: '', sex: 'femea', breed: '' }]);

  useEffect(() => {
    if (motherId) {
      const mother = mothers.find(m => m.id === parseInt(motherId));
      if (mother) {
        setCalves(calves.map(calf => ({ ...calf, breed: mother.breed })));
      }
    }
  }, [motherId, mothers, calves]);

  const handleCalfChange = (index, field, value) => {
    const newCalves = [...calves];
    newCalves[index][field] = value;
    setCalves(newCalves);
  };

  const addCalf = () => {
    setCalves([...calves, { ear_tag_id: '', sex: 'femea', breed: calves[0]?.breed || '' }]);
  };

  const removeCalf = (index) => {
    const newCalves = calves.filter((_, i) => i !== index);
    setCalves(newCalves);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!birthDate || !motherId) {
      toast({ title: "Erro", description: "Data do nascimento e Vaca mãe são obrigatórios.", variant: "destructive" });
      return;
    }
    onFormSubmit({ birthDate, motherId, notes, calves });
  };

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="chart-container">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-slate-700">Registrar Novo Parto</h3>
        <Button variant="ghost" size="icon" onClick={onCancel}><X className="w-5 h-5" /></Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Data do Nascimento</label>
            <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Vaca Mãe</label>
            <select value={motherId} onChange={(e) => setMotherId(e.target.value)} className="input-field" required>
              <option value="">Selecione a mãe</option>
              {mothers.map(mother => (
                <option key={mother.id} value={mother.id}>Brinco: {mother.ear_tag_id} ({mother.breed})</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Observações do Parto</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows="2" className="input-field" placeholder="Ex: Parto gemelar, dificuldade no parto..."></textarea>
        </div>

        <h4 className="text-lg font-semibold text-slate-700 pt-4 border-t border-slate-200">Bezerro(s)</h4>
        {calves.map((calf, index) => (
          <div key={index} className="p-4 border border-slate-200 rounded-lg space-y-3 relative">
            {calves.length > 1 && (
              <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeCalf(index)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nº do Brinco (ID)</label>
                <input type="text" value={calf.ear_tag_id} onChange={(e) => handleCalfChange(index, 'ear_tag_id', e.target.value)} placeholder="Preencher" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sexo</label>
                <select value={calf.sex} onChange={(e) => handleCalfChange(index, 'sex', e.target.value)} className="input-field">
                  <option value="femea">Fêmea</option>
                  <option value="macho">Macho</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Raça</label>
                <input type="text" value={calf.breed} onChange={(e) => handleCalfChange(index, 'breed', e.target.value)} placeholder="Raça do bezerro" className="input-field" />
              </div>
            </div>
          </div>
        ))}
        <Button type="button" onClick={addCalf} variant="outline" className="w-full"><Plus className="w-4 h-4 mr-2" /> Adicionar outro bezerro (parto gemelar)</Button>

        <div className="flex space-x-3 pt-4">
          <Button type="submit" className="btn-primary">Salvar Parto e Criar Bezerro(s)</Button>
          <Button type="button" onClick={onCancel} className="px-6 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all">Cancelar</Button>
        </div>
      </form>
    </motion.div>
  );
};

const BirthsList = ({ user, onDataChange }) => {
  const { toast } = useToast();
  const [births, setBirths] = useState([]);
  const [livestock, setLivestock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [viewingHistoryFor, setViewingHistoryFor] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [birthsRes, livestockRes] = await Promise.all([
      supabase.from('livestock_events').select('*, animal:animal_id(ear_tag_id, breed)').eq('user_id', user.id).eq('event_type', 'parto').order('event_date', { ascending: false }),
      supabase.from('livestock').select('*').eq('user_id', user.id)
    ]);

    if (birthsRes.error) {
      toast({ title: "Erro", description: "Não foi possível carregar os partos.", variant: "destructive" });
    } else {
      setBirths(birthsRes.data);
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

  const handleFormSubmit = async ({ birthDate, motherId, notes, calves }) => {
    const mother = livestock.find(a => a.id === parseInt(motherId));
    if (!mother) {
      toast({ title: "Erro", description: "Mãe não encontrada.", variant: "destructive" });
      return;
    }

    const createdCalves = [];
    for (const calf of calves) {
      const { data: newCalf, error: calfError } = await supabase.from('livestock').insert({
        user_id: user.id,
        ear_tag_id: calf.ear_tag_id,
        sex: calf.sex,
        breed: calf.breed,
        birth_date: birthDate,
        status: 'ativo',
        notes: 'Bezerro recém-nascido',
        mother_id: mother.id,
      }).select().single();

      if (calfError) {
        toast({ title: "Erro ao criar bezerro", description: calfError.message, variant: "destructive" });
        return;
      }
      createdCalves.push(newCalf);
    }

    const { error: eventError } = await supabase.from('livestock_events').insert({
      user_id: user.id,
      animal_id: mother.id,
      event_type: 'parto',
      event_date: birthDate,
      details: {
        notes,
        calves: createdCalves.map(c => ({ id: c.id, ear_tag_id: c.ear_tag_id })),
      }
    });

    if (eventError) {
      toast({ title: "Erro ao registrar o parto", description: eventError.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso!", description: "Parto registrado e bezerro(s) criado(s) com sucesso." });
      setShowForm(false);
      fetchData();
      if (onDataChange) onDataChange();
    }
  };

  const mothers = livestock.filter(animal => animal.sex === 'femea' && animal.status === 'ativo');

  if (viewingHistoryFor) {
    const mother = livestock.find(a => a.id === viewingHistoryFor);
    const motherBirths = births.filter(b => b.animal_id === viewingHistoryFor);
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">Histórico de Partos: Vaca {mother?.ear_tag_id}</h2>
          <Button onClick={() => setViewingHistoryFor(null)} variant="outline">Voltar</Button>
        </div>
        {motherBirths.length > 0 ? (
          <div className="chart-container space-y-4">
            {motherBirths.map(birth => (
              <div key={birth.id} className="p-4 border rounded-lg">
                <p className="font-semibold">Data do Parto: {new Date(birth.event_date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                <p>Bezerros:</p>
                <ul className="list-disc pl-6">
                  {birth.details.calves.map(calf => <li key={calf.id}>Brinco: {calf.ear_tag_id || 'Não informado'}</li>)}
                </ul>
                {birth.details.notes && <p className="mt-2 text-sm text-slate-600">Observações: {birth.details.notes}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-8">Nenhum parto registrado para esta vaca.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Controle de Nascimentos</h2>
        <Button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="w-5 h-5 mr-2" /> Registrar Parto
        </Button>
      </div>

      <AnimatePresence>
        {showForm && <BirthForm user={user} mothers={mothers} onFormSubmit={handleFormSubmit} onCancel={() => setShowForm(false)} />}
      </AnimatePresence>

      {loading ? (
        <div className="text-center py-12">Carregando...</div>
      ) : births.length > 0 ? (
        <div className="chart-container overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="p-4 text-sm font-semibold text-slate-600">Data do Parto</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Mãe</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Bezerro(s)</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Observações</th>
                <th className="p-4 text-sm font-semibold text-slate-600 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {births.map((birth) => (
                <motion.tr key={birth.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 text-slate-600">{new Date(birth.event_date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                  <td className="p-4 font-medium text-slate-800">{birth.animal.ear_tag_id}</td>
                  <td className="p-4 text-slate-600">
                    {birth.details.calves.map(c => c.ear_tag_id || 'N/A').join(', ')}
                  </td>
                  <td className="p-4 text-slate-500 text-sm">{birth.details.notes || '-'}</td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => setViewingHistoryFor(birth.animal_id)}>
                      Ver Histórico da Vaca <ChevronsRight className="w-4 h-4 ml-2" />
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 chart-container">
          <Baby className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-600 mb-2">Nenhum parto registrado</h3>
          <p className="text-slate-500 mb-6">Comece registrando o primeiro parto do seu rebanho.</p>
          <Button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-5 h-5 mr-2" />Registrar Parto</Button>
        </motion.div>
      )}
    </div>
  );
};

export default BirthsList;