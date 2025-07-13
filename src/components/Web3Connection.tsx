import { useWeb3 } from '@/hooks/useWeb3';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet, Network, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

interface Web3ConnectionProps {
  onProceedToBot?: () => void;
}

export const Web3Connection = ({ onProceedToBot }: Web3ConnectionProps) => {
  const { 
    account, 
    chainId, 
    isConnected, 
    isLoading, 
    error, 
    connectWallet, 
    switchToSepolia, 
    switchToBaseSepolia,
    isSepoliaNetwork,
    isBaseSepoliaNetwork
  } = useWeb3();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkName = (chainId: number) => {
    switch (chainId) {
      case 1: return 'Ethereum Mainnet';
      case 11155111: return 'Sepolia Testnet';
      case 84532: return 'Base Sepolia';
      case 5: return 'Goerli Testnet';
      default: return `Chain ID: ${chainId}`;
    }
  };

  const isSupportedNetwork = isSepoliaNetwork || isBaseSepoliaNetwork;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          MetaMask Connection
        </CardTitle>
        <CardDescription>
          Connect to Ethereum Sepolia or Base Sepolia testnet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!isConnected ? (
          <Button 
            onClick={connectWallet} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Connecting...' : 'Connect MetaMask'}
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Account:</span>
              <Badge variant="secondary">{formatAddress(account!)}</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Network:</span>
              <div className="flex items-center gap-2">
                <Badge variant={isSupportedNetwork ? 'default' : 'destructive'}>
                  {chainId ? getNetworkName(chainId) : 'Unknown'}
                </Badge>
                {isSupportedNetwork && <CheckCircle className="h-4 w-4 text-green-500" />}
              </div>
            </div>

            {!isSupportedNetwork && (
              <div className="space-y-2">
                <Alert>
                  <Network className="h-4 w-4" />
                  <AlertDescription>
                    Please switch to a supported testnet
                  </AlertDescription>
                </Alert>
                <div className="flex gap-2">
                  <Button 
                    onClick={switchToSepolia}
                    disabled={isLoading}
                    variant="outline"
                    className="flex-1"
                  >
                    Sepolia
                  </Button>
                  <Button 
                    onClick={switchToBaseSepolia}
                    disabled={isLoading}
                    variant="outline"
                    className="flex-1"
                  >
                    Base Sepolia
                  </Button>
                </div>
              </div>
            )}

            {isSupportedNetwork && onProceedToBot && (
              <div className="space-y-3">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-green-600">
                    Connected to supported testnet! Ready for arbitrage trading.
                  </AlertDescription>
                </Alert>
                <Button 
                  onClick={onProceedToBot}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Enter Arbitrage Bot
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};