;

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Wallet, CreditCard } from "lucide-react";

export function DashboardMockup() {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="w-[300px] md:w-[380px] bg-card rounded-2xl shadow-2xl shadow-foreground/10 overflow-hidden border border-border p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-muted-foreground text-xs">Portal MEU PILA</p>
          <p className="text-foreground font-semibold">Visão Geral</p>
        </div>
        <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
          Março 2026
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-secondary rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-primary" />
            </div>
          </div>
          <p className="text-muted-foreground text-xs">Saldo</p>
          <p className="text-foreground font-bold text-lg">R$ 4.847</p>
        </div>
        <div className="bg-secondary rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-red-400" />
            </div>
          </div>
          <p className="text-muted-foreground text-xs">Gastos</p>
          <p className="text-foreground font-bold text-lg">R$ 2.153</p>
        </div>
      </div>

      {/* Mini chart */}
      <div className="bg-secondary rounded-xl p-3">
        <div className="flex items-center justify-between mb-3">
          <p className="text-muted-foreground text-xs">Gastos por Categoria</p>
          <div className="flex items-center gap-1 text-primary text-xs">
            <TrendingDown className="w-3 h-3" />
            -12%
          </div>
        </div>
        <div className="space-y-2">
          {[
            { label: "Alimentação", value: 45, color: "bg-primary" },
            { label: "Transporte", value: 25, color: "bg-blue-500" },
            { label: "Lazer", value: 20, color: "bg-amber-500" },
            { label: "Outros", value: 10, color: "bg-muted-foreground" },
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground w-20 truncate">
                {item.label}
              </span>
              <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.value}%` }}
                  transition={{ delay: 1.2 + index * 0.1, duration: 0.5 }}
                  className={`h-full ${item.color} rounded-full`}
                />
              </div>
              <span className="text-[10px] text-foreground font-medium w-8">
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
