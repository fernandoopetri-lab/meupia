import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { ArrowRight, Leaf, Wheat, CheckCircle2 } from "lucide-react"

const benefits = [
  "30 dias gratis",
  "Sem cartao de credito",
  "Cancele quando quiser",
]

export function FinalCTA({ onAuthClick }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const scale = useTransform(scrollYProgress, [0, 0.5], [1.1, 1])

  return (
    <section ref={ref} className="relative py-32 md:py-48 overflow-hidden" style={{ position: "relative" }}>
      {/* Background Image with Parallax */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{ scale }}
      >
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d1f0f]/95 via-[#0d1f0f]/90 to-[#0d1f0f]/85" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1f0f] via-transparent to-[#0d1f0f]/50" />
      </motion.div>

      {/* Floating decorations */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-20 opacity-10"
      >
        <Wheat className="w-32 h-32 text-[#c9a84c]" />
      </motion.div>
      
      <motion.div
        animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-20 left-10 opacity-10"
      >
        <Leaf className="w-28 h-28 text-[#22c55e]" />
      </motion.div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#22c55e]/20 border border-[#22c55e]/30 rounded-full mb-8 backdrop-blur-sm"
        >
          <span className="w-2 h-2 bg-[#22c55e] rounded-full animate-pulse" />
          <span className="text-white/90 text-sm font-medium">Comece sua jornada hoje</span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight"
        >
          <span className="text-white">Pronto para ter </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22c55e] via-[#4ade80] to-[#c9a84c]">
            controle total?
          </span>
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-xl md:text-2xl text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed"
        >
          Junte-se a milhares de produtores e familias que ja simplificaram suas financas com o Meu Pila
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mb-12"
        >
          <button
            onClick={onAuthClick}
            className="group inline-flex items-center justify-center gap-3 px-12 py-6 bg-gradient-to-r from-[#22c55e] to-[#1a9f4a] text-white text-lg font-bold rounded-full hover:from-[#1a9f4a] hover:to-[#1a4d2e] transition-all hover:scale-105 shadow-2xl shadow-[#22c55e]/40 pulse-glow"
          >
            Comecar Gratis Agora
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-6"
        >
          {benefits.map((benefit) => (
            <div
              key={benefit}
              className="flex items-center gap-2 text-white/70"
            >
              <CheckCircle2 className="w-5 h-5 text-[#22c55e]" />
              <span>{benefit}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
