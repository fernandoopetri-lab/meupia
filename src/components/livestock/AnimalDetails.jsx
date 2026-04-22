
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit2, Plus, Hash, Dna, VenetianMask, Calendar, Activity, Syringe, TestTube2, HeartPulse, Wind, Move, DollarSign, Skull, Baby, Milk, Beef, GitCommit, Layers, MapPin } from 'lucide-react';
import EventForm from '@/components/livestock/EventForm';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnimalLots from '@/components/livestock/AnimalLots';

const EventIcon = ({ type }) => {
  const icons = {
    'vacina': { icon: Syringe, color: 'text-blue-500', bg: 'bg-blue-100' },
    'vermifugo': { icon: TestTube2, color: 'text-indigo-500', bg: 'bg-indigo-100' },
    'inseminacao': { icon: HeartPulse, color: 'text-pink-500', bg: 'bg-pink-100' },
    'prenhez': { icon: HeartPulse, color: 'text-purple-500', bg: 'bg-purple-100' },
    'secagem': { icon: Wind, color: 'text-gray-500', bg: 'bg-gray-100' },
    'transferencia': { icon: Move, color: 'text-yellow-500', bg: 'bg-yellow-100' },
    'venda': { icon: DollarSign, color: 'text-green-500', bg: 'bg-green-100' },
    'morte': { icon: Skull, color: 'text-red-500', bg: 'bg-red-100' },
    'parto': { icon: Baby, color: 'text-cyan-500', bg: 'bg-cyan-100' },
    'producao_leite': { icon: Milk, color: 'text-sky-500', bg: 'bg-sky-100' },
    'pesagem': { icon: Beef, color: 'text-orange-500', bg: 'bg-orange-100' },
    'default': { icon: Activity, color: 'text-slate-500', bg: 'bg-slate-100' },
  };
  const { icon: Icon, color, bg } = icons[type] || icons['default'];
  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bg}`}>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
  );
};

const AnimalDetails = ({ user, animalId, onBack, onDataChange }) => {
  const { toast } = useToast();
  const [animal, setAnimal] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [animalRes, eventsRes] = await Promise.all([
      supabase.from('livestock').select('*, properties(name)').eq('id', animalId).single(),
      supabase.from('livestock_events').select('*').eq('animal_id', animalId).order('event_date', { ascending: false })
    ]);

    if (animalRes.error) {
      toast({ title: "Erro", description: "Animal não encontrado.", variant: "destructive" });
      onBack();
    } else {
      setAnimal(animalRes.data);
    }

    if (eventsRes.error) {
      toast({ title: "Erro", description: "Não foi possível carregar os eventos.", variant: "destructive" });
      setEvents([]);
    } else {
      setEvents(eventsRes.data || []);
    }
    setLoading(false);
  }, [animalId, toast, onBack]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEventSubmit = async (eventData) => {
    const payload = {
      ...eventData,
      user_id: user.id,
      animal_id: animalId,
    };

    let error;
    if (editingEvent) {
      const { error: updateError } = await supabase.from('livestock_events').update(payload).eq('id', editingEvent.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('livestock_events').insert(payload);
      error = insertError;
    }

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso!", description: `Evento ${editingEvent ? 'atualizado' : 'adicionado'} com sucesso.` });
      setShowEventForm(false);
      setEditingEvent(null);
      fetchData();
      if (onDataChange) onDataChange();
    }
  };

  const weightData = (events || [])
    .filter(e => e.event_type === 'pesagem' && e.weight)
    .map(e => ({ date: new Date(e.event_date).toLocaleDateString('pt-BR'), weight: e.weight }))
    .reverse();

  if (loading) {
    return <div className="text-center py-12">Carregando detalhes do animal...</div>;
  }

  if (!animal) {
    return <div className="text-center py-12">Animal não encontrado.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button onClick={onBack} variant="ghost"><ArrowLeft className="w-5 h-5 mr-2" /> Voltar para a lista</Button>
      </div>

      <div className="chart-container">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-2xl flex items-center justify-center mb-4 md:mb-0">
            <GitCommit className="w-12 h-12 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Brinco: {animal.ear_tag_id}</h2>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-slate-600">
              <span className="flex items-center"><MapPin className="w-4 h-4 mr-2" />{animal.properties?.name || 'N/A'}</span>
              <span className="flex items-center"><Dna className="w-4 h-4 mr-2" />{animal.breed || 'N/A'}</span>
              <span className="flex items-center capitalize"><VenetianMask className="w-4 h-4 mr-2" />{animal.sex}</span>
              <span className="flex items-center"><Calendar className="w-4 h-4 mr-2" />{animal.birth_date ? new Date(animal.birth_date + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A'}</span>
              <span className="flex items-center capitalize"><Activity className="w-4 h-4 mr-2" />{animal.status}</span>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="events" className="w-full">
        <TabsList>
          <TabsTrigger value="events">Histórico de Eventos</TabsTrigger>
          <TabsTrigger value="lots">Lotes</TabsTrigger>
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
        </TabsList>
        <TabsContent value="events">
          <div className="chart-container">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-slate-700">Linha do Tempo</h3>
              <Button onClick={() => { setEditingEvent(null); setShowEventForm(true); }} className="btn-primary"><Plus className="w-5 h-5 mr-2" /> Adicionar Evento</Button>
            </div>
            <AnimatePresence>
              {showEventForm && <EventForm onFormSubmit={handleEventSubmit} onCancel={() => { setShowEventForm(false); setEditingEvent(null); }} editingEvent={editingEvent} />}
            </AnimatePresence>
            {events.length > 0 ? (
              <div className="space-y-6 mt-6">
                {events.map(event => (
                  <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-start space-x-4 wallet-card">
                    <EventIcon type={event.event_type} />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-slate-800 capitalize">{event.event_type.replace('_', ' ')}</p>
                        <span className="text-sm text-slate-500">{new Date(event.event_date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="text-sm text-slate-600 mt-1">
                        {event.event_type === 'pesagem' && <p>Peso: {event.weight} Kg</p>}
                        {event.event_type === 'producao_leite' && <p>Produção: {event.quantity} L</p>}
                        {event.details && Object.entries(event.details).map(([key, value]) => (
                          <p key={key}><span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span> {typeof value === 'object' ? JSON.stringify(value) : value}</p>
                        ))}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => { setEditingEvent(event); setShowEventForm(true); }}><Edit2 className="w-4 h-4 text-slate-400" /></Button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 wallet-card">
                <p className="text-slate-500">Nenhum evento registrado para este animal.</p>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="lots">
          <AnimalLots user={user} animal={animal} onDataChange={fetchData} />
        </TabsContent>
        <TabsContent value="charts">
          {weightData.length > 1 ? (
            <div className="chart-container">
              <h3 className="text-xl font-semibold text-slate-700 mb-4">Evolução do Peso</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="weight" name="Peso (Kg)" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12 chart-container">
              <p className="text-slate-500">Não há dados de peso suficientes para gerar um gráfico.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnimalDetails;
