const hre = require("hardhat");

async function main() {
  console.log("🔍 Checking Sepolia wallet balance...");
  
  const walletAddress = "0x1f62B60669E492b783E1dD1d805fBC7588A8557e";
  
  try {
    const balance = await hre.ethers.provider.getBalance(walletAddress);
    const balanceInEth = hre.ethers.formatEther(balance);
    
    console.log("👤 Wallet Address:", walletAddress);
    console.log("💰 Balance:", balanceInEth, "ETH");
    
    if (parseFloat(balanceInEth) > 0.01) {
      console.log("✅ Sufficient balance for deployment!");
    } else {
      console.log("⚠️  Low balance - you may need more Sepolia ETH");
      console.log("🚰 Get Sepolia ETH from: https://sepoliafaucet.net/");
    }
    
  } catch (error) {
    console.error("❌ Error checking balance:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
