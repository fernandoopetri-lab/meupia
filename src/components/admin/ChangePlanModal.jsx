import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { logAdminAction } from '@/utils/auditLog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { addDays, addYears } from 'date-fns';

const PLAN_OPTIONS = [
  {
    id: 'personal',
    label: 'Pessoal',
    description: 'Gestão financeira individual básica.',
    color: 'bg-blue-50 border-blue-200 text-blue-700'
  },
  {
    id: 'family',
    label: 'Família',
    description: 'Compartilhe finanças com membros da família.',
    color: 'bg-purple-50 border-purple-200 text-purple-700'
  },
  {
    id: 'rural',
    label: 'Rural',
    description: 'Gestão completa para produtores rurais.',
    color: 'bg-green-50 border-green-200 text-green-700'
  }
];

const ChangePlanModal = ({ isOpen, onClose, user, onSuccess }) => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setSelectedPlan(user.account_type || 'personal');
    }
  }, [user, isOpen]);

  const handlePlanChange = async () => {
    if (!user || !selectedPlan || !currentUser) return;
    
    setIsSubmitting(true);
    try {
      // Calculate new expiry date (defaulting to 1 year for paid plans)
      const newExpiryDate = addYears(new Date(), 1).toISOString();
      const oldPlan = user.account_type || 'none';

      // 1. Update Profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
            account_type: selectedPlan,
            plan_status: 'active', // 'ativo pago' normalized to system status 'active'
            plan_expires_at: newExpiryDate
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // 2. Audit Log
      await logAdminAction(
        currentUser.id,
        'change_plan',
        user.id,
        { old_plan: oldPlan, new_plan: selectedPlan }
      );

      toast({
        title: "Plano alterado com sucesso",
        description: `O plano de ${user.name} foi atualizado para ${PLAN_OPTIONS.find(p => p.id === selectedPlan)?.label}.`,
        variant: "default",
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error changing plan:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível alterar o plano. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && onClose(open)}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Alterar Plano de {user?.name}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Selecione o novo nível de acesso. O status será definido como "Ativo Pago" por 1 ano.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {PLAN_OPTIONS.map((plan) => (
            <div
              key={plan.id}
              onClick={() => !isSubmitting && setSelectedPlan(plan.id)}
              className={cn(
                "relative flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                selectedPlan === plan.id 
                  ? "border-emerald-500 bg-gray-700/50" 
                  : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
              )}
            >
              <div className={`mt-1 p-2 rounded-full ${plan.color.split(' ')[0]}`}>
                <div className={`w-2 h-2 rounded-full ${plan.color.split(' ')[2].replace('text-', 'bg-')}`} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-white">{plan.label}</h4>
                <p className="text-xs text-gray-400 mt-1">{plan.description}</p>
              </div>
              {selectedPlan === plan.id && (
                <div className="absolute top-4 right-4 text-emerald-500">
                  <Check className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onClose(false)}
            disabled={isSubmitting}
            className="hover:bg-gray-700 text-gray-300"
          >
            Cancelar
          </Button>
          <Button
            onClick={handlePlanChange}
            disabled={isSubmitting || selectedPlan === user?.account_type}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Confirmar Alteração'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePlanModal;