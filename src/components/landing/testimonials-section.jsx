;

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Maria Silva",
    role: "Empreendedora",
    avatar: "MS",
    quote:
      "Agora registro tudo pelo WhatsApp e acompanho no portal. Finalmente consigo ver para onde vai meu dinheiro!",
    rating: 5,
  },
  {
    name: "Carlos Santos",
    role: "Freelancer",
    avatar: "CS",
    quote:
      "As fotos das notas ajudam muito a registrar despesas rápido. Não preciso mais guardar papel nem digitar nada.",
    rating: 5,
  },
  {
    name: "Ana Oliveira",
    role: "Professora",
    avatar: "AO",
    quote:
      "Os lembretes de contas me salvaram várias vezes. Nunca mais paguei multa por atraso!",
    rating: 5,
  },
  {
    name: "Pedro Costa",
    role: "Designer",
    avatar: "PC",
    quote:
      "O áudio é perfeito! Registro meus gastos enquanto dirijo ou estou ocupado. Super prático.",
    rating: 5,
  },
  {
    name: "Julia Ferreira",
    role: "Médica",
    avatar: "JF",
    quote:
      "O dashboard do portal é incrível. Finalmente tenho controle total das minhas finanças.",
    rating: 5,
  },
  {
    name: "Lucas Almeida",
    role: "Estudante",
    avatar: "LA",
    quote:
      "Mesmo com pouco dinheiro, agora consigo economizar. O PILA me ajuda a ver onde posso cortar gastos.",
    rating: 5,
  },
];

export function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 lg:py-32 relative" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />

      <div className="relative mx-auto max-w-7xl px-6 hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">
            Depoimentos
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Quem já usa recomenda
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <div className="bg-card border border-border/50 rounded-2xl p-6 h-full transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 relative">
                {/* Quote icon */}
                <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10 group-hover:text-primary/20 transition-colors" />

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-foreground/90 leading-relaxed mb-6">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-semibold text-sm">
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
