"""
Configuration Manager for ATOM v2
Handles loading and validation of configuration from JSON and environment variables
"""

import json
import os
from pathlib import Path
from typing import Dict, Any
from dotenv import load_dotenv

class ConfigManager:
    def __init__(self, config_path: str = None):
        self.config_path = config_path or Path(__file__).parent.parent.parent / "config" / "config.json"
        self.env_path = Path(__file__).parent.parent.parent / "config" / ".env"
        
        # Load environment variables
        if self.env_path.exists():
            load_dotenv(self.env_path)
        
        # Load configuration
        self.config = self._load_config()
        self._apply_env_overrides()
        self._validate_config()
    
    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from JSON file"""
        try:
            with open(self.config_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            raise FileNotFoundError(f"Configuration file not found: {self.config_path}")
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON in configuration file: {e}")
    
    def _apply_env_overrides(self):
        """Apply environment variable overrides"""
        # Network configuration
        if os.getenv('RPC_URL'):
            self.config['network']['rpc_url'] = os.getenv('RPC_URL')
        if os.getenv('CHAIN_ID'):
            self.config['network']['chain_id'] = int(os.getenv('CHAIN_ID'))
        if os.getenv('NETWORK_NAME'):
            self.config['network']['name'] = os.getenv('NETWORK_NAME')
        
        # API Keys
        if os.getenv('ZEROX_API_KEY'):
            self.config['aggregators']['0x']['api_key'] = os.getenv('ZEROX_API_KEY')
        if os.getenv('ONEINCH_API_KEY'):
            self.config['aggregators']['1inch']['api_key'] = os.getenv('ONEINCH_API_KEY')
        if os.getenv('PARASWAP_API_KEY'):
            self.config['aggregators']['paraswap']['api_key'] = os.getenv('PARASWAP_API_KEY')
        
        # Flashbots
        if os.getenv('FLASHBOTS_RELAY_URL'):
            self.config['mev_protection']['flashbots_relay'] = os.getenv('FLASHBOTS_RELAY_URL')
        
        # CoW Protocol
        if os.getenv('COW_API_URL'):
            self.config['cow_protocol']['api_url'] = os.getenv('COW_API_URL')
        if os.getenv('COW_SETTLEMENT_CONTRACT'):
            self.config['cow_protocol']['settlement_contract'] = os.getenv('COW_SETTLEMENT_CONTRACT')
    
    def _validate_config(self):
        """Validate configuration values"""
        required_fields = [
            'network.rpc_url',
            'network.chain_id',
            'trading.min_profit_wei',
            'trading.trade_amount_wei'
        ]
        
        for field in required_fields:
            if not self._get_nested_value(field):
                raise ValueError(f"Required configuration field missing: {field}")
        
        # Validate numeric values
        if int(self.config['trading']['min_profit_wei']) <= 0:
            raise ValueError("min_profit_wei must be positive")
        
        if int(self.config['trading']['trade_amount_wei']) <= 0:
            raise ValueError("trade_amount_wei must be positive")
    
    def _get_nested_value(self, key_path: str) -> Any:
        """Get nested configuration value using dot notation"""
        keys = key_path.split('.')
        value = self.config
        
        for key in keys:
            if isinstance(value, dict) and key in value:
                value = value[key]
            else:
                return None
        
        return value
    
    def get(self, key_path: str, default: Any = None) -> Any:
        """Get configuration value with optional default"""
        value = self._get_nested_value(key_path)
        return value if value is not None else default
    
    def get_network_config(self) -> Dict[str, Any]:
        """Get network configuration"""
        return self.config['network']
    
    def get_trading_config(self) -> Dict[str, Any]:
        """Get trading configuration"""
        return self.config['trading']
    
    def get_dex_config(self, dex_name: str = None) -> Dict[str, Any]:
        """Get DEX configuration"""
        if dex_name:
            return self.config['dexes'].get(dex_name, {})
        return self.config['dexes']
    
    def get_aggregator_config(self, aggregator_name: str = None) -> Dict[str, Any]:
        """Get aggregator configuration"""
        if aggregator_name:
            return self.config['aggregators'].get(aggregator_name, {})
        return self.config['aggregators']
    
    def get_mev_config(self) -> Dict[str, Any]:
        """Get MEV protection configuration"""
        return self.config['mev_protection']
    
    def get_cow_config(self) -> Dict[str, Any]:
        """Get CoW protocol configuration"""
        return self.config['cow_protocol']
    
    def get_flash_loan_config(self) -> Dict[str, Any]:
        """Get flash loan configuration"""
        return self.config['flash_loans']
    
    def get_risk_config(self) -> Dict[str, Any]:
        """Get risk management configuration"""
        return self.config.get('risk_management', {})
    
    def is_enabled(self, feature_path: str) -> bool:
        """Check if a feature is enabled"""
        return bool(self._get_nested_value(f"{feature_path}.enabled"))
    
    def get_private_key(self) -> str:
        """Get private key from environment"""
        private_key = os.getenv('PRIVATE_KEY')
        if not private_key:
            raise ValueError("PRIVATE_KEY environment variable not set")
        return private_key
    
    def get_flashbots_private_key(self) -> str:
        """Get Flashbots private key from environment"""
        return os.getenv('FLASHBOTS_PRIVATE_KEY', self.get_private_key())
    
    def save_config(self, config_path: str = None):
        """Save current configuration to file"""
        path = config_path or self.config_path
        with open(path, 'w') as f:
            json.dump(self.config, f, indent=2)
    
    def update_config(self, updates: Dict[str, Any]):
        """Update configuration with new values"""
        def deep_update(base_dict, update_dict):
            for key, value in update_dict.items():
                if isinstance(value, dict) and key in base_dict and isinstance(base_dict[key], dict):
                    deep_update(base_dict[key], value)
                else:
                    base_dict[key] = value
        
        deep_update(self.config, updates)
        self._validate_config()
