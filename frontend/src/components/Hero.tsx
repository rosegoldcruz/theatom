import React from 'react';
import { Button } from '@/components/ui/button';

const Hero: React.FC = () => {
  return (
    <section className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="max-w-6xl mx-auto text-center relative z-10">
        {/* ATOM Logo with correct image */}
        <div className="mb-8 relative">
          <div className="inline-flex items-center justify-center w-32 h-32 relative">
            <img 
              src="https://d64gsuwffb70l.cloudfront.net/686038f307d9dd2be3c229d1_1751848002115_bbf861ce.png" 
              alt="ATOM Logo" 
              className="w-full h-full object-contain animate-spin-slow"
            />
            {/* Orbit rings */}
            <div className="absolute inset-0 border-2 border-cyan-400/30 rounded-full animate-ping"></div>
            <div className="absolute inset-4 border border-purple-400/40 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        {/* Main Heading - Just "THE ATOM" */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          <span className="bg-gradient-to-r from-purple-400 via-cyan-300 to-purple-500 bg-clip-text text-transparent">
            THE ATOM
          </span>
        </h1>
        
        {/* Acronym explanation */}
        <p className="text-2xl md:text-3xl text-gray-300 mb-4 font-light">
          Arbitrage Trustless On-chain Module
        </p>
        
        {/* Updated description */}
        <p className="text-lg md:text-xl text-cyan-300 mb-8 font-medium">
          Zero Risk. Fully Atomic. Always On-Chain.
        </p>
        
        <p className="text-lg text-gray-400 max-w-4xl mx-auto mb-12 leading-relaxed">
          Powered by AEON's Advanced Efficient Optimized Network. The Atom delivers institutional grade flash loan arbitrage with complete transparency and zero counterparty risk.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold px-8 py-4 text-lg rounded-lg shadow-lg transform hover:scale-105 transition-all">
            Request Institutional Access
          </Button>
          <Button variant="outline" className="border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 px-8 py-4 text-lg rounded-lg">
            Download Whitepaper
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;