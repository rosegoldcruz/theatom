const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔥 DEPLOYING ATOM ARBITRAGE SYSTEM TO BASE SEPOLIA...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Check balance
  const balance = await deployer.getBalance();
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  if (balance < ethers.parseEther("0.02")) {
    console.log("❌ Insufficient balance! Get Base Sepolia ETH from:");
    console.log("https://www.alchemy.com/faucets/base-sepolia");
    return;
  }

  // AAVE Pool Address Provider on Base Sepolia
  const AAVE_POOL_ADDRESS_PROVIDER = "0x0b8FAe5f9Bf5a1a5867FB5b39fF4C028b1C2ebA9";
  
  // Deploy the ATOM Arbitrage contract
  console.log("📦 Deploying AtomArbitrage contract...");
  const AtomArbitrage = await ethers.getContractFactory("AtomArbitrage");
  const atomArbitrage = await AtomArbitrage.deploy(AAVE_POOL_ADDRESS_PROVIDER);

  await atomArbitrage.waitForDeployment();
  const contractAddress = await atomArbitrage.getAddress();

  console.log("✅ AtomArbitrage deployed to:", contractAddress);
  console.log("🔗 Transaction hash:", atomArbitrage.deploymentTransaction().hash);

  // Wait for confirmations
  console.log("⏳ Waiting for confirmations...");
  await atomArbitrage.deploymentTransaction().wait(3);
  
  // Initialize contract configuration
  console.log("🚀 Initializing contract configuration...");

  try {
    // Set initial configuration
    await atomArbitrage.updateConfig(
      50,    // 0.5% minimum profit
      300,   // 3% max slippage
      ethers.parseUnits("50", "gwei") // 50 gwei max gas price
    );

    console.log("✅ Contract configuration set!");

    // Fund contract with some ETH for gas
    const fundTx = await deployer.sendTransaction({
      to: contractAddress,
      value: ethers.parseEther("0.01")
    });
    await fundTx.wait();

    console.log("✅ Contract funded with 0.01 ETH for operations!");

  } catch (error) {
    console.log("⚠️ Error initializing contract:", error.message);
  }
  
  // Get contract stats
  const config = await atomArbitrage.getConfig();
  const contractBalance = await ethers.provider.getBalance(contractAddress);

  console.log("\n📊 CONTRACT STATS:");
  console.log("Total Trades:", config[3].toString());
  console.log("Successful Trades:", config[4].toString());
  console.log("Total Profit:", ethers.formatEther(config[5]), "ETH");
  console.log("Total Gas Used:", config[6].toString());
  console.log("Contract Balance:", ethers.formatEther(contractBalance), "ETH");
  console.log("Min Profit Basis Points:", config[0].toString());
  console.log("Max Slippage Basis Points:", config[1].toString());
  console.log("Max Gas Price:", ethers.formatUnits(config[2], "gwei"), "gwei");

  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployerAddress: deployer.address,
    network: "base_sepolia",
    deploymentTime: new Date().toISOString(),
    aavePoolProvider: AAVE_POOL_ADDRESS_PROVIDER,
    txHash: atomArbitrage.deploymentTransaction().hash
  };

  const deploymentPath = path.join(__dirname, "../deployment.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n🔧 UPDATE YOUR .env FILE:");
  console.log(`VITE_BASE_SEPOLIA_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`BASE_SEPOLIA_CONTRACT_ADDRESS=${contractAddress}`);

  console.log("\n🌐 VIEW ON EXPLORER:");
  console.log(`https://base-sepolia.blockscout.com/address/${contractAddress}`);

  console.log("\n📄 DEPLOYMENT INFO SAVED TO: deployment.json");
  console.log("\n🎉 ATOM ARBITRAGE SYSTEM DEPLOYED SUCCESSFULLY!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
