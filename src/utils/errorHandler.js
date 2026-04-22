import { logError } from './errorLogger';
import { toast } from '@/components/ui/use-toast';

/**
 * Centralized Supabase error handling utility
 */
export const handleSupabaseError = (error, context = {}, showToast = true) => {
  const errorMessage = error?.message || 'Ocorreu um erro inesperado na comunicação com o servidor.';
  
  logError('Supabase Operation Failed', error, context.userId, {
    functionName: context.functionName,
    table: context.table,
    ...context
  });

  if (showToast) {
    toast({
      title: "Erro de Conexão",
      description: errorMessage,
      variant: "destructive"
    });
  }

  return { error, message: errorMessage };
};

export const reportCriticalError = (message, error, context = {}) => {
  logError(`CRITICAL: ${message}`, error, context.userId, context);
};