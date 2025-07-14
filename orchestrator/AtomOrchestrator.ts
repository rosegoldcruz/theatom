import { ethers } from 'ethers';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import TelegramBot from 'node-telegram-bot-api';
import nodemailer from 'nodemailer';

// Types
interface ArbitrageConfig {
  id: string;
  user_id: string;
  name: string;
  min_profit_basis_points: number;
  max_slippage_basis_points: number;
  max_gas_price_gwei: number;
  enabled_tokens: string[];
  enabled_dexes: string[];
  flash_loan_enabled: boolean;
  max_trade_amount_eth: number;
  is_active: boolean;
}

interface ArbitrageOpportunity {
  id?: string;
  config_id: string;
  token_in: string;
  token_out: string;
  amount_in: number;
  dex_buy: string;
  dex_sell: string;
  price_buy: number;
  price_sell: number;
  estimated_profit: number;
  estimated_gas_cost: number;
  profit_basis_points: number;
  status: 'detected' | 'executing' | 'completed' | 'failed' | 'expired';
}

interface DEXPrice {
  dex: string;
  price: number;
  liquidity: number;
  gasEstimate: number;
}

interface TokenPair {
  tokenA: string;
  tokenB: string;
  symbolA: string;
  symbolB: string;
}

export class AtomOrchestrator {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;
  private supabase: any;
  private telegramBot?: TelegramBot;
  private emailTransporter?: nodemailer.Transporter;
  private isRunning: boolean = false;
  private scanInterval: number = 5000; // 5 seconds
  private configs: ArbitrageConfig[] = [];

  // DEX Router addresses (Base Mainnet)
  private readonly DEX_ROUTERS = {
    uniswap_v2: '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24',
    uniswap_v3: '0x2626664c2603336E57B271c5C0b26F421741e481',
    balancer: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    curve: '0x8e764bE4288B842791989DB5b8ec067279829809'
  };

  // Common token addresses (Base Mainnet)
  private readonly TOKENS = {
    WETH: '0x4200000000000000000000000000000000000006',
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    USDT: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
    DAI: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    WBTC: '0x1C9Aa3B8C0c0e8Cd2b3b0B4b5c5c5c5c5c5c5c5c' // Placeholder
  };

  // Contract ABI (simplified)
  private readonly CONTRACT_ABI = [
    "function executeArbitrage(address asset, uint256 amount, bytes calldata params) external",
    "function getConfig() external view returns (uint256, uint256, uint256, uint256, uint256, uint256, uint256)",
    "function updateConfig(uint256 minProfitBasisPoints, uint256 maxSlippageBasisPoints, uint256 maxGasPrice) external",
    "function pause() external",
    "function unpause() external",
    "function paused() external view returns (bool)",
    "event ArbitrageExecuted(address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 profit, uint256 gasUsed, string dexPath, uint256 timestamp)",
    "event FlashLoanExecuted(address indexed asset, uint256 amount, uint256 premium, bool success)"
  ];

