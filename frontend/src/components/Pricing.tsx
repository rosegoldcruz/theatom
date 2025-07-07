import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star } from 'lucide-react';

const Pricing: React.FC = () => {
  return (
    <section className="py-20 bg-gray-900">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Early Access Membership</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Join the exclusive early access program for institutional-grade DeFi arbitrage
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Waitlist */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Waitlist Access</CardTitle>
              <div className="text-3xl font-bold text-yellow-400">FREE</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  Priority notifications
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  Whitepaper access
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  Technical documentation
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  Community updates
                </li>
              </ul>
              <Button className="w-full bg-gray-700 hover:bg-gray-600 text-white">
                Join Waitlist
              </Button>
            </CardContent>
          </Card>
          
          {/* Early Access */}
          <Card className="bg-black border-yellow-400 border-2 relative">
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black">
              <Star className="w-4 h-4 mr-1" />
              EXCLUSIVE
            </Badge>
            <CardHeader>
              <CardTitle className="text-white text-2xl">Early Access</CardTitle>
              <div className="text-3xl font-bold text-yellow-400">INVITATION ONLY</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-yellow-400" />
                  Direct platform access
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-yellow-400" />
                  KYC verification
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-yellow-400" />
                  Institutional onboarding
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-yellow-400" />
                  Dedicated support
                </li>
              </ul>
              <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold">
                Request Access
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Verification Steps */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-white mb-8">Verification Process</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 text-black font-bold">1</div>
              <h4 className="text-white font-semibold mb-2">Application</h4>
              <p className="text-gray-400 text-sm">Submit initial request</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 text-black font-bold">2</div>
              <h4 className="text-white font-semibold mb-2">KYC Review</h4>
              <p className="text-gray-400 text-sm">Identity verification</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 text-black font-bold">3</div>
              <h4 className="text-white font-semibold mb-2">Approval</h4>
              <p className="text-gray-400 text-sm">Access granted</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 text-black font-bold">4</div>
              <h4 className="text-white font-semibold mb-2">Onboarding</h4>
              <p className="text-gray-400 text-sm">Platform training</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;