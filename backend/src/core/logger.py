"""
Logging configuration for ATOM v2
"""

import logging
import os
import sys
from pathlib import Path
from logging.handlers import RotatingFileHandler
from datetime import datetime

def setup_logger(name: str, level: str = None) -> logging.Logger:
    """Setup logger with file and console handlers"""
    
    # Get log level from environment or default to INFO
    log_level = level or os.getenv('LOG_LEVEL', 'INFO').upper()
    
    # Create logger
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, log_level))
    
    # Avoid duplicate handlers
    if logger.handlers:
        return logger
    
    # Create logs directory
    log_dir = Path(__file__).parent.parent.parent / "logs"
    log_dir.mkdir(exist_ok=True)
    
    # Create formatters
    detailed_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    simple_formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s'
    )
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(simple_formatter)
    logger.addHandler(console_handler)
    
    # File handler for all logs
    file_handler = RotatingFileHandler(
        log_dir / "atom.log",
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5
    )
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(detailed_formatter)
    logger.addHandler(file_handler)
    
    # Error file handler
    error_handler = RotatingFileHandler(
        log_dir / "error.log",
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(detailed_formatter)
    logger.addHandler(error_handler)
    
    return logger

def log_trade_execution(trade_data: dict):
    """Log trade execution details"""
    trade_logger = logging.getLogger('trade_execution')
    
    if not trade_logger.handlers:
        log_dir = Path(__file__).parent.parent.parent / "logs"
        log_dir.mkdir(exist_ok=True)
        
        handler = RotatingFileHandler(
            log_dir / "trades.log",
            maxBytes=50*1024*1024,  # 50MB
            backupCount=10
        )
        
        formatter = logging.Formatter(
            '%(asctime)s - TRADE - %(message)s'
        )
        handler.setFormatter(formatter)
        trade_logger.addHandler(handler)
        trade_logger.setLevel(logging.INFO)
    
    trade_logger.info(f"Trade executed: {trade_data}")

def log_opportunity(opportunity_data: dict):
    """Log arbitrage opportunity details"""
    opp_logger = logging.getLogger('opportunities')
    
    if not opp_logger.handlers:
        log_dir = Path(__file__).parent.parent.parent / "logs"
        log_dir.mkdir(exist_ok=True)
        
        handler = RotatingFileHandler(
            log_dir / "opportunities.log",
            maxBytes=50*1024*1024,  # 50MB
            backupCount=10
        )
        
        formatter = logging.Formatter(
            '%(asctime)s - OPPORTUNITY - %(message)s'
        )
        handler.setFormatter(formatter)
        opp_logger.addHandler(handler)
        opp_logger.setLevel(logging.INFO)
    
    opp_logger.info(f"Opportunity found: {opportunity_data}")

def log_performance_metrics(metrics: dict):
    """Log performance metrics"""
    perf_logger = logging.getLogger('performance')
    
    if not perf_logger.handlers:
        log_dir = Path(__file__).parent.parent.parent / "logs"
        log_dir.mkdir(exist_ok=True)
        
        handler = RotatingFileHandler(
            log_dir / "performance.log",
            maxBytes=50*1024*1024,  # 50MB
            backupCount=10
        )
        
        formatter = logging.Formatter(
            '%(asctime)s - PERFORMANCE - %(message)s'
        )
        handler.setFormatter(formatter)
        perf_logger.addHandler(handler)
        perf_logger.setLevel(logging.INFO)
    
    perf_logger.info(f"Performance metrics: {metrics}")
