import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Archive, Edit2, Trash2, Building, MapPin, BarChart, Package, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import GrainSaleModal from '@/components/crops/GrainSaleModal';

const SiloManager = ({ user }) => {
  const { toast } = useToast();
  const [silos, setSilos] = useState([]);
  const [siloStock, setSiloStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSilo, setEditingSilo] = useState(null);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [selectedStockItem, setSelectedStockItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    cooperative: '',
    capacity: '',
    capacity_unit: 'tonnes',
    location: ''
  });

  const capacityUnits = ['tonnes', 'bags'];

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    
    const [silosRes, stockRes] = await Promise.all([
      supabase.from('silos').select('*').eq('user_id', user.id).order('name', { ascending: true }),
      supabase.from('silo_stock').select('*').eq('user_id', user.id)
    ]);

    if (silosRes.error) {
      toast({ title: "Erro", description: "Não foi possível carregar os silos.", variant: "destructive" });
      setSilos([]);
    } else {
      setSilos(Array.isArray(silosRes.data) ? silosRes.data : []);
    }

    if (stockRes.error) {
      toast({ title: "Erro", description: "Não foi possível carregar o estoque dos silos.", variant: "destructive" });
      setSiloStock([]);
    } else {
      setSiloStock(Array.isArray(stockRes.data) ? stockRes.data : []);
    }

    setLoading(false);
  }, [user?.id, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const silosWithStock = useMemo(() => {
    return silos.map(silo => {
      const stock = siloStock.filter(item => item.silo_id === silo.id);
      const totalStock = stock.reduce((acc, item) => acc + (item.quantity || 0), 0);
      const occupancy = silo.capacity > 0 ? (totalStock / silo.capacity) * 100 : 0;
      return { ...silo, stock, totalStock, occupancy };
    });
  }, [silos, siloStock]);

  const resetForm = () => {
    setFormData({ name: '', cooperative: '', capacity: '', capacity_unit: 'tonnes', location: '' });
    setEditingSilo(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.capacity) {
      toast({ title: "Erro", description: "Nome e capacidade do silo são obrigatórios.", variant: "destructive" });
      return;
    }

    const siloData = {
      user_id: user.id,
      name: formData.name,
      cooperative: formData.cooperative,
      capacity: parseFloat(formData.capacity),
      capacity_unit: formData.capacity_unit,
      location: formData.location,
    };

    let error;
    if (editingSilo) {
      const { error: updateError } = await supabase.from('silos').update(siloData).eq('id', editingSilo.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('silos').insert(siloData);
      error = insertError;
    }

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso!", description: `Silo ${editingSilo ? 'atualizado' : 'adicionado'} com sucesso.` });
      resetForm();
      fetchData();
    }
  };

  const handleEdit = (e, silo) => {
    e.stopPropagation();
    setEditingSilo(silo);
    setFormData({
      name: silo.name,
      cooperative: silo.cooperative || '',
      capacity: silo.capacity,
      capacity_unit: silo.capacity_unit,
      location: silo.location || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (e, siloId) => {
    e.stopPropagation();
    
    const { data: stock, error: stockError } = await supabase.from('silo_stock').select('id').eq('silo_id', siloId).limit(1);
    if (stockError) {
        toast({ title: "Erro", description: "Não foi possível verificar o estoque do silo.", variant: "destructive" });
        return;
    }
    if (stock && stock.length > 0) {
        toast({
            title: "Ação não permitida",
            description: "Este silo possui estoque e não pode ser excluído. Remova o estoque primeiro.",
            variant: "default"
        });
        return;
    }

    const { error } = await supabase.from('silos').delete().eq('id', siloId);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso!", description: "Silo removido com sucesso." });
      fetchData();
    }
  };

  const handleOpenSaleModal = (e, stockItem) => {
    e.stopPropagation();
    setSelectedStockItem(stockItem);
    setShowSaleModal(true);
  };

  const handleCloseSaleModal = () => {
    setShowSaleModal(false);
    setSelectedStockItem(null);
  };

  const handleSaleSuccess = () => {
    handleCloseSaleModal();
    fetchData(); // Refresh data after sale
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {showSaleModal && selectedStockItem && (
          <GrainSaleModal
            user={user}
            stockItem={selectedStockItem}
            onClose={handleCloseSaleModal}
            onSaleSuccess={handleSaleSuccess}
          />
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Gerenciar Silos</h2>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary">
          <Plus className="w-5 h-5 mr-2" /> Adicionar Silo
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="chart-container">
            <h3 className="text-xl font-semibold text-slate-700 mb-4">{editingSilo ? 'Editar Silo' : 'Novo Silo'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nome do Silo*</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Silo Principal" className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Cooperativa / Armazém</label>
                  <input type="text" value={formData.cooperative} onChange={(e) => setFormData(p => ({ ...p, cooperative: e.target.value }))} placeholder="Ex: Coopercitrus" className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-end gap-2">
                  <div className="flex-grow">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Capacidade*</label>
                    <input type="number" step="1" value={formData.capacity} onChange={(e) => setFormData(p => ({ ...p, capacity: e.target.value }))} placeholder="Ex: 10000" className="input-field" required />
                  </div>
                  <select value={formData.capacity_unit} onChange={(e) => setFormData(p => ({ ...p, capacity_unit: e.target.value }))} className="input-field w-auto">
                    {capacityUnits.map(unit => <option key={unit} value={unit}>{unit === 'tonnes' ? 'Toneladas' : 'Sacas'}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Localização</label>
                  <input type="text" value={formData.location} onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))} placeholder="Ex: Sede da Fazenda" className="input-field" />
                </div>
              </div>
              <div className="flex space-x-3">
                <Button type="submit" className="btn-primary">{editingSilo ? 'Atualizar' : 'Salvar'}</Button>
                <Button type="button" onClick={resetForm} className="px-6 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all">Cancelar</Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="text-center py-12">Carregando silos...</div>
      ) : silosWithStock.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {silosWithStock.map((silo, index) => (
            <motion.div 
              key={silo.id} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: index * 0.1 }} 
              className="wallet-card group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-100">
                  <Archive className="w-6 h-6 text-gray-600" />
                </div>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => handleEdit(e, silo)} className="p-2 text-slate-400 hover:text-blue-600" title="Editar"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={(e) => handleDelete(e, silo.id)} className="p-2 text-slate-400 hover:text-red-600" title="Excluir"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-700 truncate">{silo.name}</h3>
              {silo.cooperative && <p className="text-sm text-slate-500 flex items-center gap-2"><Building className="w-4 h-4" />{silo.cooperative}</p>}
              {silo.location && <p className="text-sm text-slate-500 flex items-center gap-2"><MapPin className="w-4 h-4" />{silo.location}</p>}
              
              <div className="mt-4 space-y-2">
                <div className="text-sm">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Ocupação</span>
                    <span className="font-semibold">{silo.occupancy.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 mt-1">
                    <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${silo.occupancy}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500 mt-1">
                    <span>{silo.totalStock.toLocaleString('pt-BR')} {silo.capacity_unit === 'tonnes' ? 'ton' : 'sc'}</span>
                    <span>{parseFloat(silo.capacity).toLocaleString('pt-BR')} {silo.capacity_unit === 'tonnes' ? 'ton' : 'sc'}</span>
                  </div>
                </div>
                {silo.stock.length > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <h4 className="text-xs font-semibold text-slate-500 mb-1">Estoque por Grão:</h4>
                    <div className="space-y-1">
                      {silo.stock.map(item => (
                        <div key={item.id} className="flex justify-between items-center text-sm text-slate-600 group/item">
                          <span className="flex items-center gap-2"><Package className="w-4 h-4 text-amber-600" /> {item.grain_type}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.quantity.toLocaleString('pt-BR')} {item.unit}</span>
                            <Button variant="ghost" size="sm" className="h-7 px-2 opacity-0 group-hover/item:opacity-100 transition-opacity" onClick={(e) => handleOpenSaleModal(e, item)}>
                              <DollarSign className="w-4 h-4 mr-1 text-emerald-600" /> Vender
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 wallet-card">
          <Archive className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-600 mb-2">Nenhum silo cadastrado</h3>
          <p className="text-slate-500 mb-6">Adicione seu primeiro silo para gerenciar o armazenamento de grãos.</p>
          <Button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-5 h-5 mr-2" />Adicionar Silo</Button>
        </motion.div>
      )}
    </div>
  );
};

export default SiloManager;