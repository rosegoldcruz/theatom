"""
Slippage Risk Agent - Claude-style modular helper
Analyzes and predicts slippage risk for arbitrage trades
"""

import json
import logging
import math
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime

@dataclass
class SlippageAnalysisInput:
    """Input structure for slippage analysis"""
    trade_amount: float
    token_pair: str
    dex_name: str
    liquidity_data: Dict[str, Any]
    market_conditions: Dict[str, Any]
    historical_slippage: Optional[List[Dict[str, Any]]] = None

@dataclass
class SlippageAnalysisOutput:
    """Output structure for slippage analysis"""
    predicted_slippage: float
    max_slippage: float
    confidence_level: float
    risk_level: str
    recommended_max_trade_size: float
    liquidity_score: float
    price_impact_estimate: float
    execution_recommendations: List[str]

class SlippageRiskAgent:
    """
    Claude-style modular agent for slippage risk analysis
    Input: JSON config with trade details and liquidity data
    Output: Slippage predictions and risk assessment
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
    def run(self, input_data: SlippageAnalysisInput) -> SlippageAnalysisOutput:
        """
        Main execution function - Claude-style interface
        
        Args:
            input_data: SlippageAnalysisInput with trade and liquidity data
            
        Returns:
            SlippageAnalysisOutput with slippage predictions
        """
        try:
            # Calculate predicted slippage
            predicted_slippage = self._calculate_predicted_slippage(
                input_data.trade_amount,
                input_data.liquidity_data,
                input_data.market_conditions
            )
            
            # Calculate maximum possible slippage
            max_slippage = self._calculate_max_slippage(
                input_data.trade_amount,
                input_data.liquidity_data,
                input_data.market_conditions
            )
            
            # Assess confidence level
            confidence_level = self._assess_confidence_level(
                input_data.liquidity_data,
                input_data.historical_slippage,
                input_data.market_conditions
            )
            
            # Determine risk level
            risk_level = self._determine_risk_level(predicted_slippage, max_slippage, confidence_level)
            
            # Calculate recommended max trade size
            recommended_max_trade_size = self._calculate_recommended_trade_size(
                input_data.liquidity_data,
                input_data.market_conditions
            )
            
            # Calculate liquidity score
            liquidity_score = self._calculate_liquidity_score(input_data.liquidity_data)
            
            # Estimate price impact
            price_impact_estimate = self._estimate_price_impact(
                input_data.trade_amount,
                input_data.liquidity_data
            )
            
            # Generate execution recommendations
            execution_recommendations = self._generate_execution_recommendations(
                predicted_slippage,
                max_slippage,
                liquidity_score,
                input_data.market_conditions
            )
            
            return SlippageAnalysisOutput(
                predicted_slippage=predicted_slippage,
                max_slippage=max_slippage,
                confidence_level=confidence_level,
                risk_level=risk_level,
                recommended_max_trade_size=recommended_max_trade_size,
                liquidity_score=liquidity_score,
                price_impact_estimate=price_impact_estimate,
                execution_recommendations=execution_recommendations
            )
            
        except Exception as e:
            self.logger.error(f"Slippage analysis failed: {e}")
            raise
    
    def _calculate_predicted_slippage(self, trade_amount: float, liquidity_data: Dict[str, Any], market_conditions: Dict[str, Any]) -> float:
        """Calculate predicted slippage based on liquidity and market conditions"""
        
        # Get liquidity metrics
        total_liquidity = liquidity_data.get('total_liquidity', 1000000)
        depth_2_percent = liquidity_data.get('depth_2_percent', 100000)
        
        # Calculate trade size as percentage of liquidity
        trade_size_ratio = trade_amount / total_liquidity
        
        # Base slippage calculation using square root model
        base_slippage = math.sqrt(trade_size_ratio) * 0.01  # 1% base for 100% of liquidity
        
        # Adjust for market volatility
        volatility_multiplier = self._get_volatility_multiplier(market_conditions.get('volatility', 'normal'))
        
        # Adjust for DEX type
        dex_multiplier = self._get_dex_multiplier(liquidity_data.get('dex_type', 'amm'))
        
        # Calculate final predicted slippage
        predicted_slippage = base_slippage * volatility_multiplier * dex_multiplier
        
        # Cap at reasonable maximum
        return min(predicted_slippage, 0.05)  # Max 5% slippage
    
    def _calculate_max_slippage(self, trade_amount: float, liquidity_data: Dict[str, Any], market_conditions: Dict[str, Any]) -> float:
        """Calculate maximum possible slippage in worst-case scenario"""
        
        predicted_slippage = self._calculate_predicted_slippage(trade_amount, liquidity_data, market_conditions)
        
        # Maximum slippage is typically 2-3x predicted in worst case
        worst_case_multiplier = 2.5
        
        # Adjust for market stress conditions
        if market_conditions.get('volatility') == 'high':
            worst_case_multiplier *= 1.5
        
        max_slippage = predicted_slippage * worst_case_multiplier
        
        # Cap at reasonable maximum
        return min(max_slippage, 0.15)  # Max 15% slippage
    
    def _assess_confidence_level(self, liquidity_data: Dict[str, Any], historical_slippage: Optional[List[Dict[str, Any]]], market_conditions: Dict[str, Any]) -> float:
        """Assess confidence level in slippage predictions (0-1)"""
        
        confidence_factors = []
        
        # Liquidity depth confidence
        total_liquidity = liquidity_data.get('total_liquidity', 0)
        if total_liquidity > 1000000:  # $1M+
            confidence_factors.append(0.9)
        elif total_liquidity > 100000:  # $100K+
            confidence_factors.append(0.7)
        else:
            confidence_factors.append(0.5)
        
        # Historical data confidence
        if historical_slippage and len(historical_slippage) > 10:
            confidence_factors.append(0.8)
        elif historical_slippage and len(historical_slippage) > 5:
            confidence_factors.append(0.6)
        else:
            confidence_factors.append(0.4)
        
        # Market stability confidence
        volatility = market_conditions.get('volatility', 'normal')
        if volatility == 'low':
            confidence_factors.append(0.9)
        elif volatility == 'normal':
            confidence_factors.append(0.7)
        else:
            confidence_factors.append(0.5)
        
        return sum(confidence_factors) / len(confidence_factors)
    
    def _determine_risk_level(self, predicted_slippage: float, max_slippage: float, confidence_level: float) -> str:
        """Determine overall risk level"""
        
        if predicted_slippage <= 0.005 and max_slippage <= 0.02 and confidence_level >= 0.8:
            return 'LOW'
        elif predicted_slippage <= 0.02 and max_slippage <= 0.05 and confidence_level >= 0.6:
            return 'MEDIUM'
        else:
            return 'HIGH'
    
    def _calculate_recommended_trade_size(self, liquidity_data: Dict[str, Any], market_conditions: Dict[str, Any]) -> float:
        """Calculate recommended maximum trade size to minimize slippage"""
        
        total_liquidity = liquidity_data.get('total_liquidity', 1000000)
        
        # Conservative approach: use 1-5% of total liquidity
        base_percentage = 0.02  # 2%
        
        # Adjust based on market conditions
        if market_conditions.get('volatility') == 'low':
            base_percentage *= 1.5
        elif market_conditions.get('volatility') == 'high':
            base_percentage *= 0.5
        
        return total_liquidity * base_percentage
    
    def _calculate_liquidity_score(self, liquidity_data: Dict[str, Any]) -> float:
        """Calculate liquidity score (0-1)"""
        
        total_liquidity = liquidity_data.get('total_liquidity', 0)
        depth_2_percent = liquidity_data.get('depth_2_percent', 0)
        
        # Score based on total liquidity
        liquidity_score = min(total_liquidity / 10000000, 1.0)  # $10M = perfect score
        
        # Adjust based on depth
        if depth_2_percent > 0:
            depth_ratio = depth_2_percent / total_liquidity
            if depth_ratio > 0.1:  # Good depth
                liquidity_score *= 1.1
            elif depth_ratio < 0.05:  # Poor depth
                liquidity_score *= 0.9
        
        return min(liquidity_score, 1.0)
    
    def _estimate_price_impact(self, trade_amount: float, liquidity_data: Dict[str, Any]) -> float:
        """Estimate price impact of the trade"""
        
        total_liquidity = liquidity_data.get('total_liquidity', 1000000)
        
        # Simple linear model for price impact
        impact_ratio = trade_amount / total_liquidity
        price_impact = impact_ratio * 0.5  # 50% of trade ratio as price impact
        
        return min(price_impact, 0.1)  # Cap at 10%
    
    def _generate_execution_recommendations(self, predicted_slippage: float, max_slippage: float, liquidity_score: float, market_conditions: Dict[str, Any]) -> List[str]:
        """Generate execution recommendations based on analysis"""
        
        recommendations = []
        
        if predicted_slippage > 0.02:
            recommendations.append("Consider splitting trade into smaller chunks")
        
        if max_slippage > 0.05:
            recommendations.append("Set tight slippage tolerance (1-2%)")
        
        if liquidity_score < 0.5:
            recommendations.append("Wait for better liquidity conditions")
        
        if market_conditions.get('volatility') == 'high':
            recommendations.append("Consider delaying trade until volatility decreases")
        
        if predicted_slippage <= 0.005:
            recommendations.append("Optimal conditions for execution")
        
        if not recommendations:
            recommendations.append("Proceed with standard execution parameters")
        
        return recommendations
    
    def _get_volatility_multiplier(self, volatility: str) -> float:
        """Get volatility multiplier for slippage calculation"""
        multipliers = {
            'low': 0.8,
            'normal': 1.0,
            'high': 1.5
        }
        return multipliers.get(volatility, 1.0)
    
    def _get_dex_multiplier(self, dex_type: str) -> float:
        """Get DEX type multiplier for slippage calculation"""
        multipliers = {
            'uniswap_v3': 0.8,  # Concentrated liquidity
            'uniswap_v2': 1.0,  # Standard AMM
            'sushiswap': 1.0,   # Standard AMM
            'curve': 0.7,       # Stable swaps
            'balancer': 0.9     # Weighted pools
        }
        return multipliers.get(dex_type, 1.0)

# Claude-style execution function
def run(input_json: str) -> str:
    """
    Claude-style execution interface
    
    Args:
        input_json: JSON string with SlippageAnalysisInput data
        
    Returns:
        JSON string with SlippageAnalysisOutput data
    """
    try:
        # Parse input
        input_data_dict = json.loads(input_json)
        input_data = SlippageAnalysisInput(**input_data_dict)
        
        # Run analysis
        agent = SlippageRiskAgent()
        result = agent.run(input_data)
        
        # Convert result to dict for JSON serialization
        result_dict = {
            'predicted_slippage': result.predicted_slippage,
            'max_slippage': result.max_slippage,
            'confidence_level': result.confidence_level,
            'risk_level': result.risk_level,
            'recommended_max_trade_size': result.recommended_max_trade_size,
            'liquidity_score': result.liquidity_score,
            'price_impact_estimate': result.price_impact_estimate,
            'execution_recommendations': result.execution_recommendations
        }
        
        return json.dumps(result_dict, indent=2)
        
    except Exception as e:
        error_result = {
            'error': str(e),
            'predicted_slippage': 0.0,
            'max_slippage': 0.0,
            'confidence_level': 0.0,
            'risk_level': 'HIGH',
            'recommended_max_trade_size': 0.0,
            'liquidity_score': 0.0,
            'price_impact_estimate': 0.0,
            'execution_recommendations': ['Error in analysis - do not execute']
        }
        return json.dumps(error_result, indent=2)

if __name__ == "__main__":
    # Example usage
    sample_input = {
        "trade_amount": 10000,
        "token_pair": "ETH/USDC",
        "dex_name": "uniswap_v3",
        "liquidity_data": {
            "total_liquidity": 5000000,
            "depth_2_percent": 250000,
            "dex_type": "uniswap_v3"
        },
        "market_conditions": {
            "volatility": "normal"
        }
    }
    
    result = run(json.dumps(sample_input))
    print(result)
