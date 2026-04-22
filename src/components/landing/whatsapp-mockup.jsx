;

import { motion } from "framer-motion";
import { Check, CheckCheck, Mic, Image, Send } from "lucide-react";

const messages = [
  {
    type: "user",
    content: "Gastei 35 no mercado",
    time: "10:32",
  },
  {
    type: "bot",
    content: "Registrado! R$ 35,00 na categoria Mercado. Seu saldo atual é R$ 1.847,00",
    time: "10:32",
  },
  {
    type: "user",
    content: "🎤 Áudio: Paguei 80 de gasolina",
    isAudio: true,
    time: "10:45",
  },
  {
    type: "bot",
    content: "Entendi! R$ 80,00 adicionado em Transporte. Você já gastou R$ 320,00 em combustível este mês.",
    time: "10:45",
  },
];

export function WhatsAppMockup() {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="w-[280px] md:w-[320px] bg-card rounded-3xl shadow-2xl shadow-foreground/10 overflow-hidden border border-border"
    >
      {/* Header */}
      <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/80 flex items-center justify-center">
          <span className="text-white font-bold text-sm">P</span>
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">PILA</p>
          <p className="text-white/70 text-xs">online</p>
        </div>
        <div className="flex gap-4">
          <div className="w-5 h-5 rounded-full bg-white/20" />
          <div className="w-5 h-5 rounded-full bg-white/20" />
        </div>
      </div>

      {/* Messages */}
      <div className="bg-[#0B141A] p-3 space-y-2 h-[320px] overflow-hidden">
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + index * 0.3 }}
            className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 ${
                msg.type === "user"
                  ? "bg-[#005C4B] rounded-tr-none"
                  : "bg-[#1F2C34] rounded-tl-none"
              }`}
            >
              {msg.isAudio ? (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/50 flex items-center justify-center">
                    <Mic className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 h-1 bg-white/30 rounded-full">
                    <div className="w-2/3 h-full bg-white/60 rounded-full" />
                  </div>
                  <span className="text-white/60 text-xs">0:04</span>
                </div>
              ) : (
                <p className="text-white text-sm">{msg.content}</p>
              )}
              <div className="flex items-center justify-end gap-1 mt-1">
                <span className="text-white/50 text-[10px]">{msg.time}</span>
                {msg.type === "user" && (
                  <CheckCheck className="w-3 h-3 text-[#53BDEB]" />
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input */}
      <div className="bg-[#1F2C34] px-3 py-2 flex items-center gap-2">
        <div className="flex-1 bg-[#2A3942] rounded-full px-4 py-2 flex items-center gap-2">
          <span className="text-white/40 text-sm">Mensagem</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
          <Mic className="w-5 h-5 text-white" />
        </div>
      </div>
    </motion.div>
  );
}
