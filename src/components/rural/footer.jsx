import { motion, AnimatePresence } from "framer-motion"
import { Leaf, X } from "lucide-react"
import { useState } from "react"

const footerLinks = {
  "Links Rápidos": [
    { label: "Início", href: "#inicio" },
    { label: "Recursos", href: "#recursos" },
    { label: "Planos", href: "#planos" },
  ],
  Recursos: [
    { label: "Dashboard", href: "#preview" },
    { label: "Lavoura", href: "#recursos" },
    { label: "Pecuária", href: "#recursos" },
    { label: "Relatórios", href: "#recursos" },
  ],
  Legal: [
    { label: "Termos de Uso", href: "#", modal: "terms" },
    { label: "Política de Privacidade", href: "#", modal: "privacy" },
    { label: "Suporte", href: "#contato" },
    { label: "FAQ", href: "#faq" },
  ],
  Contato: [
    { label: "contato@meupila.com.br", href: "mailto:contato@meupila.com.br" },
    { label: "(11) 99999-9999", href: "tel:+5511999999999" },
    { label: "São Paulo, SP", href: "#" },
  ],
}

const modalContent = {
  terms: {
    title: "Termos de Uso",
    content: `
      Ao utilizar o Meu Pila, você concorda com os seguintes termos:

      1. ACEITAÇÃO DOS TERMOS
      Ao acessar e usar nossos serviços, você aceita e concorda em cumprir estes termos e condições.

      2. DESCRIÇÃO DO SERVIÇO
      O Meu Pila é uma plataforma de gestão financeira para produtores rurais, famílias e pessoas físicas.

      3. CADASTRO E CONTA
      Você é responsável por manter a confidencialidade de sua conta e senha.

      4. USO ACEITÁVEL
      Você concorda em usar o serviço apenas para fins legais e de acordo com estes termos.

      5. PROPRIEDADE INTELECTUAL
      Todo o conteúdo do Meu Pila é protegido por direitos autorais e outras leis de propriedade intelectual.

      6. LIMITAÇÃO DE RESPONSABILIDADE
      O Meu Pila não se responsabiliza por decisões financeiras tomadas com base nas informações do sistema.

      7. MODIFICAÇÕES
      Reservamos o direito de modificar estes termos a qualquer momento.

      8. LEI APLICÁVEL
      Estes termos são regidos pelas leis brasileiras.
    `,
  },
  privacy: {
    title: "Política de Privacidade",
    content: `
      Esta política descreve como coletamos, usamos e protegemos seus dados pessoais, em conformidade com a LGPD.

      1. DADOS COLETADOS
      Coletamos dados pessoais como nome, e-mail, telefone e informações financeiras que você fornece voluntariamente.

      2. USO DOS DADOS
      Seus dados são utilizados para:
      - Fornecer e melhorar nossos serviços
      - Enviar comunicações relevantes
      - Cumprir obrigações legais

      3. COMPARTILHAMENTO DE DADOS
      Não vendemos seus dados. Compartilhamos apenas quando necessário para fornecer o serviço ou cumprir obrigações legais.

      4. SEGURANÇA DOS DADOS
      Utilizamos criptografia de ponta a ponta e armazenamos seus dados em servidores seguros no Brasil.

      5. SEUS DIREITOS (LGPD)
      Você tem direito a:
      - Acessar seus dados
      - Corrigir dados incorretos
      - Solicitar exclusão de dados
      - Revogar consentimento

      6. COOKIES
      Utilizamos cookies para melhorar sua experiência. Você pode gerenciar suas preferências nas configurações do navegador.

      7. CONTATO
      Para questões sobre privacidade, entre em contato: contato@meupila.com.br
    `,
  },
}

export function RuralFooter() {
  const [openModal, setOpenModal] = useState(null)

  return (
    <>
      <footer className="bg-[#0d1f0f] text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Logo Column */}
            <div className="col-span-2 md:col-span-1">
              <a href="/page-rural" className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#22c55e]/20 flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-[#22c55e]" />
                </div>
                <span className="text-xl font-bold">Meu Pila</span>
              </a>
              <p className="text-white/60 text-sm">
                Controle financeiro simples, do campo à cidade.
              </p>
            </div>

            {/* Link Columns */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="font-bold text-white mb-4">{title}</h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      {"modal" in link && link.modal ? (
                        <button
                          onClick={() => setOpenModal(link.modal)}
                          className="text-white/60 hover:text-[#22c55e] transition-colors text-sm text-left"
                        >
                          {link.label}
                        </button>
                      ) : (
                        <a
                          href={link.href}
                          className="text-white/60 hover:text-[#22c55e] transition-colors text-sm"
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/50 text-sm">
              © 2025 Meu Pila. Todos os direitos reservados.
            </p>
            <p className="text-white/50 text-sm">
              Feito com <span className="text-red-500">❤️</span> no Brasil
            </p>
          </div>
        </div>
      </footer>

      {/* Legal Modals */}
      <AnimatePresence>
        {openModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpenModal(null)}
              className="fixed inset-0 bg-black/60 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-2xl md:max-h-[80vh] bg-white rounded-2xl z-50 overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-[#1a1a1a]">
                  {modalContent[openModal].title}
                </h2>
                <button
                  onClick={() => setOpenModal(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Fechar"
                >
                  <X className="w-5 h-5 text-[#1a1a1a]" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <div className="prose prose-sm max-w-none text-[#1a1a1a]/80 whitespace-pre-line">
                  {modalContent[openModal].content}
                </div>
              </div>
              <div className="p-6 border-t">
                <button
                  onClick={() => setOpenModal(null)}
                  className="w-full py-3 bg-[#22c55e] text-white font-semibold rounded-full hover:bg-[#1a4d2e] transition-colors"
                >
                  Entendi
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
