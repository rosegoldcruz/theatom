import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Shield, BookOpen } from 'lucide-react';

const Documentation: React.FC = () => {
  return (
    <section className="py-20 bg-black">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Documentation & Resources</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Access comprehensive technical documentation and audit reports
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Executive Summary */}
          <Card className="bg-gray-900 border-gray-700 hover:border-yellow-400 transition-colors">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-black" />
              </div>
              <CardTitle className="text-white">Executive Summary</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-300 mb-4">Comprehensive overview of ATOM technology and market opportunity</p>
              <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </CardContent>
          </Card>
          
          {/* Pitch Deck */}
          <Card className="bg-gray-900 border-gray-700 hover:border-yellow-400 transition-colors">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-black" />
              </div>
              <CardTitle className="text-white">Pitch Deck</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-300 mb-4">Investor presentation with market analysis and financial projections</p>
              <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </CardContent>
          </Card>
          
          {/* Smart Contract Audit */}
          <Card className="bg-gray-900 border-gray-700 hover:border-yellow-400 transition-colors">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-black" />
              </div>
              <CardTitle className="text-white">Audit Report</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-300 mb-4">Full smart contract security audit by leading blockchain security firms</p>
              <Button variant="outline" className="w-full border-gray-400 text-gray-400">
                Coming Soon
              </Button>
            </CardContent>
          </Card>
          
          {/* Technical Docs */}
          <Card className="bg-gray-900 border-gray-700 hover:border-yellow-400 transition-colors">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-black" />
              </div>
              <CardTitle className="text-white">Technical Docs</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-300 mb-4">Developer documentation and API references for integration</p>
              <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black">
                <Download className="w-4 h-4 mr-2" />
                View Docs
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Additional Info */}
        <div className="mt-16 text-center">
          <Card className="bg-gray-800 border-yellow-400 max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Whitepaper Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-6">
                Get detailed technical specifications, economic models, and implementation roadmap. 
                Access requires waitlist registration.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-black px-8">
                  Request Whitepaper Access
                </Button>
                <Button variant="outline" className="border-gray-400 text-white hover:bg-gray-700 px-8">
                  Join Technical Updates
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Documentation;