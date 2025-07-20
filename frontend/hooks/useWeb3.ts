'use client';

import { useState, useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';

export function useWeb3() {
  const { actions } = useAppContext();
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = useCallback(async () => {
    if (isConnecting) return;
    
    try {
      setIsConnecting(true);
      
      // Mock wallet connection - replace with actual Web3 logic
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockAddress = '0x742d35Cc6639C0532fCb18025C9c492E5A9534e1';
      actions.connectWallet(mockAddress);
      
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, actions]);

  return { connect, isConnecting };
}