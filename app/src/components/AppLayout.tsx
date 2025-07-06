import React from 'react';
import Navigation from './Navigation';
import Hero from './Hero';
import HowItWorks from './HowItWorks';
import Partners from './Partners';
import Pricing from './Pricing';
import Documentation from './Documentation';
import Contact from './Contact';
import Footer from './Footer';

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <main>
        <div id="hero">
          <Hero />
        </div>
        <div id="how-it-works">
          <HowItWorks />
        </div>
        <div id="partners">
          <Partners />
        </div>
        <div id="pricing">
          <Pricing />
        </div>
        <div id="docs">
          <Documentation />
        </div>
        <div id="contact">
          <Contact />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;