#!/bin/bash

# ATOM Arbitrage System Test Flow
# This script tests the complete arbitrage execution flow

echo "🧪 ATOM Arbitrage System - Test Flow"
echo "===================================="

# Configuration
API_BASE="http://localhost:3001"
WALLET_ADDRESS="0x742d35Cc6634C0532925a3b8D0C9C0E3C5C7C5C5"
TOKEN_A="0xA0b86a33E6441b8C0C0C0C0C0C0C0C0C0C0C0C0C"
TOKEN_B="0xB0b86a33E6441b8C0C0C0C0C0C0C0C0C0C0C0C0C"
AMOUNT_IN="0.01"
MIN_PROFIT="0.001"

echo "📊 Testing API endpoints..."

# Test 1: Health Check
echo "1. Health Check"
curl -s -X GET "$API_BASE/api/health" | jq '.'

# Test 2: Arbitrage Status
echo -e "\n2. Arbitrage Status"
curl -s -X GET "$API_BASE/api/arbitrage/status" | jq '.'

# Test 3: Simulate Arbitrage
echo -e "\n3. Simulate Arbitrage"
curl -s -X POST "$API_BASE/api/arbitrage/simulate" \
  -H "Content-Type: application/json" \
  -d "{
    \"tokenA\": \"$TOKEN_A\",
    \"tokenB\": \"$TOKEN_B\",
    \"amountIn\": \"$AMOUNT_IN\",
    \"buyDex\": \"uniswap\",
    \"sellDex\": \"sushiswap\"
  }" | jq '.'

# Test 4: Execute Arbitrage (will fail without proper setup, but tests validation)
echo -e "\n4. Execute Arbitrage (Validation Test)"
curl -s -X POST "$API_BASE/api/arbitrage/execute" \
  -H "Content-Type: application/json" \
  -d "{
    \"walletAddress\": \"$WALLET_ADDRESS\",
    \"tokenA\": \"$TOKEN_A\",
    \"tokenB\": \"$TOKEN_B\",
    \"amountIn\": \"$AMOUNT_IN\",
    \"buyDex\": \"uniswap\",
    \"sellDex\": \"sushiswap\",
    \"minProfit\": \"$MIN_PROFIT\"
  }" | jq '.'

# Test 5: Invalid Request (should fail validation)
echo -e "\n5. Invalid Request Test"
curl -s -X POST "$API_BASE/api/arbitrage/execute" \
  -H "Content-Type: application/json" \
  -d "{
    \"walletAddress\": \"invalid-address\",
    \"tokenA\": \"$TOKEN_A\",
    \"tokenB\": \"$TOKEN_B\",
    \"amountIn\": \"999\",
    \"buyDex\": \"uniswap\",
    \"sellDex\": \"uniswap\",
    \"minProfit\": \"$MIN_PROFIT\"
  }" | jq '.'

echo -e "\n✅ Test flow completed!"
echo "📝 Check the responses above for validation and error handling"
