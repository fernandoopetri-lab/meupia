import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2 } from 'lucide-react';

const UserAccessManager = ({ user, isOpen, onClose, onUpdate }) => {
  const [status, setStatus] = useState(user?.access_status || 'active');
  const [reason, setReason] = useState(user?.access_reason || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
            access_status: status,
            access_reason: reason,
            last_access_check_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      // Log action
      await supabase.from('admin_audit_logs').insert({
          target_user_id: user.id,
          action: 'manual_access_update',
          details: {
            reason: reason,
            old_status: user.access_status,
            new_status: status
          },
          admin_user_id: (await supabase.auth.getUser()).data.user.id
      });

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating user access:', error);
      alert('Falha ao atualizar acesso.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle>Gerenciar Acesso: {user?.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label>Status do Acesso</Label>
                <select 
                    className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:outline-none"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <option value="active">Ativo</option>
                    <option value="restricted">Restrito</option>
                    <option value="blocked">Bloqueado</option>
                    <option value="trial_expired">Teste Expirado</option>
                </select>
            </div>

            <div className="space-y-2">
                <Label>Motivo / Observação</Label>
                <textarea
                    className="w-full min-h-[100px] rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:outline-none"
                    placeholder="Motivo da alteração de status..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                />
            </div>
            
            <div className="bg-gray-900/50 p-3 rounded-lg text-xs text-gray-400 space-y-1">
                <p><strong>ID do Usuário:</strong> {user?.id}</p>
                <p><strong>Plano Atual:</strong> {user?.current_plan_id || 'N/A'}</p>
                <p><strong>Expiração:</strong> {user?.plan_expires_at ? new Date(user.plan_expires_at).toLocaleDateString() : 'N/A'}</p>
            </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white hover:bg-gray-700">
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserAccessManager;