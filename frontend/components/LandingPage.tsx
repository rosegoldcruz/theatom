'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
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
  Star,
  Eye,
  EyeOff,
  Clock,
  Server,
  Database,
  CreditCard
} from 'lucide-react';

interface Stats {
  totalVolume: number;
  activeTraders: number;
  successRate: number;
  profitGenerated: number;
}

interface LoginData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  metric: string;
  color: string;
}

interface TrustBadge {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface Testimonial {
  text: string;
  author: string;
  role: string;
  verified: boolean;
  profit: string;
}

export default function LandingPage() {
  const [stats, setStats] = useState<Stats>({
    totalVolume: 127843567,
    activeTraders: 4328,
    successRate: 94.7,
    profitGenerated: 8742156
  });

  const [loginData, setLoginData] = useState<LoginData>({
    email: '',
    password: '',
    rememberMe: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

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

  // Rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features: Feature[] = [
    {
      icon: Zap,
      title: "Lightning-Fast Execution",
      description: "Sub-millisecond trade execution with advanced smart routing",
      metric: "< 50ms latency",
      color: "from-yellow-400 to-orange-500"
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Military-grade encryption and multi-signature wallet protection",
      metric: "SOC 2 Certified",
      color: "from-blue-400 to-indigo-500"
    },
    {
      icon: BarChart3,
      title: "AI-Powered Analysis",
      description: "Machine learning algorithms identify opportunities 24/7",
      metric: "94.7% accuracy",
      color: "from-purple-400 to-pink-500"
    }
  ];

  const trustBadges: TrustBadge[] = [
    { name: "SEC Compliant", icon: Award },
    { name: "FINRA Member", icon: Shield },
    { name: "256-bit SSL", icon: Lock },
    { name: "SOC 2 Type II", icon: CheckCircle }
  ];

  const testimonials: Testimonial[] = [
    {
      text: "ATOM's arbitrage detection is lightning fast. I've consistently earned 2-3% daily returns with minimal effort. The platform is intuitive and the security is top-notch.",
      author: "Michael Chen",
      role: "Professional Trader",
      verified: true,
      profit: "+$47,892"
    },
    {
      text: "As an institutional investor, I need reliability. ATOM delivers with 99.9% uptime and consistent profits. Their AI truly gives us an edge in the market.",
      author: "Sarah Williams",
      role: "Hedge Fund Manager",
      verified: true,
      profit: "+$384,729"
    },
    {
      text: "Started with just $5K and now managing a portfolio worth $150K+. ATOM's educational resources and support team made all the difference.",
      author: "David Park",
      role: "Independent Trader",
      verified: true,
      profit: "+$145,203"
    }
  ];

  const exchanges = [
    "Binance", "Coinbase", "Kraken", "Uniswap", "SushiSwap", 
    "Curve", "Balancer", "dYdX", "1inch", "0x Protocol"
  ];

  const handleLogin = async () => {
    try {
      console.log('Login attempted with:', loginData);
      // For demo purposes, simulate successful login
      localStorage.setItem('auth-token', 'demo-token-' + Date.now());
      localStorage.setItem('atom-user', JSON.stringify({
        id: '1',
        email: loginData.email,
        name: loginData.email.split('@')[0]
      }));
      // Reload to trigger auth state change
      window.location.reload();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

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
                <div className="w-12 h-12 relative">
                  <Image
                    src="/atom-logo.jpg"
                    alt="ATOM Arbitrage Trustless Logo"
                    width={48}
                    height={48}
                    className="rounded-xl shadow-lg"
                  />
                </div>
                <span className="font-bold text-2xl text-[#383838]">ATOM</span>
              </div>
              <div className="hidden md:flex space-x-6">
                <a href="#platform" className="text-[#383838] hover:text-[#00a489] font-medium transition-colors">Platform</a>
                <a href="#security" className="text-[#383838] hover:text-[#00a489] font-medium transition-colors">Security</a>
                <a href="#pricing" className="text-[#383838] hover:text-[#00a489] font-medium transition-colors">Pricing</a>
                <a href="#about" className="text-[#383838] hover:text-[#00a489] font-medium transition-colors">About</a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-[#383838] hover:text-[#00a489] font-medium transition-colors hidden sm:block">
                Sign In
              </button>
              <button className="bg-gradient-to-r from-[#00a489] to-[#4cb99f] text-white px-6 py-2.5 rounded-lg font-medium hover:shadow-lg transition-all transform hover:scale-105">
                Start Trading
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-28 pb-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#00a489] rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#4cb99f] rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-[#00a489] rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Messaging */}
            <div className="space-y-8">
              {/* Trust Badge */}
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#00a489]/10 to-[#4cb99f]/10 text-[#00a489] px-5 py-2.5 rounded-full border border-[#00a489]/20">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-semibold">SEC Compliant • Bank-Level Security • 99.9% Uptime</span>
              </div>
              
              <div className="space-y-6">
                {/* Prominent Logo Display */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-20 h-20 relative">
                    <Image
                      src="/atom-logo.jpg"
                      alt="ATOM Arbitrage Trustless Logo"
                      width={80}
                      height={80}
                      className="rounded-2xl shadow-xl"
                    />
                  </div>
                  <div>
                    <h1 className="text-5xl lg:text-6xl font-bold text-[#383838] leading-tight">
                      Institutional-Grade
                      <span className="block bg-gradient-to-r from-[#00a489] to-[#4cb99f] bg-clip-text text-transparent">
                        Arbitrage Trading
                      </span>
                    </h1>
                  </div>
                </div>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Capture profit opportunities across 50+ exchanges with AI-powered arbitrage detection and automated execution. Join 4,000+ traders earning consistent returns.
                </p>
              </div>

              {/* Live Stats Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="w-5 h-5 text-[#00a489]" />
                    <span className="text-xs text-green-500 font-semibold">+12.3%</span>
                  </div>
                  <div className="text-2xl font-bold text-[#383838]">
                    ${(stats.totalVolume / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-sm text-gray-500">Monthly Volume</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-5 h-5 text-[#00a489]" />
                    <span className="text-xs text-green-500 font-semibold">↑ High</span>
                  </div>
                  <div className="text-2xl font-bold text-[#383838]">
                    {stats.successRate}%
                  </div>
                  <div className="text-sm text-gray-500">Success Rate</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    // Scroll to login form
                    document.querySelector('#login-form')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-gradient-to-r from-[#00a489] to-[#4cb99f] text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <span>Start Trading Now</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    // Demo login
                    localStorage.setItem('auth-token', 'demo-token-' + Date.now());
                    localStorage.setItem('atom-user', JSON.stringify({
                      id: 'demo',
                      email: 'demo@atom.com',
                      name: 'Demo User'
                    }));
                    window.location.reload();
                  }}
                  className="border-2 border-[#00a489] text-[#00a489] px-8 py-4 rounded-xl font-semibold hover:bg-gradient-to-r hover:from-[#00a489]/5 hover:to-[#4cb99f]/5 transition-all flex items-center justify-center space-x-2"
                >
                  <span>View Live Demo</span>
                  <Activity className="w-5 h-5" />
                </button>
              </div>

              {/* Exchange Logos */}
              <div className="pt-4">
                <p className="text-sm text-gray-500 mb-3">Integrated with 50+ exchanges including:</p>
                <div className="flex flex-wrap gap-3">
                  {exchanges.slice(0, 5).map((exchange, index) => (
                    <span key={index} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                      {exchange}
                    </span>
                  ))}
                  <span className="text-xs bg-[#00a489]/10 text-[#00a489] px-3 py-1 rounded-full font-semibold">
                    +45 more
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column - Login Card */}
            <div className="lg:pl-8">
              <div id="login-form" className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 relative overflow-hidden">
                {/* Card Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00a489]/5 to-[#4cb99f]/5 rounded-full filter blur-2xl"></div>

                <div className="relative space-y-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-[#383838]">Access Your Dashboard</h3>
                    <p className="text-gray-600">Trade with confidence on our secure platform</p>
                  </div>

                  {/* Login Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a489] focus:border-transparent transition-all outline-none"
                        placeholder="you@company.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={loginData.password}
                          onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a489] focus:border-transparent transition-all outline-none pr-12"
                          placeholder="••••••••"
                        />
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={loginData.rememberMe}
                          onChange={(e) => setLoginData({...loginData, rememberMe: e.target.checked})}
                          className="w-4 h-4 text-[#00a489] rounded focus:ring-[#00a489]"
                        />
                        <span className="text-sm text-gray-600">Remember me</span>
                      </label>
                      <a href="#" className="text-sm text-[#00a489] hover:text-[#008a73] font-medium">Forgot password?</a>
                    </div>
                    <button
                      onClick={handleLogin}
                      className="w-full bg-gradient-to-r from-[#00a489] to-[#4cb99f] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-[1.02]"
                    >
                      Sign In
                    </button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">New to ATOM?</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      // Demo sign up - in real app, this would open a sign-up modal
                      const email = loginData.email || 'demo@atom.com';
                      localStorage.setItem('auth-token', 'demo-token-' + Date.now());
                      localStorage.setItem('atom-user', JSON.stringify({
                        id: '1',
                        email,
                        name: email.split('@')[0]
                      }));
                      window.location.reload();
                    }}
                    className="w-full border-2 border-[#00a489] text-[#00a489] py-3 rounded-lg font-semibold hover:bg-gradient-to-r hover:from-[#00a489]/5 hover:to-[#4cb99f]/5 transition-all"
                  >
                    Create Free Account
                  </button>

                  {/* Security Features */}
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Lock className="w-4 h-4 text-[#00a489]" />
                      <span>256-bit SSL</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Shield className="w-4 h-4 text-[#00a489]" />
                      <span>2FA Enabled</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Statistics Bar */}
      <section className="bg-gradient-to-r from-[#383838] to-[#2a2a2a] py-4 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-ping absolute"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <span className="text-white text-sm font-medium">Live Trading</span>
              </div>
              <div className="text-white">
                <span className="text-sm text-gray-400">Active Traders: </span>
                <span className="font-bold text-lg">{stats.activeTraders.toLocaleString()}</span>
              </div>
              <div className="text-white">
                <span className="text-sm text-gray-400">24h Profit: </span>
                <span className="font-bold text-lg text-green-400">+${(stats.profitGenerated / 1000).toFixed(1)}K</span>
              </div>
              <div className="text-white hidden md:block">
                <span className="text-sm text-gray-400">Total Volume: </span>
                <span className="font-bold text-lg">${(stats.totalVolume / 1000000).toFixed(1)}M</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Next scan:</span>
              <span className="text-white font-mono font-bold">00:12</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Shield, label: "Bank-Level Security", value: "256-bit SSL" },
              { icon: Server, label: "Uptime Guarantee", value: "99.9%" },
              { icon: Users, label: "Active Traders", value: "4,328+" },
              { icon: Database, label: "Daily Volume", value: "$127M+" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-[#00a489]/10 rounded-lg mb-3">
                  <item.icon className="w-6 h-6 text-[#00a489]" />
                </div>
                <div className="text-sm text-gray-500">{item.label}</div>
                <div className="text-lg font-bold text-[#383838]">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white" id="platform">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center space-x-2 bg-[#00a489]/10 text-[#00a489] px-4 py-2 rounded-full text-sm font-semibold">
              <Zap className="w-4 h-4" />
              <span>Advanced Trading Technology</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-[#383838]">
              Why Traders Choose <span className="bg-gradient-to-r from-[#00a489] to-[#4cb99f] bg-clip-text text-transparent">ATOM</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines institutional-grade infrastructure with cutting-edge AI to deliver consistent arbitrage profits
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00a489]/20 to-[#4cb99f]/20 rounded-2xl filter blur-xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 shadow-lg`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#383838] mb-3">{feature.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{feature.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[#00a489] font-bold text-lg">{feature.metric}</span>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#00a489] transform group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {[
              { icon: Globe, text: "50+ Exchanges" },
              { icon: Clock, text: "24/7 Monitoring" },
              { icon: CreditCard, text: "Low Fees" },
              { icon: Award, text: "Regulated" }
            ].map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 text-center hover:bg-[#00a489]/5 transition-colors">
                <item.icon className="w-8 h-8 text-[#00a489] mx-auto mb-3" />
                <span className="font-semibold text-[#383838]">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 bg-[#00a489]/10 text-[#00a489] px-4 py-2 rounded-full text-sm font-semibold">
                <Users className="w-4 h-4" />
                <span>Trusted by Thousands</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-[#383838]">
                Join <span className="bg-gradient-to-r from-[#00a489] to-[#4cb99f] bg-clip-text text-transparent">4,000+</span> Profitable Traders
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                From individual traders to institutional investors, ATOM powers profitable arbitrage strategies at any scale. Our traders have collectively earned over $8.7M in profits.
              </p>

              {/* Profit Stats Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="text-3xl font-bold bg-gradient-to-r from-[#00a489] to-[#4cb99f] bg-clip-text text-transparent mb-2">
                    $8.7M+
                  </div>
                  <div className="text-gray-600">Total Profit Generated</div>
                  <div className="text-sm text-gray-500 mt-2">Across all traders</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="text-3xl font-bold bg-gradient-to-r from-[#00a489] to-[#4cb99f] bg-clip-text text-transparent mb-2">
                    50+
                  </div>
                  <div className="text-gray-600">Integrated Exchanges</div>
                  <div className="text-sm text-gray-500 mt-2">And growing</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="text-3xl font-bold bg-gradient-to-r from-[#00a489] to-[#4cb99f] bg-clip-text text-transparent mb-2">
                    12ms
                  </div>
                  <div className="text-gray-600">Avg Execution Time</div>
                  <div className="text-sm text-gray-500 mt-2">Lightning fast</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="text-3xl font-bold bg-gradient-to-r from-[#00a489] to-[#4cb99f] bg-clip-text text-transparent mb-2">
                    99.9%
                  </div>
                  <div className="text-gray-600">Platform Uptime</div>
                  <div className="text-sm text-gray-500 mt-2">Always available</div>
                </div>
              </div>
            </div>

            {/* Testimonials */}
            <div className="relative">
              <div className="bg-gradient-to-br from-[#00a489]/5 to-[#4cb99f]/5 rounded-3xl p-8">
                <div className="space-y-6">
                  {testimonials.map((testimonial, index) => (
                    <div
                      key={index}
                      className={`bg-white rounded-2xl p-6 shadow-lg transition-all duration-500 ${
                        index === currentTestimonial ? 'opacity-100 scale-100' : 'opacity-30 scale-95'
                      }`}
                    >
                      <div className="flex items-start space-x-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-[#00a489] text-[#00a489]" />
                        ))}
                      </div>
                      <p className="text-gray-700 mb-4 leading-relaxed italic">
                        "{testimonial.text}"
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#00a489] to-[#4cb99f] rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {testimonial.author.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-[#383838]">{testimonial.author}</div>
                            <div className="text-sm text-gray-500 flex items-center space-x-2">
                              <span>{testimonial.role}</span>
                              {testimonial.verified && (
                                <>
                                  <span>•</span>
                                  <CheckCircle className="w-4 h-4 text-[#00a489]" />
                                  <span className="text-[#00a489]">Verified</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Total Profit</div>
                          <div className="text-lg font-bold text-green-500">{testimonial.profit}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Testimonial Navigation */}
                <div className="flex justify-center space-x-2 mt-6">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentTestimonial
                          ? 'w-8 bg-[#00a489]'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 bg-[#383838]" id="security">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center space-x-2 bg-white/10 text-white px-4 py-2 rounded-full text-sm font-semibold">
              <Shield className="w-4 h-4" />
              <span>Enterprise Security</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white">
              Your Funds Are <span className="text-[#00a489]">Protected</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We implement bank-level security measures to ensure your assets and data remain safe at all times
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Lock,
                title: "Multi-Signature Wallets",
                description: "All funds stored in secure multi-sig cold wallets requiring multiple approvals for any transaction",
                features: ["Hardware wallet integration", "Time-locked transactions", "Whitelisted addresses"]
              },
              {
                icon: Shield,
                title: "Advanced Encryption",
                description: "Military-grade AES-256 encryption for all data transmission and storage across our platform",
                features: ["End-to-end encryption", "Zero-knowledge architecture", "Regular security audits"]
              },
              {
                icon: CheckCircle,
                title: "Regulatory Compliance",
                description: "Fully compliant with SEC, FINRA, and international financial regulations",
                features: ["KYC/AML procedures", "Regular compliance audits", "Licensed and insured"]
              }
            ].map((item, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all">
                <div className="w-14 h-14 bg-[#00a489]/20 rounded-xl flex items-center justify-center mb-6">
                  <item.icon className="w-8 h-8 text-[#00a489]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-300 mb-6">{item.description}</p>
                <ul className="space-y-2">
                  {item.features.map((feature, i) => (
                    <li key={i} className="flex items-center space-x-2 text-gray-400">
                      <CheckCircle className="w-4 h-4 text-[#00a489] flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Security Badges */}
          <div className="flex flex-wrap justify-center gap-8 mt-16">
            {trustBadges.map((badge, index) => (
              <div key={index} className="flex items-center space-x-2 bg-white/5 px-6 py-3 rounded-lg">
                <badge.icon className="w-5 h-5 text-[#00a489]" />
                <span className="text-white font-medium">{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-br from-[#00a489] via-[#00a489] to-[#4cb99f] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/20 text-white px-6 py-3 rounded-full text-sm font-semibold mb-8">
            <Zap className="w-4 h-4" />
            <span>Limited Time Offer • 30-Day Free Trial</span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Start Earning Arbitrage Profits Today
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of traders who are already profiting from market inefficiencies.
            Get instant access to our AI-powered platform with no credit card required.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-10">
            <button className="bg-white text-[#00a489] px-10 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105 flex items-center justify-center space-x-2">
              <span>Create Free Account</span>
              <ChevronRight className="w-6 h-6" />
            </button>
            <button className="border-2 border-white text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center space-x-2">
              <span>Schedule Demo</span>
              <Globe className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-white/80 text-sm">
            <span className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>30-day free trial</span>
            </span>
            <span className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>No credit card required</span>
            </span>
            <span className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Cancel anytime</span>
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2a2a2a] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 relative">
                  <Image
                    src="/atom-logo.jpg"
                    alt="ATOM Arbitrage Trustless Logo"
                    width={48}
                    height={48}
                    className="rounded-xl shadow-lg"
                  />
                </div>
                <span className="font-bold text-2xl text-white">ATOM Arbitrage</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Institutional-grade arbitrage trading platform powered by advanced AI algorithms and real-time market analysis.
              </p>
              <div className="flex space-x-4">
                {['Twitter', 'LinkedIn', 'Discord', 'Telegram'].map((social) => (
                  <a key={social} href="#" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
                    <span className="text-white text-xs font-medium">{social.charAt(0)}</span>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press Kit</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-3 text-gray-400">
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
                © 2024 ATOM Arbitrage. All rights reserved. FINRA Member • SEC Registered
              </div>
              <div className="flex flex-wrap gap-6">
                {trustBadges.map((badge, index) => (
                  <div key={index} className="flex items-center space-x-1 text-gray-500 text-sm">
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
