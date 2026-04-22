import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Wheat, MapPin, Maximize, Plus, Calendar, Package, DollarSign, Edit2, Trash2, Beaker } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const HarvestForm = ({ plotId, user, onHarvestAction, onCancel, editingHarvest }) => {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        name: '',
        crop_name: '',
        custom_crop_name: '',
        planting_date: new Date().toISOString().split('T')[0],
        harvest_forecast_date: '',
        seeds_used_quantity: '',
        estimated_initial_cost: '',
        status: 'plantado'
    });

    const defaultCrops = ["Soja", "Milho", "Feijão", "Trigo", "Aveia", "Arroz", "Sorgo", "Grama"];

    useEffect(() => {
        if (editingHarvest) {
            const isCustomCrop = !defaultCrops.includes(editingHarvest.crop_name);
            setFormData({
                name: editingHarvest.name || '',
                crop_name: isCustomCrop ? 'Outro' : editingHarvest.crop_name || '',
                custom_crop_name: isCustomCrop ? editingHarvest.crop_name : '',
                planting_date: editingHarvest.planting_date || new Date().toISOString().split('T')[0],
                harvest_forecast_date: editingHarvest.harvest_forecast_date || '',
                seeds_used_quantity: editingHarvest.seeds_used_quantity || '',
                estimated_initial_cost: editingHarvest.estimated_initial_cost || '',
                status: editingHarvest.status || 'plantado'
            });
        }
    }, [editingHarvest]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const finalCropName = formData.crop_name === 'Outro' ? formData.custom_crop_name : formData.crop_name;

        if (!finalCropName || !formData.planting_date) {
            toast({ title: "Erro", description: "Cultura e data de plantio são obrigatórios.", variant: "destructive" });
            return;
        }

        const harvestData = {
            user_id: user.id,
            plot_id: plotId,
            name: formData.name,
            crop_name: finalCropName,
            planting_date: formData.planting_date,
            seeds_used_quantity: formData.seeds_used_quantity ? parseFloat(formData.seeds_used_quantity) : null,
            estimated_initial_cost: formData.estimated_initial_cost ? parseFloat(formData.estimated_initial_cost) : null,
            harvest_forecast_date: formData.harvest_forecast_date || null,
            status: formData.status,
        };

        let error;
        if (editingHarvest) {
            const { error: updateError } = await supabase.from('harvests').update(harvestData).eq('id', editingHarvest.id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase.from('harvests').insert(harvestData);
            error = insertError;
        }

        if (error) {
            toast({ title: "Erro", description: `Não foi possível salvar a safra. ${error.message}`, variant: "destructive" });
        } else {
            toast({ title: "Sucesso!", description: `Safra ${editingHarvest ? 'atualizada' : 'registrada'}.` });
            onHarvestAction();
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="chart-container mt-6">
            <h3 className="text-xl font-semibold text-slate-700 mb-4">{editingHarvest ? 'Editar Safra' : 'Registrar Nova Safra'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Safra (Descrição)</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Safra Verão 2026" className="input-field" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Cultura*</label>
                        <select value={formData.crop_name} onChange={(e) => setFormData(p => ({ ...p, crop_name: e.target.value }))} className="input-field" required>
                            <option value="">Selecione</option>
                            {defaultCrops.map(crop => <option key={crop} value={crop}>{crop}</option>)}
                            <option value="Outro">Outro</option>
                        </select>
                    </div>
                </div>
                {formData.crop_name === 'Outro' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Qual cultura?</label>
                        <input type="text" value={formData.custom_crop_name} onChange={(e) => setFormData(p => ({ ...p, custom_crop_name: e.target.value }))} placeholder="Digite o nome da cultura" className="input-field" required />
                    </motion.div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Data de Plantio*</label>
                        <input type="date" value={formData.planting_date} onChange={(e) => setFormData(p => ({ ...p, planting_date: e.target.value }))} className="input-field" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Previsão de Colheita</label>
                        <input type="date" value={formData.harvest_forecast_date} onChange={(e) => setFormData(p => ({ ...p, harvest_forecast_date: e.target.value }))} className="input-field" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Sementes Utilizadas (kg)</label>
                        <input type="number" step="0.01" value={formData.seeds_used_quantity} onChange={(e) => setFormData(p => ({ ...p, seeds_used_quantity: e.target.value }))} placeholder="Ex: 1200" className="input-field" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Custo Inicial Estimado (R$)</label>
                        <input type="number" step="0.01" value={formData.estimated_initial_cost} onChange={(e) => setFormData(p => ({ ...p, estimated_initial_cost: e.target.value }))} placeholder="Ex: 15000" className="input-field" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Status*</label>
                        <select value={formData.status} onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))} className="input-field" required>
                            <option value="plantado">Plantado</option>
                            <option value="colhido">Colhido</option>
                        </select>
                    </div>
                </div>
                <div className="flex space-x-3">
                    <Button type="submit" className="btn-primary">{editingHarvest ? 'Atualizar Safra' : 'Salvar Safra'}</Button>
                    <Button type="button" onClick={onCancel} className="px-6 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all">Cancelar</Button>
                </div>
            </form>
        </motion.div>
    );
};

