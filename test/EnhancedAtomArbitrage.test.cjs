const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Enhanced AtomArbitrage", function () {
  let atomArbitrage;
  let owner;
  let addr1;
  let mockToken;

  // Constants from contract
  const MAX_FLASH_LOAN_AMOUNT = ethers.parseEther("10000000"); // $10M
  const MIN_PROFIT_BASIS_POINTS = 100; // 1%
  const MAX_GAS_COST_USD = 50;
  const ETH_PRICE_USD = 2000;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    // Deploy mock ERC20 token for testing
    const MockToken = await ethers.getContractFactory("MockERC20");
    mockToken = await MockToken.deploy("Test Token", "TEST", ethers.parseEther("1000000"));
    await mockToken.waitForDeployment();

    // Deploy AtomArbitrage contract
    const AtomArbitrage = await ethers.getContractFactory("AtomArbitrage");
    atomArbitrage = await AtomArbitrage.deploy();
    await atomArbitrage.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await atomArbitrage.owner()).to.equal(owner.address);
    });

    it("Should have correct constants", async function () {
      expect(await atomArbitrage.MAX_FLASH_LOAN_AMOUNT()).to.equal(MAX_FLASH_LOAN_AMOUNT);
      expect(await atomArbitrage.MIN_PROFIT_BASIS_POINTS()).to.equal(MIN_PROFIT_BASIS_POINTS);
      expect(await atomArbitrage.MAX_GAS_COST_USD()).to.equal(MAX_GAS_COST_USD);
      expect(await atomArbitrage.ETH_PRICE_USD()).to.equal(ETH_PRICE_USD);
    });

    it("Should have correct DEX addresses", async function () {
      expect(await atomArbitrage.ADDRESSES_PROVIDER()).to.equal("0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e");
      expect(await atomArbitrage.BALANCER_VAULT()).to.equal("0xBA12222222228d8Ba445958a75a0704d566BF2C8");
      expect(await atomArbitrage.CURVE_REGISTRY()).to.equal("0x90E00ACe148ca3b23Ac1bC8C240C2a7Dd9c2d7f5");
      expect(await atomArbitrage.UNISWAP_ROUTER()).to.equal("0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D");
      expect(await atomArbitrage.SUSHISWAP_ROUTER()).to.equal("0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F");
    });
  });

  describe("Gas Cost Calculations", function () {
    it("Should calculate gas cost in USD correctly", async function () {
      const gasUnits = 500000; // 500k gas
      const gasPriceGwei = 20; // 20 gwei
      
      const expectedCostUSD = (gasUnits * gasPriceGwei * 1e9 * ETH_PRICE_USD) / 1e18;
      const actualCostUSD = await atomArbitrage.estimateGasCostUSD(gasUnits, gasPriceGwei);
      
      expect(actualCostUSD).to.equal(expectedCostUSD);
    });

    it("Should check if gas cost is acceptable", async function () {
      const gasUnits = 500000;
      const lowGasPrice = 10; // Should be acceptable
      const highGasPrice = 100; // Should be too expensive
      
      const [acceptableLow, costLow] = await atomArbitrage.isGasCostAcceptable(gasUnits, lowGasPrice);
      const [acceptableHigh, costHigh] = await atomArbitrage.isGasCostAcceptable(gasUnits, highGasPrice);
      
      expect(acceptableLow).to.be.true;
      expect(acceptableHigh).to.be.false;
      expect(costLow).to.be.lessThan(MAX_GAS_COST_USD);
      expect(costHigh).to.be.greaterThan(MAX_GAS_COST_USD);
    });

    it("Should calculate maximum gas price for $50 limit", async function () {
      const gasUnits = 500000;
      const maxGasPrice = await atomArbitrage.getMaxGasPriceForLimit(gasUnits);
      
      // Verify that using this gas price results in exactly $50 cost
      const costAtMaxPrice = await atomArbitrage.estimateGasCostUSD(gasUnits, maxGasPrice);
      expect(costAtMaxPrice).to.be.lessThanOrEqual(MAX_GAS_COST_USD);
    });
  });

  describe("Access Control", function () {
    it("Should only allow owner to execute arbitrage", async function () {
      const amount = ethers.parseEther("1000");
      const params = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "address", "uint256", "uint8", "uint8", "bytes", "bytes", "uint256", "uint256", "uint256"],
        [
          mockToken.target,
          mockToken.target,
          amount,
          0, // DEX.UNISWAP
          1, // DEX.SUSHISWAP
          "0x",
          "0x",
          ethers.parseEther("10"), // minProfit
          ethers.parseUnits("50", "gwei"), // maxGasPrice
          500000 // estimatedGasUnits
        ]
      );

      await expect(
        atomArbitrage.connect(addr1).executeArbitrage(mockToken.target, amount, params)
      ).to.be.revertedWithCustomError(atomArbitrage, "OwnableUnauthorizedAccount");
    });

    it("Should only allow owner to withdraw funds", async function () {
      await expect(
        atomArbitrage.connect(addr1).withdrawETH()
      ).to.be.revertedWithCustomError(atomArbitrage, "OwnableUnauthorizedAccount");

      await expect(
        atomArbitrage.connect(addr1).withdrawToken(mockToken.target, 100)
      ).to.be.revertedWithCustomError(atomArbitrage, "OwnableUnauthorizedAccount");
    });
  });

  describe("Flash Loan Limits", function () {
    it("Should reject flash loans exceeding $10M limit", async function () {
      const excessiveAmount = MAX_FLASH_LOAN_AMOUNT + ethers.parseEther("1");
      const params = "0x";

      await expect(
        atomArbitrage.executeArbitrage(mockToken.target, excessiveAmount, params)
      ).to.be.revertedWith("Amount exceeds $10M limit");
    });

    it("Should accept flash loans within $10M limit", async function () {
      const validAmount = ethers.parseEther("1000000"); // $1M
      const params = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "address", "uint256", "uint8", "uint8", "bytes", "bytes", "uint256", "uint256", "uint256"],
        [
          mockToken.target,
          mockToken.target,
          validAmount,
          0, // DEX.UNISWAP
          1, // DEX.SUSHISWAP
          "0x",
          "0x",
          ethers.parseEther("10"), // minProfit
          ethers.parseUnits("20", "gwei"), // maxGasPrice
          500000 // estimatedGasUnits
        ]
      );

      // This should not revert due to amount limit (will revert for other reasons in test environment)
      try {
        await atomArbitrage.executeArbitrage(mockToken.target, validAmount, params);
      } catch (error) {
        expect(error.message).to.not.include("Amount exceeds $10M limit");
      }
    });
  });

  describe("Emergency Functions", function () {
    beforeEach(async function () {
      // Send some ETH and tokens to the contract
      await owner.sendTransaction({
        to: atomArbitrage.target,
        value: ethers.parseEther("1")
      });
      
      await mockToken.transfer(atomArbitrage.target, ethers.parseEther("100"));
    });

    it("Should allow owner to withdraw ETH", async function () {
      const initialBalance = await ethers.provider.getBalance(owner.address);
      
      await atomArbitrage.withdrawETH();
      
      const finalBalance = await ethers.provider.getBalance(owner.address);
      expect(finalBalance).to.be.greaterThan(initialBalance);
    });

    it("Should allow owner to withdraw tokens", async function () {
      const contractBalance = await mockToken.balanceOf(atomArbitrage.target);
      const initialOwnerBalance = await mockToken.balanceOf(owner.address);
      
      await atomArbitrage.withdrawToken(mockToken.target, contractBalance);
      
      const finalOwnerBalance = await mockToken.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance + contractBalance);
    });

    it("Should allow emergency withdraw of all funds", async function () {
      const initialETHBalance = await ethers.provider.getBalance(owner.address);
      const initialTokenBalance = await mockToken.balanceOf(owner.address);
      
      // Emergency withdraw ETH
      await atomArbitrage.emergencyWithdraw(ethers.ZeroAddress);
      
      // Emergency withdraw tokens
      await atomArbitrage.emergencyWithdraw(mockToken.target);
      
      const finalETHBalance = await ethers.provider.getBalance(owner.address);
      const finalTokenBalance = await mockToken.balanceOf(owner.address);
      
      expect(finalETHBalance).to.be.greaterThan(initialETHBalance);
      expect(finalTokenBalance).to.be.greaterThan(initialTokenBalance);
    });
  });
});
