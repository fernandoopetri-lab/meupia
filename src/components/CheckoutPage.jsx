import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PlanSummary from './PlanSummary';
import PaymentMethodSelector from './PaymentMethodSelector';
import PixPaymentForm from './PixPaymentForm';
import CardPaymentForm from './CardPaymentForm';
import PaymentStatus from './PaymentStatus';
import CheckoutError from './CheckoutError';

const CheckoutPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);
    
    const [sessionData, setSessionData] = useState(null);
    const [planData, setPlanData] = useState(null);
    const [selectedMethod, setSelectedMethod] = useState('pix');

    const sessionId = searchParams.get('session_id');
    const planId = searchParams.get('plan_id');
    const billingPeriod = searchParams.get('billing_period') || 'monthly';

    // Initial Load
    useEffect(() => {
        const initCheckout = async () => {
            try {
                // 1. If we have a session ID, load it
                if (sessionId) {
                    const { data, error } = await supabase.functions.invoke('get-checkout-session', {
                        body: { session_id: sessionId }
                    });
                    
                    if (error) {
                        // Handle non-JSON response or network error
                        console.error("Error fetching session:", error);
                        throw new Error("Erro ao carregar sessão de pagamento. Tente novamente.");
                    }
                    
                    if (!data) throw new Error("Sessão não encontrada.");

                    setSessionData(data);
                    setPlanData(data.plan); // Assuming API returns plan details
                    if (data.payment_method) setSelectedMethod(data.payment_method);
                } 
                // 2. If no session but plan_id, create session
                else if (planId) {
                    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
                        body: { plan_id: planId, billing_period: billingPeriod }
                    });
                    
                    if (error) {
                        console.error("Error creating session:", error);
                        throw new Error("Erro ao iniciar checkout. Tente novamente.");
                    }

                    if (!data || !data.session_id) {
                        throw new Error("Resposta inválida do servidor.");
                    }
                    
                    // Update URL with session ID without reload
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set('session_id', data.session_id);
                    navigate(`/checkout?${newParams.toString()}`, { replace: true });
                    
                    // Reload to get full structure via get-checkout-session
                    const { data: fullData, error: fullDataError } = await supabase.functions.invoke('get-checkout-session', {
                        body: { session_id: data.session_id }
                    });
                    
                    if (fullDataError) throw fullDataError;
                    
                    setSessionData(fullData);
                    setPlanData(fullData.plan);
                } else {
                    throw new Error("Parâmetros inválidos. Selecione um plano.");
                }
            } catch (err) {
                console.error("Checkout init error:", err);
                setError({ message: err.message || "Erro ao iniciar checkout." });
            } finally {
                setLoading(false);
            }
        };

        initCheckout();
    }, [sessionId, planId]);

    const handlePaymentSubmit = async (paymentData = {}) => {
        setProcessing(true);
        setError(null);
        try {
            const { data, error } = await supabase.functions.invoke('process-checkout-payment', {
                body: {
                    session_id: sessionData.id,
                    payment_method: selectedMethod,
                    card_data: paymentData
                }
            });

            if (error) {
                // Check if error is HTML (often 404 or 500 from edge function)
                if (typeof error === 'string' && error.trim().startsWith('<')) {
                    throw new Error("Erro de comunicação com o servidor de pagamentos.");
                }
                throw error;
            }
            
            if (!data) throw new Error("Sem resposta do servidor.");
            if (!data.success) throw new Error(data.error || "Erro no processamento");

            // Update session data with results
            setSessionData(prev => ({
                ...prev,
                status: data.status,
                payment_method: selectedMethod,
                pix_qr_code: data.pix_qr_code,
                pix_copy_paste: data.pix_copy_paste,
                pix_expires_at: data.pix_expires_at,
                asaas_charge_id: data.asaas_charge_id
            }));

        } catch (err) {
            console.error("Payment error:", err);
            setError({ message: err.message || "Falha ao processar pagamento." });
        } finally {
            setProcessing(false);
        }
    };

    const handleRetry = () => {
        setError(null);
        // Reset status to allow retry
        setSessionData(prev => ({ ...prev, status: 'pending' }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    if (error && !sessionData) {
         return <CheckoutError error_message={error.message} />;
    }

    const showPaymentForm = sessionData?.status === 'pending' && !sessionData?.pix_qr_code;
    const showStatus = sessionData?.status !== 'pending' || sessionData?.pix_qr_code;

    return (
        <div className="min-h-screen bg-gray-950 text-white pb-20">
            {/* Header */}
            <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur sticky top-0 z-10">
                <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-lime-500 rounded-lg flex items-center justify-center">
                             <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-lg hidden sm:block">Checkout Seguro</span>
                    </div>
                    <Button variant="ghost" className="text-gray-400 hover:text-white" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Cancelar
                    </Button>
                </div>
            </header>

            <main className="container max-w-6xl mx-auto px-4 py-8">
                {error && <div className="mb-6"><CheckoutError error_message={error.message} onRetry={handleRetry} /></div>}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Plan Summary */}
                    <div className="lg:col-span-1 order-2 lg:order-1">
                        <PlanSummary plan={planData} billingPeriod={sessionData?.billing_period} />
                    </div>

                    {/* Right Column: Payment Form */}
                    <div className="lg:col-span-2 order-1 lg:order-2">
                         <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 sm:p-8 shadow-2xl">
                            {showStatus ? (
                                <PaymentStatus 
                                    sessionData={sessionData} 
                                    onRetry={handleRetry}
                                />
                            ) : (
                                <>
                                    <h2 className="text-2xl font-bold mb-6">Finalizar Pagamento</h2>
                                    
                                    <div className="mb-8">
                                        <PaymentMethodSelector 
                                            selectedMethod={selectedMethod} 
                                            onChange={setSelectedMethod} 
                                        />
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-gray-700">
                                        {selectedMethod === 'pix' && (
                                            <PixPaymentForm 
                                                onSubmit={() => handlePaymentSubmit()} 
                                                isLoading={processing} 
                                            />
                                        )}
                                        {['credit_card', 'debit_card'].includes(selectedMethod) && (
                                            <CardPaymentForm 
                                                type={selectedMethod}
                                                onSubmit={handlePaymentSubmit}
                                                isLoading={processing}
                                            />
                                        )}
                                    </div>
                                </>
                            )}
                         </div>

                         <div className="mt-6 text-center text-gray-500 text-xs">
                            <p>Pagamento processado por ASAAS Gestão Financeira S.A.</p>
                            <p className="mt-1">Ambiente seguro e criptografado.</p>
                         </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CheckoutPage;