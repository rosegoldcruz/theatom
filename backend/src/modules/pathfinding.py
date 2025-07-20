"""
Pathfinding Engine - Optimal route discovery using 0x, 1inch, and Paraswap
"""

import asyncio
import aiohttp
import time
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from decimal import Decimal

from core.logger import setup_logger
from core.config_manager import ConfigManager
from core.arbitrage_engine import ArbitrageOpportunity

logger = setup_logger(__name__)

@dataclass
class RouteQuote:
    aggregator: str
    token_in: str
    token_out: str
    amount_in: int
    amount_out: int
    gas_estimate: int
    route_data: Dict[str, Any]
    confidence_score: float

class PathfindingEngine:
    def __init__(self, config: ConfigManager):
        self.config = config
        self.is_running = False
        self.session = None
        
        # Aggregator configurations
        self.aggregators = config.get_aggregator_config()
        self.enabled_aggregators = [name for name, cfg in self.aggregators.items() if cfg.get('enabled', False)]
        
        # Trading parameters
        self.min_profit_wei = int(config.get('trading.min_profit_wei'))
        self.slippage_tolerance = config.get('trading.slippage_tolerance', 0.005)
        
        logger.info(f"PathfindingEngine initialized with aggregators: {self.enabled_aggregators}")
    
    async def start(self):
        """Start the pathfinding engine"""
        if self.is_running:
            return
        
        self.is_running = True
        self.session = aiohttp.ClientSession()
        
        logger.info("🛣️ Starting pathfinding engine...")
    
    async def stop(self):
        """Stop the pathfinding engine"""
        if not self.is_running:
            return
        
        logger.info("🛑 Stopping pathfinding engine...")
        self.is_running = False
        
        if self.session:
            await self.session.close()
    
    async def find_opportunities(self, price_data: Dict[str, Dict[str, Any]], 
                               trade_amount_wei: int, min_profit_wei: int) -> List[ArbitrageOpportunity]:
        """Find arbitrage opportunities using multiple aggregators"""
        opportunities = []
        
        try:
            # Get common token pairs
            token_pairs = self._extract_token_pairs(price_data)
            
            # Check each pair for arbitrage opportunities
            for token_in, token_out in token_pairs:
                opportunity = await self._find_pair_opportunity(
                    token_in, token_out, trade_amount_wei, min_profit_wei
                )
                
                if opportunity:
                    opportunities.append(opportunity)
            
            # Sort by profit potential
            opportunities.sort(key=lambda x: x.net_profit_wei, reverse=True)
            
            return opportunities[:10]  # Return top 10 opportunities
            
        except Exception as e:
            logger.error(f"Error finding opportunities: {e}")
            return []
    
    async def _find_pair_opportunity(self, token_in: str, token_out: str, 
                                   amount_in: int, min_profit_wei: int) -> Optional[ArbitrageOpportunity]:
        """Find arbitrage opportunity for a specific token pair"""
        try:
            # Get quotes from all enabled aggregators
            buy_quotes = await self._get_aggregator_quotes(token_in, token_out, amount_in)
            sell_quotes = await self._get_aggregator_quotes(token_out, token_in, None)  # Will be calculated based on buy amount
            
            if not buy_quotes or not sell_quotes:
                return None
            
            # Find best buy and sell routes
            best_buy = max(buy_quotes, key=lambda x: x.amount_out)
            
            # Calculate sell amount based on best buy output
            sell_amount = int(best_buy.amount_out * (1 - self.slippage_tolerance))
            sell_quotes_adjusted = await self._get_aggregator_quotes(token_out, token_in, sell_amount)
            
            if not sell_quotes_adjusted:
                return None
            
            best_sell = max(sell_quotes_adjusted, key=lambda x: x.amount_out)
            
            # Calculate profit
            profit_wei = best_sell.amount_out - amount_in
            gas_cost_wei = (best_buy.gas_estimate + best_sell.gas_estimate) * 50 * 10**9  # 50 gwei gas price
            net_profit_wei = profit_wei - gas_cost_wei
            
            if net_profit_wei < min_profit_wei:
                return None
            
            # Create opportunity
            opportunity = ArbitrageOpportunity(
                token_in=token_in,
                token_out=token_out,
                amount_in=amount_in,
                amount_out=best_sell.amount_out,
                profit_wei=profit_wei,
                gas_cost_wei=gas_cost_wei,
                net_profit_wei=net_profit_wei,
                dex_path=[best_buy.aggregator, best_sell.aggregator],
                route_data={
                    'buy_route': best_buy.route_data,
                    'sell_route': best_sell.route_data
                },
                confidence_score=min(best_buy.confidence_score, best_sell.confidence_score),
                timestamp=time.time()
            )
            
            return opportunity
            
        except Exception as e:
            logger.error(f"Error finding opportunity for {token_in}/{token_out}: {e}")
            return None
    
    async def _get_aggregator_quotes(self, token_in: str, token_out: str, 
                                   amount_in: Optional[int]) -> List[RouteQuote]:
        """Get quotes from all enabled aggregators"""
        quotes = []
        tasks = []
        
        if '0x' in self.enabled_aggregators:
            tasks.append(self._get_0x_quote(token_in, token_out, amount_in))
        
        if '1inch' in self.enabled_aggregators:
            tasks.append(self._get_1inch_quote(token_in, token_out, amount_in))
        
        if 'paraswap' in self.enabled_aggregators:
            tasks.append(self._get_paraswap_quote(token_in, token_out, amount_in))
        
        if tasks:
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for result in results:
                if isinstance(result, RouteQuote):
                    quotes.append(result)
                elif isinstance(result, Exception):
                    logger.warning(f"Aggregator quote failed: {result}")
        
        return quotes
    
    async def _get_0x_quote(self, token_in: str, token_out: str, amount_in: Optional[int]) -> Optional[RouteQuote]:
        """Get quote from 0x API"""
        try:
            if not amount_in:
                return None
            
            config = self.aggregators['0x']
            url = f"{config['api_url']}/swap/v1/quote"
            
            params = {
                'sellToken': token_in,
                'buyToken': token_out,
                'sellAmount': str(amount_in),
                'slippagePercentage': str(self.slippage_tolerance)
            }
            
            headers = {}
            if config.get('api_key'):
                headers['0x-api-key'] = config['api_key']
            
            async with self.session.get(url, params=params, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    return RouteQuote(
                        aggregator='0x',
                        token_in=token_in,
                        token_out=token_out,
                        amount_in=amount_in,
                        amount_out=int(data['buyAmount']),
                        gas_estimate=int(data.get('gas', 150000)),
                        route_data=data,
                        confidence_score=0.9
                    )
                else:
                    logger.warning(f"0x API error: {response.status}")
                    return None
                    
        except Exception as e:
            logger.error(f"0x quote error: {e}")
            return None
    
    async def _get_1inch_quote(self, token_in: str, token_out: str, amount_in: Optional[int]) -> Optional[RouteQuote]:
        """Get quote from 1inch API"""
        try:
            if not amount_in:
                return None
            
            config = self.aggregators['1inch']
            url = f"{config['api_url']}/quote"
            
            params = {
                'fromTokenAddress': token_in,
                'toTokenAddress': token_out,
                'amount': str(amount_in)
            }
            
            headers = {}
            if config.get('api_key'):
                headers['Authorization'] = f"Bearer {config['api_key']}"
            
            async with self.session.get(url, params=params, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    return RouteQuote(
                        aggregator='1inch',
                        token_in=token_in,
                        token_out=token_out,
                        amount_in=amount_in,
                        amount_out=int(data['toTokenAmount']),
                        gas_estimate=int(data.get('estimatedGas', 200000)),
                        route_data=data,
                        confidence_score=0.85
                    )
                else:
                    logger.warning(f"1inch API error: {response.status}")
                    return None
                    
        except Exception as e:
            logger.error(f"1inch quote error: {e}")
            return None
    
    async def _get_paraswap_quote(self, token_in: str, token_out: str, amount_in: Optional[int]) -> Optional[RouteQuote]:
        """Get quote from Paraswap API"""
        try:
            if not amount_in:
                return None
            
            config = self.aggregators['paraswap']
            url = f"{config['api_url']}/prices"
            
            params = {
                'srcToken': token_in,
                'destToken': token_out,
                'amount': str(amount_in),
                'srcDecimals': '18',
                'destDecimals': '18',
                'side': 'SELL',
                'network': '1'
            }
            
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    price_route = data.get('priceRoute')
                    
                    if price_route:
                        return RouteQuote(
                            aggregator='paraswap',
                            token_in=token_in,
                            token_out=token_out,
                            amount_in=amount_in,
                            amount_out=int(price_route['destAmount']),
                            gas_estimate=int(price_route.get('gasCost', 180000)),
                            route_data=data,
                            confidence_score=0.8
                        )
                else:
                    logger.warning(f"Paraswap API error: {response.status}")
                    return None
                    
        except Exception as e:
            logger.error(f"Paraswap quote error: {e}")
            return None
    
    def _extract_token_pairs(self, price_data: Dict[str, Dict[str, Any]]) -> List[Tuple[str, str]]:
        """Extract token pairs from price data"""
        pairs = set()
        
        for dex_data in price_data.values():
            for pair_name in dex_data.keys():
                if '/' in pair_name:
                    tokens = pair_name.split('/')
                    if len(tokens) >= 2:
                        pairs.add((tokens[0], tokens[1]))
                        pairs.add((tokens[1], tokens[0]))  # Both directions
        
        return list(pairs)[:20]  # Limit to top 20 pairs
