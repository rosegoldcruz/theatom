const EventEmitter = require('events');

/**
 * RISK MANAGER AGENT - The Guardian
 * 
 * Responsibilities:
 * - Evaluate risk for each opportunity
 * - Implement circuit breakers
 * - Monitor portfolio exposure
 * - Emergency stop mechanisms
 * - Position sizing
 */
class RiskManagerAgent extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.isActive = false;
    
    // Risk parameters
    this.riskLimits = {
      maxPositionSize: config.maxPositionSize || 10, // Max 10 ETH per trade
      maxDailyLoss: config.maxDailyLoss || 100, // Max $100 loss per day
      maxSlippage: config.maxSlippage || 0.005, // 0.5% max slippage
      minConfidence: config.minConfidence || 70, // 70% minimum confidence
      maxGasPrice: config.maxGasPrice || 100, // 100 gwei max
      cooldownPeriod: config.cooldownPeriod || 30000, // 30 seconds between trades
    };
    
    // Risk tracking
    this.dailyPnL = 0;
    this.totalTrades = 0;
    this.successfulTrades = 0;
    this.lastTradeTime = 0;
    this.emergencyStop = false;
    this.riskScore = 0;
    
    // Circuit breaker states
    this.circuitBreakers = {
      consecutiveLosses: { count: 0, limit: 3, active: false },
      rapidLosses: { losses: [], limit: 5, timeWindow: 300000, active: false }, // 5 losses in 5 minutes
      lowSuccessRate: { threshold: 0.5, active: false },
      highGasPrice: { active: false },
      lowLiquidity: { active: false }
    };
    
    console.log('🛡️  Risk Manager Agent initialized');
    console.log('📋 Risk Limits:', this.riskLimits);
  }

  async start() {
    if (this.isActive) {
      console.log('⚠️  Risk Manager already active');
      return;
    }

    console.log('🚀 Starting Risk Manager Agent...');
    this.isActive = true;
    this.emit('started');
    
    // Start monitoring loop
    this.monitoringLoop();
    
    console.log('✅ Risk Manager Agent started');
  }

  async stop() {
    console.log('🛑 Stopping Risk Manager Agent...');
    this.isActive = false;
    this.emit('stopped');
    console.log('✅ Risk Manager Agent stopped');
  }

  /**
   * Evaluate if an opportunity is safe to execute
   */
  evaluateOpportunity(opportunity) {
    const risks = [];
    let riskScore = 0;
    let approved = true;

    // Check emergency stop
    if (this.emergencyStop) {
      return {
        approved: false,
        riskScore: 100,
        risks: ['EMERGENCY_STOP_ACTIVE'],
        reason: 'Emergency stop is active'
      };
    }

    // Check circuit breakers
    const circuitBreakerCheck = this.checkCircuitBreakers();
    if (!circuitBreakerCheck.passed) {
      return {
        approved: false,
        riskScore: 90,
        risks: circuitBreakerCheck.activeBreakers,
        reason: 'Circuit breaker active'
      };
    }

    // 1. Position Size Risk
    const positionValue = opportunity.volume * opportunity.buyPrice;
    if (positionValue > this.riskLimits.maxPositionSize) {
      risks.push('POSITION_TOO_LARGE');
      riskScore += 30;
      approved = false;
    }

    // 2. Confidence Risk
    if (opportunity.confidence < this.riskLimits.minConfidence) {
      risks.push('LOW_CONFIDENCE');
      riskScore += 25;
      approved = false;
    }

    // 3. Slippage Risk
    const impliedSlippage = this.calculateImpliedSlippage(opportunity);
    if (impliedSlippage > this.riskLimits.maxSlippage) {
      risks.push('HIGH_SLIPPAGE');
      riskScore += 20;
      approved = false;
    }

    // 4. Gas Price Risk
    const currentGasPrice = this.getCurrentGasPrice();
    if (currentGasPrice > this.riskLimits.maxGasPrice) {
      risks.push('HIGH_GAS_PRICE');
      riskScore += 15;
      approved = false;
    }

    // 5. Cooldown Risk
    const timeSinceLastTrade = Date.now() - this.lastTradeTime;
    if (timeSinceLastTrade < this.riskLimits.cooldownPeriod) {
      risks.push('COOLDOWN_ACTIVE');
      riskScore += 10;
      approved = false;
    }

    // 6. Daily Loss Risk
    if (this.dailyPnL < -this.riskLimits.maxDailyLoss) {
      risks.push('DAILY_LOSS_LIMIT');
      riskScore += 40;
      approved = false;
    }

    // 7. Profit Margin Risk
    const profitMargin = opportunity.netProfit / (opportunity.buyPrice * opportunity.volume);
    if (profitMargin < 0.001) { // Less than 0.1% profit margin
      risks.push('LOW_PROFIT_MARGIN');
      riskScore += 15;
    }

    // Calculate final risk score
    riskScore = Math.min(riskScore, 100);
    this.riskScore = riskScore;

    const evaluation = {
      approved: approved && riskScore < 50,
      riskScore,
      risks,
      reason: approved ? 'Opportunity approved' : 'Risk limits exceeded',
      positionSize: this.calculateOptimalPositionSize(opportunity),
      maxSlippage: this.riskLimits.maxSlippage,
      stopLoss: this.calculateStopLoss(opportunity),
      timeLimit: 60000 // 1 minute execution time limit
    };

    // Log evaluation
    if (evaluation.approved) {
      console.log(`✅ Risk Check PASSED: ${opportunity.pair} - Risk Score: ${riskScore}`);
    } else {
      console.log(`❌ Risk Check FAILED: ${opportunity.pair} - Risk Score: ${riskScore} - Risks: ${risks.join(', ')}`);
    }

    this.emit('riskEvaluation', { opportunity, evaluation });
    return evaluation;
  }

  /**
   * Record trade result for risk tracking
   */
  recordTradeResult(trade) {
    this.totalTrades++;
    this.lastTradeTime = Date.now();
    
    if (trade.success) {
      this.successfulTrades++;
      this.dailyPnL += trade.profit;
      this.circuitBreakers.consecutiveLosses.count = 0; // Reset consecutive losses
      
      console.log(`📈 Trade Success: +$${trade.profit.toFixed(2)} | Daily P&L: $${this.dailyPnL.toFixed(2)}`);
    } else {
      this.dailyPnL += trade.loss || 0;
      this.circuitBreakers.consecutiveLosses.count++;
      
      // Track rapid losses
      this.circuitBreakers.rapidLosses.losses.push(Date.now());
      this.circuitBreakers.rapidLosses.losses = this.circuitBreakers.rapidLosses.losses
        .filter(time => Date.now() - time < this.circuitBreakers.rapidLosses.timeWindow);
      
      console.log(`📉 Trade Failed: -$${Math.abs(trade.loss || 0).toFixed(2)} | Daily P&L: $${this.dailyPnL.toFixed(2)}`);
    }

    // Update circuit breakers
    this.updateCircuitBreakers();
    
    this.emit('tradeRecorded', {
      trade,
      dailyPnL: this.dailyPnL,
      successRate: this.getSuccessRate(),
      riskScore: this.riskScore
    });
  }

  /**
   * Check all circuit breakers
   */
  checkCircuitBreakers() {
    const activeBreakers = [];
    
    // Consecutive losses
    if (this.circuitBreakers.consecutiveLosses.count >= this.circuitBreakers.consecutiveLosses.limit) {
      this.circuitBreakers.consecutiveLosses.active = true;
      activeBreakers.push('CONSECUTIVE_LOSSES');
    }
    
    // Rapid losses
    if (this.circuitBreakers.rapidLosses.losses.length >= this.circuitBreakers.rapidLosses.limit) {
      this.circuitBreakers.rapidLosses.active = true;
      activeBreakers.push('RAPID_LOSSES');
    }
    
    // Low success rate
    const successRate = this.getSuccessRate();
    if (this.totalTrades >= 10 && successRate < this.circuitBreakers.lowSuccessRate.threshold) {
      this.circuitBreakers.lowSuccessRate.active = true;
      activeBreakers.push('LOW_SUCCESS_RATE');
    }

    return {
      passed: activeBreakers.length === 0,
      activeBreakers
    };
  }

  /**
   * Update circuit breaker states
   */
  updateCircuitBreakers() {
    // Auto-reset circuit breakers after cooldown
    const now = Date.now();
    
    // Reset consecutive losses after successful trade
    if (this.circuitBreakers.consecutiveLosses.active && this.circuitBreakers.consecutiveLosses.count === 0) {
      this.circuitBreakers.consecutiveLosses.active = false;
      console.log('🔄 Circuit Breaker RESET: Consecutive Losses');
    }
    
    // Reset rapid losses after time window
    if (this.circuitBreakers.rapidLosses.active && this.circuitBreakers.rapidLosses.losses.length < this.circuitBreakers.rapidLosses.limit) {
      this.circuitBreakers.rapidLosses.active = false;
      console.log('🔄 Circuit Breaker RESET: Rapid Losses');
    }
  }

  /**
   * Emergency stop all trading
   */
  emergencyStopAll(reason) {
    this.emergencyStop = true;
    console.log(`🚨 EMERGENCY STOP ACTIVATED: ${reason}`);
    this.emit('emergencyStop', { reason, timestamp: Date.now() });
  }

  /**
   * Reset emergency stop
   */
  resetEmergencyStop() {
    this.emergencyStop = false;
    console.log('🔄 Emergency stop RESET');
    this.emit('emergencyStopReset', { timestamp: Date.now() });
  }

  calculateImpliedSlippage(opportunity) {
    // Estimate slippage based on trade size and liquidity
    return 0.002; // Mock 0.2% slippage
  }

  getCurrentGasPrice() {
    // Mock current gas price - in production, fetch from network
    return 25; // 25 gwei
  }

  calculateOptimalPositionSize(opportunity) {
    // Calculate position size based on risk and opportunity
    const maxSize = this.riskLimits.maxPositionSize;
    const confidenceMultiplier = opportunity.confidence / 100;
    return Math.min(maxSize * confidenceMultiplier, maxSize);
  }

  calculateStopLoss(opportunity) {
    // Calculate stop loss level
    return opportunity.buyPrice * 0.95; // 5% stop loss
  }

  getSuccessRate() {
    return this.totalTrades > 0 ? this.successfulTrades / this.totalTrades : 0;
  }

  async monitoringLoop() {
    while (this.isActive) {
      try {
        // Reset daily P&L at midnight
        const now = new Date();
        if (now.getHours() === 0 && now.getMinutes() === 0) {
          this.dailyPnL = 0;
          console.log('🔄 Daily P&L reset');
        }
        
        // Emit risk status
        this.emit('riskStatus', this.getRiskStatus());
        
        await this.sleep(10000); // Check every 10 seconds
      } catch (error) {
        console.error('❌ Risk monitoring error:', error.message);
        await this.sleep(30000);
      }
    }
  }

  getRiskStatus() {
    return {
      isActive: this.isActive,
      emergencyStop: this.emergencyStop,
      riskScore: this.riskScore,
      dailyPnL: this.dailyPnL,
      successRate: this.getSuccessRate(),
      totalTrades: this.totalTrades,
      circuitBreakers: this.circuitBreakers,
      riskLimits: this.riskLimits
    };
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = RiskManagerAgent;
