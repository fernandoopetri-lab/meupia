import React, { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Calendar } from 'lucide-react';
import { addDays, format } from 'date-fns';

const ExtendTrialModal = ({ isOpen, onClose, user, onSuccess }) => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [daysToAdd, setDaysToAdd] = useState(15);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleExtend = async () => {
    if (!user || !currentUser) return;
    
    if (parseInt(daysToAdd) <= 0) {
        toast({ title: "Valor inválido", description: "O número de dias deve ser positivo.", variant: "destructive" });
        return;
    }
    
    setIsSubmitting(true);
    try {
      const currentExpiry = user.trial_end_date 
        ? new Date(user.trial_end_date) 
        : (user.plan_expires_at ? new Date(user.plan_expires_at) : new Date());
        
      // Ensure we start from at least today if expired
      const baseDate = currentExpiry < new Date() ? new Date() : currentExpiry;
      const newDate = addDays(baseDate, parseInt(daysToAdd));
      const newDateISO = newDate.toISOString();

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
            trial_end_date: newDateISO,
            plan_expires_at: newDateISO,
            plan_status: 'trial' // Ensure status is 'trial' (mapped to 'trial ativo')
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Audit Log
      await logAdminAction(
        currentUser.id,
        'extend_trial',
        user.id,
        { 
            days_added: parseInt(daysToAdd),
            new_trial_end_date: newDateISO 
        }
      );

      toast({
        title: "Teste estendido com sucesso",
        description: `Adicionados ${daysToAdd} dias. Novo vencimento: ${format(newDate, 'dd/MM/yyyy')}`,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error extending trial:', error);
      toast({
        title: "Erro ao estender",
        description: "Não foi possível atualizar o período de teste.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && onClose(open)}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Estender Período de Teste</DialogTitle>
          <DialogDescription className="text-gray-400">
            Adicione dias ao período de teste de <span className="font-medium text-white">{user?.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="days" className="text-right text-gray-300">
              Dias
            </Label>
            <div className="col-span-3 flex items-center gap-2">
                <Input
                id="days"
                type="number"
                min="1"
                value={daysToAdd}
                onChange={(e) => setDaysToAdd(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                />
                <span className="text-sm text-gray-400">dias</span>
            </div>
          </div>
          {user && (
            <div className="text-sm text-gray-400 bg-gray-900/50 p-3 rounded flex items-center gap-2 border border-gray-700">
                <Calendar className="w-4 h-4 text-emerald-400" />
                Novo vencimento estimado: {format(addDays(new Date(), parseInt(daysToAdd || 0)), 'dd/MM/yyyy')}
            </div>
          )}
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
            onClick={handleExtend}
            disabled={isSubmitting || !daysToAdd || daysToAdd < 1}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Confirmar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExtendTrialModal;