import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Syringe, TestTube2, HeartPulse, Wind, Move, DollarSign, Skull, Baby, Milk, Beef, Activity, Edit2 } from 'lucide-react';

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

const EventsList = ({ user, onDataChange }) => {
  const { toast } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todos');

  const eventTypes = [
    { value: 'todos', label: 'Todos' },
    { value: 'vacina', label: 'Vacinação' },
    { value: 'vermifugo', label: 'Vermifugação' },
    { value: 'inseminacao', label: 'Inseminação' },
    { value: 'prenhez', label: 'Prenhez' },
    { value: 'parto', label: 'Parto' },
    { value: 'pesagem', label: 'Pesagem' },
    { value: 'producao_leite', label: 'Produção de Leite' },
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('livestock_events').select('*, animal:animal_id(ear_tag_id)').eq('user_id', user.id);
    if (filter !== 'todos') {
      query = query.eq('event_type', filter);
    }
    query = query.order('event_date', { ascending: false });

    const { data, error } = await query;

    if (error) {
      toast({ title: "Erro", description: "Não foi possível carregar os eventos.", variant: "destructive" });
    } else {
      setEvents(data);
    }
    setLoading(false);
  }, [user.id, toast, filter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Eventos do Rebanho</h2>

      <div className="chart-container">
        <div className="flex flex-wrap gap-2">
          {eventTypes.map(type => (
            <Button key={type.value} variant={filter === type.value ? 'default' : 'outline'} onClick={() => setFilter(type.value)}>
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Carregando eventos...</div>
      ) : events.length > 0 ? (
        <div className="chart-container space-y-4">
          {events.map(event => (
            <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-slate-50">
              <EventIcon type={event.event_type} />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-slate-800 capitalize">{event.event_type.replace('_', ' ')}</p>
                    <p className="text-sm text-slate-500">Animal: {event.animal?.ear_tag_id || 'Lote'}</p>
                  </div>
                  <span className="text-sm text-slate-500">{new Date(event.event_date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="text-sm text-slate-600 mt-1">
                  {event.event_type === 'pesagem' && <p>Peso: {event.weight} Kg</p>}
                  {event.event_type === 'producao_leite' && <p>Produção: {event.quantity} L</p>}
                  {event.details && Object.entries(event.details).map(([key, value]) => (
                    <p key={key}><span className="font-medium capitalize">{key.replace('_', ' ')}:</span> {typeof value === 'object' ? JSON.stringify(value) : value}</p>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 chart-container">
          <Syringe className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-600 mb-2">Nenhum evento encontrado</h3>
          <p className="text-slate-500">Nenhum evento do tipo selecionado foi registrado ainda.</p>
        </motion.div>
      )}
    </div>
  );
};

export default EventsList;