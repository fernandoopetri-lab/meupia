import React from 'react';
import { Helmet } from 'react-helmet';
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

const PessoalPage = ({ onAuthClick }) => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Meu Pila Pessoal - Finanças pelo WhatsApp</title>
        <meta
          name="description"
          content="Registre gastos com texto, áudio ou foto pelo WhatsApp. A IA organiza tudo para você."
        />
      </Helmet>

      <Header onAuthClick={onAuthClick} />
      <main>
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
        <CTASection onAuthClick={onAuthClick} />
        <div id="faq">
          <FAQSection />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PessoalPage;
