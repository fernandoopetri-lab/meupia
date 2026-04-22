import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, MessageCircle, FileText, Lock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatCPF, formatWhatsApp, validateCPF, validateWhatsApp } from '@/utils/maskUtils';
import { motion } from 'framer-motion';

const SignUpForm = ({ onSubmit, isLoading }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '', // Changed from whatsapp
    cpf: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value, allData = formData) => {
    let error = '';
    
    switch (name) {
      case 'name':
        if (value.trim().length < 3) error = 'Mínimo 3 caracteres';
        else if (value.length > 100) error = 'Máximo 100 caracteres';
        break;
      
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) error = 'E-mail é obrigatório';
        else if (!emailRegex.test(value)) error = 'E-mail inválido';
        break;
      
      case 'phone': 
        if (!validateWhatsApp(value)) error = 'WhatsApp inválido (10 ou 11 dígitos)';
        break;
      
      case 'cpf':
        if (!validateCPF(value)) error = 'CPF inválido';
        break;
      
      case 'password':
        if (value.length < 6) error = 'Mínimo 6 caracteres';
        break;
      
      case 'confirmPassword':
        if (value !== allData.password) error = 'As senhas não coincidem';
        break;
        
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (name === 'phone') {
      formattedValue = formatWhatsApp(value);
    }

    const newData = { ...formData, [name]: formattedValue };
    setFormData(newData);

    // Real-time validation if touched
    if (touched[name]) {
      const error = validateField(name, formattedValue, newData);
      setErrors(prev => ({ ...prev, [name]: error }));

      // Special check for confirm password dependency
      if (name === 'password' && touched.confirmPassword) {
        const confirmError = validateField('confirmPassword', newData.confirmPassword, newData);
        setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("[SignUpForm] Form submit triggered with data:", formData);
    
    // Validate all fields
    const newErrors = {};
    const allTouched = {};
    let isValid = true;

    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
        console.log(`[SignUpForm] Validation failed for ${key}: ${error}`);
      }
      allTouched[key] = true;
    });

    setErrors(newErrors);
    setTouched(allTouched);

    if (isValid) {
      console.log("[SignUpForm] Form is valid, passing to parent onSubmit handler");
      onSubmit(formData);
    } else {
      console.warn("[SignUpForm] Form has validation errors, aborted submission");
    }
  };

  const getFieldStatus = (name) => {
    if (!touched[name]) return 'neutral';
    return errors[name] ? 'error' : 'success';
  };

  return (
    <form onSubmit={handleSubmit} className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-3">
      {/* Name Field */}
      <div className="space-y-0.5 md:col-span-2">
        <label className="text-xs font-medium text-slate-700 ml-1">Nome Completo</label>
        <div className="relative group">
          <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${getFieldStatus('name') === 'error' ? 'text-red-400' : 'text-slate-400 group-focus-within:text-emerald-500'}`} />
          <input
            type="text"
            name="name"
            placeholder="Seu nome completo"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full pl-10 pr-10 py-2.5 text-sm border rounded-lg bg-slate-50 focus:bg-white transition-all outline-none focus:ring-2 ${
              getFieldStatus('name') === 'error' 
                ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                : getFieldStatus('name') === 'success'
                ? 'border-emerald-200 focus:ring-emerald-200 focus:border-emerald-500'
                : 'border-slate-200 focus:ring-emerald-200 focus:border-emerald-500'
            }`}
            required
          />
          {getFieldStatus('name') === 'success' && (
            <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-500" />
          )}
          {getFieldStatus('name') === 'error' && (
            <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
          )}
        </div>
        {errors.name && <p className="text-[10px] text-red-500 ml-1 mt-1">{errors.name}</p>}
      </div>

      {/* Email Field */}
      <div className="space-y-0.5">
        <label className="text-xs font-medium text-slate-700 ml-1">E-mail</label>
        <div className="relative group">
          <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${getFieldStatus('email') === 'error' ? 'text-red-400' : 'text-slate-400 group-focus-within:text-emerald-500'}`} />
          <input
            type="email"
            name="email"
            placeholder="seu@email.com"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full pl-10 pr-10 py-2.5 text-sm border rounded-lg bg-slate-50 focus:bg-white transition-all outline-none focus:ring-2 ${
              getFieldStatus('email') === 'error' 
                ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                : getFieldStatus('email') === 'success'
                ? 'border-emerald-200 focus:ring-emerald-200 focus:border-emerald-500'
                : 'border-slate-200 focus:ring-emerald-200 focus:border-emerald-500'
            }`}
            required
          />
          {getFieldStatus('email') === 'success' && (
            <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-500" />
          )}
          {getFieldStatus('email') === 'error' && (
            <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
          )}
        </div>
        {errors.email && <p className="text-[10px] text-red-500 ml-1 mt-1">{errors.email}</p>}
      </div>

      {/* Phone Field */}
      <div className="space-y-0.5">
        <label className="text-xs font-medium text-slate-700 ml-1">WhatsApp</label>
        <div className="relative group">
          <MessageCircle className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${getFieldStatus('phone') === 'error' ? 'text-red-400' : 'text-slate-400 group-focus-within:text-emerald-500'}`} />
          <input
            type="tel"
            name="phone"
            placeholder="(00) 00000-0000"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            maxLength={15}
            className={`w-full pl-10 pr-10 py-2.5 text-sm border rounded-lg bg-slate-50 focus:bg-white transition-all outline-none focus:ring-2 ${
              getFieldStatus('phone') === 'error' 
                ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                : getFieldStatus('phone') === 'success'
                ? 'border-emerald-200 focus:ring-emerald-200 focus:border-emerald-500'
                : 'border-slate-200 focus:ring-emerald-200 focus:border-emerald-500'
            }`}
            required
          />
          {getFieldStatus('phone') === 'success' && (
            <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-500" />
          )}
          {getFieldStatus('phone') === 'error' && (
            <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
          )}
        </div>
        {errors.phone && <p className="text-[10px] text-red-500 ml-1 mt-1">{errors.phone}</p>}
      </div>

      {/* CPF Field */}
      <div className="space-y-0.5">
        <label className="text-xs font-medium text-slate-700 ml-1">CPF</label>
        <div className="relative group">
          <FileText className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${getFieldStatus('cpf') === 'error' ? 'text-red-400' : 'text-slate-400 group-focus-within:text-emerald-500'}`} />
          <input
            type="text"
            name="cpf"
            placeholder="000.000.000-00"
            value={formData.cpf}
            onChange={handleChange}
            onBlur={handleBlur}
            maxLength={14}
            className={`w-full pl-10 pr-10 py-2.5 text-sm border rounded-lg bg-slate-50 focus:bg-white transition-all outline-none focus:ring-2 ${
              getFieldStatus('cpf') === 'error' 
                ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                : getFieldStatus('cpf') === 'success'
                ? 'border-emerald-200 focus:ring-emerald-200 focus:border-emerald-500'
                : 'border-slate-200 focus:ring-emerald-200 focus:border-emerald-500'
            }`}
            required
          />
          {getFieldStatus('cpf') === 'success' && (
            <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-500" />
          )}
          {getFieldStatus('cpf') === 'error' && (
            <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
          )}
        </div>
        {errors.cpf && <p className="text-[10px] text-red-500 ml-1 mt-1">{errors.cpf}</p>}
      </div>

      {/* Password Field */}
      <div className="space-y-0.5">
        <label className="text-xs font-medium text-slate-700 ml-1">Senha</label>
        <div className="relative group">
          <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${getFieldStatus('password') === 'error' ? 'text-red-400' : 'text-slate-400 group-focus-within:text-emerald-500'}`} />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Mínimo 6 caracteres"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full pl-10 pr-12 py-2.5 text-sm border rounded-lg bg-slate-50 focus:bg-white transition-all outline-none focus:ring-2 ${
              getFieldStatus('password') === 'error' 
                ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                : getFieldStatus('password') === 'success'
                ? 'border-emerald-200 focus:ring-emerald-200 focus:border-emerald-500'
                : 'border-slate-200 focus:ring-emerald-200 focus:border-emerald-500'
            }`}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="text-[10px] text-red-500 ml-1 mt-1">{errors.password}</p>}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-0.5">
        <label className="text-xs font-medium text-slate-700 ml-1">Confirmar Senha</label>
        <div className="relative group">
          <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${getFieldStatus('confirmPassword') === 'error' ? 'text-red-400' : 'text-slate-400 group-focus-within:text-emerald-500'}`} />
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Repita sua senha"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full pl-10 pr-12 py-2.5 text-sm border rounded-lg bg-slate-50 focus:bg-white transition-all outline-none focus:ring-2 ${
              getFieldStatus('confirmPassword') === 'error' 
                ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                : getFieldStatus('confirmPassword') === 'success'
                ? 'border-emerald-200 focus:ring-emerald-200 focus:border-emerald-500'
                : 'border-slate-200 focus:ring-emerald-200 focus:border-emerald-500'
            }`}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-[10px] text-red-500 ml-1 mt-1">{errors.confirmPassword}</p>}
      </div>

      <div className="pt-2 md:col-span-2">
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm hover:brightness-95"
            style={{ background: 'linear-gradient(90deg, rgba(4, 124, 12, 1) 0%, rgba(56, 77, 59, 1) 100%)' }}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Criando conta...
            </>
          ) : (
            'Criar conta gratuita'
          )}
        </motion.button>
      </div>
    </form>
  );
};

export default SignUpForm;