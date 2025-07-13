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
  status: 'active' | 'executing' | 'completed' | 'failed';
  network: string;
  liquidityA: number;
  liquidityB: number;
  slippage: number;
  timeToExpiry: number;
}

export const generateMockOpportunities = (network: string): ArbitrageOpportunity[] => {
  const baseOpportunities = [
    {
      pair: 'ETH/USDC',
      tokenA: 'ETH',
      tokenB: 'USDC',
      buyExchange: 'Uniswap V2',
      sellExchange: 'SushiSwap',
      basePrice: 2000,
      volume: 1.5,
    },
    {
      pair: 'WBTC/USDC',
      tokenA: 'WBTC',
      tokenB: 'USDC',
      buyExchange: 'SushiSwap',
      sellExchange: 'Curve',
      basePrice: 45000,
      volume: 0.1,
    },
    {
      pair: 'UNI/ETH',
      tokenA: 'UNI',
      tokenB: 'ETH',
      buyExchange: 'Uniswap V3',
      sellExchange: 'Balancer',
      basePrice: 8.5,
      volume: 100,
    },
    {
      pair: 'LINK/ETH',
      tokenA: 'LINK',
      tokenB: 'ETH',
      buyExchange: 'Curve',
      sellExchange: 'Uniswap V2',
      basePrice: 15.2,
      volume: 50,
    },
    {
      pair: 'AAVE/USDC',
      tokenA: 'AAVE',
      tokenB: 'USDC',
      buyExchange: 'Balancer',
      sellExchange: 'SushiSwap',
      basePrice: 85,
      volume: 25,
    }
  ];

  return baseOpportunities.map((opp, index) => {
    const priceDiff = (Math.random() - 0.5) * 0.02; // ±1% price difference
    const buyPrice = opp.basePrice;
    const sellPrice = opp.basePrice * (1 + Math.abs(priceDiff));
    const profitUSD = (sellPrice - buyPrice) * opp.volume;
    const profitPercent = (profitUSD / (buyPrice * opp.volume)) * 100;
    
    // Network-specific adjustments
    const networkMultipliers = {
      ethereum: { gas: 150, confidence: 0.95 },
      base: { gas: 10, confidence: 0.85 },
      arbitrum: { gas: 20, confidence: 0.90 },
      optimism: { gas: 15, confidence: 0.88 },
      polygon: { gas: 25, confidence: 0.82 },
      avalanche: { gas: 30, confidence: 0.85 },
      bsc: { gas: 8, confidence: 0.80 },
      sepolia: { gas: 100, confidence: 0.75 },
      localhost: { gas: 50, confidence: 0.95 }
    };

    const multiplier = networkMultipliers[network as keyof typeof networkMultipliers] || { gas: 100, confidence: 0.8 };
    
    return {
      id: `${network}-${index}-${Date.now()}`,
      pair: opp.pair,
      tokenA: opp.tokenA,
      tokenB: opp.tokenB,
      buyExchange: opp.buyExchange,
      sellExchange: opp.sellExchange,
      buyPrice,
      sellPrice,
      profitUSD: Math.max(profitUSD - (multiplier.gas * 0.001), 0.1), // Subtract gas costs
      profitPercent: Math.max(profitPercent, 0.01),
      volume: opp.volume,
      gasEstimate: multiplier.gas + Math.random() * 50,
      confidence: Math.min(multiplier.confidence + (Math.random() * 0.1), 0.99) * 100,
      timestamp: Date.now() - Math.random() * 60000, // Last minute
      status: Math.random() > 0.8 ? 'executing' : 'active',
      network,
      liquidityA: opp.volume * buyPrice * (10 + Math.random() * 90), // 10-100x volume
      liquidityB: opp.volume * buyPrice * (10 + Math.random() * 90),
      slippage: Math.random() * 0.5, // 0-0.5% slippage
      timeToExpiry: 30 + Math.random() * 120 // 30-150 seconds
    } as ArbitrageOpportunity;
  });
};

