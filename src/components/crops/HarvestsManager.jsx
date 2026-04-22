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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Detalhe das Safras</h2>
                <div className="flex items-center space-x-2">
                    <Filter className="w-5 h-5 text-slate-500" />
                    {filterOptions.map(option => (
                        <Button
                            key={option.value}
                            variant={statusFilter === option.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setStatusFilter(option.value)}
                            className={`transition-all ${statusFilter === option.value ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-white'}`}
                        >
                            {option.label}
                        </Button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">Carregando safras...</div>
            ) : filteredHarvests.length > 0 ? (
                <div className="space-y-4">
                    {filteredHarvests.map(harvest => (
                        <motion.div 
                            key={harvest.id} 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            className="chart-container p-4 cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => setSelectedHarvest(harvest)}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-lg font-semibold text-slate-700">{harvest.name ? `${harvest.name} - ${harvest.crop_name}` : harvest.crop_name}</h4>
                                    <div className="flex items-center text-sm text-slate-500 mt-1">
                                        <Wheat className="w-4 h-4 mr-2" />
                                        <span>{harvest.plots.name}</span>
                                        <span className="mx-2">/</span>
                                        <MapPin className="w-4 h-4 mr-2" />
                                        <span>{harvest.plots.properties.name}</span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                     <span className={`text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full ${getStatusBadge(harvest.status)}`}>
                                        {harvest.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                                <div className="flex items-center text-slate-600"><Calendar className="w-4 h-4 mr-2 text-emerald-500" /><div><p className="font-medium">Plantio</p><p>{new Date(harvest.planting_date + 'T00:00:00').toLocaleDateString('pt-BR')}</p></div></div>
                                {harvest.harvest_forecast_date && <div className="flex items-center text-slate-600"><Calendar className="w-4 h-4 mr-2 text-yellow-500" /><div><p className="font-medium">Prev. Colheita</p><p>{new Date(harvest.harvest_forecast_date + 'T00:00:00').toLocaleDateString('pt-BR')}</p></div></div>}
                                {harvest.seeds_used_quantity && <div className="flex items-center text-slate-600"><Package className="w-4 h-4 mr-2 text-blue-500" /><div><p className="font-medium">Sementes</p><p>{harvest.seeds_used_quantity} kg</p></div></div>}
                                {harvest.estimated_initial_cost && <div className="flex items-center text-slate-600"><DollarSign className="w-4 h-4 mr-2 text-red-500" /><div><p className="font-medium">Custo Inicial</p><p>R$ {parseFloat(harvest.estimated_initial_cost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div></div>}
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                    <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-slate-600">Nenhuma safra encontrada</h4>
                    <p className="text-slate-500">Nenhuma safra corresponde ao filtro "{statusFilter}".</p>
                </div>
            )}
        </div>
    );
};

export default HarvestsManager;