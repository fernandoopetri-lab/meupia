
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const AnimalForm = ({ user, editingAnimal, onFormSubmit, onCancel }) => {
  const { toast } = useToast();
  const [properties, setProperties] = useState([]);
  const [lots, setLots] = useState([]);
  const [formData, setFormData] = useState({
    ear_tag_id: '',
    breed: '',
    sex: 'femea',
    birth_date: '',
    status: 'ativo',
    notes: '',
    property_id: '',
    lot_id: '',
    sale_date: '',
    sale_value: '',
    death_date: '',
    death_reason: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      const [propsRes, lotsRes] = await Promise.all([
        supabase.from('properties').select('id, name').eq('user_id', user.id),
        supabase.from('livestock_lots').select('id, name').eq('user_id', user.id)
      ]);

      if (propsRes.error) {
        toast({ title: "Erro", description: "Não foi possível carregar as propriedades.", variant: "destructive" });
      } else {
        setProperties(propsRes.data || []);
      }

      if (lotsRes.error) {
        toast({ title: "Erro", description: "Não foi possível carregar os lotes.", variant: "destructive" });
      } else {
        setLots(lotsRes.data || []);
      }
    };
    fetchData();
  }, [user.id, toast]);

  useEffect(() => {
    if (editingAnimal) {
      setFormData({
        ear_tag_id: editingAnimal.ear_tag_id || '',
        breed: editingAnimal.breed || '',
        sex: editingAnimal.sex || 'femea',
        birth_date: editingAnimal.birth_date || '',
        status: editingAnimal.status || 'ativo',
        notes: editingAnimal.notes || '',
        property_id: editingAnimal.property_id || '',
        lot_id: editingAnimal.lot_id || '',
        sale_date: editingAnimal.status_details?.sale_date || '',
        sale_value: editingAnimal.status_details?.sale_value || '',
        death_date: editingAnimal.status_details?.death_date || '',
        death_reason: editingAnimal.status_details?.death_reason || ''
      });
    }
  }, [editingAnimal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.ear_tag_id) {
      toast({ title: "Erro", description: "O número do brinco é obrigatório.", variant: "destructive" });
      return;
    }

    let status_details = null;
    if (formData.status === 'vendido') {
      status_details = { sale_date: formData.sale_date, sale_value: formData.sale_value };
    } else if (formData.status === 'morto') {
      status_details = { death_date: formData.death_date, death_reason: formData.death_reason };
    }

    const animalData = {
      user_id: user.id,
      ear_tag_id: formData.ear_tag_id,
      breed: formData.breed,
      sex: formData.sex,
      birth_date: formData.birth_date || null,
      status: formData.status,
      notes: formData.notes,
      property_id: formData.property_id || null,
      lot_id: formData.lot_id || null,
      status_details
    };

    onFormSubmit(animalData);
  };

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="chart-container">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-slate-700 mb-4">{editingAnimal ? 'Editar Animal' : 'Novo Animal'}</h3>
        <Button variant="ghost" size="icon" onClick={onCancel}><X className="w-5 h-5" /></Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Nº do Brinco (ID)</label>
            <input type="text" value={formData.ear_tag_id} onChange={(e) => setFormData(p => ({ ...p, ear_tag_id: e.target.value }))} placeholder="Ex: 12345" className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Raça</label>
            <input type="text" value={formData.breed} onChange={(e) => setFormData(p => ({ ...p, breed: e.target.value }))} placeholder="Ex: Nelore" className="input-field" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Sexo</label>
            <select value={formData.sex} onChange={(e) => setFormData(p => ({ ...p, sex: e.target.value }))} className="input-field">
              <option value="femea">Fêmea</option>
              <option value="macho">Macho</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Data de Nascimento</label>
            <input type="date" value={formData.birth_date} onChange={(e) => setFormData(p => ({ ...p, birth_date: e.target.value }))} className="input-field" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Propriedade</label>
            <select value={formData.property_id} onChange={(e) => setFormData(p => ({ ...p, property_id: e.target.value }))} className="input-field">
              <option value="">Nenhuma</option>
              {properties.map(prop => <option key={prop.id} value={prop.id}>{prop.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Lote</label>
            <select value={formData.lot_id} onChange={(e) => setFormData(p => ({ ...p, lot_id: e.target.value }))} className="input-field">
              <option value="">Nenhum lote</option>
              {lots.map(lot => <option key={lot.id} value={lot.id}>{lot.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select value={formData.status} onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))} className="input-field">
              <option value="ativo">Ativo</option>
              <option value="vendido">Vendido</option>
              <option value="morto">Morto</option>
            </select>
          </div>
        </div>
        {formData.status === 'vendido' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Data da Venda</label>
              <input type="date" value={formData.sale_date} onChange={(e) => setFormData(p => ({ ...p, sale_date: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Valor da Venda</label>
              <input type="number" step="0.01" value={formData.sale_value} onChange={(e) => setFormData(p => ({ ...p, sale_value: e.target.value }))} placeholder="R$ 0,00" className="input-field" />
            </div>
          </div>
        )}
        {formData.status === 'morto' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-red-200 rounded-lg bg-red-50">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Data da Morte</label>
              <input type="date" value={formData.death_date} onChange={(e) => setFormData(p => ({ ...p, death_date: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Motivo</label>
              <input type="text" value={formData.death_reason} onChange={(e) => setFormData(p => ({ ...p, death_reason: e.target.value }))} placeholder="Doença, acidente..." className="input-field" />
            </div>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Observações</label>
          <textarea value={formData.notes} onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))} rows="3" className="input-field"></textarea>
        </div>
        <div className="flex space-x-3">
          <Button type="submit" className="btn-primary">{editingAnimal ? 'Atualizar' : 'Salvar'}</Button>
          <Button type="button" onClick={onCancel} className="px-6 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all">Cancelar</Button>
        </div>
      </form>
    </motion.div>
  );
};

export default AnimalForm;
