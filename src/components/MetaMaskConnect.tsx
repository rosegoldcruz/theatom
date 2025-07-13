import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { NETWORKS, NetworkConfig } from '@/constants/networks';
import { Wallet, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface MetaMaskConnectProps {
  selectedNetwork: string;
  onConnectionChange?: (connected: boolean) => void;
}

export const MetaMaskConnect = ({ selectedNetwork, onConnectionChange }: MetaMaskConnectProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [currentChainId, setCurrentChainId] = useState<string | null>(null);

  const network = NETWORKS[selectedNetwork];
  const isCorrectNetwork = currentChainId === network.chainId;

  const addNetworkToMetaMask = async (networkConfig: NetworkConfig) => {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: networkConfig.chainId,
          chainName: networkConfig.name,
          nativeCurrency: networkConfig.nativeCurrency,
          rpcUrls: [networkConfig.rpcUrl],
          blockExplorerUrls: [networkConfig.explorer],
        }],
      });
    } catch (err) {
      console.error('Failed to add network:', err);
      throw err;
    }
  };

  const switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainId }],
      });
    } catch (err: any) {
      if (err.code === 4902) {
        await addNetworkToMetaMask(network);
      } else {
        throw err;
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // First, try to switch to the selected network
      await switchNetwork();

      // Then request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        
        // Get current chain ID
        const chainId = await window.ethereum.request({
          method: 'eth_chainId',
        });
        setCurrentChainId(chainId);
        
        onConnectionChange?.(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to MetaMask');
      onConnectionChange?.(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setCurrentChainId(null);
    onConnectionChange?.(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Wallet Connection</span>
        </div>
        {account && (
          <Badge variant={isCorrectNetwork ? "default" : "destructive"}>
            {isCorrectNetwork ? "Connected" : "Wrong Network"}
          </Badge>
        )}
      </div>

      {account ? (
        <div className="space-y-3">
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Connected Account</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {account.slice(0, 6)}...{account.slice(-4)}
            </div>
          </div>

          {!isCorrectNetwork && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please switch to {network.name} to use the arbitrage bot.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            {!isCorrectNetwork && (
              <Button 
                onClick={switchNetwork} 
                disabled={isConnecting}
                size="sm"
                variant="outline"
              >
                Switch Network
              </Button>
            )}
            <Button 
              onClick={disconnect} 
              variant="outline" 
              size="sm"
            >
              Disconnect
            </Button>
          </div>
        </div>
      ) : (
        <Button 
          onClick={connectWallet} 
          disabled={isConnecting}
          className="w-full"
        >
          {isConnecting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="h-4 w-4 mr-2" />
              Connect to {network.name}
            </>
          )}
        </Button>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};