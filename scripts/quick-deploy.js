const { ethers, run, network } = require("hardhat");

/**
 * 🚀 QUICK FLASHLOAN DEPLOY + VERIFY
 * 
 * Usage:
 * npx hardhat run scripts/quick-deploy.js --network base-sepolia
 * npx hardhat run scripts/quick-deploy.js --network base-mainnet
 */

async function main() {
  console.log(`🚀 Quick deploying to ${network.name}...\n`);
  
  // Network-specific AAVE providers
  const AAVE_PROVIDERS = {
    "base_sepolia": "0x0496275d34753A48320CA58103d5220d394FF77F",
    "base_mainnet": "0xe20fCBdBfFC4Dd138cE8b2E6FBb6CB49777ad64D",
    "mainnet": "0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e"
  };
  
  const aaveProvider = AAVE_PROVIDERS[network.name];
  if (!aaveProvider) {
    throw new Error(`❌ No AAVE provider configured for ${network.name}`);
  }
  
  // Deploy
  const [deployer] = await ethers.getSigners();
  console.log(`👤 Deployer: ${await deployer.getAddress()}`);
  
  const FlashLoanArbitrage = await ethers.getContractFactory("FlashLoanArbitrage");
  const contract = await FlashLoanArbitrage.deploy(aaveProvider);
  
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  
  console.log(`✅ Deployed to: ${address}`);
  
  // Auto-verify
  console.log("🔍 Verifying...");
  try {
    await run("verify:verify", {
      address: address,
      constructorArguments: [aaveProvider],
    });
    console.log("✅ Verified!");
  } catch (error) {
    console.log("⚠️  Verification:", error.message);
  }
  
  console.log(`\n🔗 Explorer: https://${network.name === 'mainnet' ? '' : network.name + '.'}${network.name.includes('base') ? 'basescan' : 'etherscan'}.org/address/${address}`);
}

main().catch(console.error);