const PlotDetails = ({ user, plotId, onBack }) => {
    const { toast } = useToast();
    const [plot, setPlot] = useState(null);
    const [harvests, setHarvests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showHarvestForm, setShowHarvestForm] = useState(false);
    const [editingHarvest, setEditingHarvest] = useState(null);

    const fetchData = useCallback(async () => {
        if (!plotId) return;
        setLoading(true);
        const { data: plotRes, error: plotError } = await supabase
            .from('plots')
            .select('*, properties(name)')
            .eq('id', plotId)
            .single();

        if (plotError) {
            toast({ title: "Erro", description: "Não foi possível carregar os detalhes do talhão.", variant: "destructive" });
            onBack();
            return;
        }
        setPlot(plotRes);

        const { data: harvestsRes, error: harvestsError } = await supabase
            .from('harvests')
            .select('*, inputs(*)')
            .eq('plot_id', plotId)
            .order('planting_date', { ascending: false });

        if (harvestsError) {
            toast({ title: "Erro", description: "Não foi possível carregar as safras.", variant: "destructive" });
        } else {
            setHarvests(harvestsRes);
        }
        setLoading(false);
    }, [plotId, toast, onBack]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleFormAction = () => {
        setShowHarvestForm(false);
        setEditingHarvest(null);
        fetchData();
    };

    const handleEdit = (harvest) => {
        setEditingHarvest(harvest);
        setShowHarvestForm(true);
    };

    const handleDelete = async (harvestId) => {
        const { error } = await supabase.from('harvests').delete().eq('id', harvestId);
        if (error) {
            toast({ title: "Erro", description: `Não foi possível excluir a safra. ${error.message}`, variant: "destructive" });
        } else {
            toast({ title: "Sucesso!", description: "Safra excluída." });
            fetchData();
        }
    };
    
    if (loading) {
        return <div className="text-center py-12">Carregando detalhes do talhão...</div>;
    }

    if (!plot) {
        return <div className="text-center py-12">Talhão não encontrado.</div>;
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 'plantado': return 'bg-yellow-100 text-yellow-800';
            case 'colhido': return 'bg-green-100 text-green-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    return (
        <div className="space-y-6">
            <Button onClick={onBack} className="bg-transparent text-slate-600 hover:bg-slate-100 px-3 py-2">
                <ArrowLeft className="w-5 h-5 mr-2" /> Voltar para a lista
            </Button>

            <div className="wallet-card">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">{plot.name}</h2>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-slate-600">
                    <div className="flex items-center"><MapPin className="w-4 h-4 mr-2" />{plot.properties.name}</div>
                    <div className="flex items-center"><Maximize className="w-4 h-4 mr-2" />{plot.area} ha</div>
                    {plot.location_description && <div className="flex items-center"><span className="text-sm">{plot.location_description}</span></div>}
                </div>
            </div>

            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">Histórico de Safras</h3>
                {!showHarvestForm && (
                    <Button onClick={() => { setEditingHarvest(null); setShowHarvestForm(true); }} className="btn-primary">
                        <Plus className="w-5 h-5 mr-2" /> Registrar Safra
                    </Button>
                )}
            </div>

            <AnimatePresence>
                {showHarvestForm && <HarvestForm plotId={plot.id} user={user} onHarvestAction={handleFormAction} onCancel={() => { setShowHarvestForm(false); setEditingHarvest(null); }} editingHarvest={editingHarvest} />}
            </AnimatePresence>

            <div className="space-y-4">
                {harvests.length > 0 ? (
                    harvests.map(harvest => {
                        const totalCost = (harvest.estimated_initial_cost || 0) + harvest.inputs.reduce((sum, input) => sum + (input.cost || 0), 0);
                        return (
                            <motion.div key={harvest.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="chart-container p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-lg font-semibold text-slate-700">{harvest.name ? `${harvest.name} - ${harvest.crop_name}` : harvest.crop_name}</h4>
                                        <span className={`text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full ${getStatusBadge(harvest.status)}`}>
                                            {harvest.status.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(harvest)}><Edit2 className="w-4 h-4" /></Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Esta ação não pode ser desfeita. Isso excluirá permanentemente a safra e todos os seus dados associados (como aplicações de insumos).
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(harvest.id)} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                                    <div className="flex items-center text-slate-600"><Calendar className="w-4 h-4 mr-2 text-emerald-500" /><div><p className="font-medium">Plantio</p><p>{new Date(harvest.planting_date).toLocaleDateString('pt-BR')}</p></div></div>
                                    {harvest.harvest_forecast_date && <div className="flex items-center text-slate-600"><Calendar className="w-4 h-4 mr-2 text-yellow-500" /><div><p className="font-medium">Prev. Colheita</p><p>{new Date(harvest.harvest_forecast_date).toLocaleDateString('pt-BR')}</p></div></div>}
                                    {harvest.seeds_used_quantity && <div className="flex items-center text-slate-600"><Package className="w-4 h-4 mr-2 text-blue-500" /><div><p className="font-medium">Sementes</p><p>{harvest.seeds_used_quantity} kg</p></div></div>}
                                    <div className="flex items-center text-slate-600"><DollarSign className="w-4 h-4 mr-2 text-red-500" /><div><p className="font-medium">Total Gasto</p><p>R$ {parseFloat(totalCost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div></div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-200">
                                    <h5 className="text-md font-semibold text-slate-600 mb-2">Insumos Aplicados</h5>
                                    {harvest.inputs.length > 0 ? (
                                        <div className="space-y-2 text-sm">
                                            {harvest.inputs.map(input => (
                                                <div key={input.id} className="flex justify-between items-center p-2 bg-slate-50 rounded-md">
                                                    <div className="flex items-center">
                                                        <Beaker className="w-4 h-4 mr-3 text-slate-500" />
                                                        <div>
                                                            <p className="font-medium text-slate-700">{input.product_name} ({input.input_type})</p>
                                                            <p className="text-slate-500">{input.quantity} {input.measurement_unit} em {new Date(input.application_date).toLocaleDateString('pt-BR')}</p>
                                                        </div>
                                                    </div>
                                                    <p className="font-semibold text-red-500">R$ {parseFloat(input.cost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500">Nenhum insumo aplicado nesta safra.</p>
                                    )}
                                </div>
                            </motion.div>
                        )
                    })
                ) : (
                    !showHarvestForm && (
                        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                            <Wheat className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h4 className="text-lg font-semibold text-slate-600">Nenhuma safra registrada</h4>
                            <p className="text-slate-500">Clique em "Registrar Safra" para adicionar a primeira.</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default PlotDetails;