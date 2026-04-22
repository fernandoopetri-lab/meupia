import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Edit2, Trash2, Search, CheckCircle, XCircle } from 'lucide-react';
import { logAdminAction } from '@/utils/auditLog';
import { motion, AnimatePresence } from 'framer-motion';
import PlanForm from './PlanForm';
import { format } from 'date-fns';
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

const PlansManagement = () => {
  const { toast } = useToast();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('price', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar planos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingPlan(null);
    setIsFormOpen(true);
  };

  const confirmDelete = (plan) => {
    setPlanToDelete(plan);
    setIsDeleteAlertOpen(true);
  };

  const handleDelete = async () => {
    if (!planToDelete) return;
    setIsDeleting(true);

    try {
      // Check if plan has active users
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('current_plan_id', planToDelete.id);

      if (countError) throw countError;

      if (count > 0) {
        toast({
          title: "Ação bloqueada",
          description: `Existem ${count} usuários usando este plano. Desative-o em vez de excluir.`,
          variant: "destructive"
        });
        setIsDeleteAlertOpen(false);
        setIsDeleting(false);
        return;
      }

      // Soft delete (set status to inactive) or hard delete if really unused?
      // User prompt says: "Include delete functionality with confirmation (soft delete by setting status to inactive)"
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('plans')
        .update({ status: 'inactive' })
        .eq('id', planToDelete.id);

      if (error) throw error;

      await logAdminAction(user.id, 'delete_plan', null, { 
        plan_id: planToDelete.id, 
        plan_name: planToDelete.name,
        type: 'soft_delete'
      });

      toast({ title: "Plano desativado com sucesso!" });
      fetchPlans();

    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        title: "Erro",
        description: "Falha ao excluir plano.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteAlertOpen(false);
      setPlanToDelete(null);
    }
  };

  const filteredPlans = plans.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.plan_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Planos de Assinatura</h2>
          <p className="text-gray-400 text-sm">Gerencie as ofertas e regras de acesso do sistema.</p>
        </div>
        <Button onClick={handleCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Novo Plano
        </Button>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input 
            placeholder="Buscar planos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-700 border-gray-600 text-white pl-10 max-w-md"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="border-b border-gray-700 bg-gray-800">
              <tr>
                <th className="p-4 text-xs font-semibold text-gray-300 uppercase">Nome</th>
                <th className="p-4 text-xs font-semibold text-gray-300 uppercase">Tipo</th>
                <th className="p-4 text-xs font-semibold text-gray-300 uppercase">Preço</th>
                <th className="p-4 text-xs font-semibold text-gray-300 uppercase">Limite Usuários</th>
                <th className="p-4 text-xs font-semibold text-gray-300 uppercase">Status</th>
                <th className="p-4 text-xs font-semibold text-gray-300 uppercase text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
                  </td>
                </tr>
              ) : filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    Nenhum plano encontrado.
                  </td>
                </tr>
              ) : (
                filteredPlans.map(plan => (
                  <motion.tr 
                    key={plan.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-gray-700/50 hover:bg-gray-700/30"
                  >
                    <td className="p-4 font-medium text-white">{plan.name}</td>
                    <td className="p-4 text-gray-300 capitalize">{plan.plan_type}</td>
                    <td className="p-4 text-gray-300">
                      {plan.price === 0 ? 'Grátis' : `R$ ${plan.price.toFixed(2)}`}
                    </td>
                    <td className="p-4 text-gray-300">{plan.user_limit}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        plan.status === 'active' 
                          ? 'bg-green-900/30 text-green-400' 
                          : 'bg-red-900/30 text-red-400'
                      }`}>
                        {plan.status === 'active' ? (
                          <><CheckCircle className="w-3 h-3 mr-1" /> Ativo</>
                        ) : (
                          <><XCircle className="w-3 h-3 mr-1" /> Inativo</>
                        )}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEdit(plan)}
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => confirmDelete(plan)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PlanForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        planToEdit={editingPlan}
        onSuccess={fetchPlans}
      />

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className="bg-gray-800 border-gray-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar Plano?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              O plano "{planToDelete?.name}" será marcado como inativo. Usuários atuais poderão continuar usando, mas novas assinaturas não serão permitidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-gray-600 hover:bg-gray-700 text-gray-300">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Desativação'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PlansManagement;