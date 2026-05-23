import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Leaf, 
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
  Beef
} from "lucide-react";
import Logo from "@/components/Logo";

export default function LandingPage({ onAuthClick }) {
  const navigate = useNavigate();
  const [hoveredPanel, setHoveredPanel] = useState("none");

  return (
    <div className="relative min-h-screen bg-[#030303] overflow-hidden">
      {/* Background gradient sutil */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-transparent to-blue-950/20 pointer-events-none" />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      {/* Header com logo e botao de login */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="absolute top-0 left-0 right-0 z-50 px-6 py-6 flex items-center justify-between"
      >
        {/* Logo */}
        <Logo theme="dark" size="lg" />

        {/* Botao de login */}
        <a href="/login" onClick={(e) => { e.preventDefault(); navigate("/login"); }}>
          <motion.button
            className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 text-white font-medium rounded-xl backdrop-blur-sm transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Ja sou cliente
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </a>
      </motion.header>

      {/* Container principal */}
      <div className="flex flex-col lg:flex-row min-h-screen pt-28 lg:pt-0">
        
        {/* LADO ESQUERDO - RURAL */}
        <motion.div
          className="relative flex-1 flex items-center justify-center p-8 lg:p-16"
          animate={{ 
            flexGrow: hoveredPanel === "rural" ? 1.3 : hoveredPanel === "pessoal" ? 0.7 : 1 
          }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          onMouseEnter={() => setHoveredPanel("rural")}
          onMouseLeave={() => setHoveredPanel("none")}
        >
          {/* Background glow */}
          <motion.div 
            className="absolute inset-0 opacity-0 transition-opacity duration-500"
            style={{ opacity: hoveredPanel === "rural" ? 0.1 : 0 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-transparent to-transparent" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative z-10 max-w-lg w-full"
          >
            {/* Card principal */}
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500/20 to-emerald-700/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-3xl p-8 lg:p-10">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6">
                  <Leaf className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 text-sm font-medium">Agronegocio</span>
                </div>

                {/* Titulo */}
                <h2 className="font-serif text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight text-balance">
                  Gestao financeira para o campo
                </h2>
                
                {/* Subtitulo */}
                <p className="text-lg text-white/60 mb-8 leading-relaxed">
                  Controle lavouras, rebanhos e financas da sua propriedade rural em um so lugar.
                </p>

                {/* Features grid */}
                <div className="grid grid-cols-1 gap-3 mb-8">
                  <FeatureRow 
                    icon={Tractor} 
                    title="Controle de Safras" 
                    desc="Custos por talhao e cultura"
                    color="emerald" 
                  />
                  <FeatureRow 
                    icon={Wheat} 
                    title="Gestao de Rebanhos" 
                    desc="Evolucao e custos do plantel"
                    color="emerald" 
                  />
                  <FeatureRow 
                    icon={Beef} 
                    title="Producao de Leite" 
                    desc="Acompanhe producao e valor do litro"
                    color="emerald" 
                  />
                  <FeatureRow 
                    icon={FileText} 
                    title="Relatorios Completos" 
                    desc="Dashboards e analises detalhadas"
                    color="emerald" 
                  />
                </div>

                {/* CTA */}
                <a href="/rural" onClick={(e) => { e.preventDefault(); navigate("/rural"); }} className="block">
                  <motion.button
                    className="w-full group flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-600/25 transition-all duration-300"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Conhecer Modulo Rural
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </a>
              </div>
            </div>

            {/* Stats */}
            <motion.div 
              className="flex justify-center gap-8 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-400">+500</p>
                <p className="text-sm text-white/40">Produtores</p>
              </div>
              <div className="w-px bg-white/10" />
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-400">4.9</p>
                <p className="text-sm text-white/40">Avaliacao</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* DIVISOR CENTRAL */}
        <div className="relative flex items-center justify-center py-8 lg:py-0">
          {/* Linha vertical desktop */}
          <div className="hidden lg:block w-px h-2/3 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
          
          {/* Linha horizontal mobile */}
          <div className="lg:hidden w-2/3 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          {/* Ponto central pulsante */}
          <motion.div 
            className="absolute w-4 h-4 rounded-full bg-white/20 backdrop-blur-sm border border-white/30"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>

        {/* LADO DIREITO - PESSOAL */}
        <motion.div
          className="relative flex-1 flex items-center justify-center p-8 lg:p-16"
          animate={{ 
            flexGrow: hoveredPanel === "pessoal" ? 1.3 : hoveredPanel === "rural" ? 0.7 : 1 
          }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          onMouseEnter={() => setHoveredPanel("pessoal")}
          onMouseLeave={() => setHoveredPanel("none")}
        >
          {/* Background glow */}
          <motion.div 
            className="absolute inset-0 opacity-0 transition-opacity duration-500"
            style={{ opacity: hoveredPanel === "pessoal" ? 0.1 : 0 }}
          >
            <div className="absolute inset-0 bg-gradient-to-bl from-blue-500 via-transparent to-transparent" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative z-10 max-w-lg w-full"
          >
            {/* Card principal */}
            <div className="relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-3xl p-8 lg:p-10">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
                <Smartphone className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 text-sm font-medium">Pessoal e Familiar</span>
              </div>

              {/* Titulo */}
              <h2 className="font-serif text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight text-balance">
                Financas pelo WhatsApp
              </h2>
              
              {/* Subtitulo */}
              <p className="text-lg text-white/60 mb-8 leading-relaxed">
                Registre gastos com mensagens de texto, audio ou foto. A IA entende e organiza tudo.
              </p>

              {/* WhatsApp Preview */}
              <div className="bg-[#0b141a] rounded-2xl p-4 mb-8 border border-white/5">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">$</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">MEU PILA</p>
                    <p className="text-white/40 text-xs">Assistente financeiro</p>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                      <Mic className="w-4 h-4 text-white/40" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                      <Camera className="w-4 h-4 text-white/40" />
                    </div>
                  </div>
                </div>
                
                {/* Mensagens */}
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <div className="bg-[#005c4b] rounded-2xl rounded-tr-md px-4 py-2.5 max-w-[85%]">
                      <p className="text-white text-sm">Almoco hoje 32 reais</p>
                      <p className="text-white/40 text-[10px] text-right mt-1">14:32</p>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-[#202c33] rounded-2xl rounded-tl-md px-4 py-2.5 max-w-[85%]">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 text-xs font-medium">Registrado</span>
                      </div>
                      <p className="text-white text-sm">R$ 32,00 em <span className="text-blue-400">Alimentacao</span></p>
                      <p className="text-white/50 text-xs mt-1">Saldo: R$ 1.456,00</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features compactas */}
              <div className="flex flex-wrap gap-3 mb-8">
                <FeaturePill icon={MessageCircle} text="Texto" />
                <FeaturePill icon={Mic} text="Audio" />
                <FeaturePill icon={Camera} text="Foto de nota" />
                <FeaturePill icon={BarChart3} text="Relatorios" />
                <FeaturePill icon={Users} text="Familia" />
              </div>

              {/* CTA */}
              <a href="/pessoal" onClick={(e) => { e.preventDefault(); navigate("/pessoal"); }} className="block">
                <motion.button
                  className="w-full group flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-2xl shadow-lg shadow-blue-600/25 transition-all duration-300"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Conhecer Modulo Pessoal
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </a>
            </div>

            {/* Stats */}
            <motion.div 
              className="flex justify-center gap-8 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">+1.200</p>
                <p className="text-sm text-white/40">Usuarios</p>
              </div>
              <div className="w-px bg-white/10" />
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">30 dias</p>
                <p className="text-sm text-white/40">Gratis</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="absolute bottom-0 left-0 right-0 z-30 py-6 px-6"
      >
        <div className="flex flex-wrap justify-center items-center gap-6 lg:gap-10 text-sm text-white/40">
          <span className="flex items-center gap-2 hover:text-white/60 transition-colors">
            <Shield className="w-4 h-4" />
            100% Seguro
          </span>
          <span className="flex items-center gap-2 hover:text-white/60 transition-colors">
            <Globe className="w-4 h-4" />
            Web e Mobile
          </span>
          <span className="flex items-center gap-2 hover:text-white/60 transition-colors">
            <Gift className="w-4 h-4" />
            Teste gratis
          </span>
          <span className="flex items-center gap-2 hover:text-white/60 transition-colors">
            <TrendingUp className="w-4 h-4" />
            +1.700 usuarios ativos
          </span>
        </div>
      </motion.footer>
    </div>
  );
}

function FeatureRow({ 
  icon: Icon, 
  title,
  desc,
  color
}) {
  const colorClasses = {
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20"
  };

  return (
    <div className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-colors">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${colorClasses[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-white font-medium">{title}</p>
        <p className="text-white/40 text-sm">{desc}</p>
      </div>
    </div>
  );
}

function FeaturePill({ 
  icon: Icon, 
  text 
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors">
      <Icon className="w-4 h-4 text-blue-400" />
      <span className="text-white/70 text-sm">{text}</span>
    </div>
  );
}
