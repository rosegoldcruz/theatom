'use client';

import { useState, useEffect, useCallback } from 'react';
import { UseWeb3Return } from '@/types';
import { NETWORKS } from '@/constants/networks';

// Mock Web3 functionality - replace with actual Web3 integration
const mockWeb3 = {
  connect: async (): Promise<{ address: string; network: string }> => {
    // Simulate wallet connection delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      address: '0x742d35Cc6639C0532fCb18025C9c492E5A9534e1',
      network: 'ethereum'
    };
  },
  
  getBalance: async (address: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return (Math.random() * 10 + 1).toFixed(4);
  },
  
  switchNetwork: async (networkId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (!NETWORKS[networkId]) {
      throw new Error('Unsupported network');
    }
  },
  
  getNetwork: async (): Promise<string> => {
    return 'ethereum';
  }
};

export const useWeb3 = (): UseWeb3Return => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState('ethereum');
  const [balance, setBalance] = useState('0.0000');
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = useCallback(async () => {
    if (isConnecting) return;
    
    try {
      setIsConnecting(true);
      const result = await mockWeb3.connect();
      
      setAddress(result.address);
      setNetwork(result.network);
      setIsConnected(true);
      
      // Get balance after connection
      const userBalance = await mockWeb3.getBalance(result.address);
      setBalance(userBalance);
      
      // Store connection state
      localStorage.setItem('atom-wallet-connected', 'true');
      localStorage.setItem('atom-wallet-address', result.address);
      localStorage.setItem('atom-wallet-network', result.network);
      
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting]);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setAddress(null);
    setBalance('0.0000');
    
    // Clear stored connection state
    localStorage.removeItem('atom-wallet-connected');
    localStorage.removeItem('atom-wallet-address');
    localStorage.removeItem('atom-wallet-network');
  }, []);

  const switchNetwork = useCallback(async (networkId: string) => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      await mockWeb3.switchNetwork(networkId);
      setNetwork(networkId);
      
      // Update balance for new network
      if (address) {
        const newBalance = await mockWeb3.getBalance(address);
        setBalance(newBalance);
      }
      
      // Update stored network
      localStorage.setItem('atom-wallet-network', networkId);
      
    } catch (error) {
      console.error('Failed to switch network:', error);
      throw error;
    }
  }, [isConnected, address]);

  // Auto-connect on mount if previously connected
  useEffect(() => {
    const wasConnected = localStorage.getItem('atom-wallet-connected');
    const storedAddress = localStorage.getItem('atom-wallet-address');
    const storedNetwork = localStorage.getItem('atom-wallet-network');
    
    if (wasConnected && storedAddress) {
      setIsConnected(true);
      setAddress(storedAddress);
      setNetwork(storedNetwork || 'ethereum');
      
      // Get current balance
      mockWeb3.getBalance(storedAddress).then(setBalance);
    }
  }, []);

  // Update balance periodically when connected
  useEffect(() => {
    if (!isConnected || !address) return;

    const updateBalance = async () => {
      try {
        const newBalance = await mockWeb3.getBalance(address);
        setBalance(newBalance);
      } catch (error) {
        console.error('Failed to update balance:', error);
      }
    };

    // Update balance every 30 seconds
    const interval = setInterval(updateBalance, 30000);
    return () => clearInterval(interval);
  }, [isConnected, address]);

  // Listen for network changes (in real implementation, this would listen to wallet events)
  useEffect(() => {
    if (!isConnected) return;

    const checkNetwork = async () => {
      try {
        const currentNetwork = await mockWeb3.getNetwork();
        if (currentNetwork !== network) {
          setNetwork(currentNetwork);
          localStorage.setItem('atom-wallet-network', currentNetwork);
        }
      } catch (error) {
        console.error('Failed to check network:', error);
      }
    };

    // Check network every 10 seconds
    const interval = setInterval(checkNetwork, 10000);
    return () => clearInterval(interval);
  }, [isConnected, network]);

  return {
    isConnected,
    address,
    network,
    balance,
    connect,
    disconnect,
    switchNetwork
  };
};
