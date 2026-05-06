import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, Lock, CreditCard, Save, Trash2, 
  AlertTriangle, Loader2, ShieldCheck, Crown, ArrowRight,
  Eye, EyeOff, CheckCircle2, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatWhatsApp, validateWhatsApp } from '@/utils/maskUtils';
import { Badge } from '@/components/ui/badge';

const SettingsView = ({
  user,
  profile,
  onProfileUpdate,
  onDataChange
}) => {
  const { toast } = useToast();
  const { signOut } = useAuth();
  
  // Personal Info State
  const [personalData, setPersonalData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Account Delete State
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    if (profile) {
      setPersonalData({
        name: profile.name || '',
        email: user?.email || '',
        phone: profile.phone ? formatWhatsApp(profile.phone) : ''
      });
    }
  }, [profile, user]);

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      setPersonalData(prev => ({ ...prev, [name]: formatWhatsApp(value) }));
    } else {
      setPersonalData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!personalData.name.trim()) {
      toast({ title: "Erro", description: "O nome não pode estar em branco.", variant: "destructive" });
      return;
    }

    if (personalData.phone && !validateWhatsApp(personalData.phone)) {
      toast({ title: "Erro", description: "Por favor, insira um telefone válido.", variant: "destructive" });
      return;
    }

    setIsSavingProfile(true);
    try {
      // 1. Update Profile (Name and Phone)
      const { data: updatedProfile, error: profileError } = await supabase
        .from('profiles')
        .update({
          name: personalData.name.trim(),
          phone: personalData.phone.replace(/\D/g, '')
        })
        .eq('id', user.id)
        .select()
        .single();

      if (profileError) throw profileError;

      // 2. Update Email if changed
      if (personalData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email: personalData.email });
        if (emailError) throw emailError;
        toast({
          title: "Email em atualização",
          description: "Um link de confirmação foi enviado para o seu novo email.",
        });
      }

      toast({ title: "Sucesso!", description: "Suas informações foram atualizadas." });
      if (onProfileUpdate) onProfileUpdate(updatedProfile);
    } catch (error) {
      console.error('Update profile error:', error);
      toast({ title: "Erro", description: error.message || "Não foi possível atualizar o perfil.", variant: "destructive" });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword.length < 6) {
      toast({ title: "Erro", description: "A nova senha deve ter pelo menos 6 caracteres.", variant: "destructive" });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: "Erro", description: "As senhas não coincidem.", variant: "destructive" });
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
      if (error) throw error;

      toast({ title: "Sucesso!", description: "Sua senha foi alterada com sucesso." });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast({ title: "Erro", description: error.message || "Não foi possível alterar a senha.", variant: "destructive" });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'excluir minha conta') {
      toast({ title: "Confirmação incorreta", description: "Por favor, digite a frase exata para confirmar.", variant: "destructive" });
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase.functions.invoke('delete-user-account');
      if (error) throw error;

      toast({ title: "Conta excluída", description: "Sua conta foi excluída com sucesso. Você será desconectado." });
      setTimeout(async () => {
        await signOut();
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      console.error('Delete account error:', error);
      toast({ title: "Erro", description: "Não foi possível excluir sua conta.", variant: "destructive" });
      setIsDeleting(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-lime-500 animate-spin" />
      </div>
    );
  }

  const getPlanStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'trial': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'trial_expired': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPlanLabel = (status) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'trial': return 'Período de Teste';
      case 'trial_expired': return 'Teste Expirado';
      default: return status;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Configurações do Perfil</h2>
          <p className="text-slate-500 mt-1">Gerencie suas informações pessoais e preferências da conta.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`px-3 py-1 text-xs font-semibold border ${getPlanStatusColor(profile.plan_status)}`}>
            Plano: {profile.account_type === 'rural' ? 'Produtor Rural' : 'Pessoal'}
          </Badge>
          {profile.is_admin && <Badge className="bg-amber-100 text-amber-700 border-amber-200 uppercase tracking-wider text-[10px]">Admin</Badge>}
        </div>
      </motion.div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-100/50 p-1 rounded-xl mb-8">
          <TabsTrigger value="personal" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <User className="w-4 h-4 mr-2" /> Perfil
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <ShieldCheck className="w-4 h-4 mr-2" /> Segurança
          </TabsTrigger>
          <TabsTrigger value="plan" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Crown className="w-4 h-4 mr-2" /> Assinatura
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          {/* PERSONAL INFO TAB */}
          <TabsContent value="personal">
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              <Card className="border-none shadow-md overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <User className="w-5 h-5 text-lime-600" /> Informações Pessoais
                  </CardTitle>
                  <CardDescription>Atualize seu nome, email e telefone de contato.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-24 h-24 rounded-full bg-lime-100 flex items-center justify-center border-4 border-white shadow-sm">
                        <User className="w-10 h-10 text-lime-600" />
                      </div>
                      <Button variant="outline" size="sm" className="text-xs">Alterar Foto</Button>
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input 
                            id="name" name="name" 
                            value={personalData.name} 
                            onChange={handlePersonalChange} 
                            placeholder="Ex: João da Silva" 
                            className="pl-10 focus:ring-lime-500"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input 
                            id="email" name="email" 
                            value={personalData.email} 
                            onChange={handlePersonalChange} 
                            placeholder="seu@email.com" 
                            className="pl-10 focus:ring-lime-500"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone / WhatsApp</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input 
                            id="phone" name="phone" 
                            value={personalData.phone} 
                            onChange={handlePersonalChange} 
                            placeholder="(00) 00000-0000" 
                            className="pl-10 focus:ring-lime-500"
                            maxLength={15}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-50/30 border-t py-4">
                  <Button 
                    onClick={handleUpdateProfile} 
                    disabled={isSavingProfile}
                    className="bg-lime-600 hover:bg-lime-700 text-white font-semibold transition-all ml-auto"
                  >
                    {isSavingProfile ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Salvar Alterações
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </TabsContent>

          {/* SECURITY TAB */}
          <TabsContent value="security">
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
              <Card className="border-none shadow-md overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Lock className="w-5 h-5 text-amber-600" /> Segurança e Senha
                  </CardTitle>
                  <CardDescription>Mantenha sua conta segura alterando sua senha regularmente.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nova Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                          id="newPassword" 
                          type={showPasswords.new ? "text" : "password"} 
                          value={passwordData.newPassword} 
                          onChange={(e) => setPasswordData(p => ({ ...p, newPassword: e.target.value }))}
                          className="pl-10 pr-10"
                          placeholder="Mínimo 6 caracteres"
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPasswords(p => ({ ...p, new: !p.new }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                          id="confirmPassword" 
                          type={showPasswords.confirm ? "text" : "password"} 
                          value={passwordData.confirmPassword} 
                          onChange={(e) => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))}
                          className="pl-10 pr-10"
                          placeholder="Repita a nova senha"
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isChangingPassword}
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white mt-2"
                    >
                      {isChangingPassword ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                      Atualizar Senha
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-red-100 shadow-sm border bg-red-50/30">
                <CardHeader>
                  <CardTitle className="text-lg text-red-800 flex items-center gap-2">
                    <Trash2 className="w-5 h-5" /> Zona de Perigo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-600">
                    Ao excluir sua conta, todos os seus dados (transações, carteiras, propriedades) serão permanentemente removidos. Esta ação não pode ser desfeita.
                  </p>
                  {!showDeleteConfirm ? (
                    <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)} size="sm">
                      Excluir minha conta
                    </Button>
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 p-4 bg-white border border-red-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-red-800">Confirmação Necessária</p>
                          <p className="text-sm text-red-700">Digite <strong className="font-mono">excluir minha conta</strong> para prosseguir.</p>
                        </div>
                      </div>
                      <Input 
                        value={deleteConfirmText} 
                        onChange={(e) => setDeleteConfirmText(e.target.value)} 
                        className="border-red-200 focus:ring-red-500"
                        placeholder="excluir minha conta"
                      />
                      <div className="flex gap-2">
                        <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting} className="flex-1">
                          {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                          Confirmar Exclusão
                        </Button>
                        <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancelar</Button>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* PLAN TAB */}
          <TabsContent value="plan">
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              <Card className="border-none shadow-md overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-indigo-600" /> Gerenciar Assinatura
                  </CardTitle>
                  <CardDescription>Visualize os detalhes do seu plano atual e opções de upgrade.</CardDescription>
                </CardHeader>
                <CardContent className="pt-8 pb-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white relative overflow-hidden">
                        <div className="relative z-10">
                          <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">Plano Atual</p>
                          <h4 className="text-2xl font-bold mt-1">
                            {profile.account_type === 'rural' ? 'Meu Pila Rural' : 'Meu Pila Pessoal'}
                          </h4>
                          <div className="mt-8 flex items-end justify-between">
                            <div>
                              <p className="text-slate-400 text-xs">Status</p>
                              <Badge className={`mt-1 border-none ${getPlanStatusColor(profile.plan_status)}`}>
                                {getPlanLabel(profile.plan_status)}
                              </Badge>
                            </div>
                            {profile.plan_expires_at && (
                              <div className="text-right">
                                <p className="text-slate-400 text-xs">Vencimento</p>
                                <p className="font-semibold">{new Date(profile.plan_expires_at).toLocaleDateString('pt-BR')}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Decorative circle */}
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                        <Crown className="absolute top-4 right-4 w-12 h-12 text-white/10" />
                      </div>

                      <div className="space-y-4">
                        <h5 className="font-semibold text-slate-800">O que seu plano inclui:</h5>
                        <ul className="space-y-3">
                          {[
                            "Gestão completa de fluxo de caixa",
                            "Relatórios inteligentes automatizados",
                            "Acesso multi-dispositivo",
                            profile.account_type === 'rural' ? "Controle de safra e rebanho" : "Gestão de objetivos financeiros",
                            "Suporte prioritário"
                          ].map((feature, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center items-center text-center p-6 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
                      <div className="w-16 h-16 rounded-full bg-lime-100 flex items-center justify-center mb-4">
                        <TrendingUp className="w-8 h-8 text-lime-600" />
                      </div>
                      <h4 className="text-xl font-bold text-slate-800">Quer mais recursos?</h4>
                      <p className="text-slate-500 mt-2 mb-6">
                        Desbloqueie o potencial máximo da sua gestão financeira com nossos planos premium.
                      </p>
                      <Button 
                        onClick={() => window.location.href = '/checkout'}
                        className="bg-lime-600 hover:bg-lime-700 text-white w-full py-6 rounded-xl text-lg font-bold shadow-lg shadow-lime-200"
                      >
                        {profile.plan_status === 'trial' ? 'Fazer Upgrade Agora' : 'Alterar Meu Plano'}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                      <p className="text-xs text-slate-400 mt-4 italic">
                        Cobrança segura via Stripe ou PIX.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
};

export default SettingsView;