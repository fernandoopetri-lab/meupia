import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, checkAccessStatus } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("[LoginForm] Attempting to sign in user:", email);

    try {
      if (!email || !password) {
        throw new Error('Por favor, preencha todos os campos.');
      }

      const { data, error } = await signIn(email, password);

      if (error) {
        console.error("[LoginForm] Sign in error:", error);
        throw error;
      }

      console.log("[LoginForm] Sign in successful:", data?.user?.id);

      if (data?.user?.id) {
        // Optional: Check access status if needed by the app logic
        checkAccessStatus(data.user.id);
      }

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta ao Meu Pila.",
        duration: 3000,
      });

      // Navigation is handled by App.jsx routing based on auth state, 
      // but explicit navigation provides better UX feedback
      navigate('/');

    } catch (error) {
      console.error("[LoginForm] Caught error in submit handler:", error);
      let errorMessage = "E-mail ou senha inválidos.";
      
      if (error.message?.includes('campos')) {
        errorMessage = error.message;
      }

      toast({
        title: "Erro ao entrar",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Bem-vindo de volta</h2>
        <p className="text-gray-500 mt-2">Insira suas credenciais para acessar sua conta</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 ml-1">E-mail</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 transition-all outline-none"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center ml-1">
            <label className="text-sm font-medium text-gray-700">Senha</label>
            <a href="#" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium hover:underline">
              Esqueci minha senha
            </a>
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 transition-all outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Entrando...
            </>
          ) : (
            <>
              Entrar
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>

        {/* Create Account Link */}
        <div className="text-center pt-2">
          <p className="text-sm text-gray-600">
            Ainda não tem conta?{' '}
            <button
              type="button"
              onClick={() => navigate('/create')}
              className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline"
            >
              Criar conta gratuita
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;