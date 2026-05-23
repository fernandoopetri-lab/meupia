import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, MessageCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/Logo';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!email || !password) throw new Error('Por favor, preencha todos os campos.');
      const { error } = await signIn(email, password);
      if (error) throw error;
      toast({ title: 'Login realizado!', description: 'Bem-vindo de volta ao Meu Pila.', duration: 3000 });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Erro ao entrar',
        description: error.message?.includes('campos') ? error.message : 'E-mail ou senha inválidos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Entrar | Meu Pila</title>
        <meta name="description" content="Acesse sua conta no Meu Pila." />
      </Helmet>

      <div className="min-h-screen bg-[#030303] relative overflow-hidden flex items-center justify-center p-6">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-transparent to-blue-950/20 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] opacity-40" />

        <div className="relative w-full max-w-md">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <Link to="/" className="inline-block">
              <Logo theme="dark" size="lg" />
            </Link>
          </motion.div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border-white/10 bg-white/[0.06] backdrop-blur-sm shadow-2xl shadow-black/50">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold text-white">Bem-vindo de volta</CardTitle>
                <CardDescription className="text-white/50">
                  Entre na sua conta para acessar o portal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/80">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-white/80">Senha</Label>
                      <Link to="/forgot-password" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                        Esqueceu a senha?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold gap-2 shadow-lg shadow-emerald-600/25"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>Entrar <ArrowRight className="w-4 h-4" /></>
                    )}
                  </Button>
                </form>

                {/* Sign up link */}
                <p className="mt-6 text-center text-sm text-white/40">
                  Ainda não tem uma conta?{' '}
                  <Link to="/create" className="text-emerald-400 font-medium hover:text-emerald-300 transition-colors">
                    Criar conta
                  </Link>
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Back to home */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center"
          >
            <Link to="/" className="text-sm text-white/30 hover:text-white/60 transition-colors">
              ← Voltar para a página inicial
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
