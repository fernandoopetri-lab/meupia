
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Power, PowerOff, Loader2, CircleDot as RepeatIcon, Search } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import RecurringExpenseModal from './RecurringExpenseModal';
import { Input } from './ui/input';

const RecurringExpensesManager = ({ user, categories, wallets }) => {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchExpenses = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('recurring_expenses')
        .select(`
          *,
          categories:category_id (name),
          wallets:wallet_id (name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível carregar as despesas recorrentes.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const toggleStatus = async (expense) => {
    const newStatus = expense.status === 'active' ? 'inactive' : 'active';
    try {
      const { error } = await supabase
        .from('recurring_expenses')
        .update({ status: newStatus })
        .eq('id', expense.id);
      
      if (error) throw error;
      toast({ title: 'Sucesso', description: `Despesa marcada como ${newStatus === 'active' ? 'ativa' : 'inativa'}.` });
      fetchExpenses();
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível alterar o status.', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase
        .from('recurring_expenses')
        .delete()
        .eq('id', deleteId);
      
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Despesa recorrente excluída.' });
      fetchExpenses();
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível excluir a despesa.', variant: 'destructive' });
    } finally {
      setDeleteId(null);
    }
  };

  const calculateNextGeneration = (expense) => {
    if (expense.status === 'inactive') return 'Inativo';
    const now = new Date();
    let nextMonth = now.getMonth();
    let nextYear = now.getFullYear();

    if (expense.last_generated_at) {
        const lastGen = new Date(expense.last_generated_at);
        if (lastGen.getMonth() === now.getMonth() && lastGen.getFullYear() === now.getFullYear()) {
            nextMonth++;
            if (nextMonth > 11) {
                nextMonth = 0;
                nextYear++;
            }
        }
    }
    
    let validDueDay = expense.due_day;
    const daysInNextMonth = new Date(nextYear, nextMonth + 1, 0).getDate();
    if (validDueDay > daysInNextMonth) validDueDay = daysInNextMonth;

    return `${String(validDueDay).padStart(2, '0')}/${String(nextMonth + 1).padStart(2, '0')}/${nextYear}`;
  };

  const filteredExpenses = expenses.filter(exp => 
    exp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exp.categories?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Despesas Recorrentes</h2>
            <p className="text-sm text-slate-500">Gerencie contas que se repetem todo mês.</p>
        </div>
        <Button 
          onClick={() => { setSelectedExpense(null); setIsModalOpen(true); }}
          className="bg-lime-500 hover:bg-lime-600 text-white w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Despesa
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input 
          placeholder="Buscar despesas..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 w-full sm:max-w-md bg-white"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
              <tr>
                <th className="px-4 py-3">Nome / Categoria</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3 hidden md:table-cell">Vencimento (Dia)</th>
                <th className="px-4 py-3 hidden lg:table-cell">Próxima Geração</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-lime-500 mx-auto" />
                  </td>
                </tr>
              ) : filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Nenhuma despesa recorrente encontrada.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{expense.name}</div>
                      <div className="text-xs text-slate-500">{expense.categories?.name} • {expense.wallets?.name}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      R$ {parseFloat(expense.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      Dia {expense.due_day}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-slate-600">
                      {calculateNextGeneration(expense)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        expense.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {expense.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleStatus(expense)}
                          title={expense.status === 'active' ? 'Desativar' : 'Ativar'}
                        >
                          {expense.status === 'active' ? (
                            <PowerOff className="w-4 h-4 text-slate-400 hover:text-amber-500" />
                          ) : (
                            <Power className="w-4 h-4 text-slate-400 hover:text-emerald-500" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setSelectedExpense(expense); setIsModalOpen(true); }}
                        >
                          <Edit2 className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(expense.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RecurringExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={user}
        categories={categories}
        wallets={wallets}
        initialData={selectedExpense}
        onSuccess={fetchExpenses}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Despesa Recorrente?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso não afetará as parcelas que já foram geradas, mas impedirá a criação de novas contas no futuro.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RecurringExpensesManager;
