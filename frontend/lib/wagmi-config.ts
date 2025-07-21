// config/index.tsx
import { createConfig, configureChains } from 'wagmi'
import { mainnet, arbitrum, baseSepolia } from 'wagmi/chains'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { publicProvider } from 'wagmi/providers/public'

// Read Project ID from environment variables
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

// Define supported networks
export const networks = [baseSepolia, mainnet, arbitrum]

// Configure chains and providers
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [baseSepolia, mainnet, arbitrum],
  [publicProvider()]
)

// Create the Wagmi config
export const config = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: projectId || '',
        metadata: {
          name: 'ATOM Arbitrage Platform',
          description: 'Professional DeFi Arbitrage Trading with Flash Loans',
          url: 'https://AeonInvestmentsTechnologies.com',
          icons: ['https://AeonInvestmentsTechnologies.com/atom-logo.jpg']
        }
      },
    }),
    new InjectedConnector({
      chains,
      options: {
        name: 'Injected',
        shimDisconnect: true,
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
})

// Legacy exports for compatibility
export const wagmiAdapter = { wagmiConfig: config }
