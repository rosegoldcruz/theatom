const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting Enhanced AtomArbitrage deployment...");
  console.log("💰 Target: $10M Flash Loans with 1% Profit Margins");
  console.log("⛽ Gas Limit: Maximum $50 per transaction");
  console.log("🔄 DEXs: Balancer, Uniswap, Curve");

  const [deployer] = await hre.ethers.getSigners();
  console.log("\n📝 Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Deploy Enhanced AtomArbitrage contract
  console.log("\n📦 Deploying Enhanced AtomArbitrage contract...");
  const AtomArbitrage = await hre.ethers.getContractFactory("AtomArbitrage");
  const atomArbitrage = await AtomArbitrage.deploy();
  await atomArbitrage.waitForDeployment();

  const contractAddress = await atomArbitrage.getAddress();
  console.log("✅ Enhanced AtomArbitrage deployed to:", contractAddress);

  // Verify deployment and constants
  console.log("\n🔍 Verifying deployment...");
  const owner = await atomArbitrage.owner();
  console.log("👤 Contract owner:", owner);
  console.log("🏦 AAVE Provider:", await atomArbitrage.ADDRESSES_PROVIDER());
  console.log("⚖️  Balancer Vault:", await atomArbitrage.BALANCER_VAULT());
  console.log("📈 Curve Registry:", await atomArbitrage.CURVE_REGISTRY());
  console.log("🦄 Uniswap Router:", await atomArbitrage.UNISWAP_ROUTER());
  console.log("🍣 SushiSwap Router:", await atomArbitrage.SUSHISWAP_ROUTER());

  // Verify constants
  console.log("\n📊 Contract Constants:");
  console.log("💵 Max Flash Loan:", hre.ethers.formatEther(await atomArbitrage.MAX_FLASH_LOAN_AMOUNT()), "tokens ($10M equivalent)");
  console.log("📈 Min Profit:", (await atomArbitrage.MIN_PROFIT_BASIS_POINTS()).toString(), "basis points (1%)");
  console.log("⛽ Max Gas Cost:", (await atomArbitrage.MAX_GAS_COST_USD()).toString(), "USD");
  console.log("💰 ETH Price (for gas calc):", (await atomArbitrage.ETH_PRICE_USD()).toString(), "USD");

  // Test gas estimation functions
  console.log("\n🧪 Testing Gas Estimation Functions:");
  try {
    const gasUnits = 500000; // 500k gas units
    const gasPriceGwei = 20; // 20 gwei

    const gasCostUSD = await atomArbitrage.estimateGasCostUSD(gasUnits, gasPriceGwei);
    console.log(`⛽ Gas cost for ${gasUnits} units at ${gasPriceGwei} gwei: $${gasCostUSD}`);

    const [acceptable, actualCost] = await atomArbitrage.isGasCostAcceptable(gasUnits, gasPriceGwei);
    console.log(`✅ Gas cost acceptable: ${acceptable} (Cost: $${actualCost})`);

    const maxGasPrice = await atomArbitrage.getMaxGasPriceForLimit(gasUnits);
    console.log(`📊 Max gas price for $50 limit: ${maxGasPrice} gwei`);
  } catch (error) {
    console.log("⚠️  Gas estimation test failed:", error.message);
  }

  // Deploy HelloWorld for testing
  console.log("\n📦 Deploying HelloWorld test contract...");
  const HelloWorld = await hre.ethers.getContractFactory("HelloWorld");
  const helloWorld = await HelloWorld.deploy();
  await helloWorld.waitForDeployment();

  const helloWorldAddress = await helloWorld.getAddress();
  console.log("✅ HelloWorld deployed to:", helloWorldAddress);

  // Test HelloWorld
  const greeting = await helloWorld.getGreeting();
  console.log("👋 Initial greeting:", greeting);

  console.log("\n🎉 Enhanced Deployment Summary:");
  console.log("=" .repeat(60));
  console.log("🏗️  Network:", hre.network.name);
  console.log("👤 Deployer:", deployer.address);
  console.log("⚡ Enhanced AtomArbitrage:", contractAddress);
  console.log("👋 HelloWorld (Test):", helloWorldAddress);
  console.log("💰 Flash Loan Capacity: $10,000,000");
  console.log("📈 Minimum Profit Target: 1%");
  console.log("⛽ Maximum Gas Cost: $50");
  console.log("🔄 Supported DEXs: Balancer, Uniswap, Curve, SushiSwap");
  console.log("=" .repeat(60));

  // Save enhanced deployment info
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    contracts: {
      EnhancedAtomArbitrage: contractAddress,
      HelloWorld: helloWorldAddress
    },
    features: {
      maxFlashLoanUSD: 10000000,
      minProfitPercent: 1,
      maxGasCostUSD: 50,
      supportedDEXs: ["Balancer", "Uniswap", "Curve", "SushiSwap"],
      flashLoanProviders: ["AAVE", "Balancer"]
    },
    addresses: {
      aaveProvider: await atomArbitrage.ADDRESSES_PROVIDER(),
      balancerVault: await atomArbitrage.BALANCER_VAULT(),
      curveRegistry: await atomArbitrage.CURVE_REGISTRY(),
      uniswapRouter: await atomArbitrage.UNISWAP_ROUTER(),
      sushiswapRouter: await atomArbitrage.SUSHISWAP_ROUTER()
    },
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };

  console.log("\n📄 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  return deploymentInfo;
}

main()
  .then((deploymentInfo) => {
    console.log("\n🎊 Deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
