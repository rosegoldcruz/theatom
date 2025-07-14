require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true
    }
  },
  networks: {
    hardhat: {
      chainId: 31337,
      gas: "auto",
      gasPrice: 20000000000, // 20 gwei
      blockGasLimit: 30000000,
      // Disable forking for tests to avoid gas issues
      // forking: process.env.MAINNET_RPC_URL ? {
      //   url: process.env.MAINNET_RPC_URL,
      //   blockNumber: 18500000
      // } : undefined
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    },
    goerli: {
      url: process.env.GOERLI_RPC_URL || `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: process.env.PRIVATE_KEY ? [`0x${process.env.PRIVATE_KEY}`] : []
    },
    base_sepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL || `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 84532
    },
    base_mainnet: {
      url: `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
      accounts: process.env.PRIVATE_KEY ? [`0x${process.env.PRIVATE_KEY}`] : [],
      chainId: 8453
    },
    mainnet: {
      url: process.env.MAINNET_RPC_URL || `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD"
  }
};
