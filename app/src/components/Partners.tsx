import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const Partners: React.FC = () => {
  const partners = [
    {
      name: "AAVE",
      description: "Flash Loan Provider",
      status: "Integrated",
      logo: "🏦"
    },
    {
      name: "Custodia Bank",
      description: "Banking Partner",
      status: "Partnership",
      logo: "🏛️"
    },
    {
      name: "Coinbase Base L2",
      description: "Layer 2 Infrastructure",
      status: "Deployed",
      logo: "⚡"
    },
    {
      name: "Wyoming SPDI",
      description: "Regulatory Compliance",
      status: "Licensed",
      logo: "🛡️"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Partners & Integrations
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Built on institutional-grade infrastructure with full regulatory compliance
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {partners.map((partner, index) => (
            <Card key={index} className="bg-gray-900/50 border-purple-500/20 hover:border-cyan-400/40 transition-all duration-300 group hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-2xl group-hover:animate-pulse">
                  {partner.logo}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{partner.name}</h3>
                <p className="text-gray-400 text-sm mb-3">{partner.description}</p>
                <span className="inline-block px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">
                  {partner.status}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Regulatory Section */}
        <div className="bg-gray-900/30 border border-purple-500/20 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-center text-cyan-400 mb-8">Regulatory Clarity</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">✓</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Wyoming SPDI</h4>
              <p className="text-gray-400 text-sm">Special Purpose Depository Institution license for digital asset custody</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">🔍</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Smart Contract Audit</h4>
              <p className="text-gray-400 text-sm">Third-party security audit in progress (Q1 2024)</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">👤</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">KYC Compliance</h4>
              <p className="text-gray-400 text-sm">Full institutional KYC/AML procedures for qualified investors</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Partners;