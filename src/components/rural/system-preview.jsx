import { motion } from "framer-motion"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const previews = [
  {
    title: "Dashboard Inteligente",
    description: "Visão geral e consolidada de suas finanças em um só lugar.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2940&auto=format&fit=crop",
  },
  {
    title: "Lançamentos Detalhados",
    description: "Registre cada movimentação com categorias, datas e carteiras.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop",
  },
  {
    title: "Gestão de Rebanho",
    description: "Controle seus animais, vacinas, peso e produção de leite.",
    image: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?q=80&w=2873&auto=format&fit=crop",
  },
  {
    title: "Relatórios Completos",
    description: "Entenda seus dados com gráficos interativos e fáceis de ler.",
    image: "https://images.unsplash.com/photo-1543286386-713bdd548da4?q=80&w=2940&auto=format&fit=crop",
  },
]

export function SystemPreview() {
  const [activeIndex, setActiveIndex] = useState(0)

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % previews.length)
  }

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + previews.length) % previews.length)
  }

  return (
    <section id="preview" className="py-20 md:py-32 bg-[#f7f5f0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1a1a1a] mb-4">
            Por Dentro do Meu Pila
          </h2>
          <p className="text-[#1a1a1a]/70 text-lg max-w-2xl mx-auto">
            Explore as principais funcionalidades e veja como podemos transformar sua gestão.
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          <div className="overflow-hidden">
            <motion.div
              className="flex"
              animate={{ x: `-${activeIndex * 100}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {previews.map((preview, index) => (
                <div
                  key={preview.title}
                  className="w-full flex-shrink-0 px-4"
                >
                  <div className="bg-white rounded-2xl overflow-hidden shadow-xl">
                    <div className="relative aspect-video overflow-hidden group">
                      <img
                        src={preview.image}
                        alt={preview.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl md:text-2xl font-bold text-[#1a1a1a] mb-2">
                        {preview.title}
                      </h3>
                      <p className="text-[#1a1a1a]/70">
                        {preview.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#22c55e] hover:text-white transition-colors z-10"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#22c55e] hover:text-white transition-colors z-10"
            aria-label="Próximo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {previews.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  index === activeIndex ? "bg-[#22c55e]" : "bg-[#1a1a1a]/20"
                }`}
                aria-label={`Ver preview ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
