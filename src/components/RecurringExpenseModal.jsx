
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import RecurringExpenseForm from './RecurringExpenseForm';

const RecurringExpenseModal = ({ isOpen, onClose, user, categories, wallets, onSuccess, initialData }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar Despesa Recorrente' : 'Nova Despesa Recorrente'}</DialogTitle>
          <DialogDescription>
            Defina os detalhes para gerar contas a pagar automaticamente todos os meses.
          </DialogDescription>
        </DialogHeader>
        
        <RecurringExpenseForm
            user={user}
            categories={categories}
            wallets={wallets}
            initialData={initialData}
            onSuccess={() => {
                onSuccess();
                onClose();
            }}
            onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default RecurringExpenseModal;
