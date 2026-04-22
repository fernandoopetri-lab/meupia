;

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { FileSpreadsheet, Smartphone, PenLine, Bell } from "lucide-react";

const problems = [
  {
    icon: FileSpreadsheet,
    title: "Planilhas complicadas",
    description: "Perder horas organizando números que nunca batem",
  },
  {
    icon: Smartphone,
    title: "Aplicativos difíceis",
    description: "Apps cheios de botões que você nunca vai usar",
  },
  {
    icon: PenLine,
    title: "Registro manual de gastos",
    description: "Ter que anotar cada centavo no fim do dia",
  },
  {
    icon: Bell,
    title: "Esquecer contas",
    description: "Juros e multas por contas que passaram despercebidas",
  },
];

export function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 lg:py-32 relative" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />
      
      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">
            O problema
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
            Controlar dinheiro ainda é{" "}
            <span className="text-muted-foreground">complicado demais.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative"
            >
              <div className="bg-card border border-border/50 rounded-2xl p-6 h-full transition-all duration-300 hover:border-red-500/30 hover:bg-red-500/5">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4 group-hover:bg-red-500/20 transition-colors">
                  <problem.icon className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {problem.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {problem.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center text-muted-foreground text-lg mt-12 max-w-2xl mx-auto"
        >
          A maioria das pessoas não sabe para onde vai seu dinheiro porque{" "}
          <span className="text-foreground font-medium">
            as ferramentas atuais não foram feitas para a vida real.
          </span>
        </motion.p>
      </div>
    </section>
  );
}
