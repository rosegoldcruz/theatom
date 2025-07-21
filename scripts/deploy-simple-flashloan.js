const { ethers, run, network } = require("hardhat");

/**
 * 🚀 SIMPLE FLASHLOAN DEPLOY + VERIFY
 * 
 * This script deploys a simplified version for testing
 */

async function main() {
  console.log(`🚀 Deploying FlashLoan to ${network.name}...\n`);
  
  // Use a test AAVE provider address for Base Sepolia
  // This is the actual AAVE V3 Pool Addresses Provider for Base
  const aaveProvider = "0x2cc668dec5e3d9259b8b8c5c9b6e8d2b8e8e8e8e"; // Placeholder - will update with real address
  
  // For testing, let's use a simpler approach
  console.log("⚠️  Using test configuration for Base Sepolia");
  
  // Deploy
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const balance = await ethers.provider.getBalance(deployerAddress);
  
  console.log(`👤 Deployer: ${deployerAddress}`);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH\n`);
  
  // Check if we have enough balance
  if (balance < ethers.parseEther("0.001")) {
    throw new Error("❌ Insufficient balance for deployment");
  }
  
  console.log("📦 Deploying FlashLoanArbitrage...");
  
  const FlashLoanArbitrage = await ethers.getContractFactory("FlashLoanArbitrage");
  
  try {
    // Try deployment with the AAVE provider
    const contract = await FlashLoanArbitrage.deploy(aaveProvider, {
      gasLimit: 3000000 // Set a reasonable gas limit
    });
    
    console.log(`📋 Transaction hash: ${contract.deploymentTransaction().hash}`);
    console.log("⏳ Waiting for deployment...");
    
    await contract.waitForDeployment();
    const address = await contract.getAddress();
    
    console.log(`✅ Deployed to: ${address}`);
    console.log(`🔗 Explorer: https://base-sepolia.basescan.org/address/${address}`);
    
    // Auto-verify
    console.log("\n🔍 Verifying contract...");
    try {
      await run("verify:verify", {
        address: address,
        constructorArguments: [aaveProvider],
      });
      console.log("✅ Contract verified!");
    } catch (error) {
      if (error.message.includes("already verified")) {
        console.log("ℹ️  Contract already verified");
      } else {
        console.log("⚠️  Verification failed:", error.message);
        console.log(`🔧 Manual verification: npx hardhat verify --network ${network.name} ${address} "${aaveProvider}"`);
      }
    }
    
    // Save deployment info
    const deploymentInfo = {
      network: network.name,
      address: address,
      aaveProvider: aaveProvider,
      deployer: deployerAddress,
      timestamp: new Date().toISOString(),
      txHash: contract.deploymentTransaction().hash
    };
    
    console.log("\n📄 Deployment Summary:");
    console.log(JSON.stringify(deploymentInfo, null, 2));
    
  } catch (error) {
    console.error("💥 Deployment failed:", error.message);
    
    if (error.message.includes("AAVE")) {
      console.log("\n💡 Tip: The AAVE provider address might be incorrect for this network.");
      console.log("Check https://docs.aave.com/developers/deployed-contracts/v3-mainnet for correct addresses.");
    }
    
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
