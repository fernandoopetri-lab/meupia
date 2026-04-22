import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { CheckCircle2, Loader2, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PixQRCodeDisplay from './PixQRCodeDisplay';
import { Card, CardContent } from '@/components/ui/card';

const PaymentStatus = ({ sessionData, onRetry }) => {
    const [status, setStatus] = useState(sessionData.status);
    const [polling, setPolling] = useState(true);

    useEffect(() => {
        if (!['pending', 'processing'].includes(status)) {
            setPolling(false);
            return;
        }

        const pollStatus = async () => {
            try {
                // If it's a pix payment, we might want to check asaas status directly or just fetch session
                // The prompt says "Auto-refreshes status every 5 seconds via get-checkout-session"
                // But Task 16 says "check-pix-payment-status" used by PaymentStatus.
                // Let's use get-checkout-session to keep session data in sync, 
                // but if it's pending pix, we can also trigger a check-pix-payment-status
                
                // If pending pix, update status from ASAAS first
                if (status === 'pending' && sessionData.payment_method === 'pix' && sessionData.asaas_charge_id) {
                     await supabase.functions.invoke('check-pix-payment-status', {
                        body: { asaas_charge_id: sessionData.asaas_charge_id }
                     });
                     // The edge function updates the DB. Now we fetch the updated DB record.
                }

                const { data, error } = await supabase.functions.invoke('get-checkout-session', {
                    body: { session_id: sessionData.id }
                });

                if (!error && data) {
                    setStatus(data.status);
                    if (['completed', 'failed', 'expired'].includes(data.status)) {
                        setPolling(false);
                        // If completed, redirect after delay?
                        if (data.status === 'completed') {
                            setTimeout(() => {
                                window.location.href = '/';
                            }, 3000);
                        }
                    }
                }
            } catch (error) {
                console.error("Polling error:", error);
            }
        };

        const interval = setInterval(pollStatus, 5000);
        return () => clearInterval(interval);
    }, [status, sessionData.id, sessionData.payment_method, sessionData.asaas_charge_id]);


    if (status === 'completed') {
        return (
            <Card className="bg-gray-800 border-emerald-500/50">
                <CardContent className="pt-8 pb-8 text-center space-y-6">
                    <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Pagamento Confirmado!</h2>
                        <p className="text-gray-400">Seu acesso foi liberado com sucesso.</p>
                    </div>
                    <p className="text-sm text-gray-500">Você será redirecionado para o dashboard em instantes...</p>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => window.location.href = '/'}>
                        Acessar Agora <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (status === 'processing') {
        return (
            <Card className="bg-gray-800 border-yellow-500/30">
                <CardContent className="pt-8 pb-8 text-center space-y-6">
                    <div className="mx-auto w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center animate-pulse">
                        <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white mb-2">Processando Pagamento</h2>
                        <p className="text-gray-400">Estamos confirmando sua transação com a operadora.</p>
                    </div>
                    <div className="bg-yellow-900/20 text-yellow-200 text-sm p-4 rounded-md border border-yellow-500/20 flex items-center justify-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Não feche esta página enquanto processamos.
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (status === 'failed') {
        return (
            <Card className="bg-gray-800 border-red-500/30">
                <CardContent className="pt-8 pb-8 text-center space-y-6">
                    <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                        <XCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white mb-2">Falha no Pagamento</h2>
                        <p className="text-gray-400">Não conseguimos processar sua transação.</p>
                    </div>
                    <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-900/20" onClick={onRetry}>
                        Tentar Novamente
                    </Button>
                </CardContent>
            </Card>
        );
    }
    
    // Default: Pending (usually for Pix)
    if (sessionData.payment_method === 'pix') {
        return (
            <div className="space-y-6">
                 <PixQRCodeDisplay 
                    qr_code_image_url={sessionData.pix_qr_code}
                    copy_paste_code={sessionData.pix_copy_paste}
                    expires_at={sessionData.pix_expires_at}
                 />
                 <div className="text-center">
                     <p className="text-gray-400 text-sm animate-pulse">Aguardando confirmação do pagamento...</p>
                 </div>
            </div>
        );
    }

    return null;
};

export default PaymentStatus;