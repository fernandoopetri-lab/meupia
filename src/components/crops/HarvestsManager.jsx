import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { ClipboardList, Calendar, Package, DollarSign, Edit2, Trash2, MapPin, Wheat, Filter, ArrowLeft, Beaker, PackageCheck } from 'lucide-react';
import HarvestDetails from './HarvestDetails';

const HarvestsManager = ({ user, setActiveTab }) => {
    const { toast } = useToast();
    const [allHarvests, setAllHarvests] = useState([]);
    const [filteredHarvests, setFilteredHarvests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('plantado');
    const [selectedHarvest, setSelectedHarvest] = useState(null);

    const fetchData = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('harvests')
            .select(`
                *,
                plots (
                    name,
                    area,
                    properties ( name )
                )
            `)
            .eq('user_id', user.id)
            .order('planting_date', { ascending: false });

        if (error) {
            toast({ title: "Erro", description: "Não foi possível carregar as safras.", variant: "destructive" });
            setAllHarvests([]);
        } else {
            setAllHarvests(data);
        }
        setLoading(false);
    }, [user?.id, toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (statusFilter === 'todos') {
            setFilteredHarvests(allHarvests);
        } else {
            setFilteredHarvests(allHarvests.filter(h => h.status === statusFilter));
        }
    }, [statusFilter, allHarvests]);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'plantado': return 'bg-yellow-100 text-yellow-800';
            case 'colhido': return 'bg-green-100 text-green-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const filterOptions = [
        { value: 'plantado', label: 'Plantado' },
        { value: 'colhido', label: 'Colhido' },
        { value: 'todos', label: 'Todos' },
    ];

    if (selectedHarvest) {
        return <HarvestDetails harvest={selectedHarvest} onBack={() => setSelectedHarvest(null)} user={user} onDataUpdate={fetchData} setActiveTab={setActiveTab} />;
    }

    return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="heading-premium">Gestão de Safras</h2>
          <p className="subheading-premium">Acompanhe o ciclo produtivo de suas culturas.</p>
        </div>
      </div>

      <div className="card-modern !p-2 max-w-fit">
        <div className="flex p-1 bg-slate-100 rounded-xl">
          {filterOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                statusFilter === option.value
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-lime-500 mb-4" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Carregando safras...</p>
        </div>
      ) : filteredHarvests.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredHarvests.map((harvest, index) => (
            <motion.div 
              key={harvest.id} 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: index * 0.05 }}
              className="card-modern group cursor-pointer hover:bg-slate-50/80 transition-all !p-5 flex flex-col md:flex-row gap-6 items-center"
              onClick={() => setSelectedHarvest(harvest)}
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-lime-50 border border-lime-100 shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform">
                <Wheat className="w-8 h-8 text-lime-600" />
              </div>

              <div className="flex-1 min-w-0 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                  <h4 className="text-xl font-bold text-slate-800 truncate">
                    {harvest.name ? `${harvest.name} - ${harvest.crop_name}` : harvest.crop_name}
                  </h4>
                  <span className={`inline-flex px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg self-center md:self-auto ${getStatusBadge(harvest.status)}`}>
                    {harvest.status}
                  </span>
                </div>
                
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-y-1 gap-x-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <div className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-300" />{harvest.plots.properties.name}</div>
                  <div className="flex items-center"><Beaker className="w-3.5 h-3.5 mr-1.5 text-slate-300" />{harvest.plots.name}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full md:w-auto flex-shrink-0">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 min-w-[120px]">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center">
                    <Calendar className="w-3 h-3 mr-1 text-lime-500" /> Início
                  </p>
                  <p className="text-sm font-black text-slate-700">{new Date(harvest.planting_date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</p>
                </div>
                
                {harvest.harvest_forecast_date && (
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 min-w-[120px]">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center">
                      <PackageCheck className="w-3 h-3 mr-1 text-yellow-500" /> Previsão
                    </p>
                    <p className="text-sm font-black text-slate-700">{new Date(harvest.harvest_forecast_date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</p>
                  </div>
                )}

                {harvest.seeds_used_quantity && (
                  <div className="hidden lg:block bg-slate-50 p-3 rounded-2xl border border-slate-100 min-w-[100px]">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center">
                      <Package className="w-3 h-3 mr-1 text-blue-500" /> Sementes
                    </p>
                    <p className="text-sm font-black text-slate-700">{harvest.seeds_used_quantity}kg</p>
                  </div>
                )}

                {harvest.estimated_initial_cost && (
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 min-w-[140px]">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center">
                      <DollarSign className="w-3 h-3 mr-1 text-red-500" /> Investimento
                    </p>
                    <p className="text-sm font-black text-red-600">R$ {parseFloat(harvest.estimated_initial_cost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-modern py-20 text-center">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ClipboardList className="w-10 h-10 text-slate-200" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Nenhuma safra encontrada</h3>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">Não encontramos registros para o status selecionado. Comece planejando sua próxima safra!</p>
        </motion.div>
      )}
        </div>
    );
};

export default HarvestsManager;