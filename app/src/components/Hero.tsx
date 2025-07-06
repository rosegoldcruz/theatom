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
        {/* Animated ATOM Logo */}
        <div className="mb-8 relative">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-purple-500 via-cyan-400 to-purple-600 rounded-full border-4 border-gray-300 shadow-2xl relative animate-spin-slow">
            <span className="text-white font-bold text-3xl">ATOM</span>
            {/* Orbit rings */}
            <div className="absolute inset-0 border-2 border-cyan-400/30 rounded-full animate-ping"></div>
            <div className="absolute inset-4 border border-purple-400/40 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          <span className="bg-gradient-to-r from-purple-400 via-cyan-300 to-purple-500 bg-clip-text text-transparent">
            THEATOM.AI
          </span>
        </h1>
        
        {/* Tagline */}
        <p className="text-2xl md:text-3xl text-gray-300 mb-4 font-light">
          Your Trustless Arbitrage Engine
        </p>
        <p className="text-lg md:text-xl text-cyan-300 mb-12 font-medium">
          Zero-Risk. Fully Atomic. Always On-Chain.
        </p>
        
        {/* Description */}
        <p className="text-lg text-gray-400 max-w-4xl mx-auto mb-12 leading-relaxed">
          Powered by AEON's Advanced Efficient Optimized Network, ATOM delivers institutional-grade flash loan arbitrage with complete transparency and zero counterparty risk.
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
        
        {/* Contract Address */}
        <div className="mt-8 text-sm text-gray-500">
          <p>Smart Contract: <span className="text-cyan-400 font-mono">0xa395a70b59bdDd537C6a8B33fa0dC3eA9dE068A9</span></p>
        </div>
      </div>
    </section>
  );
};

export default Hero;