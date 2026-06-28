import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone,
  TrendingUp,
  MessageCircle,
  BarChart3,
  Users,
  Tractor,
  Wheat,
  FileText,
  Shield,
  Globe,
  Gift,
  ArrowRight,
  Mic,
  Camera,
  Sparkles,
  Beef,
  CheckCheck
} from "lucide-react";
import Logo from "@/components/Logo";

export default function LandingPage({ onAuthClick }) {
  const navigate = useNavigate();
  const [hoveredPanel, setHoveredPanel] = useState("none");
  const [isScrolled, setIsScrolled] = useState(false);
  const [agroTab, setAgroTab] = useState("geral");

  // WhatsApp simulator state
  const chatEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: "user", text: "Almoço hoje 32 reais", time: "14:32" },
    { id: 2, sender: "bot", text: "Registrado R$ 32,00 em 🍔 Alimentação. Saldo restante: R$ 1.456,00", time: "14:32", isCategory: true }
  ]);

  const [expenseStats, setExpenseStats] = useState({
    Alimentacao: 32,
    Transporte: 0,
    Moradia: 0,
    Salario: 0
  });

  // Handle header scroll backdrop-blur change
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll chat simulator to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isTyping]);

  const handleSimulatedExpense = (tagText, amount, category, type = "expense") => {
    if (isTyping) return;

    const timeNow = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    // 1. Add user message
    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: tagText,
      time: timeNow
    };
    setChatMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    // 2. Wait 1s and respond
    setTimeout(() => {
      setIsTyping(false);

      let botText = "";
      if (type === "income") {
        const newBalance = 1456 + amount;
        botText = `Recebido! R$ ${amount.toFixed(2).replace(".", ",")} registrado em 💰 Salários. Novo saldo: R$ ${newBalance.toFixed(2).replace(".", ",")}`;
        setExpenseStats(prev => ({ ...prev, Salario: prev.Salario + amount }));
      } else {
        const newBalance = 1456 - amount;
        let icon = "🏷️";
        let catLabel = "Outros";
        if (category === "Alimentacao") { icon = "🍔"; catLabel = "Alimentação"; }
        if (category === "Transporte") { icon = "🚗"; catLabel = "Transporte"; }
        if (category === "Moradia") { icon = "🏠"; catLabel = "Moradia"; }

        botText = `Registrado R$ ${amount.toFixed(2).replace(".", ",")} em ${icon} ${catLabel}. Saldo restante: R$ ${newBalance.toFixed(2).replace(".", ",")}`;
        setExpenseStats(prev => ({ ...prev, [category]: prev[category] + amount }));
      }

      const botMsg = {
        id: Date.now() + 1,
        sender: "bot",
        text: botText,
        time: timeNow,
        isCategory: true
      };
      setChatMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <div className="relative min-h-screen bg-[#030303] overflow-x-hidden text-slate-100 font-sans pb-28">
      {/* Background gradient sutil */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#6dcc2e]/5 via-transparent to-amber-950/5 pointer-events-none" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      {/* Header Fixo com Backdrop Blur */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between transition-all duration-300 ${isScrolled
          ? "bg-[#030303]/80 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/20"
          : "bg-transparent"
          }`}
      >
        {/* Logo */}
        <Logo theme="dark" size="lg" />

        {/* Botoes no header */}
        <div className="flex items-center gap-4">
          <a href="/login" onClick={(e) => { e.preventDefault(); navigate("/login"); }} className="text-white/70 hover:text-white text-sm font-medium transition-colors hidden sm:block">
            Já sou cliente / Entrar
          </a>
          <a href="/create" onClick={(e) => { e.preventDefault(); navigate("/create"); }}>
            <motion.button
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#6dcc2e] to-[#59ab22] hover:from-[#7edd3a] hover:to-[#6dcc2e] text-white font-semibold rounded-xl shadow-lg shadow-[#6dcc2e]/20 backdrop-blur-sm transition-all duration-300 border border-[#6dcc2e]/30"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              Criar Conta Grátis
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </a>
        </div>
      </motion.header>

      {/* Seção de Escolha de Jornada */}
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-4 flex flex-col items-center relative z-10">
        <div className="text-center max-w-2xl mb-8 lg:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-4 text-xs font-semibold text-white/70"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#6dcc2e]" /> Como o Meu Pila pode te ajudar hoje?
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3.5xl lg:text-5xl font-bold tracking-tight text-white mb-4 font-sans"
          >
            Clique na opção que mais se identifica com você
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-sm lg:text-base leading-relaxed"
          >
            Selecione o módulo ideal para o seu perfil e comece a controlar suas finanças de forma inteligente. Teste grátis por 30 dias.
          </motion.p>
        </div>

        {/* Container dos Cards */}
        <div className="w-full flex flex-col lg:flex-row items-stretch justify-center gap-8 lg:gap-12">

          {/* LADO ESQUERDO - PESSOAL (WhatsApp/Automação - Verde #6dcc2e) */}
          <motion.div
            className="relative flex-1 flex items-center justify-center p-6 lg:p-0 transition-opacity duration-500 overflow-hidden"
            animate={{
              flexGrow: hoveredPanel === "pessoal" ? 1.15 : hoveredPanel === "rural" ? 0.85 : 1,
              opacity: hoveredPanel === "rural" ? 0.5 : 1
            }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            onMouseEnter={() => setHoveredPanel("pessoal")}
            onMouseLeave={() => setHoveredPanel("none")}
          >
            {/* Background glow verde whatsapp */}
            <div
              className={`absolute inset-0 bg-gradient-to-br from-[#6dcc2e]/15 via-transparent to-transparent transition-opacity duration-500 pointer-events-none ${hoveredPanel === "pessoal" ? "opacity-100" : "opacity-0"
                }`}
            />

            <div className="relative z-10 w-full">
              {/* Card principal Pessoal */}
              <div className="relative group">
                {/* Glow border effect */}
                <div className="absolute -inset-[1px] bg-gradient-to-bl from-[#6dcc2e]/30 via-white/5 to-white/10 rounded-3xl blur-sm pointer-events-none" />

                <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.01] backdrop-blur-md border border-white/10 rounded-3xl p-5 lg:p-7 shadow-2xl w-full h-auto lg:h-[950px] flex flex-col justify-between">
                  <div>
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#6dcc2e]/10 border border-[#6dcc2e]/20 rounded-full mb-3">
                      <Smartphone className="w-3.5 h-3.5 text-[#6dcc2e]" />
                      <span className="text-[#6dcc2e] text-xs font-semibold uppercase tracking-wider">Pessoal e Familiar</span>
                    </div>

                    {/* Titulo */}
                    <h2 className="font-serif text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">
                      Finanças pelo WhatsApp
                    </h2>

                    {/* Subtitulo */}
                    <p className="text-xs lg:text-sm text-white/60 mb-4 leading-relaxed">
                      Registre seus gastos por texto ou áudio. Nossa Inteligência Artificial entende e categoriza tudo na hora.
                    </p>

                    {/* Feature Pills Pessoal */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <FeaturePill icon={MessageCircle} text="WhatsApp" color="green" />
                      <FeaturePill icon={Mic} text="Áudio" color="green" />
                      <FeaturePill icon={Camera} text="Foto de Notas" color="green" />
                      <FeaturePill icon={Users} text="Gestão Familiar" color="green" />
                      <FeaturePill icon={BarChart3} text="Relatórios" color="green" />
                    </div>

                    {/* WhatsApp Chat Simulator */}
                    <div className="bg-[#0b141a] rounded-2xl p-4 shadow-inner">
                      {/* Chat Header */}
                      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/10">
                        <div className="relative">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6dcc2e] to-[#4c961e] flex items-center justify-center shadow">
                            <span className="text-white text-xs font-bold">$</span>
                          </div>
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#6dcc2e] border border-[#0b141a] rounded-full" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-white text-sm font-semibold tracking-tight">MEU PILA</p>
                            <CheckCheck className="w-3.5 h-3.5 text-[#6dcc2e] shrink-0" />
                          </div>
                          <p className="text-white/40 text-[10px] font-medium">Assistente Financeiro Virtual</p>
                        </div>
                        <div className="ml-auto flex gap-2">
                          <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center">
                            <Mic className="w-3.5 h-3.5 text-white/40" />
                          </div>
                          <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center">
                            <Camera className="w-3.5 h-3.5 text-white/40" />
                          </div>
                        </div>
                      </div>

                      {/* Chat Messages */}
                      <div className="space-y-3 h-[140px] overflow-y-auto custom-scrollbar pr-1 pb-1">
                        {chatMessages.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                            <div className={`rounded-2xl px-3.5 py-2 max-w-[85%] shadow-sm ${msg.sender === "user"
                              ? "bg-[#005c4b] text-white rounded-tr-none"
                              : "bg-[#202c33] text-white rounded-tl-none"
                              }`}>
                              {msg.isCategory && (
                                <div className="flex items-center gap-1 mb-1">
                                  <Sparkles className="w-3 h-3 text-[#6dcc2e]" />
                                  <span className="text-[#6dcc2e] text-[10px] font-semibold uppercase tracking-wider">Lançamento Efetuado</span>
                                </div>
                              )}
                              <p className="text-xs leading-relaxed">{msg.text}</p>
                              <p className="text-white/40 text-[9px] text-right mt-1 font-medium">{msg.time}</p>
                            </div>
                          </div>
                        ))}

                        {isTyping && (
                          <div className="flex justify-start">
                            <div className="bg-[#202c33] rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
                              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                            </div>
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>

                      {/* Dynamic Progress Budget Bars */}
                      <div className="mt-3 pt-2.5 border-t border-white/5 text-left">
                        <div className="flex justify-between items-center mb-1.5">
                          <p className="text-white/50 text-[10px] font-bold uppercase tracking-wider">Acompanhamento de Metas</p>
                          <span className="text-[9px] text-[#6dcc2e] font-semibold flex items-center gap-0.5">🚀 IA Ativa</span>
                        </div>
                        <div className="space-y-1.5">
                          <div>
                            <div className="flex justify-between text-[10px] text-white/70 mb-0.5">
                              <span>🍔 Alimentação</span>
                              <span className="font-medium">R$ {expenseStats.Alimentacao},00 / R$ 500,00</span>
                            </div>
                            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-[#6dcc2e]"
                                animate={{ width: `${Math.min((expenseStats.Alimentacao / 500) * 100, 100)}%` }}
                                transition={{ duration: 0.4 }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-[10px] text-white/70 mb-0.5">
                              <span>🚗 Transporte</span>
                              <span className="font-medium">R$ {expenseStats.Transporte},00 / R$ 400,00</span>
                            </div>
                            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-blue-500"
                                animate={{ width: `${Math.min((expenseStats.Transporte / 400) * 100, 100)}%` }}
                                transition={{ duration: 0.4 }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-[10px] text-white/70 mb-0.5">
                              <span>🏠 Moradia</span>
                              <span className="font-medium">R$ {expenseStats.Moradia},00 / R$ 1.200,00</span>
                            </div>
                            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-purple-500"
                                animate={{ width: `${Math.min((expenseStats.Moradia / 1200) * 100, 100)}%` }}
                                transition={{ duration: 0.4 }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Simulated Tags */}
                    <div className="mt-4">
                      <p className="text-white/40 text-[9px] font-bold uppercase tracking-wider mb-2 text-center">Clique para testar o envio com IA:</p>
                      <div className="flex flex-wrap gap-1.5 justify-center">
                        <button
                          onClick={() => handleSimulatedExpense("Almoço hoje 38 reais", 38, "Alimentacao")}
                          className="px-2.5 py-1.5 bg-white/5 border border-white/10 hover:border-[#6dcc2e]/40 hover:bg-[#6dcc2e]/10 rounded-xl text-xs text-white/80 transition-all font-medium flex items-center gap-1"
                          disabled={isTyping}
                        >
                          🍔 Almoço R$ 38
                        </button>
                        <button
                          onClick={() => handleSimulatedExpense("Gasolina R$ 150", 150, "Transporte")}
                          className="px-2.5 py-1.5 bg-white/5 border border-white/10 hover:border-[#6dcc2e]/40 hover:bg-[#6dcc2e]/10 rounded-xl text-xs text-white/80 transition-all font-medium flex items-center gap-1"
                          disabled={isTyping}
                        >
                          🚗 Gasolina R$ 150
                        </button>
                        <button
                          onClick={() => handleSimulatedExpense("Condomínio R$ 420", 420, "Moradia")}
                          className="px-2.5 py-1.5 bg-white/5 border border-white/10 hover:border-[#6dcc2e]/40 hover:bg-[#6dcc2e]/10 rounded-xl text-xs text-white/80 transition-all font-medium flex items-center gap-1"
                          disabled={isTyping}
                        >
                          🏠 Moradia R$ 420
                        </button>
                        <button
                          onClick={() => handleSimulatedExpense("Pix recebido de Salário R$ 5000", 5000, "Salario", "income")}
                          className="px-2.5 py-1.5 bg-white/5 border border-white/10 hover:border-amber-500/40 hover:bg-amber-500/10 rounded-xl text-xs text-white/80 transition-all font-medium flex items-center gap-1"
                          disabled={isTyping}
                        >
                          💰 Salário R$ 5k
                        </button>
                      </div>
                    </div>

                    {/* Destaque Pessoal (Callout) */}
                    <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-xl flex items-center gap-2.5 mt-4">
                      <Sparkles className="w-4 h-4 text-[#6dcc2e] shrink-0 animate-pulse" />
                      <p className="text-white/70 text-xs text-left leading-relaxed">
                        <strong>Inteligência Artificial:</strong> Envie comprovantes por foto e a IA realiza a leitura do código de barras e valores automaticamente.
                      </p>
                    </div>
                  </div>

                  {/* CTA Pessoal */}
                  <a href="/pessoal" onClick={(e) => { e.preventDefault(); navigate("/pessoal"); }} className="block mt-4 lg:mt-0">
                    <motion.button
                      className="w-full group flex items-center justify-center gap-3 px-8 py-3.5 bg-gradient-to-r from-[#6dcc2e] to-[#55ab20] hover:from-[#7edd38] hover:to-[#6dcc2e] text-white font-semibold rounded-2xl shadow-lg shadow-[#6dcc2e]/25 transition-all duration-300 border border-[#6dcc2e]/30"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Conhecer Módulo Pessoal
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </a>
                </div>
              </div>

              {/* Stats */}
              <motion.div
                className="flex justify-center gap-8 mt-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#6dcc2e]">+80 Usuários</p>
                  <p className="text-xs text-white/40 font-medium">no último mês</p>
                </div>
                <div className="w-px bg-white/10" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#6dcc2e]">30 dias</p>
                  <p className="text-xs text-white/40 font-medium">Período de teste grátis</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* DIVISOR CENTRAL DINAMICO */}
          <div className="relative flex items-center justify-center py-6 lg:py-0 shrink-0">
            {/* Linha vertical desktop */}
            <div className="hidden lg:block w-px h-2/3 bg-gradient-to-b from-transparent via-white/20 to-transparent relative overflow-hidden">
              {/* Laser vertical pulse */}
              <motion.div
                className="absolute top-0 left-0 w-[1px] h-36 bg-gradient-to-b from-transparent via-[#6dcc2e] to-transparent"
                animate={{
                  y: ["-150px", "500px"]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </div>

            {/* Linha horizontal mobile */}
            <div className="lg:hidden w-2/3 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent relative overflow-hidden">
              {/* Laser horizontal pulse */}
              <motion.div
                className="absolute left-0 top-0 h-[1px] w-36 bg-gradient-to-r from-transparent via-[#6dcc2e] to-transparent"
                animate={{
                  x: ["-150px", "350px"]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </div>

            {/* Ponto central pulsante */}
            <motion.div
              className="absolute w-4 h-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 shadow-md shadow-white/5"
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>

          {/* LADO DIREITO - RURAL (Trigo/Terra - Dourado) */}
          <motion.div
            className="relative flex-1 flex items-center justify-center p-6 lg:p-0 transition-opacity duration-500 overflow-hidden"
            animate={{
              flexGrow: hoveredPanel === "rural" ? 1.15 : hoveredPanel === "pessoal" ? 0.85 : 1,
              opacity: hoveredPanel === "pessoal" ? 0.5 : 1
            }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            onMouseEnter={() => setHoveredPanel("rural")}
            onMouseLeave={() => setHoveredPanel("none")}
          >
            {/* Background glow dourado */}
            <div
              className={`absolute inset-0 bg-gradient-to-br from-amber-500/15 via-transparent to-transparent transition-opacity duration-500 pointer-events-none ${hoveredPanel === "rural" ? "opacity-100" : "opacity-0"
                }`}
            />

            {/* Trigo pattern overlay */}
            <div
              className="absolute inset-0 opacity-[0.02] pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='80' viewBox='0 0 40 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f59e0b' fill-rule='evenodd'%3E%3Cpath d='M20 10c2-3 5-5 8-5c-3 3-5 7-5 10c0 3 2 7 5 10c-3 0-6-2-8-5c-2 3-5 5-8 5c3-3 5-7 5-10c0-3-2-7-5-10c3 0 6 2 8 5zm0 30c2-3 5-5 8-5c-3 3-5 7-5 10c0 3 2 7 5 10c-3 0-6-2-8-5c-2 3-5 5-8 5c3-3 5-7 5-10c0-3-2-7-5-10c3 0 6 2 8 5z'/%3E%3C/g%3E%3C/svg%3E")`
              }}
            />

            <div className="relative z-10 w-full">
              {/* Card principal Rural */}
              <div className="relative group">
                {/* Glow border effect */}
                <div className="absolute -inset-[1px] bg-gradient-to-br from-amber-500/30 via-white/5 to-white/10 rounded-3xl blur-sm pointer-events-none" />

                <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.01] backdrop-blur-md border border-white/10 rounded-3xl p-5 lg:p-7 shadow-2xl w-full h-auto lg:h-[950px] flex flex-col justify-between">
                  <div>
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full mb-3">
                      <Wheat className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">Agronegócio</span>
                    </div>

                    {/* Titulo */}
                    <h2 className="font-serif text-3.5xl lg:text-4xl font-bold text-white mb-2 leading-tight">
                      Gestão financeira para o campo
                    </h2>

                    {/* Subtitulo */}
                    <p className="text-xs lg:text-sm text-white/60 mb-4 leading-relaxed">
                      Controle lavouras, rebanhos e finanças da sua propriedade rural em um só lugar.
                    </p>

                    {/* Feature Pills Rural */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <FeaturePill icon={Wheat} text="Culturas" color="amber" />
                      <FeaturePill icon={Beef} text="Pecuária" color="amber" />
                      <FeaturePill icon={Tractor} text="Maquinário" color="amber" />
                      <FeaturePill icon={FileText} text="Livro Caixa LCDPR" color="amber" />
                      <FeaturePill icon={BarChart3} text="Relatórios" color="amber" />
                    </div>

                    {/* Dashboard Interativo */}
                    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 shadow-inner">
                      {/* Abas */}
                      <div className="flex gap-1.5 mb-3 bg-white/5 p-1 rounded-xl border border-white/5">
                        {[
                          { id: "geral", label: "Geral" },
                          { id: "lavouras", label: "Lavouras" },
                          { id: "pecuaria", label: "Pecuária" }
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setAgroTab(tab.id)}
                            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all ${agroTab === tab.id
                              ? "bg-amber-600 text-white shadow-md shadow-amber-700/25"
                              : "text-white/60 hover:text-white hover:bg-white/5"
                              }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {/* Conteudo das Abas com framer-motion */}
                      <div className="min-h-[165px]">
                        <AnimatePresence mode="wait">
                          {agroTab === "geral" && (
                            <motion.div
                              key="geral"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className="space-y-3"
                            >
                              <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                                  <p className="text-white/40 text-[9px] uppercase font-semibold">Faturamento Geral</p>
                                  <p className="text-base font-bold text-white mt-0.5">R$ 145.200,00</p>
                                  <span className="text-[9px] text-amber-400 flex items-center gap-0.5 mt-1 font-semibold">
                                    <TrendingUp className="w-3 h-3" /> +12.4% no mês
                                  </span>
                                </div>
                                <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                                  <p className="text-white/40 text-[9px] uppercase font-semibold">Custos Totais</p>
                                  <p className="text-base font-bold text-white mt-0.5">R$ 48.310,00</p>
                                  <span className="text-[9px] text-amber-400 flex items-center gap-0.5 mt-1 font-semibold">
                                    ✓ Dentro da meta
                                  </span>
                                </div>
                              </div>

                              {/* Mini gráfico SVG */}
                              <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                                <div className="flex justify-between items-center mb-1">
                                  <p className="text-white/60 text-[10px] font-semibold">Fluxo de Caixa (Últimos meses)</p>
                                </div>
                                <div className="h-14 flex items-end justify-between gap-2.5 pt-1">
                                  {[
                                    { label: "Jan", val: "40%" },
                                    { label: "Fev", val: "55%" },
                                    { label: "Mar", val: "48%" },
                                    { label: "Abr", val: "75%" },
                                    { label: "Mai", val: "90%" }
                                  ].map((bar, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                                      <motion.div
                                        className="w-full rounded-t-sm bg-gradient-to-t from-amber-600 to-amber-400"
                                        initial={{ height: 0 }}
                                        animate={{ height: bar.val }}
                                        transition={{ duration: 0.4, delay: i * 0.05 }}
                                      />
                                      <span className="text-[9px] text-white/40 font-medium">{bar.label}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}

                          {agroTab === "lavouras" && (
                            <motion.div
                              key="lavouras"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className="space-y-2.5"
                            >
                              <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center">
                                <div>
                                  <p className="text-white font-semibold text-xs">Talhão 01 — Soja</p>
                                  <p className="text-white/40 text-[9px] mt-0.5">Custos acumulados</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-white font-bold text-xs">R$ 32.400,00</p>
                                  <span className="text-[9px] px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full mt-1 inline-block font-semibold uppercase tracking-wider">Saudável</span>
                                </div>
                              </div>

                              <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center">
                                <div>
                                  <p className="text-white font-semibold text-xs">Talhão 02 — Milho</p>
                                  <p className="text-white/40 text-[9px] mt-0.5">Custos acumulados</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-white font-bold text-xs">R$ 15.910,00</p>
                                  <span className="text-[9px] px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full mt-1 inline-block font-semibold uppercase tracking-wider">Saudável</span>
                                </div>
                              </div>

                              <div className="p-2 bg-amber-950/20 border border-amber-850/20 rounded-xl flex items-center gap-2">
                                <Tractor className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                <p className="text-white/70 text-[11px]">
                                  Rentabilidade projetada está <strong>15% acima</strong> do esperado.
                                </p>
                              </div>
                            </motion.div>
                          )}

                          {agroTab === "pecuaria" && (
                            <motion.div
                              key="pecuaria"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className="space-y-3"
                            >
                              <div className="grid grid-cols-3 gap-2">
                                <div className="p-2 bg-white/5 border border-white/5 rounded-xl text-center">
                                  <p className="text-white/40 text-[9px] uppercase font-semibold">Leite Diário</p>
                                  <p className="text-xs font-bold text-white mt-0.5">420 Litros</p>
                                </div>
                                <div className="p-2 bg-white/5 border border-white/5 rounded-xl text-center">
                                  <p className="text-white/40 text-[9px] uppercase font-semibold">Valor Litro</p>
                                  <p className="text-xs font-bold text-white mt-0.5">R$ 2,45</p>
                                </div>
                                <div className="p-2 bg-white/5 border border-white/5 rounded-xl text-center">
                                  <p className="text-white/40 text-[9px] uppercase font-semibold">Gado Ativo</p>
                                  <p className="text-xs font-bold text-white mt-0.5">128 Cab.</p>
                                </div>
                              </div>

                              <div className="p-2 bg-white/5 border border-white/5 rounded-xl">
                                <p className="text-white/60 text-[10px] font-semibold mb-1">Produção de Leite (Últimas semanas)</p>
                                <div className="h-16">
                                  <svg className="w-full h-full" viewBox="0 0 300 60" preserveAspectRatio="none">
                                    <defs>
                                      <linearGradient id="agroGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                                      </linearGradient>
                                    </defs>
                                    <path
                                      d="M 10 50 Q 50 25 90 35 T 170 15 T 250 28 T 290 10 L 290 60 L 10 60 Z"
                                      fill="url(#agroGrad2)"
                                    />
                                    <path
                                      d="M 10 50 Q 50 25 90 35 T 170 15 T 250 28 T 290 10"
                                      fill="none"
                                      stroke="#f59e0b"
                                      strokeWidth="2.5"
                                    />
                                    <circle cx="90" cy="35" r="3" fill="#f59e0b" />
                                    <circle cx="170" cy="15" r="3" fill="#f59e0b" />
                                    <circle cx="290" cy="10" r="3" fill="#f59e0b" />
                                  </svg>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Destaque Rural (Callout) */}
                    <div className="p-3 bg-amber-950/20 border border-amber-900/30 rounded-xl flex items-center gap-2.5 mt-4">
                      <TrendingUp className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                      <p className="text-white/70 text-xs text-left leading-relaxed">
                        <strong>Multi-propriedade:</strong> Gerencie múltiplas fazendas, safras, talhões e fluxo de caixa de forma totalmente integrada.
                      </p>
                    </div>
                  </div>

                  {/* CTA Rural */}
                  <a href="/rural" onClick={(e) => { e.preventDefault(); navigate("/rural"); }} className="block mt-4 lg:mt-0">
                    <motion.button
                      className="w-full group flex items-center justify-center gap-3 px-8 py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold rounded-2xl shadow-lg shadow-amber-600/25 transition-all duration-300 border border-amber-600/30"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Conhecer Módulo Rural
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </a>
                </div>
              </div>

              {/* Stats */}
              <motion.div
                className="flex justify-center gap-8 mt-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-400">+30</p>
                  <p className="text-xs text-white/40 font-medium">Propriedades cadastradas</p>
                </div>
                <div className="w-px bg-white/10" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-400">+500</p>
                  <p className="text-xs text-white/40 font-medium">Animais cadastrados</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="absolute bottom-0 left-0 right-0 z-30 py-6 px-6 bg-gradient-to-t from-black via-black/80 to-transparent"
      >
        <div className="flex flex-wrap justify-center items-center gap-6 lg:gap-10 text-xs text-white/40 font-medium">
          <span className="flex items-center gap-2 hover:text-white/60 transition-colors cursor-default">
            <Shield className="w-4 h-4 text-amber-500" />
            Conexão Criptografada SSL
          </span>
          <span className="flex items-center gap-2 hover:text-white/60 transition-colors cursor-default">
            <Globe className="w-4 h-4 text-[#6dcc2e]" />
            Acesso via Web & WhatsApp
          </span>
          <span className="flex items-center gap-2 hover:text-white/60 transition-colors cursor-default">
            <Gift className="w-4 h-4 text-amber-400" />
            Teste Grátis de 30 dias
          </span>
          <span className="flex items-center gap-2 hover:text-white/60 transition-colors cursor-default">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6dcc2e] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#6dcc2e]"></span>
            </span>
            Sistemas Operacionais (99.9% uptime)
          </span>
        </div>
      </motion.footer>
    </div>
  );
}

// Reusable Feature Pill Component
function FeaturePill({ icon: Icon, text, color }) {
  const colorClass = color === "amber" ? "text-amber-400" : "text-[#6dcc2e]";
  const borderClass = color === "amber" ? "hover:border-amber-500/30" : "hover:border-[#6dcc2e]/30";
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[11px] text-white/80 transition-all ${borderClass}`}>
      <Icon className={`w-3.5 h-3.5 ${colorClass}`} />
      <span>{text}</span>
    </div>
  );
}
