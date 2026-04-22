import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { useState } from "react"

const testimonials = [
  {
    name: "João Silva",
    location: "Uberaba, MG",
    role: "Produtor de Soja e Pecuarista",
    quote: "Antes do Meu Pila, eu perdia horas em planilhas. Agora tenho tudo na palma da mão e sei exatamente quanto cada talhão está rendendo.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&fit=crop",
  },
  {
    name: "Maria Oliveira",
    location: "Ribeirão Preto, SP",
    role: "Produtora de Leite",
    quote: "O módulo de pecuária é sensacional. Controlo vacinas, produção de leite e custos de cada animal. Minha rentabilidade aumentou 30%.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=256&h=256&fit=crop",
  },
  {
    name: "Carlos Santos",
    location: "Goiânia, GO",
    role: "Agricultor Familiar",
    quote: "Finalmente um sistema que entende a realidade do campo. Simples de usar e com tudo que preciso para organizar as finanças da família.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&h=256&fit=crop",
  },
]

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1a1a1a] mb-4">
            O que dizem nossos usuários
          </h2>
        </motion.div>

        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: index * 0.1 }}
              className="bg-[#f7f5f0] rounded-2xl p-6 md:p-8"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#c9a84c] text-[#c9a84c]" />
                ))}
              </div>
              <p className="text-[#1a1a1a]/80 mb-6 italic">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-bold text-[#1a1a1a]">{testimonial.name}</p>
                  <p className="text-sm text-[#1a1a1a]/60">{testimonial.location}</p>
                  <p className="text-xs text-[#22c55e]">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-[#f7f5f0] rounded-2xl p-6"
          >
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-[#c9a84c] text-[#c9a84c]" />
              ))}
            </div>
            <p className="text-[#1a1a1a]/80 mb-6 italic min-h-[80px]">
              &ldquo;{testimonials[activeIndex].quote}&rdquo;
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <img
                  src={testimonials[activeIndex].avatar}
                  alt={testimonials[activeIndex].name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-bold text-[#1a1a1a]">{testimonials[activeIndex].name}</p>
                <p className="text-sm text-[#1a1a1a]/60">{testimonials[activeIndex].location}</p>
                <p className="text-xs text-[#22c55e]">{testimonials[activeIndex].role}</p>
              </div>
            </div>
          </motion.div>

          {/* Carousel Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  index === activeIndex ? "bg-[#22c55e]" : "bg-[#1a1a1a]/20"
                }`}
                aria-label={`Ver depoimento ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
