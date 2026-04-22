import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, CheckCircle2, Leaf, Tractor, MilkOff } from "lucide-react"
import { useRef } from "react"

const trustBadges = [
  { icon: Leaf, text: "30 dias gratis" },
  { icon: Tractor, text: "Modulos Agro" },
  { icon: MilkOff, text: "Controle de Leite" },
]

export function RuralHero({ onAuthClick }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  })
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <section ref={ref} id="inicio" className="relative min-h-screen flex items-center overflow-hidden" style={{ position: "relative" }}>
      {/* Video/Image Background with Parallax */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{ y: backgroundY }}
      >
        {/* Primary farm image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop')`,
          }}
        />
        
        {/* Gradient overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d1f0f]/98 via-[#0d1f0f]/85 to-[#0d1f0f]/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1f0f] via-transparent to-[#0d1f0f]/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#f7f5f0]" style={{ top: '85%' }} />
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 z-5 overflow-hidden pointer-events-none">
        {/* Floating wheat/grass elements */}
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 right-10 w-32 h-32 opacity-20"
        >
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 95 L50 30 M45 35 Q50 25 50 30 M55 35 Q50 25 50 30 M40 50 Q50 40 50 45 M60 50 Q50 40 50 45 M35 65 Q50 55 50 60 M65 65 Q50 55 50 60 M30 80 Q50 70 50 75 M70 80 Q50 70 50 75" stroke="#22c55e" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        </motion.div>
        
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, -3, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/3 left-5 w-24 h-24 opacity-15"
        >
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 95 L50 30 M45 35 Q50 25 50 30 M55 35 Q50 25 50 30 M40 50 Q50 40 50 45 M60 50 Q50 40 50 45" stroke="#c9a84c" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        </motion.div>
      </div>

      <motion.div 
        style={{ y: textY, opacity }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40"
      >
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#22c55e]/20 to-[#c9a84c]/20 border border-[#22c55e]/40 rounded-full mb-8 backdrop-blur-sm"
            >
              <Leaf className="w-4 h-4 text-[#22c55e]" />
              <span className="text-sm font-medium text-white/90">Plataforma Financeira para o Agronegocio</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-8"
            >
              <span className="text-white">Simplifique sua </span>
              <span className="text-white">vida financeira</span>
              <br />
              <span className="relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22c55e] via-[#4ade80] to-[#c9a84c]">
                  no campo ou na cidade.
                </span>
                <motion.span 
                  className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-[#22c55e] to-[#c9a84c] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1, delay: 0.8 }}
                />
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg md:text-xl text-white/75 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Com o Meu Pila voce controla lavouras, pecuaria, producao de leite e financas pessoais de forma facil, visual e inteligente.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12"
            >
              <button
                onClick={onAuthClick}
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#22c55e] to-[#1a9f4a] text-white font-semibold rounded-full hover:from-[#1a9f4a] hover:to-[#1a4d2e] transition-all hover:scale-105 min-h-[60px] shadow-lg shadow-[#22c55e]/30 pulse-glow"
              >
                Teste Gratis por 30 Dias
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="#preview"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-full hover:bg-white/10 hover:border-white/50 transition-all min-h-[60px] backdrop-blur-sm"
              >
                Ver Demonstracao
              </a>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex flex-wrap gap-6 justify-center lg:justify-start"
            >
              {trustBadges.map((badge, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-2 text-white/80 text-sm bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10"
                >
                  <badge.icon className="w-4 h-4 text-[#22c55e]" />
                  <span>{badge.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right Content - Enhanced Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hidden lg:block"
          >
            <motion.div
              whileHover={{ rotateY: 5, rotateX: -5 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="relative"
              style={{ perspective: 1000 }}
            >
              {/* Glow effect behind card */}
              <div className="absolute -inset-4 bg-gradient-to-r from-[#22c55e]/20 via-[#c9a84c]/10 to-[#22c55e]/20 rounded-3xl blur-2xl" />
              
              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-5 shadow-2xl">
                <div className="bg-gradient-to-br from-[#0d1f0f] to-[#1a2f1a] rounded-2xl p-6 overflow-hidden">
                  {/* Mock Dashboard Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#22c55e] to-[#1a4d2e] flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">MP</span>
                      </div>
                      <div>
                        <p className="text-white font-semibold text-lg">Fazenda Sao Joao</p>
                        <p className="text-white/50 text-sm">Produtor Rural</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white/50 text-xs uppercase tracking-wider">Saldo Total</p>
                      <p className="text-[#22c55e] text-3xl font-bold">R$ 84.520</p>
                    </div>
                  </div>
                  
                  {/* Mini cards row */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-[#22c55e]/20 flex items-center justify-center">
                          <Tractor className="w-3 h-3 text-[#22c55e]" />
                        </div>
                        <span className="text-white/50 text-xs">Lavoura</span>
                      </div>
                      <p className="text-white font-semibold">R$ 42.800</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-[#c9a84c]/20 flex items-center justify-center">
                          <svg className="w-3 h-3 text-[#c9a84c]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C8.5 2 5 4 5 8c0 2 1 3 2 4v8h10v-8c1-1 2-2 2-4 0-4-3.5-6-7-6zm-2 18h4v2h-4v-2z"/>
                          </svg>
                        </div>
                        <span className="text-white/50 text-xs">Pecuaria</span>
                      </div>
                      <p className="text-white font-semibold">R$ 28.200</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                          <MilkOff className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-white/50 text-xs">Leite</span>
                      </div>
                      <p className="text-white font-semibold">R$ 13.520</p>
                    </div>
                  </div>

                  {/* Mock Chart */}
                  <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-white/70 text-sm font-medium">Receita Mensal</span>
                      <span className="text-[#22c55e] text-sm font-semibold">+18.5%</span>
                    </div>
                    <div className="h-24 flex items-end gap-1.5">
                      {[35, 55, 40, 70, 50, 85, 60, 75, 55, 90, 70, 80].map((height, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ delay: 0.8 + i * 0.05, duration: 0.4 }}
                          className="flex-1 bg-gradient-to-t from-[#22c55e] to-[#4ade80] rounded-t opacity-80 hover:opacity-100 transition-opacity"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Mock Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-[#22c55e]/20 to-transparent rounded-xl p-4 border border-[#22c55e]/20">
                      <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Receitas</p>
                      <p className="text-[#22c55e] text-xl font-bold">R$ 125.800</p>
                    </div>
                    <div className="bg-gradient-to-br from-red-500/20 to-transparent rounded-xl p-4 border border-red-500/20">
                      <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Despesas</p>
                      <p className="text-red-400 text-xl font-bold">R$ 41.280</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 bg-gradient-to-r from-[#22c55e] to-[#1a9f4a] text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-xl shadow-[#22c55e]/30 flex items-center gap-2"
              >
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                +R$ 12.500 hoje
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }}
                className="absolute -bottom-4 -left-4 bg-gradient-to-r from-[#c9a84c] to-[#daa520] text-white px-4 py-2 rounded-full text-sm font-semibold shadow-xl shadow-[#c9a84c]/30"
              >
                1.250 litros/dia
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom wave transition */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L48 110C96 100 192 80 288 70C384 60 480 60 576 65C672 70 768 80 864 85C960 90 1056 90 1152 85C1248 80 1344 70 1392 65L1440 60V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z" fill="#f7f5f0"/>
        </svg>
      </div>
    </section>
  )
}
