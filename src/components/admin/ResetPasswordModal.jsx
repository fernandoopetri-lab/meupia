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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Copy, Check, Mail, AlertTriangle } from 'lucide-react';

const ResetPasswordModal = ({ isOpen, onClose, user, onSuccess }) => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('link');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { type: 'link' | 'password', value: string }
  const [copied, setCopied] = useState(false);

  const resetState = () => {
    setResult(null);
    setCopied(false);
    setLoading(false);
    setActiveTab('link');
  };

  const handleClose = (open) => {
    if (!open) {
      onClose(false);
      setTimeout(resetState, 300);
    }
  };

  const handleCopy = () => {
    if (result?.value) {
      navigator.clipboard.writeText(result.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copiado!", description: "Transferido para a área de transferência." });
    }
  };

  const handleSendLink = async () => {
    if (!user?.email || !currentUser) return;
    setLoading(true);
    try {
      // Using Supabase Edge Function to generate link or send email
      const { data, error } = await supabase.functions.invoke('reset-user-password', {
        body: { userId: user.id, email: user.email, type: 'link' }
      });

      if (error || !data.success) throw new Error(error?.message || 'Falha ao gerar link');

      setResult({ type: 'link', value: data.resetLink });
      
      await logAdminAction(currentUser.id, 'reset_password', user.id, { method: 'link' });
      
      toast({ title: "Link gerado", description: "Link de redefinição criado com sucesso." });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error generating link:', error);
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTempPassword = async () => {
    if (!user?.id || !currentUser) return;
    setLoading(true);
    try {
      // Generate a random 12-char password
      const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
      const tempPassword = Array(12).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');

      // Call edge function to update password since client SDK admin methods are not available
      const { data, error } = await supabase.functions.invoke('reset-user-password', {
        body: { 
            userId: user.id, 
            email: user.email,
            type: 'temp_password', 
            password: tempPassword 
        }
      });

      if (error || !data.success) throw new Error(error?.message || 'Falha ao definir senha');

      setResult({ type: 'password', value: tempPassword });
      
      await logAdminAction(currentUser.id, 'reset_password', user.id, { method: 'temp_password' });

      toast({ title: "Senha definida", description: "Senha temporária aplicada com sucesso." });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error setting temp password:', error);
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Redefinir Senha</DialogTitle>
          <DialogDescription className="text-gray-400">
            Escolha um método para redefinir o acesso de <span className="text-white font-medium">{user?.email}</span>.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-900">
              <TabsTrigger value="link">Link de Acesso</TabsTrigger>
              <TabsTrigger value="temp">Senha Temporária</TabsTrigger>
            </TabsList>

            <div className="py-6 space-y-4">
              <TabsContent value="link" className="space-y-4 mt-0">
                <div className="bg-blue-900/20 border border-blue-800/50 p-4 rounded-lg flex gap-3">
                  <Mail className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-200">Recomendado</h4>
                    <p className="text-sm text-blue-300/80 mt-1">
                      Gera um link seguro que permite ao usuário criar sua própria senha. Mais seguro e privado.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="temp" className="space-y-4 mt-0">
                <div className="bg-yellow-900/20 border border-yellow-800/50 p-4 rounded-lg flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-yellow-200">Atenção</h4>
                    <p className="text-sm text-yellow-300/80 mt-1">
                      Você verá a senha gerada. Compartilhe-a através de um canal seguro e instrua o usuário a trocá-la imediatamente.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => handleClose(false)} className="hover:bg-gray-700 text-gray-300">
                Cancelar
              </Button>
              <Button 
                onClick={activeTab === 'link' ? handleSendLink : handleGenerateTempPassword} 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (activeTab === 'link' ? 'Gerar Link' : 'Gerar Senha')}
              </Button>
            </DialogFooter>
          </Tabs>
        ) : (
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-green-900/30 flex items-center justify-center text-green-400">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-medium text-white">
                {result.type === 'link' ? 'Link Gerado com Sucesso' : 'Senha Temporária Criada'}
              </h3>
              <p className="text-sm text-gray-400 max-w-xs">
                {result.type === 'link' 
                  ? 'Copie o link abaixo e envie para o usuário.' 
                  : 'Copie a senha abaixo. Ela não será mostrada novamente.'}
              </p>
            </div>

            <div className="bg-gray-950 p-4 rounded-lg border border-gray-800 relative group">
              <code className="text-sm text-gray-300 break-all font-mono">
                {result.value}
              </code>
              <Button
                size="icon"
                variant="secondary"
                className="absolute top-2 right-2 h-8 w-8 bg-gray-800 hover:bg-gray-700 text-gray-300"
                onClick={handleCopy}
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            <DialogFooter>
              <Button onClick={() => handleClose(false)} className="w-full bg-gray-700 hover:bg-gray-600 text-white">
                Concluir
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ResetPasswordModal;