  constructor() {
    // Initialize provider and wallet
    this.provider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC_URL);
    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, this.provider);
    
    // Initialize contract
    this.contract = new ethers.Contract(
      process.env.BASE_SEPOLIA_CONTRACT_ADDRESS!,
      this.CONTRACT_ABI,
      this.wallet
    );

    // Initialize Supabase
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Initialize Telegram bot if token provided
    if (process.env.TELEGRAM_BOT_TOKEN) {
      this.telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
    }

    // Initialize email transporter if configured
    if (process.env.SMTP_HOST) {
      this.emailTransporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Listen to contract events
    this.contract.on('ArbitrageExecuted', async (tokenIn, tokenOut, amountIn, profit, gasUsed, dexPath, timestamp, event) => {
      await this.handleArbitrageExecuted({
        tokenIn,
        tokenOut,
        amountIn: ethers.formatEther(amountIn),
        profit: ethers.formatEther(profit),
        gasUsed: gasUsed.toString(),
        dexPath,
        timestamp: new Date(Number(timestamp) * 1000),
        txHash: event.transactionHash,
        blockNumber: event.blockNumber
      });
    });

    this.contract.on('FlashLoanExecuted', async (asset, amount, premium, success, event) => {
      await this.logSystemEvent('info', 'contract', 'Flash loan executed', {
        asset,
        amount: ethers.formatEther(amount),
        premium: ethers.formatEther(premium),
        success,
        txHash: event.transactionHash
      });
    });
  }

  public async start(): Promise<void> {
    if (this.isRunning) {
      console.log('🔄 Orchestrator is already running');
      return;
    }

    console.log('🚀 Starting ATOM Arbitrage Orchestrator...');
    
    try {
      // Load configurations
      await this.loadConfigurations();
      
      // Check contract status
      const isPaused = await this.contract.paused();
      if (isPaused) {
        throw new Error('Contract is paused');
      }

      this.isRunning = true;
      
      // Start main scanning loop
      this.scanLoop();
      
      await this.logSystemEvent('info', 'orchestrator', 'Orchestrator started successfully');
      console.log('✅ ATOM Orchestrator is now running!');
      
    } catch (error) {
      console.error('❌ Failed to start orchestrator:', error);
      await this.logSystemEvent('error', 'orchestrator', 'Failed to start orchestrator', { error: error.message });
      throw error;
    }
  }

  public async stop(): Promise<void> {
    console.log('🛑 Stopping ATOM Arbitrage Orchestrator...');
    this.isRunning = false;
    
    // Remove contract listeners
    this.contract.removeAllListeners();
    
    await this.logSystemEvent('info', 'orchestrator', 'Orchestrator stopped');
    console.log('✅ Orchestrator stopped successfully');
  }

  private async loadConfigurations(): Promise<void> {
    try {
      const { data: configs, error } = await this.supabase
        .from('arbitrage_config')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      this.configs = configs || [];
      console.log(`📋 Loaded ${this.configs.length} active configurations`);
      
    } catch (error) {
      console.error('❌ Failed to load configurations:', error);
      throw error;
    }
  }

  private async scanLoop(): Promise<void> {
    while (this.isRunning) {
      try {
        await this.scanForOpportunities();
        await this.sleep(this.scanInterval);
      } catch (error) {
        console.error('❌ Error in scan loop:', error);
        await this.logSystemEvent('error', 'orchestrator', 'Scan loop error', { error: error.message });
        await this.sleep(this.scanInterval * 2); // Back off on error
      }
    }
  }

  private async scanForOpportunities(): Promise<void> {
    for (const config of this.configs) {
      try {
        await this.scanConfigOpportunities(config);
      } catch (error) {
        console.error(`❌ Error scanning config ${config.id}:`, error);
        await this.logSystemEvent('error', 'orchestrator', 'Config scan error', {
          configId: config.id,
          error: error.message
        });
      }
    }
  }

  private async scanConfigOpportunities(config: ArbitrageConfig): Promise<void> {
    // Generate token pairs from enabled tokens
    const tokenPairs = this.generateTokenPairs(config.enabled_tokens);
    
    for (const pair of tokenPairs) {
      try {
        const opportunity = await this.findArbitrageOpportunity(config, pair);
        if (opportunity) {
          await this.processOpportunity(opportunity);
        }
      } catch (error) {
        console.error(`❌ Error processing pair ${pair.symbolA}/${pair.symbolB}:`, error);
      }
    }
  }

  private generateTokenPairs(tokens: string[]): TokenPair[] {
    const pairs: TokenPair[] = [];
    
    for (let i = 0; i < tokens.length; i++) {
      for (let j = i + 1; j < tokens.length; j++) {
        pairs.push({
          tokenA: tokens[i],
          tokenB: tokens[j],
          symbolA: this.getTokenSymbol(tokens[i]),
          symbolB: this.getTokenSymbol(tokens[j])
        });
      }
    }
    
    return pairs;
  }

  private getTokenSymbol(address: string): string {
    const tokenEntries = Object.entries(this.TOKENS);
    const found = tokenEntries.find(([, addr]) => addr.toLowerCase() === address.toLowerCase());
    return found ? found[0] : address.slice(0, 8);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async logSystemEvent(level: string, component: string, message: string, details?: any): Promise<void> {
    try {
      await this.supabase.rpc('log_system_event', {
        log_level: level,
        component_name: component,
        log_message: message,
        log_details: details || {}
      });
    } catch (error) {
      console.error('Failed to log system event:', error);
    }
  }

  private async handleArbitrageExecuted(data: any): Promise<void> {
    console.log('🎉 Arbitrage executed:', data);
    
    // Update database
    try {
      await this.supabase
        .from('arbitrage_trades')
        .insert({
          token_in: data.tokenIn,
          token_out: data.tokenOut,
          amount_in: data.amountIn,
          profit: data.profit,
          gas_used: data.gasUsed,
          dex_path: data.dexPath,
          tx_hash: data.txHash,
          block_number: data.blockNumber,
          status: 'success',
          executed_at: data.timestamp,
          confirmed_at: new Date()
        });

      // Send notifications
      await this.sendNotifications('trade_success', 'Arbitrage Trade Executed', 
        `Profit: ${data.profit} ETH from ${data.dexPath}`, data);
        
    } catch (error) {
      console.error('❌ Failed to handle arbitrage executed event:', error);
    }
  }

  private async findArbitrageOpportunity(config: ArbitrageConfig, pair: TokenPair): Promise<ArbitrageOpportunity | null> {
    try {
      // Get prices from all enabled DEXes
      const prices = await this.getPricesFromDEXes(pair, config.enabled_dexes);

      if (prices.length < 2) {
        return null; // Need at least 2 DEXes for arbitrage
      }

      // Find best buy and sell prices
      const sortedByPrice = prices.sort((a, b) => a.price - b.price);
      const buyDEX = sortedByPrice[0]; // Lowest price (buy here)
      const sellDEX = sortedByPrice[sortedByPrice.length - 1]; // Highest price (sell here)

      // Calculate potential profit
      const amountIn = Math.min(config.max_trade_amount_eth, 1.0); // Start with 1 ETH or max allowed
      const amountOut = (amountIn / buyDEX.price) * sellDEX.price;
      const estimatedProfit = amountOut - amountIn;
      const estimatedGasCost = (buyDEX.gasEstimate + sellDEX.gasEstimate) * 0.00000002; // Rough gas cost estimate
      const netProfit = estimatedProfit - estimatedGasCost;

      // Check if profitable
      const profitBasisPoints = Math.floor((netProfit / amountIn) * 10000);

      if (profitBasisPoints < config.min_profit_basis_points) {
        return null; // Not profitable enough
      }

      // Create opportunity
      const opportunity: ArbitrageOpportunity = {
        config_id: config.id,
        token_in: pair.tokenA,
        token_out: pair.tokenB,
        amount_in: amountIn,
        dex_buy: buyDEX.dex,
        dex_sell: sellDEX.dex,
        price_buy: buyDEX.price,
        price_sell: sellDEX.price,
        estimated_profit: netProfit,
        estimated_gas_cost: estimatedGasCost,
        profit_basis_points: profitBasisPoints,
        status: 'detected'
      };

      console.log(`💰 Found opportunity: ${pair.symbolA}/${pair.symbolB} - ${profitBasisPoints}bp profit`);
      return opportunity;

    } catch (error) {
      console.error('Error finding arbitrage opportunity:', error);
      return null;
    }
  }

  private async getPricesFromDEXes(pair: TokenPair, enabledDEXes: string[]): Promise<DEXPrice[]> {
    const prices: DEXPrice[] = [];

    for (const dex of enabledDEXes) {
      try {
        const price = await this.getDEXPrice(pair, dex);
        if (price) {
          prices.push(price);
        }
      } catch (error) {
        console.error(`Error getting price from ${dex}:`, error);
      }
    }

    return prices;
  }

  private async getDEXPrice(pair: TokenPair, dex: string): Promise<DEXPrice | null> {
    try {
      // This is a simplified implementation
      // In production, you would call actual DEX APIs or on-chain price feeds

      switch (dex) {
        case 'uniswap_v2':
          return await this.getUniswapV2Price(pair);
        case 'uniswap_v3':
          return await this.getUniswapV3Price(pair);
        case 'balancer':
          return await this.getBalancerPrice(pair);
        default:
          return null;
      }
    } catch (error) {
      console.error(`Error getting ${dex} price:`, error);
      return null;
    }
  }

  private async getUniswapV2Price(pair: TokenPair): Promise<DEXPrice | null> {
    // Simplified price fetching - in production, use actual Uniswap SDK or subgraph
    const basePrice = 2000 + Math.random() * 100; // Mock price around $2000-2100
    const variation = (Math.random() - 0.5) * 0.02; // ±1% variation

    return {
      dex: 'uniswap_v2',
      price: basePrice * (1 + variation),
      liquidity: 1000000 + Math.random() * 500000,
      gasEstimate: 150000
    };
  }

  private async getUniswapV3Price(pair: TokenPair): Promise<DEXPrice | null> {
    const basePrice = 2000 + Math.random() * 100;
    const variation = (Math.random() - 0.5) * 0.015; // Slightly less variation

    return {
      dex: 'uniswap_v3',
      price: basePrice * (1 + variation),
      liquidity: 2000000 + Math.random() * 1000000,
      gasEstimate: 120000
    };
  }

  private async getBalancerPrice(pair: TokenPair): Promise<DEXPrice | null> {
    const basePrice = 2000 + Math.random() * 100;
    const variation = (Math.random() - 0.5) * 0.025; // More variation

    return {
      dex: 'balancer',
      price: basePrice * (1 + variation),
      liquidity: 800000 + Math.random() * 400000,
      gasEstimate: 180000
    };
  }

  private async processOpportunity(opportunity: ArbitrageOpportunity): Promise<void> {
    try {
      // Save opportunity to database
      const { data: savedOpportunity, error } = await this.supabase
        .from('arbitrage_opportunities')
        .insert(opportunity)
        .select()
        .single();

      if (error) throw error;

      console.log(`📊 Opportunity saved: ${opportunity.token_in}/${opportunity.token_out}`);

      // Check if we should execute immediately
      if (opportunity.profit_basis_points >= 100) { // 1% or higher
        await this.executeArbitrage(savedOpportunity);
      }

    } catch (error) {
      console.error('Error processing opportunity:', error);
      await this.logSystemEvent('error', 'orchestrator', 'Failed to process opportunity', {
        opportunity,
        error: error.message
      });
    }
  }

  private async executeArbitrage(opportunity: any): Promise<void> {
    try {
      console.log(`🚀 Executing arbitrage for opportunity ${opportunity.id}`);

      // Update opportunity status
      await this.supabase
        .from('arbitrage_opportunities')
        .update({ status: 'executing', executed_at: new Date() })
        .eq('id', opportunity.id);

      // Prepare arbitrage parameters
      const arbitrageParams = {
        tokenIn: opportunity.token_in,
        tokenOut: opportunity.token_out,
        amountIn: ethers.parseEther(opportunity.amount_in.toString()),
        dexRouters: [
          this.DEX_ROUTERS[opportunity.dex_buy as keyof typeof this.DEX_ROUTERS],
          this.DEX_ROUTERS[opportunity.dex_sell as keyof typeof this.DEX_ROUTERS]
        ],
        swapData: [
          ethers.AbiCoder.defaultAbiCoder().encode(['address[]'], [[opportunity.token_in, opportunity.token_out]]),
          ethers.AbiCoder.defaultAbiCoder().encode(['address[]'], [[opportunity.token_out, opportunity.token_in]])
        ],
        minProfit: ethers.parseEther((opportunity.estimated_profit * 0.9).toString()) // 10% slippage tolerance
      };

      const encodedParams = ethers.AbiCoder.defaultAbiCoder().encode(
        ['tuple(address,address,uint256,address[],bytes[],uint256)'],
        [[
          arbitrageParams.tokenIn,
          arbitrageParams.tokenOut,
          arbitrageParams.amountIn,
          arbitrageParams.dexRouters,
          arbitrageParams.swapData,
          arbitrageParams.minProfit
        ]]
      );

      // Execute flash loan arbitrage
      const tx = await this.contract.executeArbitrage(
        opportunity.token_in,
        arbitrageParams.amountIn,
        encodedParams,
        {
          gasLimit: 500000,
          gasPrice: ethers.parseUnits('20', 'gwei')
        }
      );

      console.log(`📝 Transaction submitted: ${tx.hash}`);

      // Wait for confirmation
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        console.log(`✅ Arbitrage executed successfully: ${tx.hash}`);

        await this.supabase
          .from('arbitrage_opportunities')
          .update({
            status: 'completed',
            completed_at: new Date(),
            tx_hash: tx.hash,
            block_number: receipt.blockNumber
          })
          .eq('id', opportunity.id);

      } else {
        throw new Error('Transaction failed');
      }

    } catch (error) {
      console.error('❌ Failed to execute arbitrage:', error);

      await this.supabase
        .from('arbitrage_opportunities')
        .update({
          status: 'failed',
          error_message: error.message,
          completed_at: new Date()
        })
        .eq('id', opportunity.id);

      await this.logSystemEvent('error', 'orchestrator', 'Arbitrage execution failed', {
        opportunityId: opportunity.id,
        error: error.message
      });
    }
  }

  private async sendNotifications(type: string, title: string, message: string, data?: any): Promise<void> {
    // Send Telegram notification
    if (this.telegramBot && process.env.TELEGRAM_CHAT_ID) {
      try {
        await this.telegramBot.sendMessage(process.env.TELEGRAM_CHAT_ID, `🤖 ATOM Bot\n\n${title}\n${message}`);
      } catch (error) {
        console.error('Failed to send Telegram notification:', error);
      }
    }

    // Send email notification
    if (this.emailTransporter && process.env.NOTIFICATION_EMAIL) {
      try {
        await this.emailTransporter.sendMail({
          from: process.env.SMTP_USER,
          to: process.env.NOTIFICATION_EMAIL,
          subject: `ATOM Bot: ${title}`,
          text: message,
          html: `<h3>${title}</h3><p>${message}</p><pre>${JSON.stringify(data, null, 2)}</pre>`
        });
      } catch (error) {
        console.error('Failed to send email notification:', error);
      }
    }
  }
}
