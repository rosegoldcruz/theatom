'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield, ArrowRight, Activity, TrendingUp, Zap, BarChart3,
  Users, Star, Lock, CheckCircle, Globe, Award, Clock,
  DollarSign, Target, Eye, EyeOff, Wallet
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Navbar } from './Navbar';

export function LandingPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [countdown, setCountdown] = useState(5);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => prev === 1 ? 5 : prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const stats = {
    totalVolume: 127900000,
    successRate: 94.7,
    activeTraders: 4338,
    profitGenerated: 88751400
  };

  const features = [
    {
      icon: Zap,
      title: 'Lightning-Fast Execution',
      description: 'Sub-millisecond execution with advanced routing algorithms',
      metric: '< 50ms latency'
    },
    {
      icon: Shield,
      title: 'Bank-Level Security',
      description: 'Military-grade encryption and SOC 2 compliance',
      metric: 'SOC 2 Certified'
    },
    {
      icon: BarChart3,
      title: 'AI-Powered Analysis',
      description: '24/7 opportunity detection across 50+ exchanges',
      metric: '94.7% accuracy'
    }
  ];

  const trustBadges = [
    { icon: Shield, name: 'SEC Compliant' },
    { icon: Lock, name: '256-bit SSL' },
    { icon: CheckCircle, name: 'Audited' },
    { icon: Globe, name: '99.9% Uptime' }
  ];



  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-50 to-white py-20 overflow-hidden">
        {/* Decorative Atom Symbols */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 opacity-30">
            <div className="w-20 h-20">
              <iframe
                src="https://giphy.com/embed/9oHZQ2gEez8ti"
                width="80"
                height="80"
                className="giphy-embed"
                frameBorder="0"
                allowFullScreen
                title="ATOM Animation"
              />
            </div>
          </div>
          <div className="absolute top-40 right-20 opacity-5">
            <svg width="120" height="120" viewBox="0 0 100 100" className="text-[#00a489]">
              <circle cx="50" cy="50" r="8" fill="currentColor"/>
              <ellipse cx="50" cy="50" rx="35" ry="15" fill="none" stroke="currentColor" strokeWidth="2"/>
              <ellipse cx="50" cy="50" rx="35" ry="15" fill="none" stroke="currentColor" strokeWidth="2" transform="rotate(60 50 50)"/>
              <ellipse cx="50" cy="50" rx="35" ry="15" fill="none" stroke="currentColor" strokeWidth="2" transform="rotate(120 50 50)"/>
            </svg>
          </div>
          <div className="absolute bottom-20 left-1/4 opacity-8">
            <svg width="60" height="60" viewBox="0 0 100 100" className="text-[#00a489]">
              <circle cx="50" cy="50" r="8" fill="currentColor"/>
              <ellipse cx="50" cy="50" rx="35" ry="15" fill="none" stroke="currentColor" strokeWidth="2"/>
              <ellipse cx="50" cy="50" rx="35" ry="15" fill="none" stroke="currentColor" strokeWidth="2" transform="rotate(60 50 50)"/>
              <ellipse cx="50" cy="50" rx="35" ry="15" fill="none" stroke="currentColor" strokeWidth="2" transform="rotate(120 50 50)"/>
            </svg>
          </div>
          <div className="absolute top-32 right-1/3 opacity-6">
            <svg width="100" height="100" viewBox="0 0 100 100" className="text-[#00a489]">
              <circle cx="50" cy="50" r="8" fill="currentColor"/>
              <ellipse cx="50" cy="50" rx="35" ry="15" fill="none" stroke="currentColor" strokeWidth="2"/>
              <ellipse cx="50" cy="50" rx="35" ry="15" fill="none" stroke="currentColor" strokeWidth="2" transform="rotate(60 50 50)"/>
              <ellipse cx="50" cy="50" rx="35" ry="15" fill="none" stroke="currentColor" strokeWidth="2" transform="rotate(120 50 50)"/>
            </svg>
          </div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Messaging */}
            <div className="space-y-8">
              {/* Trust Badge */}
              <div className="inline-flex items-center space-x-2 bg-[#00a489]/10 text-[#00a489] px-4 py-2 rounded-full">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-semibold">SEC Compliant • Bank-Level Security • 99.9% Uptime</span>
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



              {/* Demo Button */}
              <div className="flex justify-center">
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
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-[#383838] mb-2">
                      Access Your Dashboard
                    </h3>
                    <p className="text-gray-600">
                      Trade with confidence on our secure platform
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a489] focus:border-[#00a489] transition-colors"
                        placeholder="you@company.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a489] focus:border-[#00a489] transition-colors pr-12"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5 text-gray-400" />
                          ) : (
                            <Eye className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-[#00a489] focus:ring-[#00a489]"
                        />
                        <span className="ml-2 text-sm text-gray-600">Remember me</span>
                      </label>
                      <a href="#" className="text-sm text-[#00a489] hover:underline">
                        Forgot password?
                      </a>
                    </div>

                    <button
                      onClick={handleLogin}
                      className="w-full bg-[#00a489] text-white py-3 rounded-lg font-semibold hover:bg-[#008a73] transition-colors"
                    >
                      Sign In
                    </button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>
                  
                  {/* Google Auth Button */}
                  <button
                    onClick={async () => {
                      await supabase.auth.signInWithOAuth({
                        provider: 'google',
                        options: {
                          redirectTo: `${window.location.origin}/auth/callback`
                        }
                      })
                    }}
                    className="flex items-center justify-center space-x-3 w-full px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-sm font-medium text-gray-700">
                      Continue with Google
                    </span>
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
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">Next scan:</span>
              <span className="text-white font-mono">00:0{countdown}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 bg-gray-50 overflow-hidden">
        {/* More Decorative Atoms */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-10 opacity-5">
            <svg width="90" height="90" viewBox="0 0 100 100" className="text-[#00a489]">
              <circle cx="50" cy="50" r="8" fill="currentColor"/>
              <ellipse cx="50" cy="50" rx="35" ry="15" fill="none" stroke="currentColor" strokeWidth="2"/>
              <ellipse cx="50" cy="50" rx="35" ry="15" fill="none" stroke="currentColor" strokeWidth="2" transform="rotate(60 50 50)"/>
              <ellipse cx="50" cy="50" rx="35" ry="15" fill="none" stroke="currentColor" strokeWidth="2" transform="rotate(120 50 50)"/>
            </svg>
          </div>
          <div className="absolute bottom-10 left-16 opacity-7">
            <svg width="70" height="70" viewBox="0 0 100 100" className="text-[#00a489]">
              <circle cx="50" cy="50" r="8" fill="currentColor"/>
              <ellipse cx="50" cy="50" rx="35" ry="15" fill="none" stroke="currentColor" strokeWidth="2"/>
              <ellipse cx="50" cy="50" rx="35" ry="15" fill="none" stroke="currentColor" strokeWidth="2" transform="rotate(60 50 50)"/>
              <ellipse cx="50" cy="50" rx="35" ry="15" fill="none" stroke="currentColor" strokeWidth="2" transform="rotate(120 50 50)"/>
            </svg>
          </div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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


      {/* Security Features */}
      <section className="py-20 bg-[#383838]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-white">
              Your Funds Are <span className="text-[#00a489]">Protected</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We implement enterprise-grade security measures to ensure your assets and data remain safe at all times
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Multi-Signature Wallets",
                description: "All funds stored in multi-signature cold wallets with distributed key management"
              },
              {
                icon: Lock,
                title: "Advanced Encryption",
                description: "256-bit encryption for all data with end-to-end secure communication protocols"
              },
              {
                icon: CheckCircle,
                title: "Regulatory Compliance",
                description: "Fully compliant with SEC regulations and SOC 2 Type II certified"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-800 rounded-xl p-8 text-center">
                <div className="w-14 h-14 bg-[#00a489] rounded-lg flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="bg-[#383838] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#00a489] rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">ATOM</span>
              </div>
              <p className="text-gray-400">
                The future of institutional arbitrage trading. Powered by AI, secured by blockchain.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Risk Disclosure</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Compliance</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 ATOM Arbitrage. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Shield className="w-4 h-4" />
                <span>SEC Compliant</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Lock className="w-4 h-4" />
                <span>FINRA Member</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Award className="w-4 h-4" />
                <span>SOC 2 Type II</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}