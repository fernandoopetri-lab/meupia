;

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { X, Check, ArrowRight } from "lucide-react";

const beforeItems = [
  "Planilhas complicadas",
  "Gastos esquecidos",
  "Contas vencendo",
  "Falta de controle",
  "Apps difíceis de usar",
  "Registro manual tedioso",
];

const afterItems = [
  "Registro por mensagem ou áudio",
  "Organização automática com IA",
  "Alertas automáticos",
  "Dashboards claros",
  "Simples como mandar uma mensagem",
  "Zero esforço manual",
];

export function ComparisonSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">
            Transformação
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Antes vs Depois
          </h2>
        </motion.div>

        <div className="grid gap-6 md:gap-8 max-w-6xl mx-auto md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-stretch">
          {/* Before */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            whileHover={{
              y: -8,
              rotateX: 4,
              rotateY: -4,
              scale: 1.015,
            }}
            style={{ transformStyle: "preserve-3d" }}
            className="relative group perspective-[1400px]"
          >
            <div className="bg-card border border-red-500/20 rounded-3xl p-6 md:p-8 h-full shadow-sm transition-all duration-500 group-hover:border-red-400/35 group-hover:shadow-2xl group-hover:shadow-red-500/10 overflow-hidden">
              <div className="pointer-events-none absolute -top-16 -left-16 w-48 h-48 rounded-full bg-red-500/10 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-red-500/[0.08] via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                  <X className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Antes</h3>
              </div>
              <ul className="space-y-4">
                {beforeItems.map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
                    className="flex items-center gap-3 transition-transform duration-300 group-hover:translate-x-1"
                  >
                    <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                      <X className="w-3 h-3 text-red-400" />
                    </div>
                    <span className="text-muted-foreground">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Arrow for mobile */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.55, duration: 0.4 }}
            className="flex md:hidden items-center justify-center"
          >
            <div className="w-12 h-12 rounded-full bg-primary/90 items-center justify-center flex shadow-lg shadow-primary/20">
              <ArrowRight className="w-5 h-5 text-primary-foreground rotate-90" />
            </div>
          </motion.div>

          {/* Arrow for desktop */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.65, type: "spring" }}
            className="hidden md:flex items-center justify-center px-1"
          >
            <div className="w-14 h-14 rounded-full bg-primary items-center justify-center flex shadow-lg shadow-primary/30">
              <ArrowRight className="w-5 h-5 text-primary-foreground" />
            </div>
          </motion.div>

          {/* After */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
            whileHover={{
              y: -10,
              rotateX: 5,
              rotateY: 5,
              scale: 1.02,
            }}
            style={{ transformStyle: "preserve-3d" }}
            className="relative group perspective-[1400px]"
          >
            <div className="bg-gradient-to-br from-primary/10 via-card to-card border border-primary/30 rounded-3xl p-6 md:p-8 h-full shadow-md transition-all duration-500 group-hover:border-primary/50 group-hover:shadow-2xl group-hover:shadow-primary/20 overflow-hidden">
              <div className="pointer-events-none absolute -top-20 -right-16 w-56 h-56 rounded-full bg-primary/20 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.2),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.12),transparent_40%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Com PILA
                </h3>
              </div>
              <ul className="space-y-4">
                {afterItems.map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                    className="flex items-center gap-3 transition-transform duration-300 group-hover:translate-x-1.5"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-foreground font-medium">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-3xl blur-xl opacity-50 -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
