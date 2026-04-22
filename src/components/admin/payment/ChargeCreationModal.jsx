import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

const ChargeCreationModal = ({ isOpen, onClose, onSuccess }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        user_id: '',
        amount: '',
        due_date: '',
        description: '',
        billing_type: 'UNDEFINED'
    });

    useEffect(() => {
        if (isOpen) {
            const fetchUsers = async () => {
                const { data } = await supabase
                    .from('profiles')
                    .select('id, name, email')
                    .order('name');
                setUsers(data || []);
            };
            fetchUsers();
            // Reset form
            setFormData({
                user_id: '',
                amount: '',
                due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
                description: '',
                billing_type: 'UNDEFINED'
            });
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const selectedUser = users.find(u => u.id === formData.user_id);
            if (!selectedUser) throw new Error('Usuário inválido');

            // 1. Ensure user has ASAAS ID
            let asaasId = null;
            const { data: profile } = await supabase
                .from('profiles')
                .select('asaas_customer_id')
                .eq('id', formData.user_id)
                .single();

            if (profile?.asaas_customer_id) {
                asaasId = profile.asaas_customer_id;
            } else {
                // Try create it on the fly
                const { data: createData, error: createError } = await supabase.functions.invoke('create-asaas-customer', {
                    body: {
                        name: selectedUser.name,
                        email: selectedUser.email,
                        user_id: selectedUser.id
                    }
                });
                
                if (createError || !createData.success) {
                    throw new Error('Falha ao registrar cliente no ASAAS: ' + (createData?.error || 'Erro desconhecido'));
                }
                asaasId = createData.asaas_customer_id;
            }

            // 2. Create Charge
            const { data: chargeData, error: chargeError } = await supabase.functions.invoke('create-asaas-charge', {
                body: {
                    ...formData,
                    asaas_customer_id: asaasId
                }
            });

            if (chargeError || !chargeData.success) {
                throw new Error('Falha ao criar cobrança: ' + (chargeData?.error || 'Erro na API'));
            }

            toast({ title: "Cobrança criada com sucesso!" });
            onSuccess();
        } catch (error) {
            console.error(error);
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-gray-800 border-gray-700 text-white">
                <DialogHeader>
                    <DialogTitle>Nova Cobrança Avulsa</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Cliente</Label>
                        <select
                            className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white"
                            value={formData.user_id}
                            onChange={e => setFormData({...formData, user_id: e.target.value})}
                            required
                        >
                            <option value="">Selecione um cliente...</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Valor (R$)</Label>
                            <Input 
                                type="number" 
                                step="0.01" 
                                value={formData.amount}
                                onChange={e => setFormData({...formData, amount: e.target.value})}
                                required
                                className="bg-gray-700 border-gray-600 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Vencimento</Label>
                            <Input 
                                type="date" 
                                value={formData.due_date}
                                onChange={e => setFormData({...formData, due_date: e.target.value})}
                                required
                                className="bg-gray-700 border-gray-600 text-white"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Forma de Pagamento</Label>
                        <select
                            className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white"
                            value={formData.billing_type}
                            onChange={e => setFormData({...formData, billing_type: e.target.value})}
                        >
                            <option value="UNDEFINED">Cliente Escolhe (Pix/Boleto)</option>
                            <option value="BOLETO">Boleto Bancário</option>
                            <option value="PIX">Pix</option>
                            <option value="CREDIT_CARD">Cartão de Crédito</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label>Descrição</Label>
                        <Input 
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            placeholder="Ex: Consultoria Técnica"
                            className="bg-gray-700 border-gray-600 text-white"
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="ghost" onClick={onClose} className="text-gray-300 hover:bg-gray-700">Cancelar</Button>
                        <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar Cobrança'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ChargeCreationModal;