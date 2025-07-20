#!/usr/bin/env python3
"""
ATOM v2 CLI - Command Line Interface for ATOM Arbitrage System
"""

import argparse
import asyncio
import json
import os
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

try:
    from core.config_manager import ConfigManager
    from core.arbitrage_engine import ArbitrageEngine
    from core.logger import setup_logger
    from modules.dex_monitor import DEXMonitor
    from modules.pathfinding import PathfindingEngine
    from modules.mev_protection import MEVProtection
    from modules.cow_integration import CoWIntegration
except ImportError as e:
    print(f"Import error: {e}")
    print("Please ensure all dependencies are installed and the project structure is correct.")
    sys.exit(1)

logger = setup_logger(__name__)

class AtomCLI:
    def __init__(self):
        self.config = ConfigManager()
        self.engine = None
        
    async def start(self, dry_run=False):
        """Start the ATOM arbitrage system"""
        logger.info("🚀 Starting ATOM v2 Arbitrage System...")
        
        try:
            # Initialize components
            dex_monitor = DEXMonitor(self.config)
            pathfinding = PathfindingEngine(self.config)
            mev_protection = MEVProtection(self.config)
            cow_integration = CoWIntegration(self.config)
            
            # Create arbitrage engine
            self.engine = ArbitrageEngine(
                config=self.config,
                dex_monitor=dex_monitor,
                pathfinding=pathfinding,
                mev_protection=mev_protection,
                cow_integration=cow_integration,
                dry_run=dry_run
            )
            
            # Start the engine
            await self.engine.start()
            
        except Exception as e:
            logger.error(f"Failed to start ATOM system: {e}")
            sys.exit(1)
    
    async def stop(self):
        """Stop the ATOM arbitrage system"""
        logger.info("🛑 Stopping ATOM v2 Arbitrage System...")
        
        if self.engine:
            await self.engine.stop()
        
        logger.info("✅ ATOM system stopped successfully")
    
    async def status(self):
        """Show system status"""
        logger.info("📊 ATOM v2 System Status")
        
        if self.engine:
            status = await self.engine.get_status()
            print(json.dumps(status, indent=2))
        else:
            print("System is not running")
    
    async def deploy(self, network="mainnet"):
        """Deploy smart contracts"""
        logger.info(f"🚀 Deploying contracts to {network}...")
        
        from deployment.deploy_contracts import deploy_all_contracts
        
        try:
            contracts = await deploy_all_contracts(network, self.config)
            logger.info(f"✅ Contracts deployed successfully: {contracts}")
        except Exception as e:
            logger.error(f"❌ Deployment failed: {e}")
            sys.exit(1)
    
    async def emergency_withdraw(self):
        """Emergency withdrawal of all funds"""
        logger.warning("🚨 EMERGENCY WITHDRAWAL INITIATED")
        
        if self.engine:
            await self.engine.emergency_withdraw()
        else:
            logger.error("System is not running")

def main():
    parser = argparse.ArgumentParser(description="ATOM v2 Arbitrage CLI")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # Start command
    start_parser = subparsers.add_parser("start", help="Start the arbitrage system")
    start_parser.add_argument("--dry-run", action="store_true", help="Run in simulation mode")
    
    # Stop command
    subparsers.add_parser("stop", help="Stop the arbitrage system")
    
    # Status command
    subparsers.add_parser("status", help="Show system status")
    
    # Deploy command
    deploy_parser = subparsers.add_parser("deploy", help="Deploy smart contracts")
    deploy_parser.add_argument("--network", default="mainnet", help="Network to deploy to")
    
    # Emergency command
    subparsers.add_parser("emergency-withdraw", help="Emergency withdrawal")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    cli = AtomCLI()
    
    try:
        if args.command == "start":
            asyncio.run(cli.start(dry_run=args.dry_run))
        elif args.command == "stop":
            asyncio.run(cli.stop())
        elif args.command == "status":
            asyncio.run(cli.status())
        elif args.command == "deploy":
            asyncio.run(cli.deploy(network=args.network))
        elif args.command == "emergency-withdraw":
            asyncio.run(cli.emergency_withdraw())
    except KeyboardInterrupt:
        logger.info("👋 ATOM CLI interrupted by user")
    except Exception as e:
        logger.error(f"❌ CLI error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
