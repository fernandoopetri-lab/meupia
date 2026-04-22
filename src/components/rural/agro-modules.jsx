import { motion } from "framer-motion"
import { ArrowRight, Wheat, Tractor, MilkOff, Leaf, BarChart3 } from "lucide-react"

const modules = [
  {
    title: "Lavoura",
    description: "Controle cada safra, insumo, produtividade e resultado por talhao - saiba quanto cada parte da terra esta rendendo.",
    icon: Wheat,
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=2940&auto=format&fit=crop",
    tags: ["Safras", "Talhoes", "Insumos", "Produtividade"],
    stats: [
      { label: "Talhoes", value: "12" },
      { label: "Hectares", value: "850" },
    ],
    color: "from-[#22c55e] to-[#15803d]",
  },
  {
    title: "Pecuaria",
    description: "Gerencie seu rebanho, vacinas, producao de leite e custos - veja o lucro real do gado e acompanhe a evolucao.",
    icon: Tractor,
    image: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=2948&auto=format&fit=crop",
    tags: ["Rebanho", "Vacinas", "Custos", "Evolucao"],
    stats: [
      { label: "Cabecas", value: "340" },
      { label: "Lotes", value: "8" },
    ],
    color: "from-[#c9a84c] to-[#a67c00]",
  },
  {
    title: "Producao de Leite",
    description: "Acompanhe a producao diaria, valor do litro vendido, custos por animal e rentabilidade do setor leiteiro.",
    icon: MilkOff,
    image: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=2940&auto=format&fit=crop",
    tags: ["Producao Diaria", "Valor/Litro", "Custos", "Rentabilidade"],
    stats: [
      { label: "Litros/dia", value: "1.250" },
      { label: "Vacas", value: "85" },
    ],
    color: "from-white to-gray-200",
    textDark: true,
  },
]

export function AgroModules() {
  return (
    <section className="py-24 md:py-36 relative overflow-hidden">
      {/* Background with earth/farm texture */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d2414] via-[#1a3a20] to-[#0d2414]" />
      
      {/* Decorative patterns */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 5 L50 95 M45 15 Q50 10 55 15 M45 35 Q50 30 55 35 M45 55 Q50 50 55 55 M45 75 Q50 70 55 75' stroke='%2322c55e' stroke-width='2' fill='none'/%3E%3C/svg%3E")`,
          backgroundSize: '100px 100px'
        }} />
      </div>

      {/* Floating decorative elements */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-20 w-40 h-40 opacity-10"
      >
        <Leaf className="w-full h-full text-[#22c55e]" />
      </motion.div>
      
      <motion.div
        animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-40 left-10 w-32 h-32 opacity-10"
      >
        <Wheat className="w-full h-full text-[#c9a84c]" />
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#22c55e]/20 border border-[#22c55e]/30 rounded-full mb-6"
          >
            <Tractor className="w-4 h-4 text-[#22c55e]" />
            <span className="text-[#22c55e] text-sm font-medium">Exclusivo para o Agro</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Modulos especializados
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22c55e] to-[#c9a84c]">
              para quem vive do campo
            </span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Ferramentas desenvolvidas especialmente para a realidade do produtor rural brasileiro
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {modules.map((module, index) => (
            <motion.div
              key={module.title}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: index * 0.15 }}
              whileHover={{ y: -10 }}
              className="group relative"
            >
              {/* Card glow effect */}
              <div className={`absolute -inset-1 bg-gradient-to-r ${module.color} rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
              
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden h-full flex flex-col">
                {/* Image with overlay */}
                <div className="relative h-56 overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${module.image}')` }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.7 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d2414] via-[#0d2414]/50 to-transparent" />
                  
                  {/* Icon badge */}
                  <div className={`absolute top-4 left-4 w-14 h-14 rounded-2xl bg-gradient-to-br ${module.color} flex items-center justify-center shadow-xl`}>
                    <module.icon className={`w-7 h-7 ${module.textDark ? 'text-[#1a1a1a]' : 'text-white'}`} />
                  </div>

                  {/* Stats overlay */}
                  <div className="absolute bottom-4 right-4 flex gap-3">
                    {module.stats.map((stat) => (
                      <div key={stat.label} className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10">
                        <p className="text-white font-bold text-lg">{stat.value}</p>
                        <p className="text-white/60 text-xs">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 flex-1 flex flex-col">
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    {module.title}
                  </h3>
                  <p className="text-white/70 mb-6 flex-1 leading-relaxed">
                    {module.description}
                  </p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {module.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 bg-white/5 text-white/80 text-sm rounded-full border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <a
                    href="#planos"
                    className={`inline-flex items-center gap-2 font-semibold group/link transition-colors ${
                      index === 2 ? 'text-white hover:text-[#c9a84c]' : 'text-[#22c55e] hover:text-white'
                    }`}
                  >
                    Experimentar Gratis
                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom decoration */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-white/5 rounded-full border border-white/10">
            <BarChart3 className="w-5 h-5 text-[#22c55e]" />
            <span className="text-white/80">Relatorios integrados entre todos os modulos</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
