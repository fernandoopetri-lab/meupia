import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, DollarSign } from 'lucide-react';
import { Header } from '@/components/landing/header';
import { Hero } from '@/components/landing/hero';
import { ProblemSection } from '@/components/landing/problem-section';
import { SolutionSection } from '@/components/landing/solution-section';
import { HowItWorks } from '@/components/landing/how-it-works';
import { FeaturesSection } from '@/components/landing/features-section';
import { PortalSection } from '@/components/landing/portal-section';
import { AlertsSection } from '@/components/landing/alerts-section';
import { ComparisonSection } from '@/components/landing/comparison-section';
import { TestimonialsSection } from '@/components/landing/testimonials-section';
import { CTASection } from '@/components/landing/cta-section';
import { FAQSection } from '@/components/landing/faq-section';
import { Footer } from '@/components/landing/footer';

const floatingDecorations = [
  { icon: MessageCircle, size: 'w-7 h-7', color: 'text-emerald-500/30', left: '8%', top: '14%', duration: 7.5, delay: 0.2, rotate: -8 },
  { icon: DollarSign, size: 'w-8 h-8', color: 'text-green-500/25', left: '84%', top: '18%', duration: 8.8, delay: 0.5, rotate: 12 },
  { icon: MessageCircle, size: 'w-10 h-10', color: 'text-emerald-400/20', left: '88%', top: '44%', duration: 9.6, delay: 0.1, rotate: -14 },
  { icon: DollarSign, size: 'w-7 h-7', color: 'text-green-400/30', left: '12%', top: '54%', duration: 7.9, delay: 0.9, rotate: 6 },
  { icon: MessageCircle, size: 'w-9 h-9', color: 'text-emerald-500/25', left: '20%', top: '82%', duration: 10.2, delay: 0.4, rotate: 10 },
  { icon: DollarSign, size: 'w-9 h-9', color: 'text-green-500/20', left: '78%', top: '78%', duration: 8.3, delay: 0.7, rotate: -10 },
];

const PessoalPage = ({ onAuthClick }) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Helmet>
        <title>Meu Pila Pessoal - Finanças pelo WhatsApp</title>
        <meta
          name="description"
          content="Registre gastos com texto, áudio ou foto pelo WhatsApp. A IA organiza tudo para você."
        />
      </Helmet>

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(34,197,94,0.14),transparent_30%),radial-gradient(circle_at_86%_14%,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_70%_68%,rgba(59,130,246,0.08),transparent_35%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.88),rgba(248,250,252,0.9),rgba(255,255,255,0.92))] dark:bg-[linear-gradient(to_bottom,rgba(2,6,23,0.8),rgba(2,6,23,0.86),rgba(2,6,23,0.82))]" />

        {floatingDecorations.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={`${item.left}-${item.top}-${index}`}
              className="absolute"
              style={{ left: item.left, top: item.top }}
              initial={{ y: 0, rotate: item.rotate, opacity: 0.45 }}
              animate={{ y: [-10, 12, -8], rotate: [item.rotate, item.rotate + 6, item.rotate - 4], opacity: [0.35, 0.6, 0.35] }}
              transition={{ duration: item.duration, repeat: Infinity, ease: 'easeInOut', delay: item.delay }}
            >
              <div className="rounded-2xl p-3 backdrop-blur-[1.5px] bg-white/20 dark:bg-white/5 shadow-lg shadow-emerald-500/10">
                <Icon className={`${item.size} ${item.color}`} />
              </div>
            </motion.div>
          );
        })}
      </div>

      <Header onAuthClick={onAuthClick} />
      <main className="relative z-10">
        <Hero onAuthClick={onAuthClick} />
        <ProblemSection />
        <SolutionSection />
        <div id="como-funciona">
          <HowItWorks />
        </div>
        <div id="funcionalidades">
          <FeaturesSection />
        </div>
        <div id="portal">
          <PortalSection />
        </div>
        <AlertsSection />
        <ComparisonSection />
        <TestimonialsSection />
        <CTASection onAuthClick={() => navigate("/onboarding")} />
        <div id="faq">
          <FAQSection />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PessoalPage;
