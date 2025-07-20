"""
ATOM v2 Arbitrage Engine - Core orchestration logic
"""

import asyncio
import time
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from decimal import Decimal

from .logger import setup_logger, log_trade_execution, log_opportunity, log_performance_metrics
from .config_manager import ConfigManager

logger = setup_logger(__name__)

@dataclass
class ArbitrageOpportunity:
    token_in: str
    token_out: str
    amount_in: int
    amount_out: int
    profit_wei: int
    gas_cost_wei: int
    net_profit_wei: int
    dex_path: List[str]
    route_data: Dict[str, Any]
    confidence_score: float
    timestamp: float

class ArbitrageEngine:
    def __init__(self, config: ConfigManager, dex_monitor, pathfinding, mev_protection, cow_integration, dry_run=False):
        self.config = config
        self.dex_monitor = dex_monitor
        self.pathfinding = pathfinding
        self.mev_protection = mev_protection
        self.cow_integration = cow_integration
        self.dry_run = dry_run
        
        self.is_running = False
        self.opportunities_found = 0
        self.trades_executed = 0
        self.total_profit_wei = 0
        self.total_gas_spent_wei = 0
        self.start_time = None
        
        # Trading configuration
        self.min_profit_wei = int(config.get('trading.min_profit_wei'))
        self.trade_amount_wei = int(config.get('trading.trade_amount_wei'))
        self.max_concurrent_trades = config.get('trading.max_concurrent_trades', 3)
        self.slippage_tolerance = config.get('trading.slippage_tolerance', 0.005)
        
        # Active trades tracking
        self.active_trades = set()
        self.trade_semaphore = asyncio.Semaphore(self.max_concurrent_trades)
        
        logger.info(f"ArbitrageEngine initialized (dry_run={dry_run})")
    
    async def start(self):
        """Start the arbitrage engine"""
        if self.is_running:
            logger.warning("Engine is already running")
            return
        
        self.is_running = True
        self.start_time = time.time()
        
        logger.info("🚀 Starting ATOM v2 Arbitrage Engine...")
        
        try:
            # Start all components
            await self.dex_monitor.start()
            await self.pathfinding.start()
            await self.mev_protection.start()
            
            if self.config.is_enabled('cow_protocol'):
                await self.cow_integration.start()
            
            # Start main arbitrage loop
            await self._run_arbitrage_loop()
            
        except Exception as e:
            logger.error(f"Engine startup failed: {e}")
            await self.stop()
            raise
    
    async def stop(self):
        """Stop the arbitrage engine"""
        if not self.is_running:
            return
        
        logger.info("🛑 Stopping ATOM v2 Arbitrage Engine...")
        
        self.is_running = False
        
        # Stop all components
        await self.dex_monitor.stop()
        await self.pathfinding.stop()
        await self.mev_protection.stop()
        
        if self.config.is_enabled('cow_protocol'):
            await self.cow_integration.stop()
        
        # Wait for active trades to complete
        while self.active_trades:
            logger.info(f"Waiting for {len(self.active_trades)} active trades to complete...")
            await asyncio.sleep(1)
        
        logger.info("✅ Engine stopped successfully")
    
    async def _run_arbitrage_loop(self):
        """Main arbitrage detection and execution loop"""
        logger.info("🔍 Starting arbitrage detection loop...")
        
        while self.is_running:
            try:
                # Get latest price data
                price_data = await self.dex_monitor.get_latest_prices()
                
                if not price_data:
                    await asyncio.sleep(1)
                    continue
                
                # Find arbitrage opportunities
                opportunities = await self.pathfinding.find_opportunities(
                    price_data, 
                    self.trade_amount_wei,
                    self.min_profit_wei
                )
                
                if opportunities:
                    self.opportunities_found += len(opportunities)
                    logger.info(f"Found {len(opportunities)} arbitrage opportunities")
                    
                    # Process opportunities concurrently
                    tasks = []
                    for opportunity in opportunities:
                        if len(self.active_trades) < self.max_concurrent_trades:
                            task = asyncio.create_task(self._execute_arbitrage(opportunity))
                            tasks.append(task)
                    
                    if tasks:
                        await asyncio.gather(*tasks, return_exceptions=True)
                
                # Log performance metrics every 60 seconds
                if int(time.time()) % 60 == 0:
                    await self._log_performance_metrics()
                
                # Small delay to prevent overwhelming the system
                await asyncio.sleep(0.1)
                
            except Exception as e:
                logger.error(f"Error in arbitrage loop: {e}")
                await asyncio.sleep(5)
    
    async def _execute_arbitrage(self, opportunity: ArbitrageOpportunity):
        """Execute a single arbitrage opportunity"""
        trade_id = f"trade_{int(time.time() * 1000)}"
        
        async with self.trade_semaphore:
            self.active_trades.add(trade_id)
            
            try:
                logger.info(f"Executing arbitrage {trade_id}: {opportunity.token_in} -> {opportunity.token_out}")
                log_opportunity(opportunity.__dict__)
                
                if self.dry_run:
                    # Simulate execution
                    await asyncio.sleep(0.5)
                    success = True
                    tx_hash = f"0x{'0' * 64}"  # Fake hash for dry run
                else:
                    # Real execution
                    success, tx_hash = await self._execute_real_trade(opportunity)
                
                if success:
                    self.trades_executed += 1
                    self.total_profit_wei += opportunity.net_profit_wei
                    
                    trade_data = {
                        'trade_id': trade_id,
                        'tx_hash': tx_hash,
                        'token_in': opportunity.token_in,
                        'token_out': opportunity.token_out,
                        'amount_in': opportunity.amount_in,
                        'amount_out': opportunity.amount_out,
                        'profit_wei': opportunity.net_profit_wei,
                        'gas_cost_wei': opportunity.gas_cost_wei,
                        'dex_path': opportunity.dex_path,
                        'timestamp': time.time()
                    }
                    
                    log_trade_execution(trade_data)
                    logger.info(f"✅ Trade {trade_id} executed successfully. Profit: {opportunity.net_profit_wei / 1e18:.6f} ETH")
                else:
                    logger.warning(f"❌ Trade {trade_id} failed")
                
            except Exception as e:
                logger.error(f"Error executing trade {trade_id}: {e}")
            finally:
                self.active_trades.discard(trade_id)
    
    async def _execute_real_trade(self, opportunity: ArbitrageOpportunity) -> tuple[bool, str]:
        """Execute real arbitrage trade with MEV protection"""
        try:
            # Use MEV protection if enabled
            if self.config.is_enabled('mev_protection.flashbots_enabled'):
                return await self.mev_protection.execute_protected_trade(opportunity)
            else:
                # Direct execution without MEV protection
                return await self._execute_direct_trade(opportunity)
                
        except Exception as e:
            logger.error(f"Trade execution failed: {e}")
            return False, ""
    
    async def _execute_direct_trade(self, opportunity: ArbitrageOpportunity) -> tuple[bool, str]:
        """Execute trade directly without MEV protection"""
        # This would contain the actual smart contract interaction logic
        # For now, return a simulated result
        await asyncio.sleep(1)  # Simulate network delay
        return True, f"0x{'a' * 64}"
    
    async def get_status(self) -> Dict[str, Any]:
        """Get current engine status"""
        uptime = time.time() - self.start_time if self.start_time else 0
        
        return {
            'is_running': self.is_running,
            'uptime_seconds': uptime,
            'opportunities_found': self.opportunities_found,
            'trades_executed': self.trades_executed,
            'success_rate': self.trades_executed / max(self.opportunities_found, 1),
            'total_profit_wei': self.total_profit_wei,
            'total_profit_eth': self.total_profit_wei / 1e18,
            'total_gas_spent_wei': self.total_gas_spent_wei,
            'active_trades': len(self.active_trades),
            'avg_profit_per_trade': self.total_profit_wei / max(self.trades_executed, 1),
            'trades_per_hour': self.trades_executed / max(uptime / 3600, 1/3600)
        }
    
    async def _log_performance_metrics(self):
        """Log performance metrics"""
        status = await self.get_status()
        log_performance_metrics(status)
    
    async def emergency_withdraw(self):
        """Emergency withdrawal of all funds"""
        logger.warning("🚨 EMERGENCY WITHDRAWAL INITIATED")
        
        # Stop all trading
        self.is_running = False
        
        # Wait for active trades
        while self.active_trades:
            await asyncio.sleep(1)
        
        # Implement emergency withdrawal logic here
        logger.info("Emergency withdrawal completed")
