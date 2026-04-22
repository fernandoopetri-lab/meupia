;

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  MessageSquare,
  Mic,
  Camera,
  Sparkles,
  LayoutDashboard,
  FileText,
  Bell,
  ArrowDownCircle,
  History,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Registro por mensagem",
    description: "Digite seus gastos em linguagem natural",
  },
  {
    icon: Mic,
    title: "Registro por áudio",
    description: "Fale seus gastos e a IA transcreve tudo",
  },
  {
    icon: Camera,
    title: "Foto de nota fiscal",
    description: "Envie fotos e extraímos os dados automaticamente",
  },
  {
    icon: Sparkles,
    title: "Interpretação com IA",
    description: "Categorização inteligente e automática",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboards financeiros",
    description: "Visualize tudo no portal MEU PILA",
  },
  {
    icon: FileText,
    title: "Relatórios completos",
    description: "Exporte e analise seus dados em detalhes",
  },
  {
    icon: Bell,
    title: "Alertas de contas a pagar",
    description: "Nunca mais perca uma data de vencimento",
  },
  {
    icon: ArrowDownCircle,
    title: "Alertas de contas a receber",
    description: "Acompanhe o que você tem para receber",
  },
  {
    icon: History,
    title: "Histórico completo",
    description: "Todas as movimentações em um só lugar",
  },
];

export function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 lg:py-32 relative" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />

      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">
            Funcionalidades
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
            Tudo que você precisa para controlar suas finanças
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.05, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <div className="bg-card border border-border/50 rounded-2xl p-6 h-full transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
