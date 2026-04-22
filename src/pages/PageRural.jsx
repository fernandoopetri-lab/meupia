import React from 'react';
import { Helmet } from 'react-helmet';
import { RuralHeader } from '@/components/rural/header';
import { RuralHero } from '@/components/rural/hero';
import { SocialProofBar } from '@/components/rural/social-proof-bar';
import { HowItWorks } from '@/components/rural/how-it-works';
import { Features } from '@/components/rural/features';
import { AgroModules } from '@/components/rural/agro-modules';
import { Testimonials } from '@/components/rural/testimonials';
import { SystemPreview } from '@/components/rural/system-preview';
import { Pricing } from '@/components/rural/pricing';
import { FAQ } from '@/components/rural/faq';
import { Contact } from '@/components/rural/contact';
import { FinalCTA } from '@/components/rural/final-cta';
import { RuralFooter } from '@/components/rural/footer';

const PageRural = ({ onAuthClick }) => {
  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#1a1a1a]">
      <Helmet>
        <title>Meu Pila Rural - Gestão Financeira para o Campo</title>
        <meta
          name="description"
          content="Controle lavoura, rebanho e resultados em um só lugar. A plataforma de gestão mais simples e completa para o produtor rural brasileiro."
        />
      </Helmet>

      <RuralHeader onAuthClick={onAuthClick} />
      <main>
        <RuralHero onAuthClick={onAuthClick} />
        <SocialProofBar />
        <HowItWorks />
        <Features />
        <AgroModules />
        <Testimonials />
        <SystemPreview />
        <Pricing onAuthClick={onAuthClick} />
        <FAQ />
        <Contact />
        <FinalCTA onAuthClick={onAuthClick} />
      </main>
      <RuralFooter />
    </div>
  );
};

export default PageRural;
