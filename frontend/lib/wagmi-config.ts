import { createConfig, configureChains } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { publicProvider } from 'wagmi/providers/public'

// Configure chains and providers
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [baseSepolia],
  [publicProvider()]
)

// Set up wagmi config with v1 API
export const config = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
        metadata: {
          name: 'ATOM Arbitrage Platform',
          description: 'Professional DeFi Arbitrage Trading with Flash Loans',
          url: 'https://AeonInvestmentsTechnologies.com',
          icons: ['https://AeonInvestmentsTechnologies.com/atom-logo.jpg'],
        },
      },
    }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'ATOM Arbitrage',
        darkMode: true,
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
})

export { chains }
