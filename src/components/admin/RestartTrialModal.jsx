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
import { Loader2, AlertTriangle, Calendar } from 'lucide-react';
import { addDays, format } from 'date-fns';

const RestartTrialModal = ({ isOpen, onClose, user, onSuccess }) => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate potential new date for display
  const newTrialDate = addDays(new Date(), 30);

  const handleRestart = async () => {
    if (!user || !currentUser) return;
    
    setIsSubmitting(true);
    try {
      const newTrialDateISO = newTrialDate.toISOString();

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
            trial_end_date: newTrialDateISO,
            plan_status: 'trial', // Ensure status is explicitly set to trial
            plan_expires_at: newTrialDateISO // Sync plan expiration
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Log action
      await logAdminAction(
        currentUser.id, 
        'restart_trial', 
        user.id, 
        { new_trial_end_date: newTrialDateISO }
      );

      toast({
        title: "Teste reiniciado com sucesso",
        description: `O período de teste foi reiniciado por 30 dias.`,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error restarting trial:', error);
      toast({
        title: "Erro ao reiniciar",
        description: "Não foi possível reiniciar o teste. Tente novamente.",
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
          <DialogTitle>Reiniciar Período de Teste</DialogTitle>
          <DialogDescription className="text-gray-400">
            Você está prestes a reiniciar o período de teste de <span className="font-bold text-white">{user?.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-yellow-900/20 border border-yellow-800/50 p-4 rounded-lg flex gap-3 my-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-200/90">
                Isso reverterá o status da conta para "Trial" e concederá 30 dias gratuitos a partir de hoje.
            </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-300 bg-gray-900/50 p-3 rounded border border-gray-700">
            <Calendar className="w-4 h-4 text-emerald-400" />
            Novo vencimento: <span className="font-semibold text-white">{format(newTrialDate, 'dd/MM/yyyy')}</span>
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
            onClick={handleRestart}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              'Confirmar Reinício'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RestartTrialModal;