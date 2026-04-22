;

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Preciso instalar algum aplicativo?",
    answer:
      "Não! Tudo funciona diretamente no WhatsApp. Você só precisa adicionar o número do PILA e começar a conversar. Para ver dashboards e relatórios completos, você acessa o portal MEU PILA pelo navegador.",
  },
  {
    question: "Posso enviar áudio?",
    answer:
      "Sim! O sistema interpreta voz automaticamente. Você pode falar seus gastos naturalmente e a IA vai entender, transcrever e registrar tudo corretamente.",
  },
  {
    question: "Posso enviar foto de nota fiscal?",
    answer:
      "Sim! A IA interpreta a imagem da nota fiscal, extrai automaticamente os valores, itens e categorias, e registra tudo para você. É a forma mais rápida de registrar compras maiores.",
  },
  {
    question: "O que é o portal MEU PILA?",
    answer:
      "É o nosso portal web com dashboards e relatórios completos. Lá você pode ver gráficos de gastos por categoria, evolução mensal, histórico detalhado e muito mais. É o complemento perfeito para o WhatsApp.",
  },
  {
    question: "É seguro compartilhar minhas informações financeiras?",
    answer:
      "Absolutamente! Usamos criptografia de ponta a ponta e seguimos as melhores práticas de segurança. Seus dados são protegidos e nunca compartilhados com terceiros.",
  },
  {
    question: "Quanto custa?",
    answer:
      "Você pode começar gratuitamente com funcionalidades básicas. Temos planos premium com dashboards avançados, relatórios ilimitados e suporte prioritário para quem quer ainda mais controle.",
  },
];

export function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 lg:py-32 relative" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />

      <div className="relative mx-auto max-w-3xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">
            FAQ
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Perguntas frequentes
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="bg-card border border-border/50 rounded-xl px-6 data-[state=open]:border-primary/30 transition-colors"
                >
                  <AccordionTrigger className="text-left text-foreground hover:text-primary hover:no-underline py-5 text-base">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
