import { motion } from "framer-motion"
import { TrendingUp, Wallet, Bell, BarChart2, Users, FolderSync, ArrowRight, Leaf } from "lucide-react"

const features = [
  {
    icon: TrendingUp,
    title: "Lancamentos Simples",
    description: "Registre receitas e despesas em segundos com interface intuitiva.",
    highlighted: false,
  },
  {
    icon: Wallet,
    title: "Multiplas Carteiras",
    description: "Dinheiro, PIX, debito, credito - tudo organizado em um so lugar.",
    highlighted: true,
  },
  {
    icon: Bell,
    title: "Alertas Automaticos",
    description: "Nunca mais esqueca contas a pagar ou receber com notificacoes inteligentes.",
    highlighted: false,
  },
  {
    icon: BarChart2,
    title: "Relatorios Visuais",
    description: "Graficos claros e interativos do seu fluxo de caixa em tempo real.",
    highlighted: false,
  },
  {
    icon: Users,
    title: "Multiusuario",
    description: "Compartilhe com familia ou socios com controle de acesso completo.",
    highlighted: false,
  },
  {
    icon: FolderSync,
    title: "Importacao de Extratos",
    description: "Extratos bancarios e faturas automatizados com sincronizacao rapida.",
    highlighted: false,
  },
]

export function Features() {
  return (
    <section id="recursos" className="py-24 md:py-36 relative overflow-hidden">
      {/* Background with subtle wheat pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#f7f5f0] via-white to-[#f7f5f0]" />
      
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 5 L40 75 M35 15 Q40 10 45 15 M35 35 Q40 30 45 35 M35 55 Q40 50 45 55' stroke='%231a4d2e' stroke-width='2' fill='none'/%3E%3C/svg%3E")`,
          backgroundSize: '80px 80px'
        }} />
      </div>

      {/* Floating leaf decorations */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-32 right-16 opacity-10"
      >
        <Leaf className="w-24 h-24 text-[#22c55e]" />
      </motion.div>
      
      <motion.div
        animate={{ y: [0, 12, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-32 left-10 opacity-10"
      >
        <Leaf className="w-20 h-20 text-[#1a4d2e]" />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-full mb-6"
          >
            <span className="w-2 h-2 bg-[#22c55e] rounded-full animate-pulse" />
            <span className="text-[#1a4d2e] text-sm font-medium">Recursos Completos</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1a1a1a] mb-6">
            Tudo o que voce precisa
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22c55e] to-[#1a4d2e]">
              para ter controle total
            </span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`relative p-8 rounded-3xl transition-all duration-300 ${
                feature.highlighted
                  ? "bg-gradient-to-br from-[#1a4d2e] via-[#22663e] to-[#22c55e] shadow-2xl shadow-[#22c55e]/20 z-10"
                  : "bg-white hover:shadow-2xl hover:shadow-[#22c55e]/10 border border-[#1a1a1a]/5"
              }`}
            >
              {/* Highlighted badge */}
              {feature.highlighted && (
                <div className="absolute -top-3 right-6 px-4 py-1 bg-[#c9a84c] text-white text-xs font-bold rounded-full">
                  Popular
                </div>
              )}

              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
                  feature.highlighted
                    ? "bg-white/20 backdrop-blur-sm"
                    : "bg-gradient-to-br from-[#22c55e]/10 to-[#22c55e]/5"
                }`}
              >
                <feature.icon
                  className={`w-8 h-8 ${
                    feature.highlighted ? "text-white" : "text-[#22c55e]"
                  }`}
                />
              </div>
              
              <h3
                className={`text-xl font-bold mb-3 ${
                  feature.highlighted ? "text-white" : "text-[#1a1a1a]"
                }`}
              >
                {feature.title}
              </h3>
              
              <p
                className={`leading-relaxed ${
                  feature.highlighted ? "text-white/85" : "text-[#1a1a1a]/70"
                }`}
              >
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-center mt-16"
        >
          <a
            href="#planos"
            className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[#22c55e] to-[#1a9f4a] text-white font-semibold rounded-full hover:from-[#1a9f4a] hover:to-[#1a4d2e] transition-all hover:scale-105 shadow-xl shadow-[#22c55e]/30"
          >
            Testar Gratis Agora
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
