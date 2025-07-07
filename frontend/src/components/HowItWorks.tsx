import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: "01",
      title: "Borrow",
      description: "Flash loan initiated from AAVE protocol with zero collateral required",
      icon: "💰"
    },
    {
      number: "02", 
      title: "Swap",
      description: "Execute atomic arbitrage across DEX protocols in a single transaction",
      icon: "🔄"
    },
    {
      number: "03",
      title: "Repay",
      description: "Automatically repay loan + fees, profit extracted atomically",
      icon: "✅"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              How ATOM Works
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Three-step atomic arbitrage execution with zero counterparty risk
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="bg-gray-900/50 border-purple-500/20 hover:border-cyan-400/40 transition-all duration-300 group">
              <CardHeader className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <div className="text-6xl font-bold text-purple-400/30 mb-2">
                  {step.number}
                </div>
                <CardTitle className="text-2xl text-white">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-center leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Technical Details */}
        <div className="mt-16 text-center">
          <div className="bg-gray-900/30 border border-purple-500/20 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-cyan-400 mb-4">Fully Trustless Architecture</h3>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Smart Contract Security</h4>
                <ul className="text-gray-400 space-y-1">
                  <li>• Reentrancy protection built-in</li>
                  <li>• No admin keys or backdoors</li>
                  <li>• Immutable arbitrage logic</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Protocol Integration</h4>
                <ul className="text-gray-400 space-y-1">
                  <li>• AAVE flash loan provider</li>
                  <li>• Coinbase Base L2 optimized</li>
                  <li>• Multi-DEX routing support</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;