import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "Preciso de cartão de crédito para testar?",
    answer: "Não. O teste gratuito de 30 dias não exige cadastro de cartão. Você só paga se decidir continuar.",
  },
  {
    question: "O Meu Pila funciona no celular?",
    answer: "Sim! O sistema é totalmente responsivo e funciona em qualquer smartphone, tablet ou computador.",
  },
  {
    question: "Posso usar para lavoura e pecuária ao mesmo tempo?",
    answer: "Sim. O plano Produtor Rural inclui os dois módulos completos, sem custo adicional.",
  },
  {
    question: "Como cancelo minha assinatura?",
    answer: "Pelo próprio painel, a qualquer momento, sem burocracia ou taxa de cancelamento.",
  },
  {
    question: "Meus dados estão seguros?",
    answer: "Sim. Utilizamos criptografia de ponta a ponta e todos os dados são armazenados com segurança em servidores brasileiros.",
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1a1a1a] mb-4">
            Perguntas Frequentes
          </h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="border border-[#1a1a1a]/10 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 md:p-6 text-left bg-white hover:bg-[#f7f5f0] transition-colors"
                aria-expanded={openIndex === index}
              >
                <span className="font-medium text-[#1a1a1a] pr-4">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5 text-[#22c55e] flex-shrink-0" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-5 md:px-6 pb-5 md:pb-6 text-[#1a1a1a]/70">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
