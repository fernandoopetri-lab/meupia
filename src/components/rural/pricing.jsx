import { motion } from "framer-motion"
import { Check, Star } from "lucide-react"
import { useState } from "react"

const plans = [
  {
    name: "Pessoal",
    price: { monthly: 19.9, annual: 13.93 },
    features: [
      "1 usuário",
      "Controle de receitas e despesas",
      "Múltiplas carteiras de pagamento",
      "Relatórios básicos",
      "Alertas e lembretes",
      "Suporte por email",
    ],
    popular: false,
  },
  {
    name: "Familiar",
    price: { monthly: 24.9, annual: 17.43 },
    features: [
      "Até 2 usuários",
      "Tudo do plano Pessoal",
      "Controle compartilhado de gastos",
      "Metas familiares",
      "Relatórios completos",
      "Suporte prioritário",
    ],
    popular: true,
  },
  {
    name: "Produtor Rural",
    price: { monthly: 34.9, annual: 24.43 },
    features: [
      "Até 3 usuários",
      "Tudo do plano Familiar",
      "Módulo completo de Lavoura",
      "Módulo completo de Pecuária",
      "Relatórios avançados",
      "Suporte dedicado 24/7",
    ],
    popular: false,
  },
]

export function Pricing({ onAuthClick }) {
  const [isAnnual, setIsAnnual] = useState(false)

  return (
    <section id="planos" className="py-20 md:py-32 bg-[#f7f5f0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1a1a1a] mb-4">
            Escolha o plano ideal pra você
          </h2>
          <p className="text-[#1a1a1a]/70 text-lg max-w-2xl mx-auto">
            Todos os planos incluem 30 dias de teste grátis e sem compromisso. Cancele quando quiser.
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center justify-center gap-4 mb-12"
        >
          <span className={`font-medium ${!isAnnual ? "text-[#1a1a1a]" : "text-[#1a1a1a]/50"}`}>
            Mensal
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="relative w-14 h-8 bg-[#1a4d2e] rounded-full transition-colors"
            aria-label="Alternar entre mensal e anual"
          >
            <motion.div
              className="absolute top-1 w-6 h-6 bg-white rounded-full"
              animate={{ left: isAnnual ? "calc(100% - 28px)" : "4px" }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
          <span className={`font-medium ${isAnnual ? "text-[#1a1a1a]" : "text-[#1a1a1a]/50"}`}>
            Anual
          </span>
          <span className="px-3 py-1 bg-[#22c55e] text-white text-sm font-medium rounded-full">
            -30%
          </span>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative rounded-2xl p-6 md:p-8 ${
                plan.popular
                  ? "bg-[#1a4d2e] scale-105 shadow-2xl shadow-[#22c55e]/20 z-10"
                  : "bg-white"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#c9a84c] text-white text-sm font-bold rounded-full flex items-center gap-1">
                  <Star className="w-4 h-4 fill-white" />
                  Mais Popular
                </div>
              )}

              <h3
                className={`text-2xl font-bold mb-2 ${
                  plan.popular ? "text-white" : "text-[#1a1a1a]"
                }`}
              >
                {plan.name}
              </h3>

              <div className="mb-6">
                <span
                  className={`text-4xl md:text-5xl font-bold ${
                    plan.popular ? "text-white" : "text-[#1a1a1a]"
                  }`}
                >
                  R${isAnnual ? plan.price.annual.toFixed(2).replace(".", ",") : plan.price.monthly.toFixed(2).replace(".", ",")}
                </span>
                <span
                  className={`${plan.popular ? "text-white/70" : "text-[#1a1a1a]/60"}`}
                >
                  /mês
                </span>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className={`flex items-start gap-3 ${
                      plan.popular ? "text-white/90" : "text-[#1a1a1a]/80"
                    }`}
                  >
                    <Check
                      className={`w-5 h-5 flex-shrink-0 ${
                        plan.popular ? "text-[#22c55e]" : "text-[#22c55e]"
                      }`}
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={onAuthClick}
                className={`block w-full py-4 text-center font-semibold rounded-full transition-all min-h-[56px] ${
                  plan.popular
                    ? "bg-[#22c55e] text-white hover:bg-white hover:text-[#1a4d2e]"
                    : "bg-[#1a4d2e] text-white hover:bg-[#22c55e]"
                }`}
              >
                Testar Grátis
              </button>
            </motion.div>
          ))}
        </div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center text-[#1a1a1a]/60 mt-8"
        >
          30 dias grátis &bull; Sem cartão de crédito &bull; Cancele quando quiser
        </motion.p>
      </div>
    </section>
  )
}
