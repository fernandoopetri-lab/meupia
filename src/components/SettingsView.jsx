import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Briefcase, Save, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
const SettingsView = ({
  user,
  profile,
  onProfileUpdate,
  onDataChange
}) => {
  const {
    toast
  } = useToast();
  const {
    signOut
  } = useAuth();
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
    }
  }, [profile]);
  const handleUpdateProfile = async e => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Erro",
        description: "O nome não pode estar em branco.",
        variant: "destructive"
      });
      return;
    }
    setIsSaving(true);
    const {
      data,
      error
    } = await supabase.from('profiles').update({
      name: name.trim()
    }).eq('id', user.id).select().single();
    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sucesso!",
        description: "Seu perfil foi atualizado."
      });
      onProfileUpdate(data);
    }
    setIsSaving(false);
  };
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'excluir minha conta') {
      toast({
        title: "Confirmação incorreta",
        description: "Por favor, digite a frase exata para confirmar.",
        variant: "destructive"
      });
      return;
    }
    setIsDeleting(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('delete-user-account');
      if (error) {
        throw error;
      }
      toast({
        title: "Conta excluída",
        description: "Sua conta foi excluída com sucesso. Você será desconectado."
      });

      // Wait a moment before signing out to let the toast show
      setTimeout(async () => {
        await signOut();
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      console.error('Delete account error:', error);
      toast({
        title: "Erro",
        description: `Não foi possível excluir sua conta. Tente novamente mais tarde.`,
        variant: "destructive"
      });
      setIsDeleting(false);
    }
  };
  if (!profile) {
    return <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-lime-500 animate-spin" />
      </div>;
  }
  return <div className="space-y-8">
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }}>
        <h2 className="text-3xl font-bold text-slate-800">Configurações</h2>
        <p className="text-slate-500 mt-1">Gerencie suas informações de perfil e preferências.</p>
      </motion.div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="account">Conta</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <div className="chart-container mt-4">
            <h3 className="text-xl font-semibold text-slate-700 mb-6">Informações do Perfil</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-2xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center"><User className="w-6 h-6 text-slate-500" /></div>
                <div className="flex-grow"><label htmlFor="name" className="block text-sm font-medium text-slate-700">Nome</label><input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className="input-field mt-1" placeholder="Seu nome completo" /></div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center"><Mail className="w-6 h-6 text-slate-500" /></div>
                <div className="flex-grow"><label className="block text-sm font-medium text-slate-700">Email</label><p className="text-slate-500 mt-1">{user.email}</p></div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center"><Briefcase className="w-6 h-6 text-slate-500" /></div>
                <div className="flex-grow"><label className="block text-sm font-medium text-slate-700">Seu Plano</label><p className="text-slate-500 mt-1 capitalize">{profile.account_type === 'rural' ? 'Produtor Rural' : 'Pessoal'}</p></div>
              </div>
              <div className="pt-4"><Button type="submit" disabled={isSaving}>{isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Salvar Alterações</Button></div>
            </form>
          </div>
        </TabsContent>
        <TabsContent value="account">
          <div className="chart-container mt-4 border-l-4 border-red-500">
            <h3 className="text-xl font-semibold text-red-700 mb-4">Zona de Perigo</h3>
            <div className="space-y-4">
              <div><h4 className="font-semibold text-slate-800">Excluir Conta</h4><p className="text-sm text-slate-500 mt-1">Esta ação é irreversível. Todos os seus dados, incluindo carteiras, transações e histórico, serão permanentemente excluídos.</p></div>
              {!showDeleteConfirm ? <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}><Trash2 className="w-4 h-4 mr-2" />Excluir minha conta</Button> : <motion.div initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                    <div><h5 className="font-bold text-red-800">Confirmação necessária</h5><p className="text-sm text-red-700">Para confirmar, digite a frase <strong className="font-mono">excluir minha conta</strong> abaixo.</p></div>
                  </div>
                  <input type="text" value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)} className="input-field border-red-300 focus:ring-red-500" placeholder="excluir minha conta" />
                  <div className="flex space-x-3">
                    <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting}>{isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}Confirmar Exclusão</Button>
                    <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancelar</Button>
                  </div>
                </motion.div>}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>;
};
export default SettingsView;