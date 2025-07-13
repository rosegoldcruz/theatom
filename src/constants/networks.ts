export interface NetworkConfig {
  chainId: string;
  name: string;
  rpcUrl: string;
  explorer: string;
  contracts: {
    ATOM: string;
  };
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  faucetUrl?: string;
  color: string;
  bgColor: string;
  icon: string;
  status: 'live' | 'testnet' | 'deprecated' | 'local';
  gasPrice: string;
  blockTime: string;
  tvl: string;
  description: string;
  features: string[];
}

export const NETWORKS: Record<string, NetworkConfig> = {
  ethereum: {
    chainId: "0x1",
    name: "Ethereum Mainnet",
    rpcUrl: "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    explorer: "https://etherscan.io",
    contracts: { ATOM: "0x742d35Cc6634C0532925a3b8D4e4D4c7b0e4c4e4" },
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    color: "#627EEA",
    bgColor: "bg-blue-500",
    icon: "🔷",
    status: "live",
    gasPrice: "25 gwei",
    blockTime: "12s",
    tvl: "$45.2B",
    description: "The original and most secure smart contract platform",
    features: ["Highest Security", "Largest Ecosystem", "Most Liquidity"]
  },
  sepolia: {
    chainId: "0xaa36a7",
    name: "Ethereum Sepolia",
    rpcUrl: "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    explorer: "https://sepolia.etherscan.io",
    contracts: { ATOM: "0x5FbDB2315678afecb367f032d93F642f64180aa3" },
    nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
    faucetUrl: "https://sepoliafaucet.com",
    color: "#627EEA",
    bgColor: "bg-blue-400",
    icon: "🧪",
    status: "testnet",
    gasPrice: "20 gwei",
    blockTime: "12s",
    tvl: "N/A",
    description: "Ethereum testnet for development and testing",
    features: ["Free ETH", "Same as Mainnet", "Development Ready"]
  },
  base: {
    chainId: "0x2105",
    name: "Base",
    rpcUrl: "https://mainnet.base.org",
    explorer: "https://basescan.org",
    contracts: { ATOM: "0x1234567890123456789012345678901234567890" },
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    color: "#0052FF",
    bgColor: "bg-blue-600",
    icon: "🔵",
    status: "live",
    gasPrice: "0.1 gwei",
    blockTime: "2s",
    tvl: "$2.8B",
    description: "Coinbase's L2 solution built on Optimism",
    features: ["Ultra Low Fees", "Fast Transactions", "Coinbase Integration"]
  },
  polygon: {
    chainId: "0x89",
    name: "Polygon",
    rpcUrl: "https://polygon-rpc.com",
    explorer: "https://polygonscan.com",
    contracts: { ATOM: "0xabcdef1234567890abcdef1234567890abcdef12" },
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    color: "#8247E5",
    bgColor: "bg-purple-500"
  },
  arbitrum: {
    chainId: "0xa4b1",
    name: "Arbitrum One",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    explorer: "https://arbiscan.io",
    contracts: { ATOM: "0x9876543210987654321098765432109876543210" },
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    color: "#28A0F0",
    bgColor: "bg-sky-500"
  },
  optimism: {
    chainId: "0xa",
    name: "Optimism",
    rpcUrl: "https://mainnet.optimism.io",
    explorer: "https://optimistic.etherscan.io",
    contracts: { ATOM: "0x5555555555555555555555555555555555555555" },
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    color: "#FF0420",
    bgColor: "bg-red-500"
  },
  avalanche: {
    chainId: "0xa86a",
    name: "Avalanche",
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    explorer: "https://snowtrace.io",
    contracts: { ATOM: "0x6666666666666666666666666666666666666666" },
    nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
    color: "#E84142",
    bgColor: "bg-red-600"
  },
  bsc: {
    chainId: "0x38",
    name: "BNB Smart Chain",
    rpcUrl: "https://bsc-dataseed.binance.org",
    explorer: "https://bscscan.com",
    contracts: { ATOM: "0x7777777777777777777777777777777777777777" },
    nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
    color: "#F3BA2F",
    bgColor: "bg-yellow-500",
    icon: "🟡",
    status: "live",
    gasPrice: "5 gwei",
    blockTime: "3s",
    tvl: "$3.1B",
    description: "Binance's high-performance blockchain",
    features: ["Low Fees", "High Speed", "Large Ecosystem"]
  },
  localhost: {
    chainId: "0x7a69",
    name: "Local Hardhat",
    rpcUrl: "http://127.0.0.1:8545",
    explorer: "http://localhost:8545",
    contracts: { ATOM: "0x5FbDB2315678afecb367f032d93F642f64180aa3" },
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    color: "#F7931A",
    bgColor: "bg-orange-500",
    icon: "🏠",
    status: "local",
    gasPrice: "20 gwei",
    blockTime: "1s",
    tvl: "Test",
    description: "Local development blockchain",
    features: ["Instant Mining", "Free ETH", "Full Control"]
  }
};

export const getNetworkByChainId = (chainId: string): NetworkConfig | undefined => {
  return Object.values(NETWORKS).find(network => network.chainId === chainId);
};

export const getNetworkKey = (chainId: string): string | undefined => {
  return Object.keys(NETWORKS).find(key => NETWORKS[key].chainId === chainId);
};