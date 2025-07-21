const { ethers, run, network } = require("hardhat");
const fs = require('fs');
const path = require('path');

/**
 * 🚀 COMPREHENSIVE FLASHLOAN DEPLOYMENT + AUTO-VERIFICATION
 * 
 * Features:
 * ✅ Deploy FlashLoanArbitrage contract
 * ✅ Auto-verify on Etherscan/BaseScan using API V2
 * ✅ Save deployment info to JSON
 * ✅ Update frontend contract address
 * ✅ Comprehensive error handling
 * ✅ Gas optimization
 * ✅ Network validation
 */

// Network configurations
const NETWORK_CONFIG = {
  "base_sepolia": {
    name: "Base Sepolia",
    chainId: 84532,
    aaveProvider: "0x0496275d34753A48320CA58103d5220d394FF77F", // AAVE V3 Base Sepolia
    explorerUrl: "https://base-sepolia.basescan.org",
    currency: "ETH"
  },
  "base_mainnet": {
    name: "Base Mainnet",
    chainId: 8453,
    aaveProvider: "0xe20fCBdBfFC4Dd138cE8b2E6FBb6CB49777ad64D", // AAVE V3 Base Mainnet
    explorerUrl: "https://basescan.org",
    currency: "ETH"
  },
  "mainnet": {
    name: "Ethereum Mainnet",
    chainId: 1,
    aaveProvider: "0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e", // AAVE V3 Mainnet
    explorerUrl: "https://etherscan.io",
    currency: "ETH"
  }
};

async function main() {
  console.log("🚀 Starting FlashLoan Deployment with Auto-Verification...\n");
  
  // Get network info
  const networkName = network.name;
  const config = NETWORK_CONFIG[networkName];
  
  if (!config) {
    throw new Error(`❌ Unsupported network: ${networkName}`);
  }
  
  console.log(`📡 Network: ${config.name} (${config.chainId})`);
  console.log(`🏦 AAVE Provider: ${config.aaveProvider}`);
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const balance = await ethers.provider.getBalance(deployerAddress);
  
  console.log(`👤 Deployer: ${deployerAddress}`);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ${config.currency}\n`);
  
  // Validate minimum balance
  const minBalance = ethers.parseEther("0.01"); // 0.01 ETH minimum
  if (balance < minBalance) {
    throw new Error(`❌ Insufficient balance. Need at least 0.01 ${config.currency}`);
  }
  
  // Deploy contract
  console.log("📦 Deploying FlashLoanArbitrage contract...");
  
  const FlashLoanArbitrage = await ethers.getContractFactory("FlashLoanArbitrage");
  
  // Estimate gas
  const deploymentData = FlashLoanArbitrage.interface.encodeDeploy([config.aaveProvider]);
  const gasEstimate = await ethers.provider.estimateGas({
    data: deploymentData
  });
  
  console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);
  
  // Deploy with gas optimization
  const contract = await FlashLoanArbitrage.deploy(config.aaveProvider, {
    gasLimit: gasEstimate * 120n / 100n // 20% buffer
  });
  
  console.log(`📋 Transaction hash: ${contract.deploymentTransaction().hash}`);
  console.log("⏳ Waiting for deployment confirmation...");
  
  // Wait for deployment
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  
  console.log(`✅ Contract deployed to: ${contractAddress}`);
  console.log(`🔗 Explorer: ${config.explorerUrl}/address/${contractAddress}\n`);
  
  // Save deployment info
  const deploymentInfo = {
    network: networkName,
    chainId: config.chainId,
    contractAddress: contractAddress,
    deployerAddress: deployerAddress,
    aaveProvider: config.aaveProvider,
    deploymentHash: contract.deploymentTransaction().hash,
    timestamp: new Date().toISOString(),
    gasUsed: gasEstimate.toString(),
    explorerUrl: `${config.explorerUrl}/address/${contractAddress}`
  };
  
  // Save to deployments directory
  const deploymentsDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const deploymentFile = path.join(deploymentsDir, `flashloan-${networkName}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`💾 Deployment info saved to: ${deploymentFile}`);
  
  // Update frontend environment
  await updateFrontendConfig(contractAddress, networkName);
  
  // Auto-verification
  console.log("\n🔍 Starting contract verification...");
  await verifyContract(contractAddress, [config.aaveProvider]);
  
  // Final summary
  console.log("\n🎉 DEPLOYMENT COMPLETE!");
  console.log("=" .repeat(50));
  console.log(`📍 Contract Address: ${contractAddress}`);
  console.log(`🌐 Network: ${config.name}`);
  console.log(`🔗 Explorer: ${config.explorerUrl}/address/${contractAddress}`);
  console.log(`📁 Deployment Info: ${deploymentFile}`);
  console.log("=" .repeat(50));
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
      console.log(`npx hardhat verify --network ${network.name} ${contractAddress} "${constructorArgs[0]}"`);
    }
  }
}

async function updateFrontendConfig(contractAddress, networkName) {
  try {
    const frontendEnvPath = path.join(__dirname, '../frontend/.env.local');
    
    if (fs.existsSync(frontendEnvPath)) {
      let envContent = fs.readFileSync(frontendEnvPath, 'utf8');
      
      // Update contract address based on network
      if (networkName === 'base_sepolia') {
        envContent = envContent.replace(
          /NEXT_PUBLIC_BASE_SEPOLIA_CONTRACT_ADDRESS=".*"/,
          `NEXT_PUBLIC_BASE_SEPOLIA_CONTRACT_ADDRESS="${contractAddress}"`
        );
      } else if (networkName === 'base_mainnet') {
        envContent = envContent.replace(
          /NEXT_PUBLIC_BASE_MAINNET_CONTRACT_ADDRESS=".*"/,
          `NEXT_PUBLIC_BASE_MAINNET_CONTRACT_ADDRESS="${contractAddress}"`
        );
        
        // Add if doesn't exist
        if (!envContent.includes('NEXT_PUBLIC_BASE_MAINNET_CONTRACT_ADDRESS')) {
          envContent += `\nNEXT_PUBLIC_BASE_MAINNET_CONTRACT_ADDRESS="${contractAddress}"`;
        }
      }
      
      fs.writeFileSync(frontendEnvPath, envContent);
      console.log(`✅ Updated frontend config: ${frontendEnvPath}`);
    }
    
    // Update calls/flashLoan.ts
    const flashLoanCallsPath = path.join(__dirname, '../frontend/calls/flashLoan.ts');
    if (fs.existsSync(flashLoanCallsPath)) {
      let callsContent = fs.readFileSync(flashLoanCallsPath, 'utf8');
      callsContent = callsContent.replace(
        /address: "0x[a-fA-F0-9]{40}"/,
        `address: "${contractAddress}"`
      );
      fs.writeFileSync(flashLoanCallsPath, callsContent);
      console.log(`✅ Updated flash loan calls: ${flashLoanCallsPath}`);
    }
    
  } catch (error) {
    console.warn("⚠️  Could not update frontend config:", error.message);
  }
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Deployment failed:", error);
    process.exit(1);
  });
