;

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Bell, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";

const alerts = [
  {
    type: "warning",
    icon: AlertCircle,
    title: "Conta de luz vence amanhã",
    description: "R$ 180,00 - Vencimento: 12/03",
    time: "Agora",
    color: "amber",
  },
  {
    type: "info",
    icon: Calendar,
    title: "Parcela do cartão",
    description: "R$ 450,00 - Em 3 dias",
    time: "10:32",
    color: "blue",
  },
  {
    type: "success",
    icon: CheckCircle2,
    title: "Pagamento recebido",
    description: "R$ 1.200,00 de João Silva",
    time: "Ontem",
    color: "green",
  },
];

export function AlertsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 lg:py-32 relative" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Alerts preview */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={isInView ? { opacity: 1, x: 0, scale: 1 } : {}}
                  transition={{ delay: 0.3 + index * 0.15, duration: 0.5 }}
                  whileHover={{ scale: 1.02, x: 8 }}
                  className={`bg-card border rounded-2xl p-5 flex items-start gap-4 cursor-pointer transition-all ${
                    alert.color === "amber"
                      ? "border-amber-500/30 hover:bg-amber-500/5"
                      : alert.color === "blue"
                        ? "border-blue-500/30 hover:bg-blue-500/5"
                        : "border-green-500/30 hover:bg-green-500/5"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      alert.color === "amber"
                        ? "bg-amber-500/10"
                        : alert.color === "blue"
                          ? "bg-blue-500/10"
                          : "bg-green-500/10"
                    }`}
                  >
                    <alert.icon
                      className={`w-6 h-6 ${
                        alert.color === "amber"
                          ? "text-amber-400"
                          : alert.color === "blue"
                            ? "text-blue-400"
                            : "text-green-400"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-foreground">
                        {alert.title}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {alert.time}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {alert.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* WhatsApp notification bubble */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.8 }}
              className="mt-6 flex justify-center"
            >
              <div className="bg-[#075E54] rounded-2xl px-6 py-4 flex items-center gap-4 shadow-xl">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-white font-bold">P</span>
                </div>
                <div>
                  <p className="text-white/70 text-xs">PILA</p>
                  <p className="text-white text-sm">
                    Lembrete: Sua conta de luz vence amanhã
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="order-1 lg:order-2"
          >
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">
              Alertas inteligentes
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
              Nunca mais esqueça uma conta.
            </h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Receba notificações automáticas no WhatsApp sobre suas contas,
              vencimentos e pagamentos. O PILA cuida de tudo para você não
              perder nenhuma data importante.
            </p>

            <ul className="mt-8 space-y-4">
              {[
                "Alertas de contas a pagar",
                "Alertas de contas a receber",
                "Notificações de vencimentos próximos",
                "Resumos semanais automáticos",
              ].map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-foreground">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
