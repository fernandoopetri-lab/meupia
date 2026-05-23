import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { getDefaultPlan } from '@/utils/planMigration';
import { removeMask } from '@/utils/maskUtils';
import { createDefaultUserData } from '@/utils/createDefaultUserData';
import { checkCpfExists } from '@/utils/cpfValidation';
import SignUpForm from '@/components/SignUpForm';
import SignUpImage from '@/components/SignUpImage';
import Logo from '@/components/Logo';

const EmbedScript = () => {
  useEffect(() => {
    if (document.querySelector('script[src*="s.imgur.com/min/embed.js"]')) return;
    const script = document.createElement('script');
    script.src = '//s.imgur.com/min/embed.js';
    script.async = true;
    script.charset = 'utf-8';
    document.body.appendChild(script);
  }, []);
  return null;
};

const SignUpPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignUp = async (formData) => {
    setIsLoading(true);
    console.log("[SignUpPage] Starting signup process with email:", formData.email);

    try {
      const cleanCPF = removeMask(formData.cpf);
      const cleanPhone = removeMask(formData.phone);
      
      console.log("[SignUpPage] Checking if CPF already exists:", cleanCPF);
      const cpfExists = await checkCpfExists(cleanCPF);
      if (cpfExists) {
        console.warn("[SignUpPage] CPF validation failed: CPF already registered");
        toast({
          title: "Erro no Cadastro",
          description: "Este CPF já está cadastrado no sistema.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      console.log("[SignUpPage] Fetching default plan...");
      const defaultPlan = await getDefaultPlan();
      const planType = defaultPlan?.plan_type || 'PESSOAL';
      console.log("[SignUpPage] Using planType:", planType);

      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 30);
      const trialEndDateISO = trialEndDate.toISOString();

      console.log("[SignUpPage] Calling supabase.auth.signUp...");
      const { data, error: authError } = await signUp(formData.email, formData.password, {
        data: {
          name: formData.name,
          cpf: cleanCPF,
          phone: cleanPhone,
          initial_plan_id: defaultPlan?.id,
          account_type: 'pessoal'
        }
      });

      if (authError) {
        console.error("[SignUpPage] Supabase auth.signUp error:", authError);
        if (authError.code === 'user_already_exists' || authError.message?.includes('User already registered')) {
          toast({
            title: "E-mail já cadastrado",
            description: "Este endereço de e-mail já possui uma conta. Tente fazer login.",
            variant: "destructive",
            action: (
              <Link 
                to="/login"
                className="bg-white text-red-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-50 transition-colors inline-block"
              >
                Ir para Login
              </Link>
            )
          });
        } else {
          toast({
            title: "Erro no cadastro",
            description: authError.message || "Ocorreu um erro ao criar sua conta.",
            variant: "destructive"
          });
        }
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        console.log("[SignUpPage] User registered in auth system. ID:", data.user.id);
        
        try {
            console.log("[SignUpPage] Upserting user profile record...");
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
              
            if (profileError) {
              console.error("[SignUpPage] Error creating profile:", profileError);
            } else {
              console.log("[SignUpPage] Profile successfully created.");
            }

            console.log("[SignUpPage] Calling createDefaultUserData...");
            await createDefaultUserData(data.user.id, supabase, planType, {
               name: formData.name,
               phone: cleanPhone,
               cpf: cleanCPF
            });
            console.log("[SignUpPage] Default user data initialized.");

            console.log("[SignUpPage] Invoking create-asaas-customer edge function...");
            supabase.functions.invoke('create-asaas-customer', {
              body: {
                name: formData.name, email: formData.email, user_id: data.user.id,
                cpfCnpj: cleanCPF, mobilePhone: cleanPhone, phone: cleanPhone
              }
            }).catch(err => console.error("[SignUpPage] Asaas creation edge function error:", err));

            console.log("[SignUpPage] Invoking dispatch-user-webhook edge function...");
            supabase.functions.invoke('dispatch-user-webhook', {
              body: {
                userId: data.user.id, email: formData.email, name: formData.name,
                phone: cleanPhone, whatsapp: cleanPhone, cpf: cleanCPF,
                plan: defaultPlan?.name || 'Trial', trial_ends: trialEndDateISO
              }
            }).catch(err => console.error("[SignUpPage] Webhook dispatch edge function error:", err));
            
        } catch (postSignupErr) {
            console.error("[SignUpPage] Error during post-signup operations:", postSignupErr);
        }
      }

      console.log("[SignUpPage] Registration complete, redirecting to Dashboard...");
      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo ao Meu Pila! Verifique seu e-mail para confirmar.",
        duration: 5000,
      });

      navigate('/');
    } catch (error) {
      console.error("[SignUpPage] Unhandled Registration error:", error);
      let errorMessage = "Ocorreu um erro ao criar sua conta. Tente novamente.";
      if (error.message?.includes('User already registered') || error.message?.includes('unique constraint')) {
        errorMessage = "Este e-mail ou CPF já está cadastrado.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast({
        title: "Erro no cadastro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Criar Conta Grátis | Meu Pila</title>
        <meta name="description" content="Experimente o Meu Pila gratuitamente por 30 dias. Gestão financeira inteligente para o campo e a cidade." />
      </Helmet>

      {/* Layout em tela cheia - compacto para caber em uma tela */}
      <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden">
        {/* Coluna esquerda (~40%) - Verde + gradiente + textura + card do formulário */}
        <div
          className="w-full md:w-[42%] h-full min-h-0 relative flex flex-col p-4 md:p-5 lg:p-6 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(2, 44, 34, 1) 0%, rgba(5, 82, 20, 1) 24%, rgba(52, 97, 15, 1) 50%, rgba(72, 124, 9, 1) 75%, rgba(143, 190, 14, 1) 100%)',
          }}
        >
          {/* Textura sutil sobre o gradiente */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.08]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />
          {/* Brilho sutil no canto */}
          <div
            className="absolute top-0 right-0 w-1/2 h-1/2 pointer-events-none opacity-30"
            style={{
              background: 'radial-gradient(ellipse at top right, rgba(255,255,255,0.12) 0%, transparent 70%)',
            }}
          />

          <div className="relative z-10 flex flex-col h-full min-h-0">
            <h1 className="text-xl md:text-2xl font-bold text-white leading-tight mb-0.5 align-middle shrink-0 text-center">
              Crie sua conta gratuita
            </h1>
            <p className="text-emerald-100 text-xs md:text-sm mb-2 shrink-0 text-center">
              Experimente o Meu Pila por 30 dias grátis, sem compromisso.
            </p>

            <div
              className="flex items-center justify-center mb-3 cursor-pointer shrink-0"
              onClick={() => navigate('/')}
            >
              <Logo theme="dark" size="lg" />
            </div>

            <div className="flex-1 flex flex-col justify-center min-h-0 max-w-md w-full mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-xl shadow-xl p-4 md:p-5 border border-slate-100"
              >
                <h2 className="text-base font-bold text-slate-800 mb-3 text-left">
                  Criar conta gratuita
                </h2>

                <SignUpForm onSubmit={handleSignUp} isLoading={isLoading} />

                <p className="text-xs text-slate-500 mt-2 text-center">
                  Ao criar sua conta, você concorda com os nossos{' '}
                  <a
                    href="#"
                    className="text-emerald-600 hover:text-emerald-700 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Termos de Uso
                  </a>
                  {' '}e{' '}
                  <a
                    href="#"
                    className="text-emerald-600 hover:text-emerald-700 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Política de Privacidade
                  </a>
                  .
                </p>

                <p className="text-center mt-2 text-xs text-slate-600">
                  Já tem uma conta?{' '}
                  <Link to="/login" className="text-emerald-600 font-semibold hover:underline">
                    Entrar
                  </Link>
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Coluna direita (~60%) - Imagem e card de benefícios */}
        <div className="hidden md:block flex-1 min-h-0 overflow-hidden">
          <SignUpImage />
        </div>
      </div>

      <EmbedScript />
    </>
  );
};

export default SignUpPage;