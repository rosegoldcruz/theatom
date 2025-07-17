import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  TrendingUp, 
  Lock, 
  CheckCircle, 
  Activity,
  DollarSign,
  Users,
  Award,
  ChevronRight,
  BarChart3,
  Zap,
  Globe,
  ArrowRight,
  Star
} from 'lucide-react';

export default function HomePage() {
  const [stats, setStats] = useState({
    totalVolume: 127843567,
    activeTraders: 4328,
    successRate: 94.7,
    profitGenerated: 8742156
  });

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animate stats
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        totalVolume: prev.totalVolume + Math.floor(Math.random() * 10000),
        activeTraders: prev.activeTraders + (Math.random() > 0.5 ? 1 : 0),
        successRate: 94.7,
        profitGenerated: prev.profitGenerated + Math.floor(Math.random() * 1000)
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Zap,
      title: "Lightning-Fast Execution",
      description: "Sub-millisecond trade execution with advanced smart routing",
      metric: "< 50ms latency"
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Military-grade encryption and multi-signature wallet protection",
      metric: "SOC 2 Certified"
    },
    {
      icon: BarChart3,
      title: "AI-Powered Analysis",
      description: "Machine learning algorithms identify opportunities 24/7",
      metric: "94.7% accuracy"
    }
  ];

  const trustBadges = [
    { name: "SEC Compliant", icon: Award },
    { name: "FINRA Member", icon: Shield },
    { name: "256-bit SSL", icon: Lock },
    { name: "SOC 2 Type II", icon: CheckCircle }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#00a489] to-[#4cb99f] rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-[#383838]">ATOM Arbitrage</span>
              </div>
              <div className="hidden md:flex space-x-6">
                <a href="#" className="text-[#383838] hover:text-[#00a489] font-medium transition-colors">Platform</a>
                <a href="#" className="text-[#383838] hover:text-[#00a489] font-medium transition-colors">Security</a>
                <a href="#" className="text-[#383838] hover:text-[#00a489] font-medium transition-colors">Pricing</a>
                <a href="#" className="text-[#383838] hover:text-[#00a489] font-medium transition-colors">About</a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-[#383838] hover:text-[#00a489] font-medium transition-colors">
                Sign In
              </button>
              <button className="bg-[#00a489] text-white px-5 py-2 rounded-lg font-medium hover:bg-[#008a73] transition-all transform hover:scale-105">
                Start Trading
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#00a489] rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#4cb99f] rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Messaging */}
            <div className="space-y-8">
              {/* Trust Badge */}
              <div className="inline-flex items-center space-x-2 bg-[#00a489]/10 text-[#00a489] px-4 py-2 rounded-full">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-semibold">SEC Compliant • Bank-Level Security</span>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold text-[#383838] leading-tight">
                  Institutional-Grade
                  <span className="block text-[#00a489]">Arbitrage Trading</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Capture profit opportunities across 50+ exchanges with AI-powered arbitrage detection and automated execution. Join 4,000+ traders earning consistent returns.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-[#00a489]">
                    ${(stats.totalVolume / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-sm text-gray-600">Monthly Volume</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-[#00a489]">
                    {stats.successRate}%
                  </div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-[#00a489] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#008a73] transition-all transform hover:scale-105 flex items-center justify-center space-x-2">
                  <span>Start Trading Now</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="border-2 border-[#00a489] text-[#00a489] px-8 py-4 rounded-lg font-semibold hover:bg-[#00a489]/5 transition-all flex items-center justify-center space-x-2">
                  <span>View Live Demo</span>
                  <Activity className="w-5 h-5" />
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-6 pt-4">
                {trustBadges.map((badge, index) => (
                  <div key={index} className="flex items-center space-x-2 text-gray-600">
                    <badge.icon className="w-5 h-5 text-[#00a489]" />
                    <span className="text-sm font-medium">{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Login Form */}
            <div className="lg:pl-12">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-[#383838]">Access Your Dashboard</h3>
                    <p className="text-gray-600">Trade with confidence on our secure platform</p>
                  </div>
                  
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input 
                        type="email" 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a489] focus:border-transparent transition-all"
                        placeholder="you@company.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                      <input 
                        type="password" 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a489] focus:border-transparent transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="w-4 h-4 text-[#00a489] rounded focus:ring-[#00a489]" />
                        <span className="text-sm text-gray-600">Remember me</span>
                      </label>
                      <a href="#" className="text-sm text-[#00a489] hover:text-[#008a73]">Forgot password?</a>
                    </div>
                    <button className="w-full bg-[#00a489] text-white py-3 rounded-lg font-semibold hover:bg-[#008a73] transition-all transform hover:scale-105">
                      Sign In
                    </button>
                  </form>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">New to ATOM?</span>
                    </div>
                  </div>
                  
                  <button className="w-full border-2 border-[#00a489] text-[#00a489] py-3 rounded-lg font-semibold hover:bg-[#00a489]/5 transition-all">
                    Create Free Account
                  </button>
                  
                  {/* Security Note */}
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <Lock className="w-4 h-4" />
                    <span>256-bit SSL Encrypted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Statistics Bar */}
      <section className="bg-[#383838] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white text-sm">Live Trading</span>
              </div>
              <div className="text-white">
                <span className="text-sm text-gray-400">Active Traders: </span>
                <span className="font-bold">{stats.activeTraders.toLocaleString()}</span>
              </div>
              <div className="text-white">
                <span className="text-sm text-gray-400">24h Profit: </span>
                <span className="font-bold text-green-400">+${(stats.profitGenerated / 1000).toFixed(1)}K</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">Next opportunity scan in:</span>
              <span className="text-white font-mono">00:12</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-[#383838]">
              Why Traders Choose <span className="text-[#00a489]">ATOM</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines institutional-grade infrastructure with cutting-edge AI to deliver consistent arbitrage profits
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-[#00a489] to-[#4cb99f] rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#383838] mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <div className="text-[#00a489] font-semibold">{feature.metric}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-[#383838]">
                Trusted by <span className="text-[#00a489]">4,000+</span> Traders Worldwide
              </h2>
              <p className="text-xl text-gray-600">
                From individual traders to institutional investors, ATOM powers profitable arbitrage strategies at any scale.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-6">
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-[#00a489]">$8.7M+</div>
                  <div className="text-gray-600">Total Profit Generated</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-[#00a489]">50+</div>
                  <div className="text-gray-600">Integrated Exchanges</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-[#00a489]">12ms</div>
                  <div className="text-gray-600">Average Execution Time</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-[#00a489]">99.9%</div>
                  <div className="text-gray-600">Platform Uptime</div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="space-y-6">
                {[1, 2, 3].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex items-start space-x-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-[#00a489] text-[#00a489]" />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-3">
                      "ATOM's arbitrage detection is lightning fast. I've consistently earned 2-3% daily returns with minimal effort. The platform is intuitive and the security is top-notch."
                    </p>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#00a489]/10 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-[#00a489]" />
                      </div>
                      <div>
                        <div className="font-semibold text-[#383838]">Professional Trader</div>
                        <div className="text-sm text-gray-500">Verified User • Trading since 2022</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#00a489] to-[#4cb99f]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Start Earning Arbitrage Profits Today
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of traders who are already profiting from market inefficiencies. 
            No credit card required for your 30-day trial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-[#00a489] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center justify-center space-x-2">
              <span>Create Free Account</span>
              <ChevronRight className="w-5 h-5" />
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-all flex items-center justify-center space-x-2">
              <span>Schedule Demo</span>
              <Globe className="w-5 h-5" />
            </button>
          </div>
          <p className="text-white/80 mt-6 text-sm">
            ✓ 30-day free trial ✓ No credit card required ✓ Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#383838] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#00a489] to-[#4cb99f] rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-white">ATOM Arbitrage</span>
              </div>
              <p className="text-gray-400 text-sm">
                Institutional-grade arbitrage trading platform powered by AI.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Compliance</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Risk Disclosure</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-gray-400 text-sm">
                © 2024 ATOM Arbitrage. All rights reserved. FINRA Member.
              </div>
              <div className="flex space-x-6">
                {trustBadges.map((badge, index) => (
                  <div key={index} className="flex items-center space-x-1 text-gray-400 text-sm">
                    <badge.icon className="w-4 h-4" />
                    <span>{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}