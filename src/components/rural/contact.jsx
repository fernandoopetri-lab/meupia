import { motion } from "framer-motion"
import { useState } from "react"
import { Send, Mail, Phone, MapPin, Check, Loader2 } from "lucide-react"

export function Contact() {
  const [formState, setFormState] = useState("idle")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = "Nome é obrigatório"
    if (!formData.email.trim()) {
      newErrors.email = "E-mail é obrigatório"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "E-mail inválido"
    }
    if (!formData.message.trim()) newErrors.message = "Mensagem é obrigatória"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setFormState("loading")

    try {
      const response = await fetch("https://formspree.io/f/xkgrjnkd", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormState("success")
        setFormData({ name: "", email: "", message: "" })
      } else {
        setFormState("error")
      }
    } catch {
      setFormState("error")
    }
  }

  return (
    <section id="contato" className="py-20 md:py-32 bg-[#f7f5f0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1a1a1a] mb-4">
            Fale Conosco
          </h2>
          <p className="text-[#1a1a1a]/70 text-lg">
            Tem alguma dúvida ou sugestão? Adoramos ouvir você!
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#1a1a1a] mb-2">
                  Seu nome
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-4 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#22c55e] transition-all min-h-[56px] ${
                    errors.name ? "border-red-500" : "border-[#1a1a1a]/10"
                  }`}
                  placeholder="Digite seu nome"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#1a1a1a] mb-2">
                  Seu e-mail
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-4 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#22c55e] transition-all min-h-[56px] ${
                    errors.email ? "border-red-500" : "border-[#1a1a1a]/10"
                  }`}
                  placeholder="seuemail@exemplo.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-[#1a1a1a] mb-2">
                  Sua mensagem
                </label>
                <textarea
                  id="message"
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className={`w-full px-4 py-4 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#22c55e] transition-all resize-none ${
                    errors.message ? "border-red-500" : "border-[#1a1a1a]/10"
                  }`}
                  placeholder="Como podemos ajudar?"
                />
                {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={formState === "loading"}
                className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-[#22c55e] text-white font-semibold rounded-full hover:bg-[#1a4d2e] transition-all disabled:opacity-50 min-h-[56px]"
              >
                {formState === "loading" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : formState === "success" ? (
                  <>
                    <Check className="w-5 h-5" />
                    Mensagem Enviada!
                  </>
                ) : (
                  <>
                    Enviar Mensagem
                    <Send className="w-5 h-5" />
                  </>
                )}
              </button>

              {formState === "error" && (
                <p className="text-red-500 text-center">
                  Ocorreu um erro. Tente novamente.
                </p>
              )}
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col justify-between"
          >
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#22c55e]/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-[#22c55e]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1a1a1a] mb-1">E-mail</h3>
                  <p className="text-[#1a1a1a]/70">contato@meupila.com.br</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#22c55e]/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-[#22c55e]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1a1a1a] mb-1">Telefone</h3>
                  <p className="text-[#1a1a1a]/70">(11) 99999-9999</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#22c55e]/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-[#22c55e]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1a1a1a] mb-1">Localização</h3>
                  <p className="text-[#1a1a1a]/70">São Paulo, SP - Brasil</p>
                </div>
              </div>
            </div>

            {/* Decorative Illustration */}
            <div className="hidden lg:block mt-12">
              <div className="relative h-48 rounded-2xl overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop')`,
                  }}
                />
                <div className="absolute inset-0 bg-[#1a4d2e]/60" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white text-xl font-bold text-center px-4">
                    Do campo à cidade,<br />estamos com você.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
