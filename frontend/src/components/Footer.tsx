import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t border-purple-500/20 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">ATOM</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                THEATOM.AI
              </span>
            </div>
            <p className="text-gray-400 text-sm">Trustless arbitrage engine powered by AEON's advanced infrastructure.</p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-cyan-400">Dashboard</a></li>
              <li><a href="#" className="hover:text-cyan-400">Documentation</a></li>
              <li><a href="#" className="hover:text-cyan-400">API</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-cyan-400">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-cyan-400">Terms of Service</a></li>
              <li><a href="#" className="hover:text-cyan-400">Compliance</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Connect</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-cyan-400">Twitter</a></li>
              <li><a href="#" className="hover:text-cyan-400">Discord</a></li>
              <li><a href="#" className="hover:text-cyan-400">GitHub</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            © 2024 AEON Investments Technologies LLC. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;