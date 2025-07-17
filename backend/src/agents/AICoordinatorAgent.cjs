const EventEmitter = require('events');

/**
 * AI COORDINATOR AGENT - The Brain
 * 
 * Responsibilities:
 * - Coordinate all other agents
 * - Make strategic decisions
 * - Optimize parameters in real-time
 * - Learn from trading patterns
 * - Adapt to market conditions
 */
class AICoordinatorAgent extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.isActive = false;
    
    // Agent references
    this.agents = {
      scanner: null,
      riskManager: null,
      executor: null,
      monitor: null
    };
    
    // AI decision making
    this.marketConditions = {
      volatility: 'normal', // low, normal, high
      liquidity: 'normal',  // low, normal, high
      gasPrice: 'normal',   // low, normal, high
      competition: 'normal' // low, normal, high
    };
    
    // Learning system
    this.learningData = {
      successfulPatterns: [],
      failedPatterns: [],
      marketAdaptations: [],
      parameterOptimizations: []
    };
    
    // Strategy parameters (AI will optimize these)
    this.strategyParams = {
      scanInterval: 3000,
      minProfitThreshold: 10,
      maxPositionSize: 5,
      riskTolerance: 0.3,
      aggressiveness: 0.5, // 0 = conservative, 1 = aggressive
      adaptationRate: 0.1   // How quickly to adapt to new conditions
    };
    
    // Performance tracking
    this.performance = {
      hourlyStats: [],
      adaptationHistory: [],
      decisionAccuracy: 0,
      totalDecisions: 0,
      correctDecisions: 0
    };
    
    console.log('🧠 AI Coordinator Agent initialized');
    console.log('🎯 Initial Strategy:', this.strategyParams);
  }

  async start() {
    if (this.isActive) {
      console.log('⚠️  AI Coordinator already active');
      return;
    }

    console.log('🚀 Starting AI Coordinator Agent...');
    this.isActive = true;
    this.emit('started');
    
    // Start coordination loops
    this.coordinationLoop();
    this.learningLoop();
    this.adaptationLoop();
    
    console.log('✅ AI Coordinator Agent started');
  }

  async stop() {
    console.log('🛑 Stopping AI Coordinator Agent...');
    this.isActive = false;
    this.emit('stopped');
    console.log('✅ AI Coordinator Agent stopped');
  }

  /**
   * Register other agents for coordination
   */
  registerAgent(type, agent) {
    this.agents[type] = agent;
    this.setupAgentListeners(type, agent);
    console.log(`🔗 Agent registered: ${type}`);
  }

  /**
   * Setup event listeners for agent coordination
   */
  setupAgentListeners(type, agent) {
    switch (type) {
      case 'scanner':
        agent.on('opportunityFound', (opportunity) => {
          this.handleOpportunityFound(opportunity);
        });
        agent.on('scanComplete', (stats) => {
          this.analyzeScanPerformance(stats);
        });
        break;
        
      case 'riskManager':
        agent.on('riskEvaluation', (data) => {
          this.handleRiskEvaluation(data);
        });
        agent.on('emergencyStop', (data) => {
          this.handleEmergencyStop(data);
        });
        break;
        
      case 'executor':
        agent.on('executionComplete', (execution) => {
          this.handleExecutionComplete(execution);
        });
        agent.on('executionFailed', (execution) => {
          this.handleExecutionFailed(execution);
        });
        break;
    }
  }

  /**
   * Main coordination loop
   */
  async coordinationLoop() {
    while (this.isActive) {
      try {
        // Analyze current market conditions
        await this.analyzeMarketConditions();
        
        // Make strategic decisions
        await this.makeStrategicDecisions();
        
        // Optimize agent parameters
        await this.optimizeAgentParameters();
        
        // Emit coordination status
        this.emit('coordinationUpdate', this.getCoordinationStatus());
        
        await this.sleep(10000); // Coordinate every 10 seconds
      } catch (error) {
        console.error('❌ Coordination error:', error.message);
        await this.sleep(30000);
      }
    }
  }

  /**
   * Handle opportunity found by scanner
   */
  async handleOpportunityFound(opportunity) {
    console.log(`🧠 AI analyzing opportunity: ${opportunity.pair}`);
    
    // AI decision making process
    const decision = await this.makeOpportunityDecision(opportunity);
    
    if (decision.proceed) {
      // Get risk evaluation
      if (this.agents.riskManager) {
        const riskEval = this.agents.riskManager.evaluateOpportunity(opportunity);
        
        if (riskEval.approved) {
          // Queue for execution
          if (this.agents.executor) {
            const executionId = this.agents.executor.queueExecution(opportunity, riskEval);
            console.log(`✅ AI approved execution: ${executionId}`);
          }
        } else {
          console.log(`❌ AI rejected by risk manager: ${riskEval.reason}`);
        }
      }
    } else {
      console.log(`❌ AI rejected opportunity: ${decision.reason}`);
    }
    
    // Record decision for learning
    this.recordDecision(opportunity, decision);
  }

  /**
   * AI decision making for opportunities
   */
  async makeOpportunityDecision(opportunity) {
    const factors = {
      profitability: this.scoreProfitability(opportunity),
      marketConditions: this.scoreMarketConditions(),
      historicalSuccess: this.scoreHistoricalSuccess(opportunity),
      timing: this.scoreTiming(),
      competition: this.scoreCompetition(opportunity)
    };
    
    // Weighted decision score
    const weights = {
      profitability: 0.3,
      marketConditions: 0.2,
      historicalSuccess: 0.2,
      timing: 0.15,
      competition: 0.15
    };
    
    const score = Object.keys(factors).reduce((total, factor) => {
      return total + (factors[factor] * weights[factor]);
    }, 0);
    
    const threshold = 0.6 + (this.strategyParams.aggressiveness * 0.2);
    
    return {
      proceed: score >= threshold,
      score,
      factors,
      reason: score >= threshold ? 'AI approved' : `Score ${score.toFixed(2)} below threshold ${threshold.toFixed(2)}`,
      confidence: Math.min(score * 100, 95)
    };
  }

  /**
   * Score opportunity profitability
   */
  scoreProfitability(opportunity) {
    const profitRatio = opportunity.netProfit / this.strategyParams.minProfitThreshold;
    return Math.min(profitRatio / 3, 1); // Normalize to 0-1
  }

  /**
   * Score current market conditions
   */
  scoreMarketConditions() {
    let score = 0.5; // Base score
    
    // Adjust based on market conditions
    if (this.marketConditions.volatility === 'high') score += 0.2; // More opportunities
    if (this.marketConditions.liquidity === 'high') score += 0.2;  // Better execution
    if (this.marketConditions.gasPrice === 'low') score += 0.1;    // Lower costs
    if (this.marketConditions.competition === 'low') score += 0.2; // Less competition
    
    return Math.min(score, 1);
  }

  /**
   * Score based on historical success with similar opportunities
   */
  scoreHistoricalSuccess(opportunity) {
    const similarPatterns = this.findSimilarPatterns(opportunity);
    if (similarPatterns.length === 0) return 0.5; // Neutral for new patterns
    
    const successRate = similarPatterns.filter(p => p.success).length / similarPatterns.length;
    return successRate;
  }

  /**
   * Score timing factors
   */
  scoreTiming() {
    const hour = new Date().getHours();
    
    // Higher scores during active trading hours
    if (hour >= 9 && hour <= 16) return 0.8;  // US market hours
    if (hour >= 14 && hour <= 22) return 0.7; // EU market hours
    return 0.5; // Off hours
  }

  /**
   * Score competition level
   */
  scoreCompetition(opportunity) {
    // Estimate competition based on opportunity characteristics
    if (opportunity.profitPercentage > 2) return 0.3; // High profit = high competition
    if (opportunity.profitPercentage > 1) return 0.6; // Medium profit = medium competition
    return 0.8; // Low profit = low competition
  }

  /**
   * Learning loop - analyze past performance and adapt
   */
  async learningLoop() {
    while (this.isActive) {
      try {
        // Analyze recent performance
        await this.analyzePerformance();
        
        // Update learning patterns
        await this.updateLearningPatterns();
        
        // Calculate decision accuracy
        this.updateDecisionAccuracy();
        
        await this.sleep(60000); // Learn every minute
      } catch (error) {
        console.error('❌ Learning error:', error.message);
        await this.sleep(120000);
      }
    }
  }

  /**
   * Adaptation loop - adjust strategy based on learning
   */
  async adaptationLoop() {
    while (this.isActive) {
      try {
        // Check if adaptation is needed
        if (this.shouldAdapt()) {
          await this.adaptStrategy();
        }
        
        await this.sleep(300000); // Adapt every 5 minutes
      } catch (error) {
        console.error('❌ Adaptation error:', error.message);
        await this.sleep(600000);
      }
    }
  }

  /**
   * Analyze market conditions
   */
  async analyzeMarketConditions() {
    // This would integrate with real market data APIs
    // For now, simulate market analysis
    
    const conditions = {
      volatility: this.calculateVolatility(),
      liquidity: this.calculateLiquidity(),
      gasPrice: this.calculateGasConditions(),
      competition: this.calculateCompetition()
    };
    
    // Update market conditions if changed
    let changed = false;
    Object.keys(conditions).forEach(key => {
      if (this.marketConditions[key] !== conditions[key]) {
        console.log(`📊 Market condition changed: ${key} = ${conditions[key]}`);
        this.marketConditions[key] = conditions[key];
        changed = true;
      }
    });
    
    if (changed) {
      this.emit('marketConditionsChanged', this.marketConditions);
    }
  }

  calculateVolatility() {
    // Simulate volatility calculation
    const random = Math.random();
    if (random < 0.2) return 'low';
    if (random < 0.8) return 'normal';
    return 'high';
  }

  calculateLiquidity() {
    // Simulate liquidity calculation
    const random = Math.random();
    if (random < 0.3) return 'low';
    if (random < 0.7) return 'normal';
    return 'high';
  }

  calculateGasConditions() {
    // Simulate gas price analysis
    const random = Math.random();
    if (random < 0.3) return 'low';
    if (random < 0.7) return 'normal';
    return 'high';
  }

  calculateCompetition() {
    // Simulate competition analysis
    const random = Math.random();
    if (random < 0.4) return 'low';
    if (random < 0.8) return 'normal';
    return 'high';
  }

  /**
   * Record decision for learning
   */
  recordDecision(opportunity, decision) {
    this.totalDecisions++;
    
    // Store decision pattern
    const pattern = {
      opportunity: {
        pair: opportunity.pair,
        profitPercentage: opportunity.profitPercentage,
        confidence: opportunity.confidence
      },
      decision,
      marketConditions: { ...this.marketConditions },
      timestamp: Date.now()
    };
    
    this.learningData.successfulPatterns.push(pattern);
    
    // Keep only recent patterns
    if (this.learningData.successfulPatterns.length > 1000) {
      this.learningData.successfulPatterns = this.learningData.successfulPatterns.slice(-1000);
    }
  }

  findSimilarPatterns(opportunity) {
    return this.learningData.successfulPatterns.filter(pattern => 
      pattern.opportunity.pair === opportunity.pair &&
      Math.abs(pattern.opportunity.profitPercentage - opportunity.profitPercentage) < 0.5
    );
  }

  shouldAdapt() {
    // Adapt if performance is declining
    const recentPerformance = this.getRecentPerformance();
    return recentPerformance.successRate < 0.6 || recentPerformance.avgProfit < this.strategyParams.minProfitThreshold;
  }

  async adaptStrategy() {
    console.log('🧠 AI adapting strategy...');
    
    const performance = this.getRecentPerformance();
    
    // Adjust parameters based on performance
    if (performance.successRate < 0.5) {
      this.strategyParams.riskTolerance *= 0.9; // Be more conservative
      this.strategyParams.minProfitThreshold *= 1.1; // Require higher profit
    } else if (performance.successRate > 0.8) {
      this.strategyParams.riskTolerance *= 1.05; // Be slightly more aggressive
      this.strategyParams.minProfitThreshold *= 0.95; // Accept lower profit
    }
    
    // Update agent parameters
    this.updateAgentParameters();
    
    console.log('✅ Strategy adapted:', this.strategyParams);
    this.emit('strategyAdapted', this.strategyParams);
  }

  updateAgentParameters() {
    // Update scanner parameters
    if (this.agents.scanner) {
      this.agents.scanner.config.scanInterval = this.strategyParams.scanInterval;
      this.agents.scanner.config.minProfitThreshold = this.strategyParams.minProfitThreshold;
    }
    
    // Update risk manager parameters
    if (this.agents.riskManager) {
      this.agents.riskManager.riskLimits.maxPositionSize = this.strategyParams.maxPositionSize;
      this.agents.riskManager.riskLimits.minProfitThreshold = this.strategyParams.minProfitThreshold;
    }
  }

  getRecentPerformance() {
    // Analyze last hour of performance
    const oneHourAgo = Date.now() - 3600000;
    const recentExecutions = this.performance.hourlyStats.filter(stat => stat.timestamp > oneHourAgo);
    
    if (recentExecutions.length === 0) {
      return { successRate: 0.5, avgProfit: 0 };
    }
    
    const successful = recentExecutions.filter(e => e.success).length;
    const successRate = successful / recentExecutions.length;
    const avgProfit = recentExecutions.reduce((sum, e) => sum + (e.profit || 0), 0) / recentExecutions.length;
    
    return { successRate, avgProfit };
  }

  getCoordinationStatus() {
    return {
      isActive: this.isActive,
      marketConditions: this.marketConditions,
      strategyParams: this.strategyParams,
      performance: {
        decisionAccuracy: this.decisionAccuracy,
        totalDecisions: this.totalDecisions,
        recentPerformance: this.getRecentPerformance()
      },
      agentStatus: {
        scanner: this.agents.scanner?.isScanning || false,
        riskManager: this.agents.riskManager?.isActive || false,
        executor: this.agents.executor?.isActive || false
      }
    };
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = AICoordinatorAgent;
