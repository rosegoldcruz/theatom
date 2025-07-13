import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Wifi, WifiOff } from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';

export const NetworkStatus: React.FC = () => {
  const { 
    account, 
    chainId, 
    isConnected, 
    switchToSepolia, 
    switchToBaseSepolia, 
    isSepoliaNetwork, 
    isBaseSepoliaNetwork,
    getSupportedNetworks 
  } = useWeb3();

  const supportedNetworks = getSupportedNetworks();
  const currentNetwork = supportedNetworks.find(n => n.chainId === chainId);
  const isSupported = isSepoliaNetwork || isBaseSepoliaNetwork;

  const getNetworkStatus = () => {
    if (!isConnected) return { status: 'disconnected', color: 'bg-gray-100 text-gray-800' };
    if (!isSupported) return { status: 'unsupported', color: 'bg-red-100 text-red-800' };
    return { status: 'connected', color: 'bg-green-100 text-green-800' };
  };

  const networkStatus = getNetworkStatus();

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-gray-400" />
            )}
            <span className="font-medium">Network Status</span>
          </div>
          <Badge className={networkStatus.color}>
            {networkStatus.status}
          </Badge>
        </div>
        
        {isConnected && (
          <div className="space-y-2 mb-3">
            <div className="flex justify-between text-sm">
              <span>Account:</span>
              <span className="font-mono">
                {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Not connected'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Network:</span>
              <span>{currentNetwork?.name || `Chain ID: ${chainId}`}</span>
            </div>
          </div>
        )}
        
        {!isSupported && isConnected && (
          <div className="space-y-2">
            <p className="text-sm text-red-600 mb-2">
              Please switch to a supported testnet:
            </p>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={switchToSepolia}
              >
                Ethereum Sepolia
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={switchToBaseSepolia}
              >
                Base Sepolia
              </Button>
            </div>
          </div>
        )}
        
        {isSupported && (
          <div className="space-y-2">
            <p className="text-sm text-green-600 mb-2">
              ✓ Connected to supported testnet
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm">Need testnet ETH?</span>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => window.open(currentNetwork?.faucet, '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Get Faucet
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};