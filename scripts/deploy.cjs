const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting AtomArbitrage deployment...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Deploy AtomArbitrage contract
  console.log("\n📦 Deploying AtomArbitrage contract...");
  const AtomArbitrage = await hre.ethers.getContractFactory("AtomArbitrage");
  const atomArbitrage = await AtomArbitrage.deploy();
  await atomArbitrage.waitForDeployment();

  const contractAddress = await atomArbitrage.getAddress();
  console.log("✅ AtomArbitrage deployed to:", contractAddress);

  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  const owner = await atomArbitrage.owner();
  console.log("👤 Contract owner:", owner);
  console.log("🏦 AAVE Provider:", await atomArbitrage.ADDRESSES_PROVIDER());
  console.log("🦄 Uniswap Router:", await atomArbitrage.UNISWAP_ROUTER());
  console.log("🍣 SushiSwap Router:", await atomArbitrage.SUSHISWAP_ROUTER());

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

  console.log("\n🎉 Deployment Summary:");
  console.log("=" .repeat(50));
  console.log("🏗️  Network:", hre.network.name);
  console.log("👤 Deployer:", deployer.address);
  console.log("⚡ AtomArbitrage:", contractAddress);
  console.log("👋 HelloWorld:", helloWorldAddress);
  console.log("=" .repeat(50));

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    contracts: {
      AtomArbitrage: contractAddress,
      HelloWorld: helloWorldAddress
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
