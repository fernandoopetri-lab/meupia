;

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { MessageSquare, Mic, Camera, ArrowRight, Sparkles, Tag, Wallet, History } from "lucide-react";

const interactionExamples = [
  {
    type: "message",
    icon: MessageSquare,
    label: "Mensagem",
    input: '"Gastei 35 no mercado"',
  },
  {
    type: "audio",
    icon: Mic,
    label: "Áudio",
    input: '"Paguei 80 de gasolina"',
  },
  {
    type: "photo",
    icon: Camera,
    label: "Foto",
    input: "Foto da nota fiscal",
  },
];

const aiActions = [
  { icon: Sparkles, text: "Interpreta a mensagem" },
  { icon: Tag, text: "Categoriza a transação" },
  { icon: Wallet, text: "Atualiza o saldo" },
  { icon: History, text: "Organiza o histórico" },
];

export function SolutionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden" ref={ref}>
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">
            A solução
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
            Um assistente financeiro inteligente{" "}
            <span className="text-primary">no seu WhatsApp.</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Você não precisa mudar seus hábitos. Só precisa conversar.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Input examples */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="space-y-4"
          >
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-6">
              Você envia
            </p>
            {interactionExamples.map((example, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.02, x: 8 }}
                className="group bg-card border border-border/50 rounded-2xl p-5 flex items-center gap-4 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <example.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {example.label}
                  </p>
                  <p className="text-foreground font-medium mt-1">
                    {example.input}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </motion.div>
            ))}
          </motion.div>

          {/* AI actions */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="space-y-4"
          >
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-6">
              A IA faz automaticamente
            </p>
            <div className="bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20 rounded-3xl p-8">
              <div className="grid grid-cols-2 gap-4">
                {aiActions.map((action, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                    className="bg-background/50 backdrop-blur rounded-xl p-4 text-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                      <action.icon className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-sm text-foreground font-medium">
                      {action.text}
                    </p>
                  </motion.div>
                ))}
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 1, duration: 0.5 }}
                className="mt-6 text-center"
              >
                <p className="text-muted-foreground text-sm">
                  Tudo isso em{" "}
                  <span className="text-primary font-semibold">menos de 1 segundo</span>
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
