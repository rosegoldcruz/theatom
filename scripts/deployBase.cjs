const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting Base AtomArbitrage deployment...");
  console.log("💰 Target: $10M Flash Loans with 1% Profit Margins");
  console.log("⛽ Gas Limit: $10-20 (Base Network Optimized)");
  console.log("🔄 DEXs: Balancer, Uniswap, Curve, SushiSwap");
  console.log("🌐 Network: Base Testnet (Sepolia)");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("\n📝 Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Deploy Base AtomArbitrage contract
  console.log("\n📦 Deploying Base AtomArbitrage contract...");
  const BaseAtomArbitrage = await hre.ethers.getContractFactory("BaseAtomArbitrage");
  const baseAtomArbitrage = await BaseAtomArbitrage.deploy();
  await baseAtomArbitrage.waitForDeployment();

  const contractAddress = await baseAtomArbitrage.getAddress();
  console.log("✅ Base AtomArbitrage deployed to:", contractAddress);

  // Verify deployment and constants
  console.log("\n🔍 Verifying deployment...");
  const owner = await baseAtomArbitrage.owner();
  console.log("👤 Contract owner:", owner);
  console.log("🏦 AAVE Provider:", await baseAtomArbitrage.ADDRESSES_PROVIDER());
  console.log("⚖️  Balancer Vault:", await baseAtomArbitrage.BALANCER_VAULT());
  console.log("📈 Curve Registry:", await baseAtomArbitrage.CURVE_REGISTRY());
  console.log("🦄 Uniswap Router:", await baseAtomArbitrage.UNISWAP_ROUTER());
  console.log("🍣 SushiSwap Router:", await baseAtomArbitrage.SUSHISWAP_ROUTER());
  
  // Verify constants
  console.log("\n📊 Contract Constants:");
  console.log("💵 Max Flash Loan:", hre.ethers.formatEther(await baseAtomArbitrage.MAX_FLASH_LOAN_AMOUNT()), "tokens ($10M equivalent)");
  console.log("📈 Min Profit:", (await baseAtomArbitrage.MIN_PROFIT_BASIS_POINTS()).toString(), "basis points (1%)");
  console.log("⛽ Min Gas Cost:", (await baseAtomArbitrage.MIN_GAS_COST_USD()).toString(), "USD");
  console.log("⛽ Max Gas Cost:", (await baseAtomArbitrage.MAX_GAS_COST_USD()).toString(), "USD");
  console.log("💰 ETH Price (for gas calc):", (await baseAtomArbitrage.ETH_PRICE_USD()).toString(), "USD");

  // Test gas estimation functions
  console.log("\n🧪 Testing Gas Estimation Functions:");
  try {
    const gasUnits = 300000; // 300k gas units (Base is cheaper)
    const gasPriceGwei = 1; // Base has very low gas prices
    
    const gasCostUSD = await baseAtomArbitrage.estimateGasCostUSD(gasUnits, gasPriceGwei);
    console.log(`⛽ Gas cost for ${gasUnits} units at ${gasPriceGwei} gwei: $${gasCostUSD}`);
    
    const [acceptable, actualCost] = await baseAtomArbitrage.isGasCostAcceptable(gasUnits, gasPriceGwei);
    console.log(`✅ Gas cost acceptable: ${acceptable} (Cost: $${actualCost})`);
    
    const maxGasPrice = await baseAtomArbitrage.getMaxGasPriceForLimit(gasUnits);
    console.log(`📊 Max gas price for $20 limit: ${maxGasPrice} gwei`);
    
    const minGasPrice = await baseAtomArbitrage.getMinGasPriceForLimit(gasUnits);
    console.log(`📊 Min gas price for $10 minimum: ${minGasPrice} gwei`);
  } catch (error) {
    console.log("⚠️  Gas estimation test failed:", error.message);
  }

  // Deploy MockERC20 for testing
  console.log("\n📦 Deploying MockERC20 test token...");
  const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
  const mockToken = await MockERC20.deploy("Base Test Token", "BTT", hre.ethers.parseEther("1000000"));
  await mockToken.waitForDeployment();

  const mockTokenAddress = await mockToken.getAddress();
  console.log("✅ MockERC20 deployed to:", mockTokenAddress);

  console.log("\n🎉 Base Enhanced Deployment Summary:");
  console.log("=" .repeat(70));
  console.log("🏗️  Network:", hre.network.name);
  console.log("👤 Deployer:", deployer.address);
  console.log("⚡ Base AtomArbitrage:", contractAddress);
  console.log("🪙 Mock Test Token:", mockTokenAddress);
  console.log("💰 Flash Loan Capacity: $10,000,000");
  console.log("📈 Minimum Profit Target: 1%");
  console.log("⛽ Gas Cost Range: $10 - $20");
  console.log("🔄 Supported DEXs: Balancer, Uniswap, Curve, SushiSwap");
  console.log("🌐 Optimized for Base Network");
  console.log("=" .repeat(70));

  // Save enhanced deployment info
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    contracts: {
      BaseAtomArbitrage: contractAddress,
      MockERC20: mockTokenAddress
    },
    features: {
      maxFlashLoanUSD: 10000000,
      minProfitPercent: 1,
      minGasCostUSD: 10,
      maxGasCostUSD: 20,
      supportedDEXs: ["Balancer", "Uniswap", "Curve", "SushiSwap"],
      flashLoanProviders: ["AAVE", "Balancer"],
      optimizedFor: "Base Network"
    },
    addresses: {
      aaveProvider: await baseAtomArbitrage.ADDRESSES_PROVIDER(),
      balancerVault: await baseAtomArbitrage.BALANCER_VAULT(),
      curveRegistry: await baseAtomArbitrage.CURVE_REGISTRY(),
      uniswapRouter: await baseAtomArbitrage.UNISWAP_ROUTER(),
      sushiswapRouter: await baseAtomArbitrage.SUSHISWAP_ROUTER()
    },
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };

  console.log("\n📄 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  console.log("\n🎊 Base deployment completed successfully!");
  console.log("🔗 Next steps:");
  console.log("1. Verify contract: npx hardhat verify --network base_sepolia", contractAddress);
  console.log("2. Get Base Sepolia ETH from: https://bridge.base.org/deposit");
  console.log("3. Test arbitrage functions on Base testnet");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
