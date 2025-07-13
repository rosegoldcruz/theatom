import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { NETWORKS } from '../constants/networks';
import { Copy, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '../hooks/use-toast';

interface NetworkSelectorProps {
  selectedNetwork: string;
  onNetworkChange: (network: string) => void;
  walletAddress?: string;
}

export const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  selectedNetwork,
  onNetworkChange,
  walletAddress
}) => {
  const { toast } = useToast();
  const network = NETWORKS[selectedNetwork];

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast({ title: "Address copied!", description: "Wallet address copied to clipboard" });
    }
  };

  const openExplorer = () => {
    if (walletAddress && network) {
      window.open(`${network.explorer}/address/${walletAddress}`, '_blank');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={selectedNetwork} onValueChange={onNetworkChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select network" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(NETWORKS).map(([key, net]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{net.icon}</span>
                    <div className="flex flex-col">
                      <span className="font-medium">{net.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {net.gasPrice} • {net.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${
                      net.status === 'live' ? 'bg-green-500' :
                      net.status === 'testnet' ? 'bg-yellow-500' :
                      net.status === 'local' ? 'bg-blue-500' :
                      'bg-red-500'
                    }`} />
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {network && (
          <Badge variant="secondary" className={`${network.bgColor} text-white`}>
            {network.nativeCurrency.symbol}
          </Badge>
        )}
      </div>

      {network && (
        <div className="bg-muted/50 p-4 rounded-lg space-y-4">
          {/* Network Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Gas Price</div>
              <div className="font-semibold">{network.gasPrice}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Block Time</div>
              <div className="font-semibold">{network.blockTime}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">TVL</div>
              <div className="font-semibold">{network.tvl}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Status</div>
              <div className={`font-semibold ${
                network.status === 'live' ? 'text-green-600' :
                network.status === 'testnet' ? 'text-yellow-600' :
                network.status === 'local' ? 'text-blue-600' :
                'text-red-600'
              }`}>
                {network.status.charAt(0).toUpperCase() + network.status.slice(1)}
              </div>
            </div>
          </div>

          {/* Network Description */}
          <div className="text-sm text-muted-foreground">
            {network.description}
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-2">
            {network.features.map((feature, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>

          {/* Contract Info */}
          <div className="text-sm">
            <span className="font-medium">Contract:</span>
            <code className="ml-2 text-xs bg-muted px-2 py-1 rounded font-mono">
              {network.contracts.ATOM}
            </code>
            <Button
              size="sm"
              variant="ghost"
              className="ml-2 h-6 w-6 p-0"
              onClick={() => navigator.clipboard.writeText(network.contracts.ATOM)}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>

          {/* Wallet Info */}
          {walletAddress && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Wallet:</span>
              <code className="text-xs bg-muted px-2 py-1 rounded font-mono flex-1">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </code>
              <Button size="sm" variant="ghost" onClick={copyAddress}>
                <Copy className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={openExplorer}>
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Quick Links */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={network.explorer} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Explorer
              </a>
            </Button>

            {network.faucetUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={network.faucetUrl} target="_blank" rel="noopener noreferrer">
                  <span className="w-4 h-4 mr-2">🚰</span>
                  Faucet
                </a>
              </Button>
            )}

            <Button variant="outline" size="sm">
              <span className="w-4 h-4 mr-2">📊</span>
              Analytics
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkSelector;