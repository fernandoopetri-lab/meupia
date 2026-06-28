import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  MessageCircle, 
  Check, 
  ArrowRight, 
  Wallet, 
  CreditCard, 
  FolderPlus, 
  Smartphone, 
  Sparkles, 
  Mic, 
  Camera, 
  LayoutDashboard, 
  Bell, 
  Plus, 
  Play, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Brain,
  FileText,
  Clock,
  ArrowRightLeft,
  CheckCircle2,
  Calendar,
  Lock,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import AuthScreen from '@/pages/auth/AuthScreen';
import Logo from '@/components/Logo';

// Same floating decorations from /pessoal
const floatingDecorations = [
  { icon: MessageCircle, size: 'w-7 h-7', color: 'text-emerald-500/30', left: '8%', top: '14%', duration: 7.5, delay: 0.2, rotate: -8 },
  { icon: DollarSign, size: 'w-8 h-8', color: 'text-green-500/25', left: '84%', top: '18%', duration: 8.8, delay: 0.5, rotate: 12 },
  { icon: MessageCircle, size: 'w-10 h-10', color: 'text-emerald-400/20', left: '88%', top: '44%', duration: 9.6, delay: 0.1, rotate: -14 },
  { icon: DollarSign, size: 'w-7 h-7', color: 'text-green-400/30', left: '12%', top: '54%', duration: 7.9, delay: 0.9, rotate: 6 },
  { icon: MessageCircle, size: 'w-9 h-9', color: 'text-emerald-500/25', left: '20%', top: '82%', duration: 10.2, delay: 0.4, rotate: 10 },
  { icon: DollarSign, size: 'w-9 h-9', color: 'text-green-500/20', left: '78%', top: '78%', duration: 8.3, delay: 0.7, rotate: -10 },
];

// WhatsApp conversation mockups
const initialChatMessages = [
  { sender: 'user', text: 'Gastei R$ 85 no mercado', time: '14:20' },
  { sender: 'bot', text: '✅ Despesa de R$ 85,00 registrada com sucesso!\n📂 Categoria: Alimentação\n🏦 Carteira: Padrão', time: '14:20' },
  { sender: 'user', text: 'Recebi R$ 1.500 referente a salário', time: '14:21' },
  { sender: 'bot', text: '🎉 Receita de R$ 1.500,00 adicionada!\n📂 Categoria: Salário\n🏦 Carteira: Padrão', time: '14:21' },
];

export default function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [step1Completed, setStep1Completed] = useState(false);
  
  // Interactive simulator states
  const [activeStep4Tab, setActiveStep4Tab] = useState('whatsapp');
  const [simulatedChat, setSimulatedChat] = useState(initialChatMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Sync step 1 status with user login
  useEffect(() => {
    if (user) {
      setStep1Completed(true);
    }
  }, [user]);

  const handleOpenSignup = () => {
    if (user) {
      window.open('/', '_blank');
    } else {
      setShowSignupModal(true);
    }
  };

  const handleSignupSuccess = () => {
    setStep1Completed(true);
    setShowSignupModal(false);
    // Open painel in a new tab
    window.open('/', '_blank');
  };

  // WhatsApp interaction simulation
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = {
      sender: 'user',
      text: inputText,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setSimulatedChat(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      let botResponse = 'Entendi! Estou processando sua solicitação.';
      const textLower = userMsg.text.toLowerCase();

      if (textLower.includes('mercado') || textLower.includes('gastei') || textLower.includes('compra')) {
        botResponse = '✅ Despesa registrada!\n📂 Categoria: Alimentação\n🏦 Carteira: Padrão';
      } else if (textLower.includes('salario') || textLower.includes('recebi') || textLower.includes('salário')) {
        botResponse = '🎉 Receita registrada!\n📂 Categoria: Salário\n🏦 Carteira: Padrão';
      } else if (textLower.includes('quanto gastei')) {
        botResponse = '📊 Este mês você gastou R$ 85,00 em Alimentação.\nPrecisa de mais algum detalhe?';
      }

      const botMsg = {
        sender: 'bot',
        text: botResponse,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };

      setSimulatedChat(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden text-slate-800 font-sans pb-20">
      <Helmet>
        <title>Primeiros Passos | Meu Pila Onboarding</title>
        <meta name="description" content="Aprenda a utilizar o Meu Pila pelo WhatsApp e pelo painel em poucos minutos." />
      </Helmet>

      {/* Floating Background Glows and Decorations (Matching /pessoal exactly) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(34,197,94,0.14),transparent_30%),radial-gradient(circle_at_86%_14%,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_70%_68%,rgba(59,130,246,0.08),transparent_35%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.88),rgba(248,250,252,0.9),rgba(255,255,255,0.92))] dark:bg-[linear-gradient(to_bottom,rgba(2,6,23,0.8),rgba(2,6,23,0.86),rgba(2,6,23,0.82))]" />
        
        {floatingDecorations.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={`${item.left}-${item.top}-${index}`}
              className="absolute"
              style={{ left: item.left, top: item.top }}
              initial={{ y: 0, rotate: item.rotate, opacity: 0.45 }}
              animate={{ y: [-10, 12, -8], rotate: [item.rotate, item.rotate + 6, item.rotate - 4], opacity: [0.35, 0.6, 0.35] }}
              transition={{ duration: item.duration, repeat: Infinity, ease: 'easeInOut', delay: item.delay }}
            >
              <div className="rounded-2xl p-3 backdrop-blur-[1.5px] bg-white/20 dark:bg-white/5 shadow-lg shadow-emerald-500/10">
                <Icon className={`${item.size} ${item.color}`} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Glassmorphic Floating Onboarding Header (Matching /pessoal) */}
      <header className="sticky top-0 z-40 mx-auto max-w-7xl px-4 sm:px-6 pt-4">
        <div className="flex items-center justify-between rounded-3xl border border-border/60 bg-card/75 px-4 py-3 shadow-[0_18px_50px_-22px_rgba(15,23,42,0.15)] backdrop-blur-2xl sm:px-6">
          <Link to="/pessoal" className="flex items-center gap-3">
            <Logo size="md" />
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <Button 
                onClick={() => navigate('/')} 
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-5 rounded-full shadow-lg shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 font-bold flex items-center gap-2"
              >
                Ir para o Painel <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider hidden sm:inline">Já se cadastrou?</span>
                <Button 
                  variant="outline" 
                  onClick={() => setShowLoginModal(true)} 
                  className="h-10 rounded-full border-border/60 hover:bg-slate-100/80 font-bold px-5"
                >
                  Entrar
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-10">
        
        {/* HERO SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 leading-[1.1]">
              🚀 Bem-vindo ao <span className="text-primary">Meu Pila</span>!
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
              Você está a poucos minutos de ter um controle financeiro muito mais simples, inteligente e organizado.
            </p>
          </motion.div>
        </div>

        {/* PROGRESS CHECKLIST (Glassmorphic) */}
        <section className="max-w-4xl mx-auto mb-20 bg-white/60 border border-slate-200/60 p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] backdrop-blur-md rounded-[32px]">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">Progresso da Configuração</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Step 1 indicator */}
            <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/50 border border-slate-100 relative overflow-hidden shadow-sm">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 font-bold text-sm ${step1Completed ? 'bg-primary text-white shadow-md shadow-primary/25' : 'bg-slate-200 text-slate-500'}`}>
                {step1Completed ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <span className="text-xs font-black text-slate-700">Criar Conta</span>
              <span className="text-[10px] text-slate-400 mt-0.5">{step1Completed ? 'Concluído' : 'Pendente'}</span>
              <div className="absolute top-0 right-0 w-8 h-8 bg-primary/5 rounded-bl-full pointer-events-none" />
            </div>

            {/* Step 2 indicator */}
            <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/50 border border-slate-100 relative overflow-hidden shadow-sm">
              <div className="w-8 h-8 rounded-full flex items-center justify-center mb-2 font-bold text-sm bg-slate-200 text-slate-500">2</div>
              <span className="text-xs font-black text-slate-700">WhatsApp</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Leitura de QR</span>
            </div>

            {/* Step 3 indicator */}
            <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/50 border border-slate-100 relative overflow-hidden shadow-sm">
              <div className="w-8 h-8 rounded-full flex items-center justify-center mb-2 font-bold text-sm bg-slate-200 text-slate-500">3</div>
              <span className="text-xs font-black text-slate-700">Painel</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Configuração</span>
            </div>

            {/* Step 4 indicator */}
            <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/50 border border-slate-100 relative overflow-hidden shadow-sm">
              <div className="w-8 h-8 rounded-full flex items-center justify-center mb-2 font-bold text-sm bg-slate-200 text-slate-500">4</div>
              <span className="text-xs font-black text-slate-700">Primeiro Lançamento</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Ativação</span>
            </div>

            {/* Step 5 indicator */}
            <div className="col-span-2 md:col-span-1 flex flex-col items-center text-center p-3 rounded-2xl bg-white/50 border border-slate-100 relative overflow-hidden shadow-sm">
              <div className="w-8 h-8 rounded-full flex items-center justify-center mb-2 font-bold text-sm bg-slate-200 text-slate-500">5</div>
              <span className="text-xs font-black text-slate-700">Pronto!</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Acompanhamento</span>
            </div>
          </div>
        </section>

        {/* STEP-BY-STEP SECTIONS (Premium Glassmorphism) */}
        <div className="space-y-20 max-w-5xl mx-auto">
          
          {/* PASSO 1: CRIE SUA CONTA */}
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-12 gap-8 items-center bg-white/60 border border-slate-200/60 p-8 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.02)] backdrop-blur-md rounded-[32px] relative overflow-hidden"
          >
            <div className="md:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-bold text-primary">
                PASSO 1
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Crie sua conta</h2>
              <p className="text-slate-600 leading-relaxed">
                Antes de começar, crie gratuitamente sua conta no Meu Pila para sincronizar seu WhatsApp com nosso painel inteligente.
              </p>
              
              <div className="pt-4 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                <Button 
                  onClick={handleOpenSignup} 
                  className={`h-12 px-8 rounded-full text-base font-bold transition-all duration-300 ${
                    step1Completed 
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25' 
                      : 'bg-[#1A2E27] hover:bg-[#243d34] text-white shadow-lg'
                  }`}
                >
                  {step1Completed ? (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Minha conta está ativa
                    </>
                  ) : (
                    'Criar minha conta'
                  )}
                </Button>
                
                {step1Completed && (
                  <span className="text-slate-600 text-sm font-semibold flex items-center gap-1.5 justify-center">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    Primeiro passo concluído!
                  </span>
                )}
              </div>
            </div>
            
            <div className="md:col-span-5 flex justify-center">
              <div className="w-full max-w-[280px] p-6 bg-white/40 rounded-2xl border border-slate-100 flex flex-col items-center text-center shadow-inner relative">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 ${step1Completed ? 'bg-primary text-white shadow-md' : 'bg-slate-200 text-slate-400'}`}>
                  <Lock className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-700 mb-1">Acesso Seguro</h4>
                <p className="text-xs text-slate-500">Ambiente encriptado de ponta a ponta com acesso exclusivo via painel e WhatsApp oficial.</p>
                {step1Completed && (
                  <div className="absolute inset-0 bg-primary/5 backdrop-blur-[0.5px] rounded-2xl flex items-center justify-center">
                    <div className="bg-white p-3 rounded-full shadow-lg border border-primary/25">
                      <Check className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.section>

          {/* PASSO 2: ADICIONE NOSSO WHATSAPP OFICIAL */}
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-12 gap-8 items-stretch"
          >
            {/* Left Column */}
            <div className="md:col-span-7 bg-white/60 border border-slate-200/60 p-8 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.02)] backdrop-blur-md rounded-[32px] flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-xs font-bold text-emerald-600">
                  PASSO 2
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Adicione nosso WhatsApp Oficial</h2>
                
                <p className="text-slate-600 leading-relaxed">
                  Após concluir seu cadastro você receberá automaticamente uma mensagem de boas-vindas enviada pelo número oficial do Meu Pila. Toda comunicação da plataforma acontecerá através deste número.
                </p>

                <div className="bg-white/40 border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-6 shadow-inner">
                  {/* QR Code component using pure crisp SVG paths */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 flex-shrink-0">
                    <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-800">
                      <path d="M3 9V3H9" />
                      <path d="M15 3H21V9" />
                      <path d="M21 15V21H15" />
                      <path d="M9 21H3V15" />
                      <rect x="5" y="5" width="2" height="2" fill="currentColor" />
                      <rect x="17" y="5" width="2" height="2" fill="currentColor" />
                      <rect x="5" y="17" width="2" height="2" fill="currentColor" />
                      <rect x="10" y="10" width="4" height="4" fill="currentColor" />
                      <rect x="8" y="7" width="1" height="1" fill="currentColor" />
                      <rect x="15" y="8" width="1" height="1" fill="currentColor" />
                      <rect x="7" y="15" width="2" height="1" fill="currentColor" />
                      <rect x="15" y="15" width="1" height="2" fill="currentColor" />
                      <rect x="11" y="6" width="2" height="1" fill="currentColor" />
                      <rect x="6" y="11" width="1" height="2" fill="currentColor" />
                    </svg>
                  </div>
                  <div className="text-center sm:text-left space-y-1">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">WhatsApp Oficial</span>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">(46) 98803-5530</h3>
                    <p className="text-xs text-slate-500">Escaneie o QR Code ou clique no botão abaixo para iniciar</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <a href="https://wa.me/5546988035530" target="_blank" rel="noopener noreferrer" className="block sm:inline-block">
                  <Button className="w-full sm:w-auto h-12 bg-[#25D366] hover:bg-[#20ba5a] text-white px-8 rounded-full font-bold shadow-lg shadow-[#25D366]/25 flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5">
                    <MessageCircle className="w-5 h-5 fill-current" />
                    Abrir WhatsApp
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              </div>

              <div className="border-t border-slate-200/60 pt-4">
                <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">É por ele que você poderá:</p>
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600">
                  <span className="flex items-center gap-1.5">• Registrar receitas</span>
                  <span className="flex items-center gap-1.5">• Registrar despesas</span>
                  <span className="flex items-center gap-1.5">• Enviar fotos</span>
                  <span className="flex items-center gap-1.5">• Enviar áudios</span>
                  <span className="flex items-center gap-1.5">• Receber lembretes</span>
                  <span className="flex items-center gap-1.5">• Consultar relatórios</span>
                </div>
              </div>
            </div>

            {/* Right Column - WhatsApp Conversation Mockup */}
            <div className="md:col-span-5 bg-[#0b141a] rounded-[32px] p-4 shadow-xl border border-slate-800 flex flex-col justify-between h-[500px]">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#128c7e] flex items-center justify-center text-white font-bold text-sm">
                    PILA
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">Meu Pila Oficial</h4>
                    <span className="text-[10px] text-[#25D366] font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-ping" /> online
                    </span>
                  </div>
                </div>
              </div>

              {/* Chat messages */}
              <div className="flex-grow overflow-y-auto py-4 space-y-3 custom-scrollbar text-xs">
                {simulatedChat.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`flex flex-col max-w-[80%] rounded-2xl p-3 ${
                      msg.sender === 'user' 
                        ? 'bg-[#005c4b] text-white ml-auto rounded-tr-none' 
                        : 'bg-[#202c33] text-slate-200 rounded-tl-none whitespace-pre-line'
                    }`}
                  >
                    <span>{msg.text}</span>
                    <span className="text-[9px] text-white/40 self-end mt-1">{msg.time}</span>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="bg-[#202c33] text-slate-400 rounded-2xl rounded-tl-none p-3 max-w-[120px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-100" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-200" />
                  </div>
                )}
              </div>

              {/* Input box */}
              <form onSubmit={handleSendMessage} className="flex gap-2 pt-3 border-t border-white/5">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Experimente digitar: 'Gastei 50 no posto'" 
                  className="flex-grow bg-[#2a3942] border-0 text-white rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-lime-500 focus:outline-none placeholder:text-white/20"
                />
                <Button type="submit" className="bg-[#128c7e] hover:bg-[#0b665c] text-white rounded-xl p-3 aspect-square h-auto">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.section>

          {/* PASSO 3: CONFIGURE SEU AMBIENTE */}
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="bg-white/60 border border-slate-200/60 p-8 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.02)] backdrop-blur-md rounded-[32px] space-y-8"
          >
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-xs font-bold text-blue-600">
                PASSO 3
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Configure seu ambiente</h2>
              <p className="text-slate-600 leading-relaxed">
                Antes de iniciar, recomendamos realizar algumas configurações simples no portal. Isso ajuda a calibrar a Inteligência Artificial para categorizar seus lançamentos perfeitamente.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Carteiras */}
              <div className="p-5 rounded-2xl bg-white/50 border border-slate-100 space-y-3 group hover:border-primary/40 hover:bg-primary/[0.02] transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-800">🏦 Carteiras</h4>
                <p className="text-xs text-slate-500">Cadastre seus bancos ou dinheiro em mãos para separar seus saldos.</p>
              </div>

              {/* Cartões */}
              <div className="p-5 rounded-2xl bg-white/50 border border-slate-100 space-y-3 group hover:border-primary/40 hover:bg-primary/[0.02] transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-800">💳 Cartões</h4>
                <p className="text-xs text-slate-500">Insira seus cartões de crédito para acompanhar faturas e limites.</p>
              </div>

              {/* Categorias de Receita */}
              <div className="p-5 rounded-2xl bg-white/50 border border-slate-100 space-y-3 group hover:border-primary/40 hover:bg-primary/[0.02] transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-800">📂 Categorias de Receita</h4>
                <p className="text-xs text-slate-500">Configure suas principais fontes de ganho (salário, comissão, etc).</p>
              </div>

              {/* Categorias de Despesa */}
              <div className="p-5 rounded-2xl bg-white/50 border border-slate-100 space-y-3 group hover:border-primary/40 hover:bg-primary/[0.02] transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-800">📂 Categorias de Despesa</h4>
                <p className="text-xs text-slate-500">Defina onde você gasta mais para categorizar automaticamente.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-slate-200/60">
              <span className="text-xs text-slate-500 font-semibold max-w-md">
                💡 Essas configurações são realizadas apenas uma vez. Depois disso o sistema fará praticamente todo o trabalho para você.
              </span>
              <Button onClick={() => window.open('/', '_blank')} className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground px-8 rounded-full font-bold shadow-lg shadow-primary/25 flex items-center gap-2 transition-transform hover:-translate-y-0.5">
                Acessar Painel <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </motion.section>

          {/* PASSO 4: FAÇA SEU PRIMEIRO LANÇAMENTO */}
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-12 gap-8 items-center bg-white/60 border border-slate-200/60 p-8 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.02)] backdrop-blur-md rounded-[32px]"
          >
            <div className="md:col-span-6 space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full text-xs font-bold text-amber-600">
                  PASSO 4
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Faça seu primeiro lançamento</h2>
                <p className="text-slate-600 leading-relaxed">
                  Você pode alimentar seu controle financeiro de duas maneiras flexíveis. Experimente fazer sua primeira inserção hoje!
                </p>
              </div>

              <div className="flex bg-slate-200/60 p-1.5 rounded-xl max-w-sm border border-slate-300/30">
                <button 
                  onClick={() => setActiveStep4Tab('whatsapp')} 
                  className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all ${activeStep4Tab === 'whatsapp' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  📱 Pelo WhatsApp
                </button>
                <button 
                  onClick={() => setActiveStep4Tab('panel')} 
                  className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all ${activeStep4Tab === 'panel' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  🖥 Pelo Painel
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-lime-100 text-lime-600 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">"Gastei R$ 85 no mercado"</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-lime-100 text-lime-600 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">"Recebi R$ 1.500 referente a salário"</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-lime-100 text-lime-600 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">Enviar foto do comprovante ou nota fiscal</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-lime-100 text-lime-600 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">Enviar áudio descrevendo a despesa</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-6">
              <AnimatePresence mode="wait">
                {activeStep4Tab === 'whatsapp' ? (
                  <motion.div 
                    key="tab-whatsapp"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-[#0b141a] rounded-[32px] p-5 shadow-lg border border-slate-800 space-y-4"
                  >
                    <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                      <div className="w-8 h-8 rounded-full bg-[#128c7e] flex items-center justify-center text-white text-xs font-bold">P</div>
                      <span className="text-xs font-bold text-white">Lançamento por WhatsApp</span>
                    </div>

                    <div className="space-y-3 text-[11px] leading-relaxed">
                      <div className="bg-[#202c33] text-slate-200 rounded-2xl rounded-tl-none p-3 max-w-[90%]">
                        🎤 *Mensagem de Áudio enviada*
                        <div className="flex items-center gap-2 mt-1 bg-white/5 p-1.5 rounded-lg border border-white/10">
                          <Mic className="w-4 h-4 text-[#25D366]" />
                          <span className="text-white/60">"Gastei 150 reais no almoço com o cliente"</span>
                        </div>
                      </div>
                      <div className="bg-[#005c4b] text-white rounded-2xl rounded-tr-none p-3 max-w-[90%] ml-auto">
                        Entendido! Registrei despesa de R$ 150,00 na categoria Alimentação.
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="tab-panel"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white/50 border border-slate-200/60 rounded-[32px] p-5 shadow-inner space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-xs font-bold text-slate-700">Formulário de Lançamento</span>
                      <span className="text-[10px] bg-lime-100 text-lime-700 font-bold px-2 py-0.5 rounded-full">Painel</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Descrição</label>
                        <div className="bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-700 font-medium">Almoço Corporativo</div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Valor</label>
                          <div className="bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-700 font-medium">R$ 150,00</div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Categoria</label>
                          <div className="bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-700 font-medium">🍔 Alimentação</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>

          {/* PASSO 5: ACOMPANHE SEUS RESULTADOS */}
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-12 gap-8 items-center bg-white/60 border border-slate-200/60 p-8 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.02)] backdrop-blur-md rounded-[32px]"
          >
            <div className="md:col-span-5 flex justify-center">
              <div className="w-full max-w-[320px] bg-[#0b141a] rounded-[32px] p-4 shadow-xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                  <div className="w-6 h-6 rounded-full bg-[#128c7e] flex items-center justify-center text-white text-[10px] font-bold">P</div>
                  <span className="text-[10px] font-bold text-white">Relatório Rápido</span>
                </div>
                
                <div className="space-y-3 text-xs">
                  <div className="bg-[#005c4b] text-white rounded-2xl rounded-tr-none p-3 max-w-[85%] ml-auto">
                    Quanto gastei este mês?
                  </div>
                  
                  <div className="bg-[#202c33] text-slate-200 rounded-2xl rounded-tl-none p-3 max-w-[85%]">
                    📊 *Resumo Mensal*
                    
                    Você gastou *R$ 1.835,00* no total.
                    
                    *Principais categorias:*
                    • 🍔 Alimentação: R$ 620,00
                    • 🚗 Transporte: R$ 310,00
                    • 🏠 Moradia: R$ 905,00
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-7 space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 border border-purple-100 rounded-full text-xs font-bold text-purple-600">
                  PASSO 5
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Acompanhe seus resultados</h2>
                <p className="text-slate-600 leading-relaxed">
                  Agora você pode acompanhar tudo de forma consolidada. O painel se alimenta automaticamente e gera gráficos detalhados. Se preferir a praticidade, basta perguntar diretamente para nossa inteligência pelo WhatsApp.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/50 border border-slate-100 rounded-2xl shadow-sm space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Dashboard Principal</span>
                  <p className="text-sm font-bold text-slate-800">Gráficos em tempo real</p>
                </div>
                <div className="p-4 bg-white/50 border border-slate-100 rounded-2xl shadow-sm space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase">WhatsApp Relatórios</span>
                  <p className="text-sm font-bold text-slate-800">Comandos por chat</p>
                </div>
              </div>
            </div>
          </motion.section>

        </div>

        {/* FEATURE GRID SECTION */}
        <section className="mt-32 max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Tudo o que você pode fazer
            </h2>
            <p className="text-slate-600 font-medium">
              Conheça todos os módulos integrados do Meu Pila para potencializar sua organização financeira.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white/60 border border-slate-200/60 rounded-[24px] p-6 hover:shadow-lg transition-all group duration-300 hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-xl bg-lime-100 text-lime-600 flex items-center justify-center mb-4">
                <Plus className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">💰 Registrar Receitas</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Registre receitas pelo WhatsApp ou diretamente pelo painel com total facilidade e rapidez.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white/60 border border-slate-200/60 rounded-[24px] p-6 hover:shadow-lg transition-all group duration-300 hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">💸 Registrar Despesas</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Adicione saídas enviando mensagem de texto, imagem do cupom ou gravação de áudio.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white/60 border border-slate-200/60 rounded-[24px] p-6 hover:shadow-lg transition-all group duration-300 hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">📅 Contas a Receber</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Cadastre datas de vencimento de clientes ou salários e receba lembretes automáticos.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white/60 border border-slate-200/60 rounded-[24px] p-6 hover:shadow-lg transition-all group duration-300 hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">📄 Contas a Pagar</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Organize boletos e vencimentos para nunca mais esquecek um compromisso financeiro.
              </p>
            </div>

            {/* Card 5 */}
            <div className="bg-white/60 border border-slate-200/60 rounded-[24px] p-6 hover:shadow-lg transition-all group duration-300 hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">🔁 Contas Recorrentes</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Configure lançamentos automáticos mensais (como internet, aluguel) para provisionamento de gastos.
              </p>
            </div>

            {/* Card 6 */}
            <div className="bg-white/60 border border-slate-200/60 rounded-[24px] p-6 hover:shadow-lg transition-all group duration-300 hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center mb-4">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">🏦 Controle de Contas</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Acompanhe o saldo consolidado de todas as suas carteiras e bancos em uma única visualização.
              </p>
            </div>

            {/* Card 7 */}
            <div className="bg-white/60 border border-slate-200/60 rounded-[24px] p-6 hover:shadow-lg transition-all group duration-300 hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">💳 Cartões de Crédito</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Controle o limite disponível, gerencie o histórico de compras e visualize datas de faturas.
              </p>
            </div>

            {/* Card 8 */}
            <div className="bg-white/60 border border-slate-200/60 rounded-[24px] p-6 hover:shadow-lg transition-all group duration-300 hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center mb-4">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">📊 Dashboard Inteligente</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tenha relatórios completos, estatísticas e gráficos interativos em tempo real.
              </p>
            </div>

            {/* Card 9 */}
            <div className="bg-white/60 border border-slate-200/60 rounded-[24px] p-6 hover:shadow-lg transition-all group duration-300 hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center mb-4">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">🤖 Inteligência Artificial</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Converse naturalmente com suas finanças utilizando nossa integração inteligente do WhatsApp.
              </p>
            </div>

            {/* Card 10 */}
            <div className="bg-white/60 border border-slate-200/60 rounded-[24px] p-6 hover:shadow-lg transition-all group col-span-1 sm:col-span-2 lg:col-span-1 mx-auto w-full duration-300 hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center mb-4">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">🔔 Lembretes Automáticos</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Receba notificações com antecedência para não atrasar o pagamento ou recebimento de boletos.
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER CALLOUT SECTION */}
        <section className="mt-32 max-w-4xl mx-auto relative z-10">
          <div className="bg-slate-900 text-white rounded-[32px] p-8 sm:p-12 relative overflow-hidden text-center space-y-6 shadow-xl border border-white/5">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#6dcc2e]/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10 space-y-3 max-w-xl mx-auto">
              <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">Seu ambiente está pronto.</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Agora basta registrar sua primeira movimentação e deixar o Meu Pila cuidar da organização financeira para você.
              </p>
            </div>

            <div className="relative z-10 pt-4">
              <Button 
                onClick={() => navigate('/')} 
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-14 px-10 rounded-full text-base font-bold shadow-lg shadow-primary/30 transition-transform active:scale-[0.98] hover:-translate-y-0.5 group flex items-center justify-center mx-auto gap-2"
              >
                Começar Agora
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="mt-32 border-t border-slate-200/60 pt-8 text-center text-xs text-slate-400 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p>© {new Date().getFullYear()} Meu Pila. Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* SIGNUP MODAL */}
      <AnimatePresence>
        {showSignupModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" 
            onClick={() => setShowSignupModal(false)}
          >
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md">
              <AuthScreen 
                defaultIsLogin={false} 
                onAuthSuccess={handleSignupSuccess} 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOGIN MODAL */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" 
            onClick={() => setShowLoginModal(false)}
          >
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md">
              <AuthScreen 
                defaultIsLogin={true} 
                onAuthSuccess={() => {
                  setShowLoginModal(false);
                  navigate('/');
                }} 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
