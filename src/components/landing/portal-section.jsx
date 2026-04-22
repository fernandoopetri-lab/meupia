;

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Wallet,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export function PortalSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden" ref={ref}>
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] opacity-50" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">
              Portal MEU PILA
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
              Tenha uma visão completa das suas finanças.
            </h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Além do WhatsApp, você tem acesso a um portal completo com
              dashboards interativos, gráficos detalhados e relatórios que te
              ajudam a entender para onde vai seu dinheiro.
            </p>

            <ul className="mt-8 space-y-4">
              {[
                { icon: BarChart3, text: "Dashboards financeiros interativos" },
                { icon: PieChart, text: "Gráficos de gastos por categoria" },
                { icon: TrendingUp, text: "Relatórios de evolução mensal" },
                { icon: Wallet, text: "Visão geral do saldo em tempo real" },
                { icon: Calendar, text: "Histórico completo de movimentações" },
              ].map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-foreground">{item.text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Dashboard preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative"
          >
            <div className="bg-card border border-border rounded-3xl p-6 shadow-2xl shadow-foreground/10">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Bem-vindo de volta
                  </p>
                  <p className="text-xl font-semibold text-foreground">
                    Portal MEU PILA
                  </p>
                </div>
                <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  Premium
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.5 }}
                  className="bg-secondary rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Wallet className="w-5 h-5 text-primary" />
                    <span className="flex items-center gap-1 text-xs text-green-400">
                      <ArrowUpRight className="w-3 h-3" />
                      +12%
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    R$ 12.847
                  </p>
                  <p className="text-xs text-muted-foreground">Saldo total</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.6 }}
                  className="bg-secondary rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-5 h-5 text-red-400" />
                    <span className="flex items-center gap-1 text-xs text-red-400">
                      <ArrowDownRight className="w-3 h-3" />
                      -8%
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">R$ 3.245</p>
                  <p className="text-xs text-muted-foreground">Gastos do mês</p>
                </motion.div>
              </div>

              {/* Chart placeholder */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.7 }}
                className="bg-secondary rounded-2xl p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-foreground">
                    Gastos por categoria
                  </p>
                  <p className="text-xs text-muted-foreground">Março 2026</p>
                </div>
                <div className="flex items-end gap-2 h-32">
                  {[65, 45, 80, 35, 55, 70, 40].map((height, index) => (
                    <motion.div
                      key={index}
                      initial={{ height: 0 }}
                      animate={isInView ? { height: `${height}%` } : {}}
                      transition={{ delay: 0.8 + index * 0.05, duration: 0.5 }}
                      className="flex-1 bg-primary/30 rounded-t-md hover:bg-primary/50 transition-colors cursor-pointer"
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-2">
                  {["S", "T", "Q", "Q", "S", "S", "D"].map((day, index) => (
                    <span
                      key={index}
                      className="text-[10px] text-muted-foreground"
                    >
                      {day}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Floating card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1 }}
              className="absolute -bottom-6 -left-6 bg-card border border-border/50 rounded-xl p-4 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    + R$ 2.500
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Salário recebido
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
