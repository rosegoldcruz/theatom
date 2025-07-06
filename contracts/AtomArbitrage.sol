// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Simple reentrancy guard without external dependencies
abstract contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}

contract AtomArbitrage is ReentrancyGuard {
    address public owner;
    uint256 public totalTrades;
    uint256 public totalProfit;
    
    event ArbitrageExecuted(address indexed trader, uint256 profit, uint256 timestamp);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function executeArbitrage(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        
        // Placeholder arbitrage logic
        uint256 profit = amount / 100; // 1% profit simulation
        totalTrades++;
        totalProfit += profit;
        
        emit ArbitrageExecuted(msg.sender, profit, block.timestamp);
    }
    
    function setOwner(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
    
    function getStats() external view returns (uint256, uint256) {
        return (totalTrades, totalProfit);
    }
}