"""
Trade Analysis Agent - Claude-style modular helper
Analyzes arbitrage opportunities and provides trade recommendations
"""

import json
import logging
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta

@dataclass
class TradeOpportunity:
    """Data structure for trade opportunities"""
    pair: str
    dex_a: str
    dex_b: str
    price_a: float
    price_b: float
    profit_potential: float
    gas_cost_estimate: float
    net_profit: float
    confidence_score: float
    timestamp: datetime
    risk_level: str

@dataclass
class TradeAnalysisInput:
    """Input structure for trade analysis"""
    opportunities: List[Dict[str, Any]]
    market_conditions: Dict[str, Any]
    risk_parameters: Dict[str, Any]
    historical_data: Optional[List[Dict[str, Any]]] = None

@dataclass
class TradeAnalysisOutput:
    """Output structure for trade analysis"""
    recommended_trades: List[TradeOpportunity]
    rejected_trades: List[Dict[str, Any]]
    market_analysis: Dict[str, Any]
    risk_assessment: Dict[str, Any]
    execution_priority: List[str]

class TradeAnalysisAgent:
    """
    Claude-style modular agent for trade analysis
    Input: JSON config with opportunities and market data
    Output: Analyzed and prioritized trade recommendations
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
    def run(self, input_data: TradeAnalysisInput) -> TradeAnalysisOutput:
        """
        Main execution function - Claude-style interface
        
        Args:
            input_data: TradeAnalysisInput with opportunities and market data
            
        Returns:
            TradeAnalysisOutput with analyzed recommendations
        """
        try:
            # Analyze each opportunity
            analyzed_opportunities = []
            rejected_opportunities = []
            
            for opp in input_data.opportunities:
                analysis = self._analyze_opportunity(opp, input_data.market_conditions, input_data.risk_parameters)
                
                if analysis.confidence_score >= 0.7 and analysis.net_profit > 0:
                    analyzed_opportunities.append(analysis)
                else:
                    rejected_opportunities.append({
                        'opportunity': opp,
                        'rejection_reason': self._get_rejection_reason(analysis),
                        'confidence_score': analysis.confidence_score
                    })
            
            # Sort by profit potential and confidence
            analyzed_opportunities.sort(
                key=lambda x: (x.net_profit * x.confidence_score), 
                reverse=True
            )
            
            # Generate market analysis
            market_analysis = self._analyze_market_conditions(input_data.market_conditions)
            
            # Assess overall risk
            risk_assessment = self._assess_portfolio_risk(analyzed_opportunities, input_data.risk_parameters)
            
            # Create execution priority list
            execution_priority = [opp.pair for opp in analyzed_opportunities[:5]]  # Top 5
            
            return TradeAnalysisOutput(
                recommended_trades=analyzed_opportunities,
                rejected_trades=rejected_opportunities,
                market_analysis=market_analysis,
                risk_assessment=risk_assessment,
                execution_priority=execution_priority
            )
            
        except Exception as e:
            self.logger.error(f"Trade analysis failed: {e}")
            raise
    
    def _analyze_opportunity(self, opp: Dict[str, Any], market_conditions: Dict[str, Any], risk_params: Dict[str, Any]) -> TradeOpportunity:
        """Analyze a single arbitrage opportunity"""
        
        # Calculate profit metrics
        price_diff = abs(opp['price_a'] - opp['price_b'])
        profit_potential = price_diff * opp.get('volume', 1.0)
        gas_cost = self._estimate_gas_cost(opp, market_conditions)
        net_profit = profit_potential - gas_cost
        
        # Calculate confidence score based on multiple factors
        confidence_factors = {
            'price_stability': self._assess_price_stability(opp),
            'liquidity': self._assess_liquidity(opp),
            'execution_speed': self._assess_execution_speed(opp),
            'market_volatility': self._assess_market_volatility(market_conditions),
            'historical_success': self._get_historical_success_rate(opp.get('pair', ''))
        }
        
        confidence_score = sum(confidence_factors.values()) / len(confidence_factors)
        
        # Determine risk level
        risk_level = self._determine_risk_level(net_profit, confidence_score, market_conditions)
        
        return TradeOpportunity(
            pair=opp.get('pair', 'UNKNOWN'),
            dex_a=opp.get('dex_a', 'UNKNOWN'),
            dex_b=opp.get('dex_b', 'UNKNOWN'),
            price_a=opp.get('price_a', 0),
            price_b=opp.get('price_b', 0),
            profit_potential=profit_potential,
            gas_cost_estimate=gas_cost,
            net_profit=net_profit,
            confidence_score=confidence_score,
            timestamp=datetime.now(),
            risk_level=risk_level
        )
    
    def _estimate_gas_cost(self, opp: Dict[str, Any], market_conditions: Dict[str, Any]) -> float:
        """Estimate gas cost for the trade"""
        base_gas = 150000  # Base gas for flash loan arbitrage
        gas_price = market_conditions.get('gas_price_gwei', 20)
        eth_price = market_conditions.get('eth_price_usd', 2000)
        
        gas_cost_eth = (base_gas * gas_price * 1e-9)
        gas_cost_usd = gas_cost_eth * eth_price
        
        return gas_cost_usd
    
    def _assess_price_stability(self, opp: Dict[str, Any]) -> float:
        """Assess price stability (0-1 score)"""
        # Simple heuristic - in real implementation, use historical price data
        price_diff_pct = abs(opp.get('price_a', 0) - opp.get('price_b', 0)) / max(opp.get('price_a', 1), opp.get('price_b', 1))
        
        if price_diff_pct > 0.05:  # >5% difference might be unstable
            return 0.6
        elif price_diff_pct > 0.02:  # >2% difference
            return 0.8
        else:
            return 0.9
    
    def _assess_liquidity(self, opp: Dict[str, Any]) -> float:
        """Assess liquidity (0-1 score)"""
        # Simple heuristic based on volume
        volume = opp.get('volume', 0)
        if volume > 100000:  # High liquidity
            return 0.9
        elif volume > 10000:  # Medium liquidity
            return 0.7
        else:  # Low liquidity
            return 0.5
    
    def _assess_execution_speed(self, opp: Dict[str, Any]) -> float:
        """Assess execution speed requirements (0-1 score)"""
        # Simple heuristic - DEX type affects speed
        fast_dexes = ['uniswap_v3', 'sushiswap']
        dex_a = opp.get('dex_a', '').lower()
        dex_b = opp.get('dex_b', '').lower()
        
        if dex_a in fast_dexes and dex_b in fast_dexes:
            return 0.9
        elif dex_a in fast_dexes or dex_b in fast_dexes:
            return 0.7
        else:
            return 0.6
    
    def _assess_market_volatility(self, market_conditions: Dict[str, Any]) -> float:
        """Assess market volatility impact (0-1 score)"""
        volatility = market_conditions.get('volatility', 'normal')
        
        if volatility == 'low':
            return 0.9
        elif volatility == 'normal':
            return 0.8
        else:  # high volatility
            return 0.6
    
    def _get_historical_success_rate(self, pair: str) -> float:
        """Get historical success rate for this pair (0-1 score)"""
        # Placeholder - in real implementation, query historical data
        return 0.8
    
    def _determine_risk_level(self, net_profit: float, confidence_score: float, market_conditions: Dict[str, Any]) -> str:
        """Determine risk level for the trade"""
        if confidence_score >= 0.8 and net_profit > 50:
            return 'LOW'
        elif confidence_score >= 0.6 and net_profit > 20:
            return 'MEDIUM'
        else:
            return 'HIGH'
    
    def _get_rejection_reason(self, analysis: TradeOpportunity) -> str:
        """Get reason for rejecting a trade"""
        if analysis.net_profit <= 0:
            return 'NEGATIVE_PROFIT'
        elif analysis.confidence_score < 0.7:
            return 'LOW_CONFIDENCE'
        else:
            return 'UNKNOWN'
    
    def _analyze_market_conditions(self, market_conditions: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze overall market conditions"""
        return {
            'overall_sentiment': 'NEUTRAL',  # Placeholder
            'volatility_trend': market_conditions.get('volatility', 'normal'),
            'liquidity_status': 'NORMAL',
            'gas_price_trend': 'STABLE',
            'recommended_position_size': 'MEDIUM'
        }
    
    def _assess_portfolio_risk(self, opportunities: List[TradeOpportunity], risk_params: Dict[str, Any]) -> Dict[str, Any]:
        """Assess overall portfolio risk"""
        total_exposure = sum(opp.net_profit for opp in opportunities)
        high_risk_count = sum(1 for opp in opportunities if opp.risk_level == 'HIGH')
        
        return {
            'total_exposure': total_exposure,
            'high_risk_trades': high_risk_count,
            'diversification_score': len(set(opp.pair for opp in opportunities)) / max(len(opportunities), 1),
            'overall_risk_level': 'MEDIUM' if high_risk_count < 3 else 'HIGH'
        }

