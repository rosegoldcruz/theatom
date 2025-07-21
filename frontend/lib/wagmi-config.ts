import { createConfig } from 'wagmi'
import { http } from 'viem'
import { baseSepolia } from 'wagmi/chains'
import { metaMask, walletConnect, coinbaseWallet } from '@wagmi/connectors'

// Set up wagmi config with new API
export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    metaMask({
      dappMetadata: {
        name: 'ATOM Arbitrage Platform',
        url: 'https://AeonInvestmentsTechnologies.com',
      },
    }),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
      metadata: {
        name: 'ATOM Arbitrage Platform',
        description: 'Professional DeFi Arbitrage Trading with Flash Loans',
        url: 'https://AeonInvestmentsTechnologies.com',
        icons: ['https://AeonInvestmentsTechnologies.com/atom-logo.jpg'],
      },
    }),
    coinbaseWallet({
      appName: 'ATOM Arbitrage',
      darkMode: true,
    }),
  ],
  transports: {
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'),
  },
})

export const chains = [baseSepolia]
