import { useState, useEffect } from 'react';

interface Web3State {
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

interface EthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, handler: (...args: any[]) => void) => void;
  removeListener: (event: string, handler: (...args: any[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111 in hex
const BASE_SEPOLIA_CHAIN_ID = '0x14a34'; // 84532 in hex

export const useWeb3 = () => {
  const [state, setState] = useState<Web3State>({
    account: null,
    chainId: null,
    isConnected: false,
    isLoading: false,
    error: null,
  });

  const connectWallet = async () => {
    if (!window.ethereum) {
      setState(prev => ({ ...prev, error: 'MetaMask not found. Please install MetaMask.' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const chainId = await window.ethereum.request({
        method: 'eth_chainId',
      });

      setState({
        account: accounts[0],
        chainId: parseInt(chainId, 16),
        isConnected: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to connect wallet',
      }));
    }
  };

  const switchToSepolia = async () => {
    if (!window.ethereum) {
      setState(prev => ({ ...prev, error: 'MetaMask not found' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error: any) {
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: SEPOLIA_CHAIN_ID,
              chainName: 'Sepolia Test Network',
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              blockExplorerUrls: ['https://sepolia.etherscan.io/'],
            }],
          });
          setState(prev => ({ ...prev, isLoading: false }));
        } catch (addError: any) {
          setState(prev => ({ ...prev, isLoading: false, error: 'Failed to add Sepolia network' }));
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false, error: 'Failed to switch to Sepolia network' }));
      }
    }
  };

  const switchToBaseSepolia = async () => {
    if (!window.ethereum) {
      setState(prev => ({ ...prev, error: 'MetaMask not found' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BASE_SEPOLIA_CHAIN_ID }],
      });
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error: any) {
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: BASE_SEPOLIA_CHAIN_ID,
              chainName: 'Base Sepolia Testnet',
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://sepolia.base.org'],
              blockExplorerUrls: ['https://sepolia-explorer.base.org'],
            }],
          });
          setState(prev => ({ ...prev, isLoading: false }));
        } catch (addError: any) {
          setState(prev => ({ ...prev, isLoading: false, error: 'Failed to add Base Sepolia network' }));
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false, error: 'Failed to switch to Base Sepolia network' }));
      }
    }
  };

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            setState({
              account: accounts[0],
              chainId: parseInt(chainId, 16),
              isConnected: true,
              isLoading: false,
              error: null,
            });
          }
        } catch (error) {
          console.error('Error checking connection:', error);
        }
      }
    };

    checkConnection();
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        setState(prev => ({
          ...prev,
          account: accounts[0] || null,
          isConnected: !!accounts[0],
        }));
      };

      const handleChainChanged = (chainId: string) => {
        setState(prev => ({ ...prev, chainId: parseInt(chainId, 16) }));
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  return {
    ...state,
    connectWallet,
    switchToSepolia,
    switchToBaseSepolia,
    isSepoliaNetwork: state.chainId === 11155111,
    isBaseSepoliaNetwork: state.chainId === 84532,
    getSupportedNetworks: () => [
      { name: 'Ethereum Sepolia', chainId: 11155111, faucet: 'https://sepoliafaucet.com/' },
      { name: 'Base Sepolia', chainId: 84532, faucet: 'https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet' }
    ]
  };
};