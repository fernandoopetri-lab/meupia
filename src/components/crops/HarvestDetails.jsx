import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Beaker, PackageCheck, DollarSign, Maximize, BarChart, PieChart, TrendingUp, Calendar, Wheat, MapPin } from 'lucide-react';
import { ResponsiveContainer, Bar, XAxis, YAxis, Tooltip, Legend, ComposedChart, Line, Pie, Cell } from 'recharts';
import InputsManager from './InputsManager';
import CropHarvestManager from './CropHarvestManager';

const HarvestDetails = ({ harvest, onBack, user, onDataUpdate, setActiveTab }) => {
    const { toast } = useToast();
    const [details, setDetails] = useState({ inputs: [], cropHarvests: [] });
    const [loading, setLoading] = useState(true);
    const [showInputForm, setShowInputForm] = useState(false);
    const [showCropHarvestForm, setShowCropHarvestForm] = useState(false);

    const fetchDetails = useCallback(async () => {
        setLoading(true);
        const [inputsRes, cropHarvestsRes] = await Promise.all([
            supabase.from('inputs').select('*').eq('harvest_id', harvest.id),
            supabase.from('crop_harvests').select('*').eq('harvest_id', harvest.id)
        ]);

        if (inputsRes.error || cropHarvestsRes.error) {
            toast({ title: "Erro", description: "Não foi possível carregar os detalhes da safra.", variant: "destructive" });
        } else {
            setDetails({ inputs: inputsRes.data, cropHarvests: cropHarvestsRes.data });
        }
        setLoading(false);
    }, [harvest.id, toast]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    const totalCost = details.inputs.reduce((sum, input) => sum + input.cost, 0) + (harvest.estimated_initial_cost || 0);
    const costPerHectare = harvest.plots.area > 0 ? totalCost / harvest.plots.area : 0;
    const totalYield = details.cropHarvests.reduce((sum, ch) => sum + ch.total_production, 0);
    const yieldPerHectare = harvest.plots.area > 0 ? totalYield / harvest.plots.area : 0;

    const costData = details.inputs.map(input => ({
        date: new Date(input.application_date + 'T00:00:00').toLocaleDateString('pt-BR'),
        cost: input.cost
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    const cumulativeCostData = costData.reduce((acc, item) => {
        const lastTotal = acc.length > 0 ? acc[acc.length - 1].cumulativeCost : 0;
        acc.push({ ...item, cumulativeCost: lastTotal + item.cost });
        return acc;
    }, []);

    const inputTypeCost = details.inputs.reduce((acc, input) => {
        acc[input.input_type] = (acc[input.input_type] || 0) + input.cost;
        return acc;
    }, {});

    const inputTypeCostData = Object.entries(inputTypeCost).map(([name, value]) => ({ name, value }));
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    const handleFormSuccess = () => {
        setShowInputForm(false);
        setShowCropHarvestForm(false);
        fetchDetails();
        onDataUpdate();
    };

    if (showInputForm) {
        return <InputsManager user={user} onDataChange={handleFormSuccess} preselectedHarvestId={harvest.id} onBack={() => setShowInputForm(false)} />;
    }

    if (showCropHarvestForm) {
        return <CropHarvestManager user={user} onDataChange={handleFormSuccess} preselectedHarvestId={harvest.id} onBack={() => setShowCropHarvestForm(false)} />;
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex justify-between items-center">
                <Button variant="ghost" onClick={onBack} className="flex items-center">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para a lista
                </Button>
                <div className="flex gap-2">
                    <Button onClick={() => setShowInputForm(true)} className="btn-secondary">
                        <Beaker className="w-4 h-4 mr-2" /> Aplicar Insumos
                    </Button>
                    <Button onClick={() => setShowCropHarvestForm(true)} className="btn-primary">
                        <PackageCheck className="w-4 h-4 mr-2" /> Colher
                    </Button>
                </div>
            </div>

            <div className="chart-container p-6">
                <h2 className="text-2xl font-bold text-slate-800">{harvest.name ? `${harvest.name} - ${harvest.crop_name}` : harvest.crop_name}</h2>
                <div className="flex items-center text-md text-slate-500 mt-1">
                    <Wheat className="w-5 h-5 mr-2" />
                    <span>{harvest.plots.name}</span>
                    <span className="mx-2">/</span>
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{harvest.plots.properties.name}</span>
                </div>
                <div className="flex items-center text-sm text-slate-500 mt-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Plantio em: {new Date(harvest.planting_date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <IndicatorCard icon={DollarSign} title="Custo Total" value={`R$ ${totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} color="text-red-500" />
                <IndicatorCard icon={TrendingUp} title="Custo por Hectare" value={`R$ ${costPerHectare.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} color="text-orange-500" />
                <IndicatorCard icon={PackageCheck} title="Produção Total" value={`${totalYield.toLocaleString('pt-BR')} ${harvest.yield_unit || 'kg'}`} color="text-green-500" />
                <IndicatorCard icon={BarChart} title="Produtividade" value={`${yieldPerHectare.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${harvest.yield_unit || 'kg'}/ha`} color="text-blue-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="chart-container">
                    <h3 className="text-xl font-semibold text-slate-700 mb-4">Evolução de Custos</h3>
                    {loading ? <p>Carregando...</p> : cumulativeCostData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <ComposedChart data={cumulativeCostData}>
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`} />
                                <Legend />
                                <Bar dataKey="cost" fill="#8884d8" name="Custo do Dia" />
                                <Line type="monotone" dataKey="cumulativeCost" stroke="#ff7300" name="Custo Acumulado" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    ) : <p className="text-center py-10 text-slate-500">Nenhum custo de insumo lançado.</p>}
                </div>
                <div className="chart-container">
                    <h3 className="text-xl font-semibold text-slate-700 mb-4">Custos por Tipo de Insumo</h3>
                    {loading ? <p>Carregando...</p> : inputTypeCostData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={inputTypeCostData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                                    {inputTypeCostData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <p className="text-center py-10 text-slate-500">Nenhum insumo lançado.</p>}
                </div>
            </div>
        </motion.div>
    );
};

const IndicatorCard = ({ icon: Icon, title, value, color }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="wallet-card">
        <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full bg-slate-100 ${color}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
        </div>
    </motion.div>
);

export default HarvestDetails;