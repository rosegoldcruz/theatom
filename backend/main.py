"""
THEATOM - Unified FastAPI Orchestration Layer
The central command center for the Advanced Efficient Optimized Network

This is the main entry point that coordinates:
- ADOM (Python arbitrage engine)
- ATOM (Node.js bot)
- Claude-style agents
- All API endpoints
"""

import os
import sys
import json
import asyncio
import subprocess
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
from pathlib import Path

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/theatom.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("THEATOM")

# Initialize FastAPI app
app = FastAPI(
    title="THEATOM - Advanced Efficient Optimized Network",
    description="Unified arbitrage orchestration platform",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
system_state = {
    "status": "initializing",
    "adom_status": "stopped",
    "atom_status": "stopped",
    "agents_status": {},
    "last_update": datetime.now().isoformat(),
    "total_trades": 0,
    "total_profit": 0.0,
    "active_opportunities": []
}

# Pydantic models
class TradeRequest(BaseModel):
    pair: str
    amount: float
    dex_a: str
    dex_b: str
    max_slippage: float = 0.02
    gas_limit: Optional[int] = None

class OpportunityRequest(BaseModel):
    pairs: List[str] = ["ETH/USDC", "WBTC/ETH", "USDC/USDT"]
    min_profit: float = 10.0
    max_gas_price: int = 50

class AgentRequest(BaseModel):
    agent_name: str
    input_data: Dict[str, Any]

# ============================================================================
# CORE API ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """Root endpoint - system status"""
    return {
        "message": "🧬 THEATOM - Advanced Efficient Optimized Network",
        "status": system_state["status"],
        "version": "2.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "adom_status": system_state["adom_status"],
        "atom_status": system_state["atom_status"],
        "agents_count": len(system_state["agents_status"]),
        "uptime": datetime.now().isoformat(),
        "system_health": "operational"
    }

@app.get("/api/status")
async def get_system_status():
    """Get comprehensive system status"""
    return {
        "system": system_state,
        "environment": {
            "network": os.getenv("NETWORK", "base_sepolia"),
            "rpc_url": os.getenv("BASE_SEPOLIA_RPC_URL", "")[:50] + "...",
            "contract_address": os.getenv("BASE_SEPOLIA_CONTRACT_ADDRESS", ""),
            "max_gas_cost": os.getenv("MAX_GAS_COST_USD", "20")
        },
        "performance": {
            "total_trades": system_state["total_trades"],
            "total_profit": system_state["total_profit"],
            "active_opportunities": len(system_state["active_opportunities"])
        }
    }

# ============================================================================
# TRADE EXECUTION ENDPOINTS
# ============================================================================

@app.post("/api/execute-trade")
async def execute_trade(trade_request: TradeRequest, background_tasks: BackgroundTasks):
    """Execute arbitrage trade through ADOM"""
    try:
        logger.info(f"🚀 Executing trade: {trade_request.pair} on {trade_request.dex_a} -> {trade_request.dex_b}")
        
        # Prepare trade data for ADOM
        trade_data = {
            "pair": trade_request.pair,
            "amount": trade_request.amount,
            "dex_a": trade_request.dex_a,
            "dex_b": trade_request.dex_b,
            "max_slippage": trade_request.max_slippage,
            "gas_limit": trade_request.gas_limit,
            "timestamp": datetime.now().isoformat()
        }
        
        # Execute trade in background
        background_tasks.add_task(execute_adom_trade, trade_data)
        
        # Update system state
        system_state["total_trades"] += 1
        system_state["last_update"] = datetime.now().isoformat()
        
        return {
            "status": "trade_initiated",
            "trade_id": f"trade_{system_state['total_trades']}",
            "message": "Trade execution started",
            "trade_data": trade_data
        }
        
    except Exception as e:
        logger.error(f"❌ Trade execution failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/scan-opportunities")
async def scan_opportunities(request: OpportunityRequest = None):
    """Scan for arbitrage opportunities using ATOM"""
    try:
        logger.info("🔍 Scanning for arbitrage opportunities...")
        
        # Default request if none provided
        if not request:
            request = OpportunityRequest()
        
        # Call ATOM scanner
        opportunities = await scan_with_atom(request)
        
        # Update system state
        system_state["active_opportunities"] = opportunities
        system_state["last_update"] = datetime.now().isoformat()
        
        return {
            "status": "scan_complete",
            "opportunities_found": len(opportunities),
            "opportunities": opportunities,
            "scan_parameters": {
                "pairs": request.pairs,
                "min_profit": request.min_profit,
                "max_gas_price": request.max_gas_price
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Opportunity scan failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# AGENT MANAGEMENT ENDPOINTS
# ============================================================================

@app.get("/api/agents/status")
async def get_agents_status():
    """Get status of all Claude-style agents"""
    try:
        agents_dir = Path(__file__).parent.parent / "services" / "agents"
        available_agents = []
        
        for agent_file in agents_dir.glob("agent_*.py"):
            agent_name = agent_file.stem.replace("agent_", "")
            available_agents.append({
                "name": agent_name,
                "file": str(agent_file),
                "status": system_state["agents_status"].get(agent_name, "available")
            })
        
        return {
            "total_agents": len(available_agents),
            "available_agents": available_agents,
            "active_agents": [name for name, status in system_state["agents_status"].items() if status == "active"]
        }
        
    except Exception as e:
        logger.error(f"❌ Agent status check failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/agents/execute")
async def execute_agent(agent_request: AgentRequest):
    """Execute a Claude-style agent"""
    try:
        logger.info(f"🤖 Executing agent: {agent_request.agent_name}")
        
        # Find agent file
        agents_dir = Path(__file__).parent.parent / "services" / "agents"
        agent_file = agents_dir / f"agent_{agent_request.agent_name}.py"
        
        if not agent_file.exists():
            raise HTTPException(status_code=404, detail=f"Agent {agent_request.agent_name} not found")
        
        # Execute agent
        result = await execute_claude_agent(str(agent_file), agent_request.input_data)
        
        # Update agent status
        system_state["agents_status"][agent_request.agent_name] = "completed"
        system_state["last_update"] = datetime.now().isoformat()
        
        return {
            "status": "agent_executed",
            "agent_name": agent_request.agent_name,
            "result": result,
            "execution_time": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Agent execution failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# SYSTEM CONTROL ENDPOINTS
# ============================================================================

@app.post("/api/system/start")
async def start_system():
    """Start the entire THEATOM system"""
    try:
        logger.info("🚀 Starting THEATOM system...")
        
        # Start ADOM
        await start_adom()
        
        # Start ATOM
        await start_atom()
        
        # Update system state
        system_state["status"] = "running"
        system_state["last_update"] = datetime.now().isoformat()
        
        return {
            "status": "system_started",
            "message": "THEATOM system is now running",
            "components": {
                "adom": system_state["adom_status"],
                "atom": system_state["atom_status"]
            }
        }
        
    except Exception as e:
        logger.error(f"❌ System start failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/system/stop")
async def stop_system():
    """Stop the entire THEATOM system"""
    try:
        logger.info("🛑 Stopping THEATOM system...")
        
        # Stop ADOM
        await stop_adom()
        
        # Stop ATOM
        await stop_atom()
        
        # Update system state
        system_state["status"] = "stopped"
        system_state["adom_status"] = "stopped"
        system_state["atom_status"] = "stopped"
        system_state["last_update"] = datetime.now().isoformat()
        
        return {
            "status": "system_stopped",
            "message": "THEATOM system has been stopped"
        }
        
    except Exception as e:
        logger.error(f"❌ System stop failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# BACKGROUND TASKS AND UTILITIES
# ============================================================================

async def execute_adom_trade(trade_data: Dict[str, Any]):
    """Execute trade using ADOM (Python arbitrage engine)"""
    try:
        adom_dir = Path(__file__).parent / "adom"
        
        # Create signal file for ADOM
        signal_data = {
            "id": f"signal_{datetime.now().timestamp()}",
            "status": "pending",
            "pair": trade_data["pair"],
            "amount": trade_data["amount"],
            "dex_a": trade_data["dex_a"],
            "dex_b": trade_data["dex_b"],
            "max_slippage": trade_data["max_slippage"],
            "expires_at": datetime.now().isoformat(),
            "created_at": datetime.now().isoformat()
        }
        
        # Write signal to ADOM
        signals_file = adom_dir / "signals.json"
        with open(signals_file, 'w') as f:
            json.dump([signal_data], f, indent=2)
        
        logger.info(f"✅ Trade signal sent to ADOM: {signal_data['id']}")
        
    except Exception as e:
        logger.error(f"❌ ADOM trade execution failed: {e}")

async def scan_with_atom(request: OpportunityRequest) -> List[Dict[str, Any]]:
    """Scan for opportunities using ATOM (Node.js bot)"""
    try:
        # Mock opportunities for now - in real implementation, call ATOM
        opportunities = [
            {
                "pair": "ETH/USDC",
                "dex_a": "uniswap_v3",
                "dex_b": "sushiswap",
                "price_a": 2000.5,
                "price_b": 2005.2,
                "profit_potential": 47.0,
                "gas_cost": 15.0,
                "net_profit": 32.0,
                "confidence": 0.85
            }
        ]
        
        return opportunities
        
    except Exception as e:
        logger.error(f"❌ ATOM scan failed: {e}")
        return []

async def execute_claude_agent(agent_file: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
    """Execute a Claude-style agent"""
    try:
        # Prepare input JSON
        input_json = json.dumps(input_data)
        
        # Execute Python agent
        process = await asyncio.create_subprocess_exec(
            sys.executable, agent_file,
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        stdout, stderr = await process.communicate(input_json.encode())
        
        if process.returncode == 0:
            result = json.loads(stdout.decode())
            return result
        else:
            raise Exception(f"Agent execution failed: {stderr.decode()}")
            
    except Exception as e:
        logger.error(f"❌ Claude agent execution failed: {e}")
        return {"error": str(e)}

async def start_adom():
    """Start ADOM (Python arbitrage engine)"""
    try:
        system_state["adom_status"] = "starting"
        # In real implementation, start ADOM process
        await asyncio.sleep(1)  # Simulate startup time
        system_state["adom_status"] = "running"
        logger.info("✅ ADOM started successfully")
    except Exception as e:
        system_state["adom_status"] = "error"
        logger.error(f"❌ ADOM start failed: {e}")

async def start_atom():
    """Start ATOM (Node.js bot)"""
    try:
        system_state["atom_status"] = "starting"
        # In real implementation, start ATOM process
        await asyncio.sleep(1)  # Simulate startup time
        system_state["atom_status"] = "running"
        logger.info("✅ ATOM started successfully")
    except Exception as e:
        system_state["atom_status"] = "error"
        logger.error(f"❌ ATOM start failed: {e}")

async def stop_adom():
    """Stop ADOM"""
    try:
        system_state["adom_status"] = "stopping"
        await asyncio.sleep(0.5)
        system_state["adom_status"] = "stopped"
        logger.info("✅ ADOM stopped successfully")
    except Exception as e:
        logger.error(f"❌ ADOM stop failed: {e}")

async def stop_atom():
    """Stop ATOM"""
    try:
        system_state["atom_status"] = "stopping"
        await asyncio.sleep(0.5)
        system_state["atom_status"] = "stopped"
        logger.info("✅ ATOM stopped successfully")
    except Exception as e:
        logger.error(f"❌ ATOM stop failed: {e}")

# ============================================================================
# STARTUP
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize THEATOM on startup"""
    logger.info("🧬 THEATOM - Advanced Efficient Optimized Network Starting...")
    logger.info("=" * 60)
    
    # Create logs directory
    os.makedirs("logs", exist_ok=True)
    
    # Initialize system state
    system_state["status"] = "ready"
    system_state["last_update"] = datetime.now().isoformat()
    
    logger.info("✅ THEATOM FastAPI orchestration layer ready")

if __name__ == "__main__":
    # Run the FastAPI server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=False,
        log_level="info"
    )
