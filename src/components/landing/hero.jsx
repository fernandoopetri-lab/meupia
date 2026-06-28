;

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Check, ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppMockup } from "./whatsapp-mockup";
import { DashboardMockup } from "./dashboard-mockup";

export function Hero({ onAuthClick }) {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] opacity-30" />
      
      <div className="relative mx-auto max-w-7xl px-6 pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-sm text-primary font-medium">
                Inteligência Artificial Financeira
              </span>
            </motion.div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance leading-[1.1] mb-6">
              Controle suas finanças pelo{" "}
              <span className="text-primary">WhatsApp</span> em segundos.
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
              Envie mensagens, áudios ou fotos de notas, e o PILA interpreta
              tudo automaticamente com inteligência artificial.
            </p>

            {/* Benefits */}
            <ul className="space-y-3 mb-10 text-left max-w-md mx-auto lg:mx-0">
              {[
                "Registre gastos por mensagem, áudio ou foto de nota",
                "Inteligência artificial interpreta e organiza automaticamente",
                "Dashboards completos no portal MEU PILA",
                "Alertas automáticos de contas",
              ].map((benefit, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-foreground/80">{benefit}</span>
                </motion.li>
              ))}
            </ul>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-14 px-8 text-base font-semibold shadow-lg shadow-primary/25"
                onClick={() => navigate("/onboarding")}
              >
                <MessageCircle className="w-5 h-5" />
                Começar agora no WhatsApp
                <ArrowRight className="w-4 h-4" />
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="gap-2 h-14 px-8 text-base border-border/50 hover:bg-secondary"
               
              >
                <Play className="w-4 h-4" />
                <a href="#como-funciona">
                Ver como funciona
                </a>
              </Button>
            </motion.div>
          </motion.div>

          {/* Right content - Floating mockups */}
          <div className="relative h-[500px] lg:h-[600px]">
            <motion.div
              initial={{ opacity: 0, x: 50, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="absolute top-0 right-0 lg:right-[-20px] z-10"
            >
              <WhatsAppMockup />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -50, y: -20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="absolute bottom-0 left-0 lg:left-[-40px]"
            >
              <DashboardMockup />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2"
        >
          <div className="w-1 h-2 rounded-full bg-muted-foreground/50" />
        </motion.div>
      </motion.div>
    </section>
  );
}
