"""
DEX Monitor - Real-time price monitoring across multiple DEXs
"""

import asyncio
import json
import time
import websockets
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from decimal import Decimal

from core.logger import setup_logger
from core.config_manager import ConfigManager

logger = setup_logger(__name__)

@dataclass
class PriceData:
    token_pair: str
    dex: str
    price: Decimal
    liquidity: Decimal
    timestamp: float
    block_number: int

class DEXMonitor:
    def __init__(self, config: ConfigManager):
        self.config = config
        self.is_running = False
        self.price_cache = {}
        self.websocket_connections = {}
        self.last_update = {}
        
        # DEX configurations
        self.dex_configs = config.get_dex_config()
        self.enabled_dexes = [name for name, cfg in self.dex_configs.items() if cfg.get('enabled', False)]
        
        logger.info(f"DEXMonitor initialized for: {self.enabled_dexes}")
    
    async def start(self):
        """Start monitoring all enabled DEXs"""
        if self.is_running:
            return
        
        self.is_running = True
        logger.info("🔍 Starting DEX monitoring...")
        
        # Start monitoring tasks for each DEX
        tasks = []
        
        if 'uniswap_v2' in self.enabled_dexes:
            tasks.append(asyncio.create_task(self._monitor_uniswap_v2()))
        
        if 'uniswap_v3' in self.enabled_dexes:
            tasks.append(asyncio.create_task(self._monitor_uniswap_v3()))
        
        if 'sushiswap' in self.enabled_dexes:
            tasks.append(asyncio.create_task(self._monitor_sushiswap()))
        
        if 'curve' in self.enabled_dexes:
            tasks.append(asyncio.create_task(self._monitor_curve()))
        
        # Start price aggregation task
        tasks.append(asyncio.create_task(self._aggregate_prices()))
        
        # Wait for all tasks
        await asyncio.gather(*tasks, return_exceptions=True)
    
    async def stop(self):
        """Stop all monitoring"""
        if not self.is_running:
            return
        
        logger.info("🛑 Stopping DEX monitoring...")
        self.is_running = False
        
        # Close websocket connections
        for ws in self.websocket_connections.values():
            if ws and not ws.closed:
                await ws.close()
        
        self.websocket_connections.clear()
    
    async def _monitor_uniswap_v2(self):
        """Monitor Uniswap V2 prices"""
        logger.info("Starting Uniswap V2 monitoring...")
        
        while self.is_running:
            try:
                # Get top token pairs
                pairs = await self._get_uniswap_v2_pairs()
                
                for pair in pairs:
                    price_data = await self._fetch_uniswap_v2_price(pair)
                    if price_data:
                        self._update_price_cache('uniswap_v2', pair, price_data)
                
                await asyncio.sleep(1)  # Update every second
                
            except Exception as e:
                logger.error(f"Uniswap V2 monitoring error: {e}")
                await asyncio.sleep(5)
    
    async def _monitor_uniswap_v3(self):
        """Monitor Uniswap V3 prices"""
        logger.info("Starting Uniswap V3 monitoring...")
        
        while self.is_running:
            try:
                # Get top token pairs with different fee tiers
                pairs = await self._get_uniswap_v3_pairs()
                
                for pair in pairs:
                    price_data = await self._fetch_uniswap_v3_price(pair)
                    if price_data:
                        self._update_price_cache('uniswap_v3', pair, price_data)
                
                await asyncio.sleep(1)
                
            except Exception as e:
                logger.error(f"Uniswap V3 monitoring error: {e}")
                await asyncio.sleep(5)
    
    async def _monitor_sushiswap(self):
        """Monitor Sushiswap prices"""
        logger.info("Starting Sushiswap monitoring...")
        
        while self.is_running:
            try:
                pairs = await self._get_sushiswap_pairs()
                
                for pair in pairs:
                    price_data = await self._fetch_sushiswap_price(pair)
                    if price_data:
                        self._update_price_cache('sushiswap', pair, price_data)
                
                await asyncio.sleep(1)
                
            except Exception as e:
                logger.error(f"Sushiswap monitoring error: {e}")
                await asyncio.sleep(5)
    
    async def _monitor_curve(self):
        """Monitor Curve prices"""
        logger.info("Starting Curve monitoring...")
        
        while self.is_running:
            try:
                pools = await self._get_curve_pools()
                
                for pool in pools:
                    price_data = await self._fetch_curve_price(pool)
                    if price_data:
                        self._update_price_cache('curve', pool, price_data)
                
                await asyncio.sleep(2)  # Curve updates less frequently
                
            except Exception as e:
                logger.error(f"Curve monitoring error: {e}")
                await asyncio.sleep(5)
    
    async def _aggregate_prices(self):
        """Aggregate and clean price data"""
        while self.is_running:
            try:
                # Remove stale price data (older than 30 seconds)
                current_time = time.time()
                stale_threshold = 30
                
                for dex in list(self.price_cache.keys()):
                    for pair in list(self.price_cache[dex].keys()):
                        if current_time - self.price_cache[dex][pair].timestamp > stale_threshold:
                            del self.price_cache[dex][pair]
                
                await asyncio.sleep(10)  # Clean every 10 seconds
                
            except Exception as e:
                logger.error(f"Price aggregation error: {e}")
                await asyncio.sleep(10)
    
    def _update_price_cache(self, dex: str, pair: str, price_data: PriceData):
        """Update price cache with new data"""
        if dex not in self.price_cache:
            self.price_cache[dex] = {}
        
        self.price_cache[dex][pair] = price_data
        self.last_update[f"{dex}_{pair}"] = time.time()
    
    async def get_latest_prices(self) -> Dict[str, Dict[str, PriceData]]:
        """Get latest price data for all monitored pairs"""
        return self.price_cache.copy()
    
    async def get_price(self, dex: str, token_pair: str) -> Optional[PriceData]:
        """Get price for specific DEX and token pair"""
        return self.price_cache.get(dex, {}).get(token_pair)
    
    async def _get_uniswap_v2_pairs(self) -> List[str]:
        """Get top Uniswap V2 trading pairs"""
        # This would query the Uniswap V2 subgraph or use direct contract calls
        # For now, return common pairs
        return [
            'WETH/USDC',
            'WETH/USDT', 
            'WETH/DAI',
            'WBTC/WETH',
            'LINK/WETH'
        ]
    
    async def _fetch_uniswap_v2_price(self, pair: str) -> Optional[PriceData]:
        """Fetch price data from Uniswap V2"""
        # This would make actual contract calls to get reserves and calculate price
        # For now, return simulated data
        await asyncio.sleep(0.01)  # Simulate network delay
        
        return PriceData(
            token_pair=pair,
            dex='uniswap_v2',
            price=Decimal('2000.50'),  # Simulated price
            liquidity=Decimal('1000000'),  # Simulated liquidity
            timestamp=time.time(),
            block_number=18500000  # Simulated block number
        )
    
    async def _get_uniswap_v3_pairs(self) -> List[str]:
        """Get top Uniswap V3 trading pairs"""
        return [
            'WETH/USDC/500',   # 0.05% fee tier
            'WETH/USDC/3000',  # 0.3% fee tier
            'WETH/USDT/500',
            'WETH/DAI/3000',
            'WBTC/WETH/3000'
        ]
    
    async def _fetch_uniswap_v3_price(self, pair: str) -> Optional[PriceData]:
        """Fetch price data from Uniswap V3"""
        await asyncio.sleep(0.01)
        
        return PriceData(
            token_pair=pair,
            dex='uniswap_v3',
            price=Decimal('2000.75'),
            liquidity=Decimal('2000000'),
            timestamp=time.time(),
            block_number=18500000
        )
    
    async def _get_sushiswap_pairs(self) -> List[str]:
        """Get top Sushiswap trading pairs"""
        return [
            'WETH/USDC',
            'WETH/USDT',
            'WETH/DAI',
            'WBTC/WETH'
        ]
    
    async def _fetch_sushiswap_price(self, pair: str) -> Optional[PriceData]:
        """Fetch price data from Sushiswap"""
        await asyncio.sleep(0.01)
        
        return PriceData(
            token_pair=pair,
            dex='sushiswap',
            price=Decimal('2001.25'),
            liquidity=Decimal('800000'),
            timestamp=time.time(),
            block_number=18500000
        )
    
    async def _get_curve_pools(self) -> List[str]:
        """Get Curve pools"""
        return [
            '3pool',  # DAI/USDC/USDT
            'stETH',  # ETH/stETH
            'frxETH', # ETH/frxETH
            'tricrypto2'  # USDT/WBTC/WETH
        ]
    
    async def _fetch_curve_price(self, pool: str) -> Optional[PriceData]:
        """Fetch price data from Curve"""
        await asyncio.sleep(0.01)
        
        return PriceData(
            token_pair=pool,
            dex='curve',
            price=Decimal('1.0001'),  # Curve pools often have prices close to 1
            liquidity=Decimal('5000000'),
            timestamp=time.time(),
            block_number=18500000
        )

    def get_monitored_pairs(self) -> List[str]:
        """Get list of all monitored token pairs"""
        pairs = set()
        for dex_data in self.price_cache.values():
            pairs.update(dex_data.keys())
        return list(pairs)

    def get_dex_health(self) -> Dict[str, Dict[str, Any]]:
        """Get health status of each DEX connection"""
        health = {}
        current_time = time.time()

        for dex in self.enabled_dexes:
            last_update_time = max(
                [self.last_update.get(f"{dex}_{pair}", 0)
                 for pair in self.price_cache.get(dex, {}).keys()],
                default=0
            )

            health[dex] = {
                'is_connected': current_time - last_update_time < 60,
                'last_update': last_update_time,
                'pairs_monitored': len(self.price_cache.get(dex, {})),
                'status': 'healthy' if current_time - last_update_time < 30 else 'stale'
            }

        return health