export const generateNetworkStats = (network: string) => {
  const baseStats = {
    ethereum: {
      totalOpportunities: 156,
      activeOpportunities: 23,
      totalProfit: 2847.32,
      successRate: 87.5,
      avgGasPrice: 25,
      avgBlockTime: 12,
      networkLoad: 'High'
    },
    base: {
      totalOpportunities: 89,
      activeOpportunities: 15,
      totalProfit: 1234.56,
      successRate: 92.1,
      avgGasPrice: 0.1,
      avgBlockTime: 2,
      networkLoad: 'Medium'
    },
    arbitrum: {
      totalOpportunities: 134,
      activeOpportunities: 19,
      totalProfit: 1876.43,
      successRate: 89.3,
      avgGasPrice: 0.5,
      avgBlockTime: 1,
      networkLoad: 'Medium'
    },
    optimism: {
      totalOpportunities: 98,
      activeOpportunities: 12,
      totalProfit: 1456.78,
      successRate: 85.7,
      avgGasPrice: 0.3,
      avgBlockTime: 2,
      networkLoad: 'Low'
    },
    polygon: {
      totalOpportunities: 76,
      activeOpportunities: 8,
      totalProfit: 987.65,
      successRate: 82.4,
      avgGasPrice: 30,
      avgBlockTime: 2,
      networkLoad: 'Medium'
    },
    sepolia: {
      totalOpportunities: 45,
      activeOpportunities: 6,
      totalProfit: 0, // Testnet
      successRate: 75.0,
      avgGasPrice: 20,
      avgBlockTime: 12,
      networkLoad: 'Low'
    },
    localhost: {
      totalOpportunities: 234,
      activeOpportunities: 28,
      totalProfit: 3456.78,
      successRate: 95.2,
      avgGasPrice: 20,
      avgBlockTime: 1,
      networkLoad: 'Low'
    }
  };

  return baseStats[network as keyof typeof baseStats] || baseStats.localhost;
};

export const generateRecentTrades = (network: string) => {
  const trades = [];
  const pairs = ['ETH/USDC', 'WBTC/USDC', 'UNI/ETH', 'LINK/ETH', 'AAVE/USDC'];
  const exchanges = ['Uniswap V2', 'SushiSwap', 'Curve', 'Balancer', 'Uniswap V3'];
  
  for (let i = 0; i < 10; i++) {
    const pair = pairs[Math.floor(Math.random() * pairs.length)];
    const buyExchange = exchanges[Math.floor(Math.random() * exchanges.length)];
    let sellExchange = exchanges[Math.floor(Math.random() * exchanges.length)];
    while (sellExchange === buyExchange) {
      sellExchange = exchanges[Math.floor(Math.random() * exchanges.length)];
    }
    
    const profit = (Math.random() * 100) + 5; // $5-$105
    const success = Math.random() > 0.15; // 85% success rate
    
    trades.push({
      id: `trade-${network}-${i}`,
      pair,
      buyExchange,
      sellExchange,
      profit: success ? profit : -Math.random() * 20, // Loss if failed
      gasUsed: Math.random() * 200000 + 100000,
      timestamp: Date.now() - (i * 60000) - Math.random() * 300000, // Last 5 hours
      status: success ? 'completed' : 'failed',
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      network
    });
  }
  
  return trades.sort((a, b) => b.timestamp - a.timestamp);
};

export const generateMarketData = (network: string) => {
  return {
    gasPrice: {
      current: Math.random() * 50 + 10,
      trend: Math.random() > 0.5 ? 'up' : 'down',
      history: Array.from({ length: 24 }, (_, i) => ({
        time: Date.now() - (23 - i) * 3600000,
        value: Math.random() * 50 + 10
      }))
    },
    volume: {
      current: Math.random() * 1000000 + 500000,
      trend: Math.random() > 0.5 ? 'up' : 'down',
      change24h: (Math.random() - 0.5) * 20 // ±10%
    },
    opportunities: {
      count: Math.floor(Math.random() * 50) + 10,
      avgProfit: Math.random() * 50 + 10,
      topPair: 'ETH/USDC'
    }
  };
};
