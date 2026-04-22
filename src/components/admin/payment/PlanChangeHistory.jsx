import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

const PlanChangeHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('plan_change_history')
                .select(`
                    *,
                    profiles:user_id (name, email)
                `)
                .order('created_at', { ascending: false })
                .limit(50);
            
            if (!error) {
                setHistory(data);
            }
            setLoading(false);
        };
        fetchHistory();
    }, []);

    return (
        <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
                <CardTitle>Histórico de Alterações de Plano</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-gray-700 hover:bg-gray-800">
                                    <TableHead className="text-gray-400">Usuário</TableHead>
                                    <TableHead className="text-gray-400">Data</TableHead>
                                    <TableHead className="text-gray-400">Origem</TableHead>
                                    <TableHead className="text-gray-400">Motivo</TableHead>
                                    <TableHead className="text-gray-400">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {history.map((record) => (
                                    <TableRow key={record.id} className="border-gray-700 hover:bg-gray-700/50">
                                        <TableCell>
                                            <div className="text-white font-medium">{record.profiles?.name}</div>
                                            <div className="text-xs text-gray-500">{record.profiles?.email}</div>
                                        </TableCell>
                                        <TableCell className="text-gray-300">
                                            {format(new Date(record.created_at), 'dd/MM/yyyy HH:mm')}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                                                {record.change_source === 'asaas_webhook' ? 'ASAAS (Auto)' : 'Painel Admin'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-gray-300 max-w-xs truncate" title={record.reason}>
                                            {record.reason || '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={record.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}>
                                                {record.status === 'success' ? 'Sucesso' : 'Falha'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {history.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                                            Nenhum registro encontrado.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default PlanChangeHistory;