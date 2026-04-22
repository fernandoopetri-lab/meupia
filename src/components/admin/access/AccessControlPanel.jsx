import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Shield, AlertTriangle, RefreshCw, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AccessStatusBadge from '@/components/AccessStatusBadge';
import UserAccessManager from './UserAccessManager';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AccessControlPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select(`
            *,
            current_plan_id (name)
        `)
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('access_status', filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Client-side filtering for search term if needed (or could rely on DB ilike)
      const filtered = searchTerm 
        ? data.filter(u => u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.cpf?.includes(searchTerm))
        : data;

      setUsers(filtered);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filterStatus, searchTerm]);

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleForceSync = async (userId) => {
      // Logic to call edge function force-access-sync
      console.log("Syncing user", userId);
      // Mock toast
      alert("Sync initiated (mock)");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-emerald-500" />
          Controle de Acesso
        </h2>
        <div className="flex gap-2 w-full sm:w-auto">
           <div className="relative flex-1 sm:w-64">
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
             <Input 
                placeholder="Buscar usuário..." 
                className="pl-9 bg-gray-800 border-gray-700 text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           <select 
             className="bg-gray-800 border border-gray-700 text-white rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
             value={filterStatus}
             onChange={(e) => setFilterStatus(e.target.value)}
           >
             <option value="all">Todos os Status</option>
             <option value="active">Ativos</option>
             <option value="restricted">Restritos</option>
             <option value="blocked">Bloqueados</option>
             <option value="trial_expired">Teste Expirado</option>
           </select>
        </div>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-800">
            <TableRow className="border-gray-700 hover:bg-gray-800">
              <TableHead className="text-gray-400">Usuário</TableHead>
              <TableHead className="text-gray-400">Plano</TableHead>
              <TableHead className="text-gray-400">Status Acesso</TableHead>
              <TableHead className="text-gray-400">Expira em</TableHead>
              <TableHead className="text-gray-400 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-400">Carregando...</TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-400">Nenhum usuário encontrado</TableCell>
              </TableRow>
            ) : (
              users.map(user => (
                <TableRow key={user.id} className="border-gray-700 hover:bg-gray-700/50">
                  <TableCell>
                    <div>
                      <p className="font-medium text-white">{user.name || 'Sem nome'}</p>
                      <p className="text-xs text-gray-400">{user.cpf || 'Sem CPF'}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-300">
                      {user.current_plan_id ? 'Plano Ativo' : 'Sem Plano'} 
                      {/* Note: current_plan_id is an ID, ideally we joined the name, handled in query select */}
                    </span>
                  </TableCell>
                  <TableCell>
                    <AccessStatusBadge status={user.access_status} reason={user.access_reason} />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-300">
                      {user.plan_expires_at 
                        ? format(new Date(user.plan_expires_at), 'dd/MM/yyyy', { locale: ptBR })
                        : '-'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 text-gray-200">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEditUser(user)} className="hover:bg-gray-700 cursor-pointer">
                          Gerenciar Acesso
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleForceSync(user.id)} className="hover:bg-gray-700 cursor-pointer">
                          <RefreshCw className="mr-2 h-4 w-4" /> Sincronizar ASAAS
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-700" />
                        <DropdownMenuItem className="text-red-400 hover:bg-red-900/20 cursor-pointer">
                          Bloquear Usuário
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedUser && (
        <UserAccessManager 
          user={selectedUser} 
          isOpen={isModalOpen} 
          onClose={() => { setIsModalOpen(false); setSelectedUser(null); }}
          onUpdate={fetchUsers}
        />
      )}
    </div>
  );
};

export default AccessControlPanel;