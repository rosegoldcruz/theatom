# 🚀 Enhanced AtomArbitrage Smart Contract

## 💰 $10M Flash Loan Arbitrage System with 1% Profit Targeting

This enhanced smart contract utilizes **$10 million flash loans** from AAVE to find **1% profit margins** across arbitrage opportunities on **Balancer**, **Uniswap**, and **Curve** exchanges, with built-in **$50 gas cost protection**.

---

## 🎯 Key Features

### 💵 Flash Loan Capabilities
- **AAVE V3 Integration**: Up to $10M flash loans with 0.09% fee
- **Balancer V2 Integration**: Fee-free flash loans for certain tokens
- **Multi-token Support**: Flash loan multiple assets simultaneously

### 📈 Profit Optimization
- **1% Minimum Profit**: Enforced 100 basis points minimum profit margin
- **Multi-DEX Arbitrage**: Balancer, Uniswap, Curve, SushiSwap support
- **Advanced Route Optimization**: Find optimal trading paths across DEXs

### ⛽ Gas Protection
- **$50 Maximum Gas Cost**: Built-in protection against expensive transactions
- **Dynamic Gas Pricing**: Real-time gas cost calculations
- **Gas Estimation Tools**: Pre-execution cost analysis

### 🛡️ Security Features
- **Owner-only Execution**: Protected arbitrage functions
- **Reentrancy Protection**: SafeERC20 and ReentrancyGuard
- **Emergency Withdrawals**: Fail-safe fund recovery

---

## 🏗️ Contract Architecture

```solidity
contract AtomArbitrage is IFlashLoanSimpleReceiver, IFlashLoanRecipient, ReentrancyGuard, Ownable
```

### Core Components

1. **Flash Loan Receivers**
   - AAVE V3 flash loan callback
   - Balancer V2 flash loan callback

2. **DEX Integrations**
   - Uniswap V2 Router
   - SushiSwap Router  
   - Balancer V2 Vault
   - Curve Finance Pools

3. **Profit Calculation Engine**
   - Multi-DEX price simulation
   - Gas cost estimation
   - Profit margin validation

---

## 🔧 Usage Examples

### Execute AAVE Flash Loan Arbitrage

```javascript
const params = ethers.AbiCoder.defaultAbiCoder().encode(
  ["address", "address", "uint256", "uint8", "uint8", "bytes", "bytes", "uint256", "uint256", "uint256"],
  [
    tokenA,                    // Token A address
    tokenB,                    // Token B address  
    amount,                    // Flash loan amount
    0,                         // Buy DEX (0=Uniswap, 1=SushiSwap, 2=Balancer, 3=Curve)
    2,                         // Sell DEX
    buyData,                   // Buy execution data
    sellData,                  // Sell execution data
    minProfit,                 // Minimum profit required
    maxGasPrice,               // Maximum gas price (gwei)
    estimatedGasUnits          // Estimated gas consumption
  ]
);

await atomArbitrage.executeArbitrage(tokenA, flashLoanAmount, params);
```

### Execute Balancer Flash Loan

```javascript
const tokens = [tokenA];
const amounts = [flashLoanAmount];

await atomArbitrage.executeBalancerFlashLoan(tokens, amounts, params);
```

### Check Gas Cost

```javascript
const gasUnits = 500000;
const gasPriceGwei = 20;

const [acceptable, costUSD] = await atomArbitrage.isGasCostAcceptable(gasUnits, gasPriceGwei);
console.log(`Gas cost: $${costUSD}, Acceptable: ${acceptable}`);
```

---

## 📊 Constants & Limits

| Parameter | Value | Description |
|-----------|-------|-------------|
| `MAX_FLASH_LOAN_AMOUNT` | 10,000,000 * 1e18 | $10M maximum flash loan |
| `MIN_PROFIT_BASIS_POINTS` | 100 | 1% minimum profit margin |
| `MAX_GAS_COST_USD` | 50 | $50 maximum gas cost |
| `ETH_PRICE_USD` | 2000 | ETH price for gas calculations |

---

## 🔄 Supported DEXs

### 1. **Uniswap V2**
- Router: `0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D`
- Fee: 0.3%
- Liquidity: High

### 2. **SushiSwap**
- Router: `0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F`
- Fee: 0.3%
- Liquidity: Medium-High

### 3. **Balancer V2**
- Vault: `0xBA12222222228d8Ba445958a75a0704d566BF2C8`
- Fee: Variable (0.01% - 10%)
- Features: Weighted pools, stable pools

### 4. **Curve Finance**
- Registry: `0x90E00ACe148ca3b23Ac1bC8C240C2a7Dd9c2d7f5`
- Fee: 0.04%
- Specialty: Stablecoin swaps

---

## 🚀 Deployment

### Local Development

```bash
# Compile contracts
npm run compile

# Run tests
npm run test

# Deploy to local network
npm run deploy:local
```

### Mainnet Deployment

```bash
# Deploy to mainnet (requires PRIVATE_KEY and MAINNET_RPC_URL)
npm run deploy:mainnet
```

---

## 🧪 Testing

The contract includes comprehensive tests covering:

- ✅ Gas cost calculations
- ✅ Flash loan limits ($10M)
- ✅ Profit margin validation (1%)
- ✅ Access control
- ✅ Emergency functions
- ✅ Multi-DEX integration

```bash
npm run test
```

---

## ⚠️ Risk Management

### Gas Protection
- Automatic rejection of transactions exceeding $50 gas cost
- Real-time gas price monitoring
- Pre-execution cost estimation

### Profit Validation
- Minimum 1% profit margin enforcement
- Slippage protection
- MEV protection considerations

### Security Measures
- Owner-only execution
- Reentrancy protection
- Emergency withdrawal functions

---

## 📈 Profit Calculation

The contract calculates profit as:

```
Profit = Final Amount - Initial Amount - Flash Loan Fee
Required Profit = Initial Amount × 1% (100 basis points)
```

Gas costs are factored into profitability:

```
Net Profit = Gross Profit - Gas Cost (max $50)
```

---

## 🔧 Emergency Functions

### Withdraw ETH
```solidity
function withdrawETH() external onlyOwner
```

### Withdraw Tokens
```solidity
function withdrawToken(address token, uint256 amount) external onlyOwner
```

### Emergency Withdraw All
```solidity
function emergencyWithdraw(address token) external onlyOwner
```

---

## 📞 Support

For technical support or questions about the Enhanced AtomArbitrage system:

- 📧 Review the test files for usage examples
- 🔍 Check the deployment scripts for configuration
- 🛠️ Examine the contract source for implementation details

---

**⚡ Built for high-frequency, high-value arbitrage with maximum profit extraction and risk protection.**
