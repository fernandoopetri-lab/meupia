import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const eventTypes = [
  { value: 'vacina', label: 'Vacinação' },
  { value: 'vermifugo', label: 'Vermifugação' },
  { value: 'inseminacao', label: 'Inseminação / Cobertura' },
  { value: 'prenhez', label: 'Confirmação de Prenhez' },
  { value: 'secagem', label: 'Secagem' },
  { value: 'transferencia', label: 'Transferência' },
  { value: 'venda', label: 'Venda' },
  { value: 'morte', label: 'Morte' },
  { value: 'pesagem', label: 'Pesagem' },
  { value: 'producao_leite', label: 'Produção de Leite' },
];

const EventForm = ({ onFormSubmit, onCancel, editingEvent }) => {
  const { toast } = useToast();
  const [eventType, setEventType] = useState(editingEvent?.event_type || 'vacina');
  const [eventDate, setEventDate] = useState(editingEvent?.event_date || '');
  const [details, setDetails] = useState(editingEvent?.details || {});
  const [weight, setWeight] = useState(editingEvent?.weight || '');
  const [quantity, setQuantity] = useState(editingEvent?.quantity || '');

  useEffect(() => {
    if (editingEvent) {
      setEventType(editingEvent.event_type);
      setEventDate(editingEvent.event_date);
      setDetails(editingEvent.details || {});
      setWeight(editingEvent.weight || '');
      setQuantity(editingEvent.quantity || '');
    }
  }, [editingEvent]);

  const handleDetailChange = (field, value) => {
    setDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!eventDate) {
      toast({ title: "Erro", description: "A data do evento é obrigatória.", variant: "destructive" });
      return;
    }
    const eventData = {
      event_type: eventType,
      event_date: eventDate,
      details,
      weight: eventType === 'pesagem' ? weight : null,
      quantity: eventType === 'producao_leite' ? quantity : null,
    };
    onFormSubmit(eventData);
  };

  const renderDetailFields = () => {
    switch (eventType) {
      case 'vacina':
        return (
          <>
            <input type="text" placeholder="Tipo de vacina" value={details.tipo_vacina || ''} onChange={e => handleDetailChange('tipo_vacina', e.target.value)} className="input-field" />
            <input type="text" placeholder="Lote da vacina" value={details.lote_vacina || ''} onChange={e => handleDetailChange('lote_vacina', e.target.value)} className="input-field" />
          </>
        );
      case 'vermifugo':
        return <input type="text" placeholder="Tipo de vermífugo" value={details.tipo_vermifugo || ''} onChange={e => handleDetailChange('tipo_vermifugo', e.target.value)} className="input-field" />;
      case 'inseminacao':
        return (
          <>
            <select value={details.tipo || 'ia'} onChange={e => handleDetailChange('tipo', e.target.value)} className="input-field">
              <option value="ia">Inseminação Artificial</option>
              <option value="natural">Cobertura Natural</option>
            </select>
            <input type="text" placeholder="Touro utilizado" value={details.touro || ''} onChange={e => handleDetailChange('touro', e.target.value)} className="input-field" />
          </>
        );
      case 'prenhez':
        return (
          <select value={details.resultado || 'positiva'} onChange={e => handleDetailChange('resultado', e.target.value)} className="input-field">
            <option value="positiva">Positiva</option>
            <option value="negativa">Negativa</option>
          </select>
        );
      case 'transferencia':
        return (
          <>
            <input type="text" placeholder="Propriedade de origem" value={details.origem || ''} onChange={e => handleDetailChange('origem', e.target.value)} className="input-field" />
            <input type="text" placeholder="Propriedade de destino" value={details.destino || ''} onChange={e => handleDetailChange('destino', e.target.value)} className="input-field" />
          </>
        );
      case 'venda':
        return (
          <>
            <input type="number" placeholder="Valor da venda" value={details.valor || ''} onChange={e => handleDetailChange('valor', e.target.value)} className="input-field" />
            <input type="text" placeholder="Comprador" value={details.comprador || ''} onChange={e => handleDetailChange('comprador', e.target.value)} className="input-field" />
          </>
        );
      case 'morte':
        return <input type="text" placeholder="Motivo da morte" value={details.motivo || ''} onChange={e => handleDetailChange('motivo', e.target.value)} className="input-field" />;
      case 'pesagem':
        return <input type="number" placeholder="Peso (Kg)" value={weight} onChange={e => setWeight(e.target.value)} className="input-field" required />;
      case 'producao_leite':
        return <input type="number" placeholder="Produção (L)" value={quantity} onChange={e => setQuantity(e.target.value)} className="input-field" required />;
      default:
        return <textarea placeholder="Observações" value={details.observacoes || ''} onChange={e => handleDetailChange('observacoes', e.target.value)} className="input-field" />;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="chart-container">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-slate-700">{editingEvent ? 'Editar Evento' : 'Novo Evento'}</h3>
        <Button variant="ghost" size="icon" onClick={onCancel}><X className="w-5 h-5" /></Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Evento</label>
            <select value={eventType} onChange={e => setEventType(e.target.value)} className="input-field">
              {eventTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Data do Evento</label>
            <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="input-field" required />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Detalhes</label>
          {renderDetailFields()}
        </div>
        <div className="flex space-x-3 pt-4">
          <Button type="submit" className="btn-primary">{editingEvent ? 'Atualizar Evento' : 'Salvar Evento'}</Button>
          <Button type="button" onClick={onCancel} variant="outline">Cancelar</Button>
        </div>
      </form>
    </motion.div>
  );
};

export default EventForm;