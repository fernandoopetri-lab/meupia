
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { logAdminAction } from '@/utils/auditLog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, UserCheck, UserX, Trash2, Search, Loader2, Crown, KeyRound, Clock, CreditCard, PlayCircle, RefreshCw, Power, AlertCircle, AlertTriangle } from 'lucide-react';
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
import { format, differenceInDays } from 'date-fns';
import ChangePlanModal from './ChangePlanModal';
import ResetPasswordModal from './ResetPasswordModal';
import ExtendTrialModal from './ExtendTrialModal';
import RestartTrialModal from './RestartTrialModal';
import { useUserRefresh } from '@/hooks/useUserRefresh';
import { checkUserAccess } from '@/utils/checkUserAccess';

const UserManagement = ({ adminUser }) => {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Custom hook for refreshing specific users
  const { refetchUser } = useUserRefresh(setUsers);
  
  // Filters
  const [filters, setFilters] = useState({ 
    plan: 'all', 
    status: 'all', 
    planStatus: 'all',
    paymentMethod: 'all',
    accessStatus: 'all' // New filter
  });

  // Sorting
  const [sortConfig, setSortConfig] = useState({ key: 'updated_at', direction: 'desc' });

  // Processing state for actions (holds userId)
  const [isProcessing, setIsProcessing] = useState(null); 
  
  // Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [userToBlock, setUserToBlock] = useState(null);

  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [selectedUserForPlan, setSelectedUserForPlan] = useState(null);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState(null);

  const [isExtendTrialModalOpen, setIsExtendTrialModalOpen] = useState(false);
  const [selectedUserForTrial, setSelectedUserForTrial] = useState(null);

  const [isRestartTrialModalOpen, setIsRestartTrialModalOpen] = useState(false);
  const [userForRestartTrial, setUserForRestartTrial] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.functions.invoke('list-users');
      if (authError || !authData?.users) throw authError || new Error("Failed to fetch users from function");

      const userIds = authData.users.map(u => u.id);
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
      if (profilesError) throw profilesError;
      
      const profileMap = new Map();
      profiles.forEach(p => profileMap.set(p.id, p));

      const combinedUsers = authData.users
        .map(u => {
            const profile = profileMap.get(u.id) || {};
            // Pre-calculate access status for filtering
            const access = checkUserAccess({ ...profile, is_admin: false }); // Force check as non-admin to see true status
            return {
                ...u, 
                ...profile,
                computedAccessStatus: access.status
            };
        });
        
      setUsers(combinedUsers);

    } catch (error) {
      console.error("Error fetching users:", error);
      toast({ 
        title: "Erro ao buscar usuários", 
        description: error.message || "Não foi possível carregar os dados.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);


  // --- Actions ---

  const handleBlockUser = async () => {
    if (!userToBlock) return;
    const isBlocking = userToBlock.status !== 'blocked';
    const newStatus = isBlocking ? 'blocked' : 'active';
    
    setIsProcessing(userToBlock.id);
    
    try {
        const { error } = await supabase
            .from('profiles')
            .update({ status: newStatus })
            .eq('id', userToBlock.id);

        if (error) throw error;

        toast({ 
            title: isBlocking ? "Conta bloqueada com sucesso" : "Conta desbloqueada com sucesso", 
            description: isBlocking ? "O usuário não poderá mais acessar o sistema." : "Acesso do usuário restabelecido."
        });
        
        await logAdminAction(adminUser.id, isBlocking ? 'block_user' : 'unblock_user', userToBlock.id, { old_status: userToBlock.status, new_status: newStatus });
        await refetchUser(userToBlock.id);

    } catch (error) {
        console.error("Error toggling status:", error);
        toast({ title: "Erro", description: `Falha ao alterar status.`, variant: "destructive" });
    } finally {
        setIsProcessing(null);
        setIsBlockModalOpen(false);
        setUserToBlock(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsProcessing(userToDelete.id);
    
    try {
        // Capture user details before deletion for the log
        const deletedUserDetails = {
          deleted_user_id: userToDelete.id,
          email: userToDelete.email,
          name: userToDelete.name
        };

        // Use edge function for complete deletion (auth + public tables)
        const { error } = await supabase.functions.invoke('delete-user', { body: { userId: userToDelete.id } });

        if (error) throw error;

        toast({ title: "Usuário excluído com sucesso", description: "A conta e todos os dados foram removidos." });
        
        // Pass null as target_user_id because the user no longer exists in profiles table
        // This prevents foreign key constraint violation in admin_audit_logs
        await logAdminAction(adminUser.id, 'delete_user', null, deletedUserDetails);
        
        // Remove from list
        setUsers(current => current.filter(u => u.id !== userToDelete.id));

    } catch (error) {
        console.error("Error deleting user:", error);
        
        let errorMessage = "Falha ao excluir usuário.";
        
        // Try to parse the error message from the response if available
        if (error.message) {
             errorMessage = error.message;
        }
        
        // Check for common FK constraint keywords in Postgres errors
        if (errorMessage.includes('foreign key constraint') || errorMessage.includes('violates foreign key')) {
            errorMessage = "Não é possível excluir: O usuário possui registros vinculados (como transações ou logs) que impedem a exclusão. Remova os dados dependentes primeiro.";
        } else if (errorMessage.includes('Failed to delete profile')) {
             errorMessage = "Erro ao excluir perfil: Existem dados vinculados (ex: carteiras, transações) que precisam ser removidos antes.";
        }

        toast({ 
            title: "Erro ao excluir", 
            description: errorMessage, 
            variant: "destructive" 
        });
    } finally {
        setIsProcessing(null);
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
    }
  };

  // --- Filtering & Sorting ---
  
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = useMemo(() => {
    const sortableUsers = [...users];
    if (sortConfig.key) {
      sortableUsers.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        
        // Handle dates specifically
        if (['updated_at', 'last_login', 'trial_end_date', 'plan_expires_at'].includes(sortConfig.key)) {
            valA = valA ? new Date(valA).getTime() : 0;
            valB = valB ? new Date(valB).getTime() : 0;
        }
        
        // Handle nulls
        if (valA === null || valA === undefined) valA = '';
        if (valB === null || valB === undefined) valB = '';

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableUsers;
  }, [users, sortConfig]);

  const filteredUsers = useMemo(() => {
    return sortedUsers.filter(user => {
      // Text Search
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = user.name?.toLowerCase().includes(searchLower) || 
                            user.email?.toLowerCase().includes(searchLower) || 
                            user.phone?.includes(searchTerm);
      
      // Filters
      const matchesPlan = filters.plan === 'all' || user.account_type === filters.plan;
      const matchesStatus = filters.status === 'all' || user.status === filters.status;
      const matchesPlanStatus = filters.planStatus === 'all' || user.plan_status === filters.planStatus;
      const matchesPayment = filters.paymentMethod === 'all' || 
                             (filters.paymentMethod === 'none' ? !user.payment_method : user.payment_method === filters.paymentMethod);
      
      const matchesAccess = filters.accessStatus === 'all' || user.computedAccessStatus === filters.accessStatus;

      return matchesSearch && matchesPlan && matchesStatus && matchesPlanStatus && matchesPayment && matchesAccess;
    });
  }, [sortedUsers, searchTerm, filters]);

  const getDaysRemaining = (user) => {
    if (user.is_admin) return 9999;
    if (!user.plan_expires_at && !user.trial_end_date) return 0;
    const end = user.trial_end_date ? new Date(user.trial_end_date) : new Date(user.plan_expires_at);
    return differenceInDays(end, new Date());
  };

  const renderSortArrow = (key) => {
      if (sortConfig.key !== key) return null;
      return <span className="ml-1 text-emerald-400">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
  };

  const renderAccessBadge = (status) => {
      switch(status) {
          case 'active': return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><UserCheck className="w-3 h-3 mr-1"/>Ativo</span>;
          case 'trial_active': return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1"/>Teste</span>;
          case 'trial_expired': return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><AlertCircle className="w-3 h-3 mr-1"/>Teste Vencido</span>;
          case 'plan_expired': return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1"/>Plano Vencido</span>;
          case 'blocked': return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"><UserX className="w-3 h-3 mr-1"/>Bloqueado</span>;
          default: return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Desconhecido</span>;
      }
  };

  return (
    <>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Gerenciamento de Usuários</h1>
        
        {/* Filters Section */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                placeholder="Buscar por nome, e-mail ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white pl-10 w-full"
                />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <select 
                    value={filters.plan}
                    onChange={(e) => setFilters(f => ({...f, plan: e.target.value}))} 
                    className="input-field bg-gray-700 border-gray-600 text-white rounded-md p-2 text-sm"
                >
                    <option value="all">Plano: Todos</option>
                    <option value="personal">Pessoal</option>
                    <option value="family">Família</option>
                    <option value="rural">Rural</option>
                </select>
                
                <select 
                    value={filters.planStatus}
                    onChange={(e) => setFilters(f => ({...f, planStatus: e.target.value}))} 
                    className="input-field bg-gray-700 border-gray-600 text-white rounded-md p-2 text-sm"
                >
                    <option value="all">Status DB: Todos</option>
                    <option value="trial">Em Teste</option>
                    <option value="active">Ativo Pago</option>
                    <option value="expired">Vencido</option>
                    <option value="cancelled">Cancelado</option>
                </select>

                <select 
                    value={filters.accessStatus}
                    onChange={(e) => setFilters(f => ({...f, accessStatus: e.target.value}))} 
                    className="input-field bg-gray-700 border-gray-600 text-white rounded-md p-2 text-sm"
                >
                    <option value="all">Acesso: Todos</option>
                    <option value="active">Ativo</option>
                    <option value="trial_active">Teste Ativo</option>
                    <option value="trial_expired">Teste Expirado</option>
                    <option value="plan_expired">Plano Expirado</option>
                    <option value="blocked">Bloqueado</option>
                </select>

                <select 
                    value={filters.status}
                    onChange={(e) => setFilters(f => ({...f, status: e.target.value}))} 
                    className="input-field bg-gray-700 border-gray-600 text-white rounded-md p-2 text-sm"
                >
                    <option value="all">Conta: Todas</option>
                    <option value="active">Ativa</option>
                    <option value="blocked">Bloqueada</option>
                </select>

                <select 
                    value={filters.paymentMethod}
                    onChange={(e) => setFilters(f => ({...f, paymentMethod: e.target.value}))} 
                    className="input-field bg-gray-700 border-gray-600 text-white rounded-md p-2 text-sm"
                >
                    <option value="all">Pagamento: Todos</option>
                    <option value="credit_card">Cartão de Crédito</option>
                    <option value="boleto">Boleto</option>
                    <option value="pix">PIX</option>
                    <option value="none">Nenhum</option>
                </select>
            </div>
        </div>

        {/* Table */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="border-b border-gray-700 bg-gray-800">
              <tr>
                <th onClick={() => handleSort('name')} className="p-4 text-xs font-semibold text-gray-300 uppercase cursor-pointer hover:bg-gray-700/50">Usuário {renderSortArrow('name')}</th>
                <th onClick={() => handleSort('account_type')} className="p-4 text-xs font-semibold text-gray-300 uppercase cursor-pointer hover:bg-gray-700/50">Plano Atual {renderSortArrow('account_type')}</th>
                <th className="p-4 text-xs font-semibold text-gray-300 uppercase">Status Acesso</th>
                <th onClick={() => handleSort('updated_at')} className="p-4 text-xs font-semibold text-gray-300 uppercase cursor-pointer hover:bg-gray-700/50">Atualizado em {renderSortArrow('updated_at')}</th>
                <th onClick={() => handleSort('last_login')} className="p-4 text-xs font-semibold text-gray-300 uppercase cursor-pointer hover:bg-gray-700/50">Último Login {renderSortArrow('last_login')}</th>
                <th className="p-4 text-xs font-semibold text-gray-300 uppercase">Dias Restantes</th>
                <th onClick={() => handleSort('status')} className="p-4 text-xs font-semibold text-gray-300 uppercase cursor-pointer hover:bg-gray-700/50">Status Conta {renderSortArrow('status')}</th>
                <th onClick={() => handleSort('payment_method')} className="p-4 text-xs font-semibold text-gray-300 uppercase cursor-pointer hover:bg-gray-700/50">Pagamento {renderSortArrow('payment_method')}</th>
                <th className="p-4 text-xs font-semibold text-gray-300 uppercase text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="relative">
              <AnimatePresence>
                {loading ? (
                  <tr><td colSpan="9" className="text-center p-8"><Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-400" /></td></tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan="9" className="text-center p-8 text-gray-500">Nenhum usuário encontrado com os filtros atuais.</td></tr>
                ) : filteredUsers.map(user => {
                    const daysLeft = getDaysRemaining(user);
                    const processingThis = isProcessing === user.id;

                    return (
                      <motion.tr 
                          key={user.id} 
                          initial={{ opacity: 0, y: 10 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          exit={{ opacity: 0, scale: 0.95 }}
                          layout
                          className={`border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors ${user.is_admin ? 'bg-yellow-900/10' : ''}`}
                      >
                        <td className="p-4">
                          <div className="flex flex-col">
                              <div className='flex items-center gap-2'>
                                  {user.is_admin && <Crown className="w-3 h-3 text-yellow-400" />}
                                  <span className={`font-medium ${user.is_admin ? 'text-yellow-300' : 'text-white'}`}>{user.name || 'Sem nome'}</span>
                              </div>
                              <span className="text-xs text-gray-500">{user.email}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-300 capitalize">{user.account_type || '-'}</td>
                        <td className="p-4">
                            {renderAccessBadge(user.computedAccessStatus)}
                        </td>
                        <td className="p-4 text-xs text-gray-400">
                            {user.updated_at ? format(new Date(user.updated_at), 'dd/MM/yy') : '-'}
                        </td>
                        <td className="p-4 text-xs text-gray-400">
                            {user.last_login ? (
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {format(new Date(user.last_login), 'dd/MM HH:mm')}
                                </div>
                            ) : '-'}
                        </td>
                        <td className="p-4">
                            <span className={`text-xs font-bold ${daysLeft < 3 ? 'text-red-400' : 'text-emerald-400'}`}>
                              {user.is_admin ? '∞' : (daysLeft > 0 ? `${daysLeft} dias` : 'Vencido')}
                            </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${user.status === 'blocked' ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'}`}>
                            {user.status === 'blocked' ? 'Bloqueada' : 'Ativa'}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-gray-400">
                            {user.payment_method || '-'}
                        </td>
                        <td className="p-4 text-right">
                          {processingThis ? <Loader2 className="h-5 w-5 animate-spin text-emerald-400 ml-auto" /> : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild disabled={user.is_admin && user.id !== adminUser.id}>
                                <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:bg-gray-700 data-[state=open]:bg-gray-700">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuPortal>
                                <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 text-white min-w-[200px]">
                                  <DropdownMenuLabel className="text-gray-500 text-xs uppercase tracking-wider">Ações da Conta</DropdownMenuLabel>
                                  
                                  <DropdownMenuItem onClick={() => { setUserToBlock(user); setIsBlockModalOpen(true); }} className="cursor-pointer hover:bg-gray-700 focus:bg-gray-700">
                                      <Power className={`mr-2 h-4 w-4 ${user.status === 'blocked' ? 'text-green-400' : 'text-red-400'}`} /> 
                                      {user.status === 'blocked' ? 'Desbloquear Conta' : 'Bloquear Conta'}
                                  </DropdownMenuItem>
                                  
                                  <DropdownMenuItem onClick={() => { setSelectedUserForPassword(user); setIsPasswordModalOpen(true); }} className="cursor-pointer hover:bg-gray-700 focus:bg-gray-700">
                                    <KeyRound className="mr-2 h-4 w-4" /> Redefinir Senha
                                  </DropdownMenuItem>

                                  <DropdownMenuSeparator className="bg-gray-700" />
                                  <DropdownMenuLabel className="text-gray-500 text-xs uppercase tracking-wider">Assinatura</DropdownMenuLabel>

                                  <DropdownMenuItem onClick={() => { setSelectedUserForPlan(user); setIsPlanModalOpen(true); }} className="cursor-pointer hover:bg-gray-700 focus:bg-gray-700">
                                    <CreditCard className="mr-2 h-4 w-4" /> Alterar Plano
                                  </DropdownMenuItem>
                                  
                                  <DropdownMenuItem onClick={() => { setSelectedUserForTrial(user); setIsExtendTrialModalOpen(true); }} className="cursor-pointer hover:bg-gray-700 focus:bg-gray-700">
                                    <PlayCircle className="mr-2 h-4 w-4" /> Estender Teste
                                  </DropdownMenuItem>

                                  <DropdownMenuItem onClick={() => { setUserForRestartTrial(user); setIsRestartTrialModalOpen(true); }} className="cursor-pointer hover:bg-gray-700 focus:bg-gray-700">
                                    <RefreshCw className="mr-2 h-4 w-4" /> Reiniciar Teste
                                  </DropdownMenuItem>

                                  <DropdownMenuSeparator className="bg-gray-700" />
                                  <DropdownMenuItem onClick={() => { setUserToDelete(user); setIsDeleteModalOpen(true); }} className="cursor-pointer text-red-400 hover:!bg-red-900/50 focus:!bg-red-900/50">
                                      <Trash2 className="mr-2 h-4 w-4" /> Excluir Usuário
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenuPortal>
                            </DropdownMenu>
                          )}
                        </td>
                      </motion.tr>
                    )
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modals */}
      <ChangePlanModal 
        isOpen={isPlanModalOpen} 
        onClose={setIsPlanModalOpen} 
        user={selectedUserForPlan} 
        onSuccess={() => refetchUser(selectedUserForPlan?.id)}
      />

      <ResetPasswordModal 
        isOpen={isPasswordModalOpen}
        onClose={setIsPasswordModalOpen}
        user={selectedUserForPassword}
        onSuccess={() => refetchUser(selectedUserForPassword?.id)}
      />

      <ExtendTrialModal 
        isOpen={isExtendTrialModalOpen}
        onClose={setIsExtendTrialModalOpen}
        user={selectedUserForTrial}
        onSuccess={() => refetchUser(selectedUserForTrial?.id)}
      />

      <RestartTrialModal
        isOpen={isRestartTrialModalOpen}
        onClose={setIsRestartTrialModalOpen}
        user={userForRestartTrial}
        onSuccess={() => refetchUser(userForRestartTrial?.id)}
      />

      {/* Delete Confirmation Alert */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent className="bg-gray-800 border-gray-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Excluir Conta?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Esta ação é irreversível. A conta de <span className="font-bold text-white">{userToDelete?.name}</span> ({userToDelete?.email}) será apagada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700 text-white">
              {isProcessing === userToDelete?.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Block Confirmation Alert */}
      <AlertDialog open={isBlockModalOpen} onOpenChange={setIsBlockModalOpen}>
        <AlertDialogContent className="bg-gray-800 border-gray-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>{userToBlock?.status === 'blocked' ? 'Desbloquear Conta?' : 'Bloquear Conta?'}</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              {userToBlock?.status === 'blocked' 
                ? `O usuário ${userToBlock?.name} terá o acesso restabelecido ao sistema.`
                : `O usuário ${userToBlock?.name} perderá o acesso ao sistema imediatamente.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
                onClick={handleBlockUser} 
                className={`${userToBlock?.status === 'blocked' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white`}
            >
              {isProcessing === userToBlock?.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UserManagement;
