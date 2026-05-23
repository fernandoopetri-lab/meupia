
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, MessageCircle, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { getDefaultPlan } from '@/utils/planMigration';
import { supabase } from '@/lib/customSupabaseClient';
import { formatCPF, formatWhatsApp, removeMask, validateCPF, validateWhatsApp } from '@/utils/maskUtils';
import { checkCpfExists } from '@/utils/cpfValidation';
import { createDefaultUserData } from '@/utils/createDefaultUserData';
import Logo from '@/components/Logo';

const AuthScreen = ({ onAuthSuccess }) => {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
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
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'name':
        if (value.length < 3 || value.length > 100) error = 'Nome deve ter entre 3 e 100 caracteres';
        break;
      case 'phone':
        if (!validateWhatsApp(value)) error = 'WhatsApp inválido (DDD 11-99)';
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

    if (name === 'cpf') formattedValue = formatCPF(value);
    else if (name === 'phone') formattedValue = formatWhatsApp(value);

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setLoading(false);
      toast({ title: "Tempo excedido", description: "A operação demorou muito para responder.", variant: "destructive" });
    }, 30000);

    setLoading(true);
    setErrors({});

    try {
      if (!formData.email || !formData.password) throw new Error("Por favor, preencha todos os campos obrigatórios.");

      if (isLogin) {
        const { data, error } = await signIn(formData.email, formData.password);
        if (error) throw error;
        toast({ title: "Sucesso!", description: "Bem-vindo de volta!" });
        if (typeof onAuthSuccess === 'function') {
          onAuthSuccess();
        }
        navigate('/', { replace: true });
      } else {
        const newErrors = {};
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "As senhas não coincidem";
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

        const cpfExists = await checkCpfExists(cleanCPF);
        if (cpfExists) throw new Error("Este CPF já está cadastrado no sistema.");
        
        const { data, error } = await signUp(formData.email, formData.password, {
          data: { name: formData.name, cpf: cleanCPF, phone: cleanPhone, initial_plan_id: defaultPlan?.id }
        });

        if (error) {
          if (error.code === 'user_already_exists') {
            toast({
              title: "E-mail já cadastrado",
              description: "Este endereço de e-mail já possui uma conta. Tente fazer login.",
              variant: "destructive",
              action: (<button onClick={() => setIsLogin(true)} className="bg-white text-red-600 px-3 py-2 rounded-md text-sm font-medium">Ir para Login</button>)
            });
            return;
          }
          throw error;
        } 
        
        if (data?.user) {
            await supabase.from('profiles').upsert({ id: data.user.id, name: formData.name, cpf: cleanCPF, phone: cleanPhone, account_type: null }, { onConflict: 'id' });
            await createDefaultUserData(data.user.id, supabase, planType, { name: formData.name, phone: cleanPhone, cpf: cleanCPF });
            toast({ title: "Sucesso!", description: "Conta criada! Por favor, verifique seu e-mail para confirmar." });
        }
      }
    } catch (err) {
      toast({ title: "Erro", description: err.message || "Ocorreu um erro inesperado.", variant: "destructive" });
    } finally {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 my-8">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <Logo />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">{isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta grátis'}</h1>
        <p className="text-slate-500 mt-1">{isLogin ? 'Acesse para continuar.' : 'Comece seu teste de 30 dias.'}</p>
      </div>

      <div className="flex mb-6 bg-slate-100 p-1 rounded-lg">
        <button onClick={() => { setIsLogin(true); setErrors({}); }} className={`flex-1 py-2 px-4 rounded-md font-medium text-sm ${isLogin ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`} disabled={loading}>Entrar</button>
        <button onClick={() => { setIsLogin(false); setErrors({}); }} className={`flex-1 py-2 px-4 rounded-md font-medium text-sm ${!isLogin ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`} disabled={loading}>Cadastrar</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="text" name="name" placeholder="Nome Completo" value={formData.name} onChange={handleInputChange} className={`input-field-landing pl-12 ${errors.name ? 'border-red-500' : ''}`} required disabled={loading} />
              {errors.name && <p className="text-xs text-red-500 ml-1">{errors.name}</p>}
            </div>
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="text" name="cpf" placeholder="CPF" value={formData.cpf} onChange={handleInputChange} maxLength={14} className={`input-field-landing pl-12 ${errors.cpf ? 'border-red-500' : ''}`} required disabled={loading} />
              {errors.cpf && <p className="text-xs text-red-500 ml-1">{errors.cpf}</p>}
            </div>
            <div className="relative">
              <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="WhatsApp" maxLength={15} className={`input-field-landing pl-12 ${errors.phone ? 'border-red-500' : ''}`} required disabled={loading} />
              {errors.phone && <p className="text-xs text-red-500 ml-1">{errors.phone}</p>}
            </div>
          </>
        )}

        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input type="email" name="email" placeholder="E-mail" value={formData.email} onChange={handleInputChange} className="input-field-landing pl-12" required disabled={loading} />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input type={showPassword ? "text" : "password"} name="password" placeholder="Senha" value={formData.password} onChange={handleInputChange} className="input-field-landing pl-12" required disabled={loading} />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" disabled={loading}>
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {!isLogin && (
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="password" name="confirmPassword" placeholder="Confirmar Senha" value={formData.confirmPassword} onChange={handleInputChange} className={`input-field-landing pl-12 ${errors.confirmPassword ? 'border-red-500' : ''}`} required disabled={loading} />
            {errors.confirmPassword && <p className="text-xs text-red-500 ml-1">{errors.confirmPassword}</p>}
          </div>
        )}

        <button type="submit" className="w-full btn-primary-landing py-3 mt-4 flex items-center justify-center gap-2" disabled={loading}>
          {loading ? <span>Processando...</span> : (isLogin ? 'Entrar' : 'Criar Conta')}
        </button>
      </form>
    </motion.div>
  );
};

export default AuthScreen;
