import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import LoginForm from '@/components/LoginForm';
import LoginImage from '@/components/LoginImage';
import Logo from '@/components/Logo';

const LoginPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  return (
    <>
      <Helmet>
        <title>Entrar | Meu Pila</title>
        <meta name="description" content="Acesse sua conta no Meu Pila e gerencie suas finanças com facilidade." />
      </Helmet>

      <div className="min-h-screen w-full flex flex-col md:flex-row bg-white">
        {/* Left Side - Login Form (Green Background) */}
        <div className="w-full md:w-1/2 bg-emerald-900 min-h-screen flex flex-col p-6 md:p-12 relative overflow-y-auto">
          {/* Logo */}
          <div 
            className="mb-8 md:mb-12 cursor-pointer inline-block"
            onClick={() => navigate('/')}
          >
            <Logo theme="dark" size="lg" />
          </div>

          {/* Form Container */}
          <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <LoginForm />
            </motion.div>
          </div>
          
          {/* Mobile Spacer */}
          <div className="h-8 md:hidden"></div>
        </div>

        {/* Right Side - Image & Promo (Desktop Only) */}
        <div className="w-full md:w-1/2 bg-slate-100 md:h-screen md:sticky md:top-0 hidden md:block">
          <LoginImage />
        </div>
      </div>
    </>
  );
};

export default LoginPage;