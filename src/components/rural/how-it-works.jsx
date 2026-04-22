import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { UserPlus, Settings, BarChart3, CheckCircle2 } from "lucide-react"

const steps = [
  {
    number: "01",
    title: "Crie sua conta gratis em 2 minutos",
    description: "Cadastro rapido e sem burocracia. Comece a usar imediatamente sem necessidade de cartao de credito.",
    icon: UserPlus,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2940&auto=format&fit=crop",
    features: ["Cadastro simples", "Sem cartao", "Acesso imediato"],
  },
  {
    number: "02",
    title: "Configure suas carteiras e categorias",
    description: "Personalize o sistema para sua realidade. Defina carteiras, categorias, metas e modulos do agro.",
    icon: Settings,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop",
    features: ["Carteiras ilimitadas", "Categorias personalizadas", "Modulos agro"],
  },
  {
    number: "03",
    title: "Acompanhe tudo em tempo real",
    description: "Visualize seus dados com graficos claros, relatorios inteligentes e insights sobre suas financas.",
    icon: BarChart3,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2940&auto=format&fit=crop",
    features: ["Graficos interativos", "Relatorios completos", "Insights automaticos"],
  },
]

export function HowItWorks() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  })

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])

  return (
    <section className="py-24 md:py-36 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-white" />
      
      {/* Subtle farm-inspired pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #1a4d2e 1px, transparent 0)`,
          backgroundSize: '40px 40px'
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
            <span className="text-[#1a4d2e] text-sm font-medium">Simples e Rapido</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1a1a1a] mb-4">
            Em 3 passos voce ja esta
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22c55e] to-[#1a4d2e]">
              no controle
            </span>
          </h2>
        </motion.div>

        <div ref={containerRef} className="relative" style={{ position: "relative" }}>
          {/* Animated Progress Line - Desktop */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-1 bg-[#1a1a1a]/10 -translate-x-1/2 rounded-full overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-[#22c55e] to-[#1a4d2e] rounded-full"
              style={{ height: lineHeight }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-20 lg:space-y-32">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7 }}
                className={`flex flex-col ${
                  index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                } items-center gap-10 lg:gap-20`}
              >
                {/* Text Content */}
                <div className={`flex-1 ${index % 2 === 0 ? "lg:text-right lg:pr-16" : "lg:text-left lg:pl-16"}`}>
                  <div className={`inline-flex items-center gap-4 mb-6 ${index % 2 === 0 ? "lg:flex-row-reverse" : ""}`}>
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#22c55e] to-[#1a4d2e] flex items-center justify-center shadow-lg shadow-[#22c55e]/20"
                    >
                      <step.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <span className="text-[#22c55e] font-bold text-2xl">{step.number}</span>
                  </div>
                  
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#1a1a1a] mb-4">
                    {step.title}
                  </h3>
                  
                  <p className="text-[#1a1a1a]/70 text-lg mb-6 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Feature pills */}
                  <div className={`flex flex-wrap gap-2 ${index % 2 === 0 ? "lg:justify-end" : "lg:justify-start"}`}>
                    {step.features.map((feature) => (
                      <span
                        key={feature}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#22c55e]/10 text-[#1a4d2e] text-sm rounded-full"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Center Dot - Desktop */}
                <motion.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="hidden lg:flex w-8 h-8 rounded-full bg-gradient-to-br from-[#22c55e] to-[#1a4d2e] border-4 border-white shadow-xl z-10 items-center justify-center"
                >
                  <span className="w-2 h-2 bg-white rounded-full" />
                </motion.div>

                {/* Image */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="flex-1 w-full"
                >
                  <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-[#1a1a1a]/10 border border-[#1a1a1a]/5">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-110"
                      style={{ backgroundImage: `url('${step.image}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a4d2e]/30 to-transparent" />
                    
                    {/* Step number overlay */}
                    <div className="absolute bottom-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-[#1a4d2e] font-bold text-xl">{step.number}</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
