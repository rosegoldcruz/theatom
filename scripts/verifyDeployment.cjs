const hre = require("hardhat");

async function main() {
  console.log("🔍 Verifying Base Sepolia deployment...");
  
  // Contract address from deployment
  const contractAddress = "0xFc905877348deA2f91000fe99F94E0AfAEDEB590";
  
  console.log("📍 Contract Address:", contractAddress);
  console.log("🌐 Network:", hre.network.name);
  
  try {
    // Get contract instance
    const BaseAtomArbitrage = await hre.ethers.getContractFactory("BaseAtomArbitrage");
    const contract = BaseAtomArbitrage.attach(contractAddress);
    
    // Wait a bit for the contract to be fully available
    console.log("⏳ Waiting for contract to be available...");
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Verify basic contract info
    console.log("\n✅ Contract Verification:");
    
    const owner = await contract.owner();
    console.log("👤 Owner:", owner);
    
    const aaveProvider = await contract.ADDRESSES_PROVIDER();
    console.log("🏦 AAVE Provider:", aaveProvider);
    
    const balancerVault = await contract.BALANCER_VAULT();
    console.log("⚖️  Balancer Vault:", balancerVault);
    
    const maxFlashLoan = await contract.MAX_FLASH_LOAN_AMOUNT();
    console.log("💰 Max Flash Loan:", hre.ethers.formatEther(maxFlashLoan), "tokens");
    
    const minProfit = await contract.MIN_PROFIT_BASIS_POINTS();
    console.log("📈 Min Profit:", minProfit.toString(), "basis points");
    
    const maxGasCost = await contract.MAX_GAS_COST_USD();
    console.log("⛽ Max Gas Cost:", maxGasCost.toString(), "USD");
    
    console.log("\n🎉 Contract verification successful!");
    console.log("🔗 View on BaseScan:", `https://sepolia.basescan.org/address/${contractAddress}`);
    
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
    console.log("🔗 Check contract on BaseScan:", `https://sepolia.basescan.org/address/${contractAddress}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
