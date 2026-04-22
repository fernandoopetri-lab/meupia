import { motion, useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { Star } from "lucide-react"

function AnimatedCounter({ target, duration = 2 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    
    let startTime
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      setCount(Math.floor(progress * target))
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)
  }, [isInView, target, duration])

  return <span ref={ref}>{count.toLocaleString('pt-BR')}</span>
}

export function SocialProofBar() {
  return (
    <section className="relative py-8 md:py-10 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1a4d2e] via-[#22663e] to-[#1a4d2e]" />
      
      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 5 L20 35 M15 10 Q20 5 25 10 M15 20 Q20 15 25 20 M15 30 Q20 25 25 30' stroke='%2322c55e' stroke-width='1' fill='none'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16 text-white text-center"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#22c55e]/20 border border-[#22c55e]/30 flex items-center justify-center">
              <span className="text-[#22c55e] text-xl font-bold">+</span>
            </div>
            <p className="text-base md:text-lg text-left">
              <span className="font-bold text-2xl text-[#22c55e]"><AnimatedCounter target={1200} /></span>
              <br />
              <span className="text-white/70 text-sm">produtores e familias</span>
            </p>
          </div>

          <div className="hidden md:block w-px h-12 bg-white/20" />
          
          <div className="flex items-center gap-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-[#c9a84c] text-[#c9a84c]" />
              ))}
            </div>
            <div className="text-left">
              <span className="font-bold text-2xl text-white">4.9</span>
              <span className="text-white/70 text-sm">/5</span>
              <br />
              <span className="text-white/70 text-sm">avaliacao media</span>
            </div>
          </div>

          <div className="hidden md:block w-px h-12 bg-white/20" />

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#c9a84c]/20 border border-[#c9a84c]/30 flex items-center justify-center">
              <span className="text-[#c9a84c] text-lg font-bold">R$</span>
            </div>
            <p className="text-base md:text-lg text-left">
              <span className="font-bold text-2xl text-[#c9a84c]"><AnimatedCounter target={15} />M+</span>
              <br />
              <span className="text-white/70 text-sm">gerenciados na plataforma</span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
