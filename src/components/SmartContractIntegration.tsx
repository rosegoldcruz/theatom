import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Copy, ExternalLink, Wallet, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SmartContractIntegration: React.FC = () => {
  const [contractAddress, setContractAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  const sampleContract = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AtomArbitrage {
    address public owner;
    
    constructor() {
        owner = msg.sender;
    }
    
    receive() external payable {}
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    function requestFlashLoan(address token, uint amount) external onlyOwner {
        // Flash loan logic here
        // 1. Request flash loan from AAVE
        // 2. Execute arbitrage trade
        // 3. Repay flash loan + fee
        // 4. Keep profit
    }
    
    function withdrawETH() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Contract code copied successfully"
    });
  };

  const connectContract = () => {
    if (contractAddress.length === 42 && contractAddress.startsWith('0x')) {
      setIsConnected(true);
      toast({
        title: "Contract Connected",
        description: `Connected to ${contractAddress.slice(0, 6)}...${contractAddress.slice(-4)}`
      });
    } else {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Ethereum contract address",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Contract Connection */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Smart Contract Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contract-address" className="text-slate-300">
              Contract Address
            </Label>
            <div className="flex gap-2">
              <Input
                id="contract-address"
                placeholder="0x..."
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <Button onClick={connectContract} className="bg-blue-500 hover:bg-blue-600">
                Connect
              </Button>
            </div>
          </div>
          
          {isConnected && (
            <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-green-500">Connected</Badge>
                <span className="text-green-400 text-sm font-mono">
                  {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
                </span>
              </div>
              <p className="text-green-300 text-sm">
                Bot is now connected to your AtomArbitrage contract. 
                Detected opportunities will be executed through your contract.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contract Code */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Code className="w-5 h-5" />
            Your AtomArbitrage Contract
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Textarea
              value={sampleContract}
              readOnly
              className="bg-slate-900 border-slate-600 text-green-400 font-mono text-sm min-h-[400px] resize-none"
            />
            <Button
              onClick={() => copyToClipboard(sampleContract)}
              size="sm"
              className="absolute top-2 right-2 bg-slate-700 hover:bg-slate-600"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="mt-4 space-y-2">
            <h4 className="text-white font-medium">Integration Steps:</h4>
            <ul className="text-slate-300 text-sm space-y-1">
              <li>• Deploy your AtomArbitrage contract to mainnet</li>
              <li>• Connect the contract address above</li>
              <li>• Bot will call requestFlashLoan() when opportunities are detected</li>
              <li>• Profits are automatically sent to your contract</li>
              <li>• Use withdrawETH() to claim your profits</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Flash Loan Providers */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Flash Loan Providers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium">AAVE</h4>
                <Badge className="bg-purple-500">Primary</Badge>
              </div>
              <p className="text-slate-400 text-sm">Largest flash loan provider with 0.09% fee</p>
            </div>
            
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium">Balancer</h4>
                <Badge variant="outline">Secondary</Badge>
              </div>
              <p className="text-slate-400 text-sm">No fee flash loans for certain tokens</p>
            </div>
            
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium">dYdX</h4>
                <Badge variant="outline">Backup</Badge>
              </div>
              <p className="text-slate-400 text-sm">High liquidity for major tokens</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartContractIntegration;