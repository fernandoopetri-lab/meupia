import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Loader2, Check } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getDefaultPlan } from '@/utils/planMigration';
import { removeMask, formatCPF, formatWhatsApp } from '@/utils/formatters/maskUtils';
import { checkCpfExists } from '@/utils/validators/cpfValidation';
import { supabase } from '@/lib/customSupabaseClient';
import { createDefaultUserData } from '@/utils/createDefaultUserData';
import Logo from '@/components/Logo';

const benefits = [
  'Registre gastos pelo WhatsApp',
  'Dashboards completos',
  'Alertas automáticos',
  '30 dias grátis para começar',
];

const SignUpPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', cpf: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const handleChange = (field) => (e) => {
    let value = e.target.value;
    if (field === 'cpf') value = formatCPF(value);
    if (field === 'phone') value = formatWhatsApp(value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptTerms) {
      toast({ title: 'Aceite os termos', description: 'Você precisa aceitar os Termos de Uso para continuar.', variant: 'destructive' });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast({ title: 'Senhas diferentes', description: 'As senhas não coincidem.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      if (formData.cpf) {
        const cleanCPF = removeMask(formData.cpf);
        const cpfExists = await checkCpfExists(cleanCPF);
        if (cpfExists) {
          toast({ title: 'CPF já cadastrado', description: 'Este CPF já possui uma conta.', variant: 'destructive' });
          return;
        }
      }
      const defaultPlan = await getDefaultPlan();
      const cleanCPF = formData.cpf ? removeMask(formData.cpf) : '';
      const cleanPhone = formData.phone ? removeMask(formData.phone) : '';

      const { data, error: authError } = await signUp(formData.email, formData.password, {
        data: {
          name: formData.name,
          cpf: cleanCPF,
          phone: cleanPhone,
          telefone: cleanPhone,
          initial_plan_id: defaultPlan?.id,
          account_type: 'pessoal',
        },
      });
      if (authError) {
        if (authError.code === 'user_already_exists' || authError.message?.includes('User already registered')) {
          toast({ title: 'E-mail já cadastrado', description: 'Este e-mail já possui uma conta. Tente fazer login.', variant: 'destructive' });
        } else {
          toast({ title: 'Erro no cadastro', description: authError.message || 'Ocorreu um erro.', variant: 'destructive' });
        }
        return;
      }

      if (data?.user) {
        try {
          const trialEndDate = new Date();
          trialEndDate.setDate(trialEndDate.getDate() + 30);
          const trialEndDateISO = trialEndDate.toISOString();

          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              name: formData.name,
              cpf: cleanCPF,
              phone: cleanPhone,
              account_type: 'pessoal',
              plan_status: 'trial',
              trial_end_date: trialEndDateISO,
              plan_expires_at: trialEndDateISO
            }, { onConflict: 'id' });

          if (profileError) console.error("Profile creation error:", profileError);

          await createDefaultUserData(data.user.id, supabase, defaultPlan?.plan_type || 'PESSOAL', {
            name: formData.name,
            phone: cleanPhone,
            cpf: cleanCPF
          });

          supabase.functions.invoke('create-asaas-customer', {
            body: {
              name: formData.name, email: formData.email, user_id: data.user.id,
              cpfCnpj: cleanCPF, mobilePhone: cleanPhone, phone: cleanPhone
            }
          }).catch(err => console.error("Asaas creation edge function error:", err));

          supabase.functions.invoke('dispatch-user-webhook', {
            body: {
              userId: data.user.id, email: formData.email, name: formData.name,
              phone: cleanPhone, whatsapp: cleanPhone, cpf: cleanCPF,
              plan: 'pessoal', trial_ends: trialEndDateISO
            }
          }).catch(err => console.error("Webhook dispatch edge function error:", err));
        } catch (postSignupErr) {
          console.error("Error during post-signup operations:", postSignupErr);
        }
      }

      toast({ title: 'Conta criada!', description: 'Verifique seu e-mail para confirmar o cadastro.', duration: 5000 });
      navigate('/');
    } catch (err) {
      toast({ title: 'Erro inesperado', description: err.message || 'Tente novamente.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Criar Conta | Meu Pila</title>
        <meta name="description" content="Crie sua conta gratuita no Meu Pila." />
      </Helmet>

      <div className="min-h-screen bg-[#030303] relative overflow-hidden flex items-center justify-center p-6">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-transparent to-blue-950/20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] opacity-30" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] opacity-20" />

        <div className="relative w-full max-w-5xl grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

          {/* Left – Benefits (desktop only) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block"
          >
            <Link to="/" className="inline-flex items-center gap-3 mb-8">
              <Logo theme="dark" size="lg" />
            </Link>

            <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
              Comece a controlar suas finanças de forma{' '}
              <span className="text-emerald-400">inteligente</span>
            </h1>
            <p className="text-lg text-white/50 mb-8">
              Crie sua conta gratuita e tenha acesso a todas as funcionalidades do Meu Pila.
            </p>

            <ul className="space-y-4 mb-12">
              {benefits.map((benefit, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-white/70">{benefit}</span>
                </motion.li>
              ))}
            </ul>

            <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10">
              <p className="text-white/50 italic">
                "O Meu Pila mudou minha forma de lidar com dinheiro. Agora sei exatamente para onde vai cada centavo, é muito fácil"
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-emerald-400 font-semibold">V</span>
                </div>
                <div>
                  <p className="font-medium text-white">Valdina Petri</p>
                  <p className="text-sm text-white/40">Usuária ativa desde Março de 2026</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right – Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Mobile logo */}
            <div className="lg:hidden flex justify-center mb-8">
              <Link to="/">
                <Logo theme="dark" size="md" />
              </Link>
            </div>

            <Card className="border-white/10 bg-white/[0.06] backdrop-blur-sm shadow-2xl shadow-black/50">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold text-white">Criar conta</CardTitle>
                <CardDescription className="text-white/50">Preencha os dados abaixo para começar</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white/80">Nome completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                      <Input id="name" type="text" placeholder="Seu nome" value={formData.name} onChange={handleChange('name')}
                        className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500" required />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/80">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                      <Input id="email" type="email" placeholder="seu@email.com" value={formData.email} onChange={handleChange('email')}
                        className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500" required />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-white/80">WhatsApp <span className="text-white/30 text-xs">(opcional)</span></Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                      <Input id="phone" type="tel" placeholder="(00) 00000-0000" value={formData.phone} onChange={handleChange('phone')}
                        className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500" />
                    </div>
                  </div>

                  {/* CPF */}
                  <div className="space-y-2">
                    <Label htmlFor="cpf" className="text-white/80">CPF</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                      <Input id="cpf" type="text" placeholder="000.000.000-00" value={formData.cpf} onChange={handleChange('cpf')}
                        className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500" required />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white/80">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                      <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Mínimo 8 caracteres"
                        value={formData.password} onChange={handleChange('password')}
                        className="pl-10 pr-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500"
                        required minLength={8} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white/80">Confirmar senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                      <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="Repita sua senha"
                        value={formData.confirmPassword} onChange={handleChange('confirmPassword')}
                        className="pl-10 pr-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500" required />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-3 pt-2">
                    <button type="button" onClick={() => setAcceptTerms(!acceptTerms)}
                      className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors mt-0.5 ${acceptTerms ? 'bg-emerald-500 border-emerald-500' : 'border-white/20 hover:border-emerald-500/50'
                        }`}>
                      {acceptTerms && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <p className="text-sm text-white/40">
                      Concordo com os{' '}
                      <span className="text-emerald-400 hover:underline cursor-pointer">Termos de Uso</span>{' '}
                      e{' '}
                      <span className="text-emerald-400 hover:underline cursor-pointer">Política de Privacidade</span>
                    </p>
                  </div>

                  {/* Submit */}
                  <Button type="submit" disabled={isLoading || !acceptTerms}
                    className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold gap-2 mt-2 shadow-lg shadow-emerald-600/25 disabled:opacity-50">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ArrowRight className="w-4 h-4" />Criar minha conta</>}
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-white/40">
                  Já tem uma conta?{' '}
                  <Link to="/login" className="text-emerald-400 font-medium hover:text-emerald-300 transition-colors">
                    Fazer login
                  </Link>
                </p>
              </CardContent>
            </Card>

            <div className="mt-6 text-center">
              <Link to="/" className="text-sm text-white/30 hover:text-white/60 transition-colors">
                ← Voltar para a página inicial
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default SignUpPage;
