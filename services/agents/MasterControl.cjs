const EventEmitter = require('events');
const { spawn } = require('child_process');
const path = require('path');

// Import Claude-style agents
const ScannerAgent = require('./ScannerAgent.cjs');
const RiskManagerAgent = require('./RiskManagerAgent.cjs');
const ExecutorAgent = require('./ExecutorAgent.cjs');
const AICoordinatorAgent = require('./AICoordinatorAgent.cjs');

/**
 * MASTER CONTROL SYSTEM - The Command Center
 * 
 * Responsibilities:
 * - Orchestrate all agents
 * - Provide unified API
 * - Handle system-wide events
 * - Manage agent lifecycle
 * - Emergency controls
 */
class MasterControl extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.isRunning = false;
    this.startTime = null;
    
    // Initialize all agents
    this.agents = {
      scanner: new ScannerAgent(config),
      riskManager: new RiskManagerAgent(config),
      executor: new ExecutorAgent(config),
      aiCoordinator: new AICoordinatorAgent(config)
    };
    
    // System statistics
    this.systemStats = {
      uptime: 0,
      totalOpportunities: 0,
      totalExecutions: 0,
      totalProfit: 0,
      systemHealth: 'healthy',
      lastUpdate: Date.now()
    };

    // Claude-style agent registry
    this.claudeAgents = {
      tradeAnalysis: path.join(__dirname, 'agent_trade_analysis.py'),
      slippageRisk: path.join(__dirname, 'agent_slippage_risk.py'),
      latencyControl: path.join(__dirname, 'agent_latency_control.py'),
      mevDefense: path.join(__dirname, 'agent_mev_defense.py')
    };
    
    // Setup inter-agent communication
    this.setupAgentCommunication();
    
    console.log('🎛️  Master Control System initialized');
    console.log('🤖 Agents loaded:', Object.keys(this.agents).join(', '));
  }

  /**
   * Setup communication between agents
   */
  setupAgentCommunication() {
    // Register agents with AI coordinator
    this.agents.aiCoordinator.registerAgent('scanner', this.agents.scanner);
    this.agents.aiCoordinator.registerAgent('riskManager', this.agents.riskManager);
    this.agents.aiCoordinator.registerAgent('executor', this.agents.executor);
    
    // Setup system-wide event listeners
    this.setupSystemEventListeners();
    
    console.log('🔗 Agent communication established');
  }

  /**
   * Setup system-wide event listeners
   */
  setupSystemEventListeners() {
    // Scanner events
    this.agents.scanner.on('opportunityFound', (opportunity) => {
      this.systemStats.totalOpportunities++;
      this.emit('opportunityFound', opportunity);
    });
    
    this.agents.scanner.on('error', (error) => {
      this.handleAgentError('scanner', error);
    });
    
    // Risk Manager events
    this.agents.riskManager.on('emergencyStop', (data) => {
      this.handleEmergencyStop(data);
    });
    
    this.agents.riskManager.on('riskEvaluation', (data) => {
      this.emit('riskEvaluation', data);
    });
    
    // Executor events
    this.agents.executor.on('executionComplete', (execution) => {
      this.systemStats.totalExecutions++;
      if (execution.status === 'success') {
        this.systemStats.totalProfit += execution.actualProfit || 0;
      }
      this.emit('executionComplete', execution);
    });
    
    this.agents.executor.on('error', (error) => {
      this.handleAgentError('executor', error);
    });
    
    // AI Coordinator events
    this.agents.aiCoordinator.on('strategyAdapted', (strategy) => {
      console.log('🧠 Strategy adapted by AI:', strategy);
      this.emit('strategyAdapted', strategy);
    });
    
    this.agents.aiCoordinator.on('marketConditionsChanged', (conditions) => {
      console.log('📊 Market conditions changed:', conditions);
      this.emit('marketConditionsChanged', conditions);
    });
  }

  /**
   * Start the entire system
   */
  async start() {
    if (this.isRunning) {
      console.log('⚠️  System already running');
      return;
    }

    console.log('🚀 Starting Master Control System...');
    console.log('=' .repeat(50));
    
    try {
      this.startTime = Date.now();
      this.isRunning = true;
      
      // Start agents in order
      console.log('🔍 Starting Scanner Agent...');
      await this.agents.scanner.start();
      
      console.log('🛡️  Starting Risk Manager Agent...');
      await this.agents.riskManager.start();
      
      console.log('⚡ Starting Executor Agent...');
      await this.agents.executor.start();
      
      console.log('🧠 Starting AI Coordinator Agent...');
      await this.agents.aiCoordinator.start();
      
      // Start system monitoring
      this.startSystemMonitoring();
      
      console.log('=' .repeat(50));
      console.log('✅ MASTER CONTROL SYSTEM ONLINE');
      console.log('🎯 All agents operational');
      console.log('🤖 AI coordination active');
      console.log('🛡️  Security systems armed');
      console.log('⚡ Ready for arbitrage operations');
      console.log('=' .repeat(50));
      
      this.emit('systemStarted');
      
    } catch (error) {
      console.error('❌ Failed to start system:', error.message);
      await this.stop();
      throw error;
    }
  }

  /**
   * Stop the entire system
   */
  async stop() {
    if (!this.isRunning) {
      console.log('⚠️  System already stopped');
      return;
    }

    console.log('🛑 Stopping Master Control System...');
    this.isRunning = false;
    
    try {
      // Stop agents in reverse order
      console.log('🧠 Stopping AI Coordinator...');
      await this.agents.aiCoordinator.stop();
      
      console.log('⚡ Stopping Executor...');
      await this.agents.executor.stop();
      
      console.log('🛡️  Stopping Risk Manager...');
      await this.agents.riskManager.stop();
      
      console.log('🔍 Stopping Scanner...');
      await this.agents.scanner.stop();
      
      console.log('✅ Master Control System stopped');
      this.emit('systemStopped');
      
    } catch (error) {
      console.error('❌ Error stopping system:', error.message);
    }
  }

  /**
   * Emergency stop all operations
   */
  emergencyStop(reason) {
    console.log(`🚨 EMERGENCY STOP ACTIVATED: ${reason}`);
    
    // Immediately stop all agents
    this.agents.riskManager.emergencyStopAll(reason);
    this.agents.executor.stop();
    this.agents.scanner.stop();
    
    this.systemStats.systemHealth = 'emergency_stop';
    this.emit('emergencyStop', { reason, timestamp: Date.now() });
  }

  /**
   * Handle agent errors
   */
  handleAgentError(agentName, error) {
    console.error(`❌ Agent error [${agentName}]:`, error.message);
    
    // Implement error recovery logic
    if (error.severity === 'critical') {
      this.emergencyStop(`Critical error in ${agentName}: ${error.message}`);
    } else {
      // Try to restart the agent
      this.restartAgent(agentName);
    }
    
    this.emit('agentError', { agentName, error });
  }

  /**
   * Handle emergency stop from risk manager
   */
  handleEmergencyStop(data) {
    console.log(`🚨 Emergency stop triggered by Risk Manager: ${data.reason}`);
    this.emergencyStop(data.reason);
  }

  /**
   * Restart a specific agent
   */
  async restartAgent(agentName) {
    try {
      console.log(`🔄 Restarting agent: ${agentName}`);
      
      await this.agents[agentName].stop();
      await this.sleep(2000); // Wait 2 seconds
      await this.agents[agentName].start();
      
      console.log(`✅ Agent restarted: ${agentName}`);
      this.emit('agentRestarted', { agentName, timestamp: Date.now() });
      
    } catch (error) {
      console.error(`❌ Failed to restart agent ${agentName}:`, error.message);
      this.emergencyStop(`Failed to restart ${agentName}`);
    }
  }

  /**
   * Start system monitoring
   */
  startSystemMonitoring() {
    setInterval(() => {
      this.updateSystemStats();
      this.checkSystemHealth();
      this.emit('systemStats', this.getSystemStats());
    }, 10000); // Update every 10 seconds
  }

  /**
   * Update system statistics
   */
  updateSystemStats() {
    if (this.startTime) {
      this.systemStats.uptime = Date.now() - this.startTime;
    }
    this.systemStats.lastUpdate = Date.now();
  }

  /**
   * Check overall system health
   */
  checkSystemHealth() {
    const agentHealth = Object.keys(this.agents).map(name => {
      const agent = this.agents[name];
      return {
        name,
        status: agent.isActive || agent.isRunning || agent.isScanning || false
      };
    });
    
    const healthyAgents = agentHealth.filter(a => a.status).length;
    const totalAgents = agentHealth.length;
    
    if (healthyAgents === totalAgents) {
      this.systemStats.systemHealth = 'healthy';
    } else if (healthyAgents > totalAgents / 2) {
      this.systemStats.systemHealth = 'degraded';
    } else {
      this.systemStats.systemHealth = 'critical';
    }
  }

  /**
   * Get comprehensive system status
   */
  getSystemStatus() {
    return {
      isRunning: this.isRunning,
      systemStats: this.systemStats,
      agentStatus: {
        scanner: this.agents.scanner.getStats(),
        riskManager: this.agents.riskManager.getRiskStatus(),
        executor: this.agents.executor.getStats(),
        aiCoordinator: this.agents.aiCoordinator.getCoordinationStatus()
      },
      marketConditions: this.agents.aiCoordinator.marketConditions,
      strategyParams: this.agents.aiCoordinator.strategyParams
    };
  }

  /**
   * Get system statistics
   */
  getSystemStats() {
    return {
      ...this.systemStats,
      agentCount: Object.keys(this.agents).length,
      activeAgents: Object.values(this.agents).filter(a => 
        a.isActive || a.isRunning || a.isScanning
      ).length
    };
  }

  /**
   * Manual override controls
   */
  setManualOverride(type, value) {
    switch (type) {
      case 'minProfitThreshold':
        this.agents.aiCoordinator.strategyParams.minProfitThreshold = value;
        this.agents.aiCoordinator.updateAgentParameters();
        break;
        
      case 'maxPositionSize':
        this.agents.riskManager.riskLimits.maxPositionSize = value;
        break;
        
      case 'scanInterval':
        this.agents.scanner.config.scanInterval = value;
        break;
        
      default:
        throw new Error(`Unknown override type: ${type}`);
    }
    
    console.log(`🎛️  Manual override set: ${type} = ${value}`);
    this.emit('manualOverride', { type, value, timestamp: Date.now() });
  }

  /**
   * Get agent by name
   */
  getAgent(name) {
    return this.agents[name];
  }

  /**
   * Check if system is healthy
   */
  isHealthy() {
    return this.systemStats.systemHealth === 'healthy';
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = MasterControl;
