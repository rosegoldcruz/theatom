import { ethers } from 'ethers';

// Base Sepolia token addresses (common testnet tokens)
const TOKEN_ADDRESSES = {
  ETH: '0x0000000000000000000000000000000000000000', // Native ETH
  WETH: '0x4200000000000000000000000000000000000006', // Wrapped ETH on Base
  USDC: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // USDC on Base Sepolia
  USDT: '0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2', // Mock USDT
  WBTC: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', // Mock WBTC
  DAI: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', // Mock DAI
  LINK: '0x88Fb150BDc53A65fe94Dea0c9BA0a6dAf8C6e196', // Mock LINK
  UNI: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'   // Mock UNI
};

// Simple ERC20 ABI for price fetching
const ERC20_ABI = [
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function balanceOf(address) view returns (uint256)"
];

// Uniswap V2 Pair ABI for price calculation
const PAIR_ABI = [
  "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function token0() view returns (address)",
  "function token1() view returns (address)"
];

export interface TokenPrice {
  symbol: string;
  address: string;
  price: number;
  priceUSD: number;
  change24h: number;
  volume24h: number;
  lastUpdated: number;
}

export interface ArbitrageOpportunity {
  id: string;
  pair: string;
  tokenA: string;
  tokenB: string;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  profitUSD: number;
  profitPercent: number;
  volume: number;
  gasEstimate: number;
  confidence: number;
  timestamp: number;
  network: string;
}

class PriceService {
  private provider: ethers.JsonRpcProvider;
  private priceCache: Map<string, TokenPrice> = new Map();
  private lastUpdate: number = 0;
  private updateInterval: number = 30000; // 30 seconds

  constructor() {
    const rpcUrl = import.meta.env.VITE_BASE_SEPOLIA_RPC_URL || 
      'https://nameless-misty-pool.base-sepolia.quiknode.pro/6d60e9cd97d2fc31ceade73f41dd089d507fb19b/';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  async getTokenPrice(tokenSymbol: string): Promise<TokenPrice | null> {
    try {
      const address = TOKEN_ADDRESSES[tokenSymbol as keyof typeof TOKEN_ADDRESSES];
      if (!address) {
        console.warn(`Token ${tokenSymbol} not found in address mapping`);
        return null;
      }

      // Check cache first
      const cached = this.priceCache.get(tokenSymbol);
      if (cached && Date.now() - cached.lastUpdated < this.updateInterval) {
        return cached;
      }

      // For testnet, we'll simulate realistic prices with some variation
      const basePrice = this.getBasePriceForToken(tokenSymbol);
      const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
      const currentPrice = basePrice * (1 + variation);

      const tokenPrice: TokenPrice = {
        symbol: tokenSymbol,
        address,
        price: currentPrice,
        priceUSD: currentPrice,
        change24h: (Math.random() - 0.5) * 20, // ±10% daily change
        volume24h: Math.random() * 1000000 + 100000,
        lastUpdated: Date.now()
      };

      this.priceCache.set(tokenSymbol, tokenPrice);
      return tokenPrice;
    } catch (error) {
      console.error(`Error fetching price for ${tokenSymbol}:`, error);
      return null;
    }
  }

  private getBasePriceForToken(symbol: string): number {
    const basePrices: Record<string, number> = {
      ETH: 2000,
      WETH: 2000,
      USDC: 1,
      USDT: 1,
      WBTC: 45000,
      DAI: 1,
      LINK: 15,
      UNI: 8
    };
    return basePrices[symbol] || 1;
  }

  async getArbitrageOpportunities(network: string = 'base'): Promise<ArbitrageOpportunity[]> {
    try {
      const opportunities: ArbitrageOpportunity[] = [];
      const tokenPairs = [
        ['ETH', 'USDC'],
        ['WBTC', 'USDC'],
        ['UNI', 'ETH'],
        ['LINK', 'ETH'],
        ['DAI', 'USDC']
      ];

      for (const [tokenA, tokenB] of tokenPairs) {
        const priceA = await this.getTokenPrice(tokenA);
        const priceB = await this.getTokenPrice(tokenB);

        if (!priceA || !priceB) continue;

        // Simulate price differences between exchanges
        const exchanges = ['Uniswap V2', 'SushiSwap', 'Curve', 'Balancer'];
        const buyExchange = exchanges[Math.floor(Math.random() * exchanges.length)];
        const sellExchange = exchanges[Math.floor(Math.random() * exchanges.length)];

        if (buyExchange === sellExchange) continue;

        // Calculate arbitrage opportunity
        const priceDiff = (Math.random() - 0.5) * 0.04; // ±2% price difference
        const buyPrice = priceA.price;
        const sellPrice = priceA.price * (1 + Math.abs(priceDiff));
        const volume = Math.random() * 10 + 1; // 1-11 tokens
        const profitUSD = (sellPrice - buyPrice) * volume;
        const profitPercent = (profitUSD / (buyPrice * volume)) * 100;

        if (profitPercent > 0.1) { // Only profitable opportunities
          opportunities.push({
            id: `${tokenA}-${tokenB}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            pair: `${tokenA}/${tokenB}`,
            tokenA,
            tokenB,
            buyExchange,
            sellExchange,
            buyPrice,
            sellPrice,
            profitUSD,
            profitPercent,
            volume,
            gasEstimate: this.estimateGasCost(network),
            confidence: Math.random() * 30 + 70, // 70-100% confidence
            timestamp: Date.now(),
            network
          });
        }
      }

      return opportunities.sort((a, b) => b.profitPercent - a.profitPercent).slice(0, 10);
    } catch (error) {
      console.error('Error fetching arbitrage opportunities:', error);
      return [];
    }
  }

  private estimateGasCost(network: string): number {
    const gasEstimates: Record<string, number> = {
      ethereum: 150,
      base: 10,
      arbitrum: 20,
      optimism: 15,
      polygon: 25,
      sepolia: 100
    };
    return gasEstimates[network] || 50;
  }

  async getNetworkStats(network: string) {
    try {
      const [blockNumber, feeData] = await Promise.all([
        this.provider.getBlockNumber(),
        this.provider.getFeeData()
      ]);

      const gasPrice = feeData.gasPrice ? 
        parseFloat(ethers.formatUnits(feeData.gasPrice, 'gwei')) : 0;

      return {
        blockNumber,
        gasPrice,
        avgBlockTime: network === 'base' ? 2 : 12, // Base has ~2s blocks
        networkLoad: gasPrice > 20 ? 'High' : gasPrice > 10 ? 'Medium' : 'Low',
        totalOpportunities: Math.floor(Math.random() * 50) + 20,
        activeOpportunities: Math.floor(Math.random() * 15) + 5,
        totalProfit: Math.random() * 5000 + 1000,
        successRate: Math.random() * 20 + 80 // 80-100%
      };
    } catch (error) {
      console.error('Error fetching network stats:', error);
      return {
        blockNumber: 0,
        gasPrice: 0,
        avgBlockTime: 12,
        networkLoad: 'Unknown',
        totalOpportunities: 0,
        activeOpportunities: 0,
        totalProfit: 0,
        successRate: 0
      };
    }
  }

  // Clear cache and force refresh
  clearCache() {
    this.priceCache.clear();
    this.lastUpdate = 0;
  }

  // Get all cached prices
  getAllPrices(): TokenPrice[] {
    return Array.from(this.priceCache.values());
  }
}

export const priceService = new PriceService();
export default priceService;
