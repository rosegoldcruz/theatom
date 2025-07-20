"""
CoW Protocol Integration - Batch auction arbitrage
"""

import asyncio
import aiohttp
import json
import time
from typing import Dict, List, Any, Optional
from dataclasses import dataclass

from core.logger import setup_logger
from core.config_manager import ConfigManager

logger = setup_logger(__name__)

@dataclass
class CoWOrder:
    order_id: str
    token_in: str
    token_out: str
    amount_in: int
    amount_out: int
    valid_until: int
    fee_amount: int
    order_data: Dict[str, Any]
    status: str  # 'pending', 'filled', 'cancelled', 'expired'

@dataclass
class BatchAuction:
    auction_id: str
    orders: List[CoWOrder]
    settlement_block: int
    total_surplus: int
    status: str

class CoWIntegration:
    def __init__(self, config: ConfigManager):
        self.config = config
        self.is_running = False
        self.session = None
        
        # CoW Protocol configuration
        self.cow_config = config.get_cow_config()
        self.api_url = self.cow_config.get('api_url')
        self.settlement_contract = self.cow_config.get('settlement_contract')
        self.order_validity_seconds = self.cow_config.get('order_validity_seconds', 3600)
        
        # Order tracking
        self.active_orders = {}
        self.order_history = []
        self.batch_history = []
        
        logger.info("CoWIntegration initialized")
    
    async def start(self):
        """Start CoW Protocol integration"""
        if self.is_running:
            return
        
        self.is_running = True
        self.session = aiohttp.ClientSession()
        
        logger.info("🐄 Starting CoW Protocol integration...")
        
        # Start monitoring tasks
        asyncio.create_task(self._monitor_auctions())
        asyncio.create_task(self._monitor_orders())
    
    async def stop(self):
        """Stop CoW Protocol integration"""
        if not self.is_running:
            return
        
        logger.info("🛑 Stopping CoW Protocol integration...")
        self.is_running = False
        
        if self.session:
            await self.session.close()
    
    async def create_arbitrage_order(self, opportunity) -> Optional[CoWOrder]:
        """Create CoW order for arbitrage opportunity"""
        try:
            # Calculate order parameters
            valid_until = int(time.time()) + self.order_validity_seconds
            
            # Create order
            order = CoWOrder(
                order_id=f"cow_order_{int(time.time() * 1000)}",
                token_in=opportunity.token_in,
                token_out=opportunity.token_out,
                amount_in=opportunity.amount_in,
                amount_out=opportunity.amount_out,
                valid_until=valid_until,
                fee_amount=opportunity.gas_cost_wei,
                order_data=await self._build_order_data(opportunity),
                status='pending'
            )
            
            # Submit order to CoW API
            success = await self._submit_cow_order(order)
            
            if success:
                self.active_orders[order.order_id] = order
                logger.info(f"Created CoW order {order.order_id}")
                return order
            else:
                logger.error(f"Failed to submit CoW order")
                return None
                
        except Exception as e:
            logger.error(f"CoW order creation error: {e}")
            return None
    
    async def _build_order_data(self, opportunity) -> Dict[str, Any]:
        """Build CoW order data"""
        return {
            'sellToken': opportunity.token_in,
            'buyToken': opportunity.token_out,
            'sellAmount': str(opportunity.amount_in),
            'buyAmount': str(opportunity.amount_out),
            'validTo': int(time.time()) + self.order_validity_seconds,
            'appData': '0x0000000000000000000000000000000000000000000000000000000000000000',
            'feeAmount': str(opportunity.gas_cost_wei),
            'kind': 'sell',
            'partiallyFillable': False,
            'sellTokenBalance': 'erc20',
            'buyTokenBalance': 'erc20'
        }
    
    async def _submit_cow_order(self, order: CoWOrder) -> bool:
        """Submit order to CoW Protocol API"""
        try:
            url = f"{self.api_url}/orders"
            
            # Sign order (this would use actual wallet signing)
            signed_order = await self._sign_order(order)
            
            async with self.session.post(url, json=signed_order) as response:
                if response.status == 201:
                    result = await response.json()
                    order.order_id = result.get('orderUid', order.order_id)
                    logger.info(f"CoW order submitted: {order.order_id}")
                    return True
                else:
                    logger.error(f"CoW order submission failed: {response.status}")
                    return False
                    
        except Exception as e:
            logger.error(f"CoW order submission error: {e}")
            return False
    
    async def _sign_order(self, order: CoWOrder) -> Dict[str, Any]:
        """Sign CoW order (simplified)"""
        # This would use actual cryptographic signing
        # For now, return the order data with a fake signature
        return {
            **order.order_data,
            'signature': '0x' + '0' * 130,  # Fake signature
            'signingScheme': 'eip712'
        }
    
    async def _monitor_auctions(self):
        """Monitor CoW batch auctions"""
        while self.is_running:
            try:
                # Get current auction info
                auction_info = await self._get_current_auction()
                
                if auction_info:
                    await self._process_auction(auction_info)
                
                await asyncio.sleep(5)  # Check every 5 seconds
                
            except Exception as e:
                logger.error(f"Auction monitoring error: {e}")
                await asyncio.sleep(10)
    
    async def _get_current_auction(self) -> Optional[Dict[str, Any]]:
        """Get current batch auction information"""
        try:
            url = f"{self.api_url}/auction"
            
            async with self.session.get(url) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    return None
                    
        except Exception as e:
            logger.error(f"Error getting auction info: {e}")
            return None
    
    async def _process_auction(self, auction_info: Dict[str, Any]):
        """Process batch auction information"""
        try:
            auction_id = auction_info.get('auctionId')
            orders = auction_info.get('orders', [])
            
            # Check if any of our orders are in this auction
            our_orders = []
            for order_data in orders:
                order_uid = order_data.get('orderUid')
                if order_uid in self.active_orders:
                    our_orders.append(self.active_orders[order_uid])
            
            if our_orders:
                logger.info(f"Found {len(our_orders)} of our orders in auction {auction_id}")
                
                # Create batch auction record
                batch = BatchAuction(
                    auction_id=auction_id,
                    orders=our_orders,
                    settlement_block=auction_info.get('block', 0),
                    total_surplus=0,  # Would be calculated from settlement
                    status='active'
                )
                
                self.batch_history.append(batch)
                
        except Exception as e:
            logger.error(f"Auction processing error: {e}")
    
    async def _monitor_orders(self):
        """Monitor active CoW orders"""
        while self.is_running:
            try:
                # Check status of active orders
                for order_id, order in list(self.active_orders.items()):
                    status = await self._check_order_status(order_id)
                    
                    if status and status != order.status:
                        order.status = status
                        logger.info(f"Order {order_id} status changed to {status}")
                        
                        if status in ['filled', 'cancelled', 'expired']:
                            # Move to history
                            self.order_history.append(order)
                            del self.active_orders[order_id]
                
                # Clean up old order history
                if len(self.order_history) > 1000:
                    self.order_history = self.order_history[-1000:]
                
                await asyncio.sleep(10)  # Check every 10 seconds
                
            except Exception as e:
                logger.error(f"Order monitoring error: {e}")
                await asyncio.sleep(10)
    
    async def _check_order_status(self, order_id: str) -> Optional[str]:
        """Check status of a specific order"""
        try:
            url = f"{self.api_url}/orders/{order_id}"
            
            async with self.session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get('status', 'unknown')
                elif response.status == 404:
                    return 'not_found'
                else:
                    return None
                    
        except Exception as e:
            logger.error(f"Error checking order status: {e}")
            return None
    
    async def cancel_order(self, order_id: str) -> bool:
        """Cancel a CoW order"""
        try:
            if order_id not in self.active_orders:
                logger.warning(f"Order {order_id} not found in active orders")
                return False
            
            url = f"{self.api_url}/orders/{order_id}"
            
            async with self.session.delete(url) as response:
                if response.status == 200:
                    order = self.active_orders[order_id]
                    order.status = 'cancelled'
                    self.order_history.append(order)
                    del self.active_orders[order_id]
                    
                    logger.info(f"Cancelled CoW order {order_id}")
                    return True
                else:
                    logger.error(f"Failed to cancel order {order_id}: {response.status}")
                    return False
                    
        except Exception as e:
            logger.error(f"Order cancellation error: {e}")
            return False
    
    def get_cow_stats(self) -> Dict[str, Any]:
        """Get CoW Protocol statistics"""
        total_orders = len(self.order_history) + len(self.active_orders)
        filled_orders = len([o for o in self.order_history if o.status == 'filled'])
        
        return {
            'active_orders': len(self.active_orders),
            'total_orders': total_orders,
            'filled_orders': filled_orders,
            'fill_rate': filled_orders / max(total_orders, 1),
            'total_batches': len(self.batch_history),
            'avg_orders_per_batch': len(self.order_history) / max(len(self.batch_history), 1)
        }
    
    async def get_order_book(self) -> Dict[str, Any]:
        """Get current CoW order book"""
        try:
            url = f"{self.api_url}/orders"
            
            async with self.session.get(url) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    return {}
                    
        except Exception as e:
            logger.error(f"Error getting order book: {e}")
            return {}
