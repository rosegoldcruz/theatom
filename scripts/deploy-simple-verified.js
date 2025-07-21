const { ethers, run, network } = require("hardhat");
const fs = require('fs');
const path = require('path');

/**
 * 🚀 SIMPLE FLASHLOAN DEPLOYMENT + AUTO-VERIFICATION
 * 
 * This deploys the SimpleFlashLoan contract which doesn't require AAVE
 * Perfect for testing the deployment and verification pipeline
 */

async function main() {
  console.log(`🚀 Deploying SimpleFlashLoan to ${network.name}...\n`);
  
  // Get deployer info
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const balance = await ethers.provider.getBalance(deployerAddress);
  
  console.log(`👤 Deployer: ${deployerAddress}`);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`);
  console.log(`🌐 Network: ${network.name} (Chain ID: ${network.config.chainId})\n`);
  
  // Check minimum balance
  if (balance < ethers.parseEther("0.001")) {
    throw new Error("❌ Insufficient balance for deployment");
  }
  
  // Deploy contract
  console.log("📦 Deploying SimpleFlashLoan contract...");
  
  const SimpleFlashLoan = await ethers.getContractFactory("SimpleFlashLoan");
  
  // Estimate gas
  const deploymentData = SimpleFlashLoan.interface.encodeDeploy([]);
  const gasEstimate = await ethers.provider.estimateGas({
    data: deploymentData,
    from: deployerAddress
  });
  
  console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);
  
  // Deploy with gas buffer
  const contract = await SimpleFlashLoan.deploy({
    gasLimit: gasEstimate * 120n / 100n // 20% buffer
  });
  
  console.log(`📋 Transaction hash: ${contract.deploymentTransaction().hash}`);
  console.log("⏳ Waiting for deployment confirmation...");
  
  // Wait for deployment
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  
  console.log(`✅ Contract deployed to: ${contractAddress}`);
  
  // Get explorer URL
  const explorerUrl = getExplorerUrl(network.name, contractAddress);
  console.log(`🔗 Explorer: ${explorerUrl}\n`);
  
  // Save deployment info
  const deploymentInfo = {
    contractName: "SimpleFlashLoan",
    network: network.name,
    chainId: network.config.chainId,
    contractAddress: contractAddress,
    deployerAddress: deployerAddress,
    deploymentHash: contract.deploymentTransaction().hash,
    timestamp: new Date().toISOString(),
    gasUsed: gasEstimate.toString(),
    explorerUrl: explorerUrl,
    constructorArgs: [] // No constructor arguments
  };
  
  // Save to deployments directory
  const deploymentsDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const deploymentFile = path.join(deploymentsDir, `simple-flashloan-${network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`💾 Deployment info saved to: ${deploymentFile}`);
  
  // Update frontend configuration
  await updateFrontendConfig(contractAddress, network.name);
  
  // Auto-verification
  console.log("\n🔍 Starting contract verification...");
  await verifyContract(contractAddress, []);
  
  // Test basic functionality
  console.log("\n🧪 Testing basic contract functionality...");
  await testContract(contract);
  
  // Final summary
  console.log("\n🎉 DEPLOYMENT COMPLETE!");
  console.log("=" .repeat(60));
  console.log(`📍 Contract: SimpleFlashLoan`);
  console.log(`📍 Address: ${contractAddress}`);
  console.log(`🌐 Network: ${network.name}`);
  console.log(`🔗 Explorer: ${explorerUrl}`);
  console.log(`📁 Info: ${deploymentFile}`);
  console.log("=" .repeat(60));
  
  return contractAddress;
}

function getExplorerUrl(networkName, address) {
  const explorers = {
    'base_sepolia': `https://base-sepolia.basescan.org/address/${address}`,
    'base_mainnet': `https://basescan.org/address/${address}`,
    'mainnet': `https://etherscan.io/address/${address}`,
    'sepolia': `https://sepolia.etherscan.io/address/${address}`
  };
  
  return explorers[networkName] || `https://etherscan.io/address/${address}`;
}

async function verifyContract(contractAddress, constructorArgs) {
  try {
    console.log("⏳ Verifying contract on Etherscan/BaseScan...");
    
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: constructorArgs,
    });
    
    console.log("✅ Contract verified successfully!");
    
  } catch (error) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("ℹ️  Contract already verified");
    } else {
      console.error("❌ Verification failed:", error.message);
      console.log("🔧 Manual verification command:");
      console.log(`npx hardhat verify --network ${network.name} ${contractAddress}`);
    }
  }
}

async function updateFrontendConfig(contractAddress, networkName) {
  try {
    // Update frontend calls
    const flashLoanCallsPath = path.join(__dirname, '../frontend/calls/flashLoan.ts');
    if (fs.existsSync(flashLoanCallsPath)) {
      let callsContent = fs.readFileSync(flashLoanCallsPath, 'utf8');
      
      // Update the address
      callsContent = callsContent.replace(
        /address: "0x[a-fA-F0-9]{40}"/,
        `address: "${contractAddress}"`
      );
      
      // Update the ABI to match SimpleFlashLoan
      const simpleABI = `[
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "asset",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "requestFlashLoan",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ]`;
      
      callsContent = callsContent.replace(
        /abi: \[[\s\S]*?\]/,
        `abi: ${simpleABI}`
      );
      
      fs.writeFileSync(flashLoanCallsPath, callsContent);
      console.log(`✅ Updated flash loan calls: ${flashLoanCallsPath}`);
    }
    
  } catch (error) {
    console.warn("⚠️  Could not update frontend config:", error.message);
  }
}

async function testContract(contract) {
  try {
    // Test basic view functions
    const owner = await contract.owner();
    const feePercent = await contract.flashLoanFeePercent();
    
    console.log(`✅ Contract owner: ${owner}`);
    console.log(`✅ Flash loan fee: ${feePercent} basis points (${feePercent/100}%)`);
    
  } catch (error) {
    console.warn("⚠️  Contract test failed:", error.message);
  }
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Deployment failed:", error);
    process.exit(1);
  });
