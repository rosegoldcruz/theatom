import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const Contact: React.FC = () => {
  const founders = [
    {
      name: "Daniel Cruz",
      title: "Co-Founder & Chief Technology Officer",
      specialty: "AI Infrastructure & Automation Architecture",
      image: "👨‍💻"
    },
    {
      name: "David Schutzman", 
      title: "Co-Founder & Chief Financial Officer",
      specialty: "Blockchain Treasury & Contract Oversight",
      image: "👨‍💼"
    }
  ];

  return (
    <section id="contact" className="py-20 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-6xl mx-auto px-4">
        {/* Founders Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Leadership Team
            </span>
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {founders.map((founder, index) => (
              <Card key={index} className="bg-gray-900/50 border-purple-500/20 hover:border-cyan-400/40 transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-4xl">
                    {founder.image}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{founder.name}</h3>
                  <p className="text-base sm:text-lg text-cyan-400 mb-3">{founder.title}</p>
                  <p className="text-sm sm:text-base text-gray-400">{founder.specialty}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gray-900/50 border-purple-500/20">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold">
                <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Secure Contact Form
                </span>
              </CardTitle>
              <p className="text-gray-400 mt-2">Request institutional access or compliance consultation</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName" className="text-white">Full Name *</Label>
                  <Input id="fullName" className="bg-gray-800 border-gray-600 text-white" placeholder="John Doe" />
                </div>
                <div>
                  <Label htmlFor="email" className="text-white">Email *</Label>
                  <Input id="email" type="email" className="bg-gray-800 border-gray-600 text-white" placeholder="john@company.com" />
                </div>
              </div>
              <div>
                <Label htmlFor="company" className="text-white">Company/Institution</Label>
                <Input id="company" className="bg-gray-800 border-gray-600 text-white" placeholder="Your Institution" />
              </div>
              <div>
                <Label htmlFor="message" className="text-white">Message *</Label>
                <Textarea id="message" className="bg-gray-800 border-gray-600 text-white min-h-32" placeholder="Tell us about your arbitrage requirements..." />
              </div>
              <Button className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white py-3">
                Submit Secure Inquiry
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/10 py-4">
            📄 Download Whitepaper
          </Button>
          <Button variant="outline" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 py-4">
            🔍 View Audit Report (Coming Soon)
          </Button>
          <Button variant="outline" className="border-green-500 text-green-400 hover:bg-green-500/10 py-4">
            📞 Book Compliance Call
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Contact;