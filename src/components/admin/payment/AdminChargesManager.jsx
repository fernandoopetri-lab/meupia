import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table'; // Assuming you have or will use standard table components, if not using divs
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Filter, DollarSign, Calendar, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import ChargeCreationModal from './ChargeCreationModal';

const AdminChargesManager = () => {
    const [charges, setCharges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchCharges = async () => {
        setLoading(true);
        try {
            // Join with profiles to get user names
            const { data, error } = await supabase
                .from('charges')
                .select(`
                    *,
                    profiles:user_id (name)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCharges(data || []);
        } catch (error) {
            console.error('Error fetching charges:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCharges();
    }, []);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'confirmed': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'pending': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            case 'overdue': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'cancelled': return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
            default: return 'text-gray-400 bg-gray-500/10';
        }
    };

    const filteredCharges = charges.filter(charge => 
        charge.profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        charge.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white">Gerenciar Cobranças</h2>
                    <p className="text-gray-400">Visualize e crie cobranças avulsas via ASAAS.</p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Nova Cobrança
                </Button>
            </div>

            <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input 
                            placeholder="Buscar por nome ou descrição..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 bg-gray-900 border-gray-700 text-white w-full md:w-80"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-400">
                                <thead className="text-xs uppercase bg-gray-900/50 text-gray-300">
                                    <tr>
                                        <th className="px-4 py-3">Cliente</th>
                                        <th className="px-4 py-3">Descrição</th>
                                        <th className="px-4 py-3">Valor</th>
                                        <th className="px-4 py-3">Vencimento</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCharges.map((charge) => (
                                        <tr key={charge.id} className="border-b border-gray-700 hover:bg-gray-700/30">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-white">{charge.profiles?.name || 'N/A'}</div>
                                            </td>
                                            <td className="px-4 py-3 max-w-xs truncate">{charge.description || '-'}</td>
                                            <td className="px-4 py-3 font-medium text-white">
                                                R$ {Number(charge.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-4 py-3">
                                                {charge.due_date ? format(new Date(charge.due_date), 'dd/MM/yyyy') : '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(charge.status)}`}>
                                                    {charge.status === 'paid' ? 'PAGO' : 
                                                     charge.status === 'pending' ? 'PENDENTE' : 
                                                     charge.status === 'overdue' ? 'VENCIDO' : 
                                                     charge.status?.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {charge.invoice_url && (
                                                    <a 
                                                        href={charge.invoice_url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-xs"
                                                    >
                                                        Boleto/Link <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredCharges.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                                                Nenhuma cobrança encontrada.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <ChargeCreationModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                onSuccess={() => {
                    fetchCharges();
                    setIsCreateModalOpen(false);
                }} 
            />
        </div>
    );
};

export default AdminChargesManager;