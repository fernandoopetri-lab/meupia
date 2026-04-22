import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, RefreshCw, CheckCircle, AlertTriangle, Clock, Eye, EyeOff, Copy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

const WebhookMonitoring = () => {
    const { toast } = useToast();
    const [stats, setStats] = useState({ processed: 0, failed: 0, pending: 0 });
    const [recentEvents, setRecentEvents] = useState([]);
    const [webhookToken, setWebhookToken] = useState('');
    const [showToken, setShowToken] = useState(false);
    const [loading, setLoading] = useState(true);
    const [lastValidation, setLastValidation] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Stats
            const { count: processedCount } = await supabase.from('webhook_events').select('*', { count: 'exact', head: true }).eq('status', 'processed');
            const { count: failedCount } = await supabase.from('webhook_events').select('*', { count: 'exact', head: true }).eq('status', 'failed');
            const { count: pendingCount } = await supabase.from('webhook_events').select('*', { count: 'exact', head: true }).eq('status', 'pending');
            setStats({ processed: processedCount || 0, failed: failedCount || 0, pending: pendingCount || 0 });

            // Recent Events
            const { data: events } = await supabase
                .from('webhook_events')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10);
            setRecentEvents(events || []);

            // Settings
            const { data: settings } = await supabase.from('asaas_settings').select('webhook_token, last_validation').single();
            if (settings) {
                setWebhookToken(settings.webhook_token || 'Não configurado');
                setLastValidation(settings.last_validation);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        
        // Subscription for real-time updates
        const channel = supabase
            .channel('webhook-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'webhook_events' }, () => {
                fetchData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const copyToken = () => {
        navigator.clipboard.writeText(webhookToken);
        toast({ title: "Token copiado!" });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'processed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'failed': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Processados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-500 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" /> {stats.processed}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Falhas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" /> {stats.failed}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Pendentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-500 flex items-center gap-2">
                            <Clock className="w-5 h-5" /> {stats.pending}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle>Configuração do Token</CardTitle>
                    <CardDescription>Token de segurança para validar chamadas do ASAAS.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 bg-gray-900 p-3 rounded-md border border-gray-700">
                        <code className="flex-1 font-mono text-sm text-gray-300">
                            {showToken ? webhookToken : '•'.repeat(20)}
                        </code>
                        <Button variant="ghost" size="sm" onClick={() => setShowToken(!showToken)}>
                            {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={copyToken}>
                            <Copy className="w-4 h-4" />
                        </Button>
                    </div>
                    {lastValidation && (
                        <p className="text-xs text-gray-500 mt-2">
                            Última validação de conexão: {format(new Date(lastValidation), 'dd/MM/yyyy HH:mm')}
                        </p>
                    )}
                </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Eventos Recentes</CardTitle>
                        <CardDescription>Monitoramento em tempo real dos webhooks recebidos.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchData}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Atualizar
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentEvents.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">Nenhum evento registrado.</div>
                        ) : (
                            recentEvents.map(event => (
                                <div key={event.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50 border border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <Activity className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <div className="font-medium text-white">{event.event_type}</div>
                                            <div className="text-xs text-gray-500">{format(new Date(event.created_at), 'dd/MM/yyyy HH:mm:ss')}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className={getStatusColor(event.status)}>
                                            {event.status.toUpperCase()}
                                        </Badge>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default WebhookMonitoring;