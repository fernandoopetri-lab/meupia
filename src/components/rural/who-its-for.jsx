import { motion } from "framer-motion"
import { ArrowRight, Tractor, Users, User } from "lucide-react"

const segments = [
  {
    number: "01",
    title: "Produtor Rural",
    description: "Controle financeiro completo para sua fazenda, com modulos especializados em lavoura, pecuaria e producao de leite.",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2940&auto=format&fit=crop",
    icon: Tractor,
    color: "from-[#22c55e] to-[#1a4d2e]",
  },
  {
    number: "02",
    title: "Familia",
    description: "Organize as financas de toda a familia em um so lugar, com controle compartilhado e metas conjuntas.",
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=2940&auto=format&fit=crop",
    icon: Users,
    color: "from-[#c9a84c] to-[#a67c00]",
  },
  {
    number: "03",
    title: "Pessoal",
    description: "Tenha controle total das suas financas pessoais, onde quer que voce esteja.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2940&auto=format&fit=crop",
    icon: User,
    color: "from-[#3b82f6] to-[#1d4ed8]",
  },
]

export function WhoItsFor() {
  return (
    <section id="quem-somos" className="py-24 md:py-36 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#f7f5f0] to-white" />
      
      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #1a4d2e 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
      </div>

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
            <span className="text-[#1a4d2e] text-sm font-medium">Para Todos os Perfis</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1a1a1a] mb-4">
            Feito pra quem quer ter
            <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22c55e] to-[#1a4d2e]">
              o controle na palma da mao
            </span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {segments.map((segment, index) => (
            <motion.div
              key={segment.number}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: index * 0.15 }}
              whileHover={{ y: -10 }}
              className="group relative h-[450px] md:h-[520px] rounded-3xl overflow-hidden cursor-pointer"
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url('${segment.image}')` }}
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1f0f] via-[#0d1f0f]/60 to-transparent" />
              
              {/* Decorative glow */}
              <div className={`absolute -inset-1 bg-gradient-to-br ${segment.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl`} />

              {/* Icon badge */}
              <div className={`absolute top-6 left-6 w-14 h-14 rounded-2xl bg-gradient-to-br ${segment.color} flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform duration-300`}>
                <segment.icon className="w-7 h-7 text-white" />
              </div>

              {/* Content */}
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                <span className="text-[#22c55e] text-sm font-bold mb-2 tracking-wider">{segment.number}</span>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  {segment.title}
                </h3>
                <p className="text-white/80 text-sm md:text-base mb-6 leading-relaxed">
                  {segment.description}
                </p>
                
                {/* CTA - appears on hover */}
                <a
                  href="#planos"
                  className="inline-flex items-center gap-2 text-[#22c55e] font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-2"
                >
                  Comecar Agora
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
