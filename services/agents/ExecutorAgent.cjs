const { ethers } = require('ethers');
const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');

/**
 * EXECUTOR AGENT - The Hands
 * 
 * Responsibilities:
 * - Execute approved arbitrage trades
 * - Manage flash loan transactions
 * - Handle transaction failures and retries
 * - Monitor execution performance
 * - Gas optimization
 */
class ExecutorAgent extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.isActive = false;
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.wallet = new ethers.Wallet(config.privateKey, this.provider);
    
    // Execution tracking
    this.executionQueue = [];
    this.activeExecutions = new Map();
    this.executionHistory = [];
    this.stats = {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      totalGasUsed: 0,
      totalProfit: 0,
      avgExecutionTime: 0
    };
    
    this.loadContract();
    console.log('⚡ Executor Agent initialized');
  }

  loadContract() {
    try {
      const artifactPath = path.join(__dirname, '../artifacts/contracts/AtomArbitrage.sol/AtomArbitrage.json');
      const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
      
      this.contract = new ethers.Contract(
        this.config.contractAddress,
        artifact.abi,
        this.wallet
      );
      
      console.log('✅ Smart contract loaded:', this.config.contractAddress);
    } catch (error) {
      console.error('❌ Failed to load contract:', error.message);
      throw error;
    }
  }

  async start() {
    if (this.isActive) {
      console.log('⚠️  Executor already active');
      return;
    }

    console.log('🚀 Starting Executor Agent...');
    this.isActive = true;
    this.emit('started');
    
    // Start execution loop
    this.executionLoop();
    
    console.log('✅ Executor Agent started');
  }

  async stop() {
    console.log('🛑 Stopping Executor Agent...');
    this.isActive = false;
    
    // Wait for active executions to complete
    if (this.activeExecutions.size > 0) {
      console.log(`⏳ Waiting for ${this.activeExecutions.size} active executions to complete...`);
      await this.waitForActiveExecutions();
    }
    
    this.emit('stopped');
    console.log('✅ Executor Agent stopped');
  }

  /**
   * Queue an approved opportunity for execution
   */
  queueExecution(opportunity, riskEvaluation) {
    const execution = {
      id: this.generateExecutionId(),
      opportunity,
      riskEvaluation,
      status: 'queued',
      queuedAt: Date.now(),
      priority: this.calculatePriority(opportunity),
      retryCount: 0,
      maxRetries: 3
    };

    // Insert in priority order
    this.insertByPriority(execution);
    
    console.log(`📋 Execution queued: ${execution.id} - ${opportunity.pair} - Priority: ${execution.priority}`);
    this.emit('executionQueued', execution);
    
    return execution.id;
  }

  /**
   * Main execution loop
   */
  async executionLoop() {
    while (this.isActive) {
      try {
        if (this.executionQueue.length > 0 && this.activeExecutions.size < this.config.maxConcurrentExecutions) {
          const execution = this.executionQueue.shift();
          this.executeArbitrage(execution);
        }
        
        await this.sleep(100); // Check every 100ms
      } catch (error) {
        console.error('❌ Execution loop error:', error.message);
        await this.sleep(1000);
      }
    }
  }

  /**
   * Execute arbitrage trade
   */
  async executeArbitrage(execution) {
    const startTime = Date.now();
    execution.status = 'executing';
    execution.startedAt = startTime;
    this.activeExecutions.set(execution.id, execution);
    
    console.log(`⚡ Executing arbitrage: ${execution.id} - ${execution.opportunity.pair}`);
    this.emit('executionStarted', execution);

    try {
      // Prepare transaction parameters
      const txParams = await this.prepareTxParams(execution);
      
      // Execute flash loan arbitrage
      const tx = await this.contract.executeArbitrage(
        execution.opportunity.tokenA,
        execution.opportunity.volume,
        txParams.encodedParams,
        {
          gasLimit: txParams.gasLimit,
          gasPrice: txParams.gasPrice,
          value: 0
        }
      );

      console.log(`📝 Transaction sent: ${tx.hash}`);
      execution.txHash = tx.hash;
      execution.status = 'pending';
      this.emit('transactionSent', { execution, txHash: tx.hash });

      // Wait for confirmation
      const receipt = await tx.wait();
      const endTime = Date.now();
      
      execution.executionTime = endTime - startTime;
      execution.gasUsed = receipt.gasUsed;
      execution.gasPrice = receipt.gasPrice;
      execution.blockNumber = receipt.blockNumber;
      
      if (receipt.status === 1) {
        // Success
        execution.status = 'success';
        const profit = await this.calculateActualProfit(execution, receipt);
        execution.actualProfit = profit;
        
        this.stats.successfulExecutions++;
        this.stats.totalProfit += profit;
        
        console.log(`✅ Execution successful: ${execution.id} - Profit: $${profit.toFixed(2)}`);
        this.emit('executionSuccess', execution);
        
      } else {
        // Transaction failed
        execution.status = 'failed';
        execution.error = 'Transaction reverted';
        
        this.stats.failedExecutions++;
        console.log(`❌ Execution failed: ${execution.id} - Transaction reverted`);
        this.emit('executionFailed', execution);
      }

    } catch (error) {
      // Execution error
      execution.status = 'error';
      execution.error = error.message;
      execution.executionTime = Date.now() - startTime;
      
      console.log(`❌ Execution error: ${execution.id} - ${error.message}`);
      
      // Retry logic
      if (execution.retryCount < execution.maxRetries && this.shouldRetry(error)) {
        execution.retryCount++;
        execution.status = 'retrying';
        
        console.log(`🔄 Retrying execution: ${execution.id} - Attempt ${execution.retryCount}/${execution.maxRetries}`);
        
        // Add back to queue with delay
        setTimeout(() => {
          this.executionQueue.unshift(execution);
        }, 5000 * execution.retryCount); // Exponential backoff
        
        this.emit('executionRetry', execution);
      } else {
        this.stats.failedExecutions++;
        console.log(`❌ Execution failed permanently: ${execution.id}`);
        this.emit('executionFailed', execution);
      }
    } finally {
      // Update stats
      this.stats.totalExecutions++;
      this.stats.totalGasUsed += execution.gasUsed || 0;
      this.stats.avgExecutionTime = this.calculateAvgExecutionTime();
      
      // Move to history
      this.executionHistory.unshift(execution);
      if (this.executionHistory.length > 1000) {
        this.executionHistory = this.executionHistory.slice(0, 1000);
      }
      
      // Remove from active executions
      this.activeExecutions.delete(execution.id);
      
      this.emit('executionComplete', execution);
    }
  }

  /**
   * Prepare transaction parameters
   */
  async prepareTxParams(execution) {
    const { opportunity, riskEvaluation } = execution;
    
    // Encode arbitrage parameters
    const params = {
      tokenA: opportunity.tokenA,
      tokenB: opportunity.tokenB,
      amountIn: opportunity.volume,
      pathBuy: [opportunity.tokenA, opportunity.tokenB],
      pathSell: [opportunity.tokenB, opportunity.tokenA],
      routerBuy: this.config.uniswapRouter,
      routerSell: this.config.sushiswapRouter,
      minProfit: ethers.parseEther("0.001") // Minimum 0.001 ETH profit
    };

    const encodedParams = ethers.AbiCoder.defaultAbiCoder().encode(
      ["address", "address", "uint256", "address[]", "address[]", "address", "address", "uint256"],
      [
        params.tokenA,
        params.tokenB,
        params.amountIn,
        params.pathBuy,
        params.pathSell,
        params.routerBuy,
        params.routerSell,
        params.minProfit
      ]
    );

    // Optimize gas parameters
    const gasLimit = await this.estimateGasLimit(opportunity, encodedParams);
    const gasPrice = await this.optimizeGasPrice();

    return {
      encodedParams,
      gasLimit: Math.floor(gasLimit * 1.2), // 20% buffer
      gasPrice
    };
  }

  async estimateGasLimit(opportunity, encodedParams) {
    try {
      const estimate = await this.contract.executeArbitrage.estimateGas(
        opportunity.tokenA,
        opportunity.volume,
        encodedParams
      );
      return estimate;
    } catch (error) {
      console.warn('⚠️  Gas estimation failed, using default:', error.message);
      return 500000; // Default gas limit
    }
  }

  async optimizeGasPrice() {
    try {
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice;
      
      // Cap gas price at risk limit
      const maxGasPrice = ethers.parseUnits(this.config.maxGasPrice.toString(), 'gwei');
      return gasPrice > maxGasPrice ? maxGasPrice : gasPrice;
    } catch (error) {
      console.warn('⚠️  Gas price fetch failed, using default:', error.message);
      return ethers.parseUnits('20', 'gwei'); // 20 gwei default
    }
  }

  async calculateActualProfit(execution, receipt) {
    // Parse logs to get actual profit
    // This is simplified - in production, parse the actual events
    const estimatedProfit = execution.opportunity.netProfit;
    const gasCore = parseFloat(ethers.formatEther(execution.gasUsed * execution.gasPrice)) * 2000; // ETH price
    return Math.max(0, estimatedProfit - gasCore);
  }

  shouldRetry(error) {
    const retryableErrors = [
      'network error',
      'timeout',
      'nonce too low',
      'replacement transaction underpriced'
    ];
    
    return retryableErrors.some(retryableError => 
      error.message.toLowerCase().includes(retryableError)
    );
  }

  calculatePriority(opportunity) {
    // Higher profit percentage = higher priority
    return Math.floor(opportunity.profitPercentage * 10);
  }

  insertByPriority(execution) {
    let inserted = false;
    for (let i = 0; i < this.executionQueue.length; i++) {
      if (execution.priority > this.executionQueue[i].priority) {
        this.executionQueue.splice(i, 0, execution);
        inserted = true;
        break;
      }
    }
    if (!inserted) {
      this.executionQueue.push(execution);
    }
  }

  generateExecutionId() {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  calculateAvgExecutionTime() {
    const completedExecutions = this.executionHistory.filter(e => e.executionTime);
    if (completedExecutions.length === 0) return 0;
    
    const totalTime = completedExecutions.reduce((sum, e) => sum + e.executionTime, 0);
    return totalTime / completedExecutions.length;
  }

  async waitForActiveExecutions() {
    while (this.activeExecutions.size > 0) {
      await this.sleep(1000);
    }
  }

  getStats() {
    return {
      ...this.stats,
      queueLength: this.executionQueue.length,
      activeExecutions: this.activeExecutions.size,
      successRate: this.stats.totalExecutions > 0 ? 
        (this.stats.successfulExecutions / this.stats.totalExecutions * 100).toFixed(2) + '%' : '0%',
      isActive: this.isActive
    };
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = ExecutorAgent;