# Claude-style execution function
def run(input_json: str) -> str:
    """
    Claude-style execution interface
    
    Args:
        input_json: JSON string with TradeAnalysisInput data
        
    Returns:
        JSON string with TradeAnalysisOutput data
    """
    try:
        # Parse input
        input_data_dict = json.loads(input_json)
        input_data = TradeAnalysisInput(**input_data_dict)
        
        # Run analysis
        agent = TradeAnalysisAgent()
        result = agent.run(input_data)
        
        # Convert result to dict for JSON serialization
        result_dict = {
            'recommended_trades': [
                {
                    'pair': trade.pair,
                    'dex_a': trade.dex_a,
                    'dex_b': trade.dex_b,
                    'price_a': trade.price_a,
                    'price_b': trade.price_b,
                    'profit_potential': trade.profit_potential,
                    'gas_cost_estimate': trade.gas_cost_estimate,
                    'net_profit': trade.net_profit,
                    'confidence_score': trade.confidence_score,
                    'timestamp': trade.timestamp.isoformat(),
                    'risk_level': trade.risk_level
                }
                for trade in result.recommended_trades
            ],
            'rejected_trades': result.rejected_trades,
            'market_analysis': result.market_analysis,
            'risk_assessment': result.risk_assessment,
            'execution_priority': result.execution_priority
        }
        
        return json.dumps(result_dict, indent=2)
        
    except Exception as e:
        error_result = {
            'error': str(e),
            'recommended_trades': [],
            'rejected_trades': [],
            'market_analysis': {},
            'risk_assessment': {},
            'execution_priority': []
        }
        return json.dumps(error_result, indent=2)

if __name__ == "__main__":
    # Example usage
    sample_input = {
        "opportunities": [
            {
                "pair": "ETH/USDC",
                "dex_a": "uniswap_v3",
                "dex_b": "sushiswap",
                "price_a": 2000.5,
                "price_b": 2005.2,
                "volume": 50000
            }
        ],
        "market_conditions": {
            "volatility": "normal",
            "gas_price_gwei": 25,
            "eth_price_usd": 2000
        },
        "risk_parameters": {
            "max_position_size": 10000,
            "min_profit_threshold": 10
        }
    }
    
    result = run(json.dumps(sample_input))
    print(result)
