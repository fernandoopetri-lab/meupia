import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, MessageCircle, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { getDefaultPlan } from '@/utils/planMigration';
import { supabase } from '@/lib/customSupabaseClient';
import { formatCPF, formatWhatsApp, removeMask, validateCPF, validateWhatsApp } from '@/utils/maskUtils';
import { createDefaultUserData } from '@/utils/createDefaultUserData';
import { checkCpfExists } from '@/utils/cpfValidation';
import Logo from '@/components/Logo';

const AuthScreen = ({ onAuthSuccess }) => {
  const { signIn, signUp, checkAccessStatus } = useAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '', 
    cpf: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'name':
        if (value.length < 3 || value.length > 100) error = 'Nome deve ter entre 3 e 100 caracteres';
        break;
      case 'phone':
        if (!validateWhatsApp(value)) error = 'WhatsApp inválido (10 ou 11 dígitos)';
        break;
      case 'cpf':
        if (!validateCPF(value)) error = 'CPF inválido';
        break;
      default:
        break;
    }
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (name === 'phone') {
      formattedValue = formatWhatsApp(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear any existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set safety timeout for 30s
    timeoutRef.current = setTimeout(() => {
      setLoading(prev => {
        if (prev) {
          console.error("[AuthScreen] OPERATION TIMED OUT AFTER 30 SECONDS");
          toast({
            title: "Tempo excedido",
            description: "A operação demorou muito para responder. Por favor, verifique sua conexão e tente novamente.",
            variant: "destructive"
          });
        }
        return false; // Force loading false
      });
    }, 30000);

    setLoading(true);
    setErrors({});

    try {
      console.log(`[AuthScreen] Form submit triggered. Mode: ${isLogin ? 'Login' : 'Signup'}, Email: ${formData.email}`);

      if (!formData.email || !formData.password) {
        throw new Error("Por favor, preencha todos os campos obrigatórios.");
      }

      if (isLogin) {
        // --- LOGIN FLOW ---
        console.log("[AuthScreen] (1) Before calling signIn...");
        const { data, error } = await signIn(formData.email, formData.password);
        console.log("[AuthScreen] (2) After signIn returned. Error:", error?.message || 'None');

        if (error) {
          throw error;
        } 
        
        console.log("[AuthScreen] SignIn successful:", data?.user?.id);
        toast({ title: "Sucesso!", description: "Bem-vindo de volta!" });
        if (data?.user?.id) {
            checkAccessStatus(data.user.id);
        }
        if (typeof onAuthSuccess === 'function') {
          onAuthSuccess();
        }

      } else {
        // --- SIGNUP FLOW ---
        const newErrors = {};
        
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = "As senhas não coincidem";
        }

        newErrors.name = validateField('name', formData.name);
        newErrors.phone = validateField('phone', formData.phone);
        newErrors.cpf = validateField('cpf', formData.cpf);

        Object.keys(newErrors).forEach(key => !newErrors[key] && delete newErrors[key]);

        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          throw new Error("Erro de Validação: Por favor, corrija os erros no formulário.");
        }
        
        const defaultPlan = await getDefaultPlan();
        const planType = defaultPlan?.plan_type || 'PESSOAL'; 
        const cleanPhone = removeMask(formData.phone);
        const cleanCPF = removeMask(formData.cpf);

        console.log("[AuthScreen] Checking CPF existence for:", cleanCPF);
        const cpfExists = await checkCpfExists(cleanCPF);
        if (cpfExists) {
          throw new Error("Este CPF já está cadastrado no sistema.");
        }
        
        console.log("[AuthScreen] (1) Before calling signUp auth function with email:", formData.email);
        const { data, error } = await signUp(formData.email, formData.password, {
          data: {
            name: formData.name,
            cpf: cleanCPF,
            phone: cleanPhone,
            initial_plan_id: defaultPlan?.id
          }
        });

        console.log("[AuthScreen] (2) Immediately after signUp returns. User ID:", data?.user?.id, "Error:", error?.message || "None");

        if (error) {
          if (error.code === 'user_already_exists' || error.message?.includes('User already registered')) {
            toast({
              title: "E-mail já cadastrado",
              description: "Este endereço de e-mail já possui uma conta. Tente fazer login.",
              variant: "destructive",
              action: (
                <button 
                  onClick={() => setIsLogin(true)}
                  className="bg-white text-red-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-50 transition-colors"
                >
                  Ir para Login
                </button>
              )
            });
            return; // Exit gracefully since toast is handled custom here
          } else {
            throw error;
          }
        } 
        
        if (data?.user) {
            console.log("[AuthScreen] (3) Before calling createProfile manually for ID:", data.user.id);
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: data.user.id,
                    name: formData.name,
                    cpf: cleanCPF,
                    phone: cleanPhone, 
                    account_type: null 
                }, { onConflict: 'id' });
            
            console.log("[AuthScreen] (4) After createProfile completed. Error:", profileError?.message || "None");
            
            if (profileError) {
               console.error("[AuthScreen] Manual profile creation failed:", profileError);
               // We don't throw here to allow default data to try running, but it's a critical error
               toast({
                 title: "Aviso",
                 description: "Conta criada, mas houve um erro ao salvar o perfil. O suporte foi notificado.",
                 variant: "destructive"
               });
            }

            console.log("[AuthScreen] (5) Before calling createDefaultUserData...");
            await createDefaultUserData(data.user.id, supabase, planType, {
              name: formData.name,
              phone: cleanPhone,
              cpf: cleanCPF
            });
            console.log("[AuthScreen] (6) After createDefaultUserData completed.");

            console.log("[AuthScreen] Invoking async webhooks (non-blocking)...");
            supabase.functions.invoke('create-asaas-customer', {
                body: {
                    name: formData.name, email: formData.email, user_id: data.user.id,
                    cpfCnpj: cleanCPF, mobilePhone: cleanPhone, phone: cleanPhone
                }
            }).catch(err => console.error('[AuthScreen] Failed to invoke create-asaas-customer:', err));

            supabase.functions.invoke('dispatch-user-webhook', {
              body: {
                userId: data.user.id, email: formData.email, name: formData.name,
                phone: cleanPhone, whatsapp: cleanPhone, plan: null, cpf: cleanCPF
              }
            }).catch(err => console.error('[AuthScreen] Failed to dispatch user webhook:', err));

            toast({
              title: "Sucesso!",
              description: "Conta criada! Por favor, verifique seu e-mail para confirmar."
            });
        }
      }

    } catch (err) {
      console.error("[AuthScreen] (8) Caught error in try-catch block:", err);
      toast({
        title: "Erro",
        description: err.message || "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      console.log("[AuthScreen] (7) Entering finally block. Clearing timeout and setting isLoading(false)");
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 my-8"
    >
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <Logo />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">
          {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta grátis'}
        </h1>
        <p className="text-slate-500 mt-1">
          {isLogin ? 'Acesse para continuar.' : 'Comece seu teste de 30 dias.'}
        </p>
      </div>

      <div className="flex mb-6 bg-slate-100 p-1 rounded-lg">
        <button
          onClick={() => {
            setIsLogin(true);
            setErrors({});
          }}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-all text-sm ${isLogin ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          disabled={loading}
        >
          Entrar
        </button>
        <button
          onClick={() => {
            setIsLogin(false);
            setErrors({});
          }}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-all text-sm ${!isLogin ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          disabled={loading}
        >
          Cadastrar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <>
            <div className="space-y-1">
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  name="name"
                  placeholder="Nome Completo"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`input-field-landing pl-12 ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                  required
                  disabled={loading}
                />
              </div>
              {errors.name && <p className="text-xs text-red-500 ml-1">{errors.name}</p>}
            </div>

            <div className="space-y-1">
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  name="cpf"
                  inputMode="numeric"
                  placeholder="CPF (000.000.000-00)"
                  value={formData.cpf}
                  onChange={handleInputChange}
                  maxLength={14}
                  className={`input-field-landing pl-12 ${errors.cpf ? 'border-red-500 focus:ring-red-500' : ''}`}
                  required
                  disabled={loading}
                />
              </div>
              {errors.cpf && <p className="text-xs text-red-500 ml-1">{errors.cpf}</p>}
            </div>

            <div className="space-y-1">
              <div className="relative">
                <MessageCircle className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type="tel"
                  inputMode="numeric"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="WhatsApp (xx) xxxxx-xxxx"
                  maxLength={15}
                  className={`input-field-landing pl-12 ${errors.phone ? 'border-red-500 focus:ring-red-500' : ''}`}
                  required
                  disabled={loading}
                />
              </div>
              {errors.phone && <p className="text-xs text-red-500 ml-1">{errors.phone}</p>}
            </div>
          </>
        )}

        <div className="relative">
          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          <input
            type="email"
            name="email"
            placeholder="E-mail"
            value={formData.email}
            onChange={handleInputChange}
            className="input-field-landing pl-12"
            required
            disabled={loading}
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Senha"
            value={formData.password}
            onChange={handleInputChange}
            className="input-field-landing pl-12"
            required
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10"
            disabled={loading}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {!isLogin && (
          <div className="space-y-1">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirmar Senha"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`input-field-landing pl-12 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                required
                disabled={loading}
              />
            </div>
            {errors.confirmPassword && <p className="text-xs text-red-500 ml-1">{errors.confirmPassword}</p>}
          </div>
        )}

        <button
          type="submit"
          className="w-full btn-primary-landing py-3 mt-4 flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading ? (
             <span className="flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processando...
             </span>
          ) : (isLogin ? 'Entrar' : 'Criar Conta')}
        </button>
      </form>
    </motion.div>
  );
};

export default AuthScreen;