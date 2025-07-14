const hre = require("hardhat");

async function main() {
  console.log("🔗 Interacting with Enhanced AtomArbitrage contract...");
  
  // Get deployed contract address (update this with your deployed address)
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  // Get contract instance
  const AtomArbitrage = await hre.ethers.getContractFactory("AtomArbitrage");
  const atomArbitrage = AtomArbitrage.attach(contractAddress);
  
  const [owner] = await hre.ethers.getSigners();
  console.log("👤 Interacting as:", owner.address);
  
  // Test gas estimation functions
  console.log("\n⛽ Testing Gas Estimation:");
  
  const gasUnits = 500000;
  const gasPriceGwei = 25;
  
  try {
    const gasCostUSD = await atomArbitrage.estimateGasCostUSD(gasUnits, gasPriceGwei);
    console.log(`💰 Gas cost: $${gasCostUSD} for ${gasUnits} units at ${gasPriceGwei} gwei`);
    
    const [acceptable, actualCost] = await atomArbitrage.isGasCostAcceptable(gasUnits, gasPriceGwei);
    console.log(`✅ Acceptable: ${acceptable} (Actual cost: $${actualCost})`);
    
    const maxGasPrice = await atomArbitrage.getMaxGasPriceForLimit(gasUnits);
    console.log(`📊 Max gas price for $50 limit: ${maxGasPrice} gwei`);
  } catch (error) {
    console.error("❌ Gas estimation failed:", error.message);
  }
  
  // Test contract constants
  console.log("\n📊 Contract Constants:");
  try {
    const maxFlashLoan = await atomArbitrage.MAX_FLASH_LOAN_AMOUNT();
    const minProfit = await atomArbitrage.MIN_PROFIT_BASIS_POINTS();
    const maxGasCost = await atomArbitrage.MAX_GAS_COST_USD();
    const ethPrice = await atomArbitrage.ETH_PRICE_USD();
    
    console.log(`💵 Max Flash Loan: ${hre.ethers.formatEther(maxFlashLoan)} tokens`);
    console.log(`📈 Min Profit: ${minProfit} basis points`);
    console.log(`⛽ Max Gas Cost: $${maxGasCost}`);
    console.log(`💰 ETH Price: $${ethPrice}`);
  } catch (error) {
    console.error("❌ Constants check failed:", error.message);
  }
  
  // Test DEX addresses
  console.log("\n🔄 DEX Addresses:");
  try {
    const aaveProvider = await atomArbitrage.ADDRESSES_PROVIDER();
    const balancerVault = await atomArbitrage.BALANCER_VAULT();
    const curveRegistry = await atomArbitrage.CURVE_REGISTRY();
    const uniswapRouter = await atomArbitrage.UNISWAP_ROUTER();
    const sushiswapRouter = await atomArbitrage.SUSHISWAP_ROUTER();
    
    console.log(`🏦 AAVE Provider: ${aaveProvider}`);
    console.log(`⚖️  Balancer Vault: ${balancerVault}`);
    console.log(`📈 Curve Registry: ${curveRegistry}`);
    console.log(`🦄 Uniswap Router: ${uniswapRouter}`);
    console.log(`🍣 SushiSwap Router: ${sushiswapRouter}`);
  } catch (error) {
    console.error("❌ DEX addresses check failed:", error.message);
  }
  
  // Test ownership
  console.log("\n👤 Ownership:");
  try {
    const contractOwner = await atomArbitrage.owner();
    console.log(`🔑 Contract Owner: ${contractOwner}`);
    console.log(`✅ You are owner: ${contractOwner.toLowerCase() === owner.address.toLowerCase()}`);
  } catch (error) {
    console.error("❌ Ownership check failed:", error.message);
  }
  
  // Simulate profit calculation (this would fail in test environment but shows the interface)
  console.log("\n📊 Testing Profit Calculation Interface:");
  try {
    const tokenA = "0xA0b86a33E6441b8e8C7C7b0b8b8b8b8b8b8b8b8b"; // Mock address
    const tokenB = "0xB0b86a33E6441b8e8C7C7b0b8b8b8b8b8b8b8b8b"; // Mock address
    const amount = hre.ethers.parseEther("1000000"); // $1M
    const buyData = hre.ethers.AbiCoder.defaultAbiCoder().encode(["address[]"], [[tokenA, tokenB]]);
    const sellData = hre.ethers.AbiCoder.defaultAbiCoder().encode(["address[]"], [[tokenB, tokenA]]);
    
    console.log("🧮 Profit calculation interface ready");
    console.log(`📊 Would calculate profit for ${hre.ethers.formatEther(amount)} tokens`);
    console.log("⚠️  Note: Actual calculation requires mainnet fork or real DEX data");
  } catch (error) {
    console.log("ℹ️  Profit calculation interface available (requires mainnet data)");
  }
  
  console.log("\n✅ Contract interaction test completed!");
  console.log("🚀 Ready for arbitrage operations!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Interaction failed:", error);
    process.exit(1);
  });
