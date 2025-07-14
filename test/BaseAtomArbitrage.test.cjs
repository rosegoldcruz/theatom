const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Base AtomArbitrage", function () {
  let baseAtomArbitrage;
  let owner;
  let addr1;
  let mockToken;

  // Constants from contract
  const MAX_FLASH_LOAN_AMOUNT = ethers.parseEther("10000000"); // $10M
  const MIN_PROFIT_BASIS_POINTS = 100; // 1%
  const MAX_GAS_COST_USD = 20; // $20 maximum
  const ETH_PRICE_USD = 2000;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    // Deploy mock ERC20 token for testing
    const MockToken = await ethers.getContractFactory("MockERC20");
    mockToken = await MockToken.deploy("Base Test Token", "BTT", ethers.parseEther("1000000"));
    await mockToken.waitForDeployment();

    // Deploy BaseAtomArbitrage contract
    const BaseAtomArbitrage = await ethers.getContractFactory("BaseAtomArbitrage");
    baseAtomArbitrage = await BaseAtomArbitrage.deploy();
    await baseAtomArbitrage.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await baseAtomArbitrage.owner()).to.equal(owner.address);
    });

    it("Should have correct constants", async function () {
      expect(await baseAtomArbitrage.MAX_FLASH_LOAN_AMOUNT()).to.equal(MAX_FLASH_LOAN_AMOUNT);
      expect(await baseAtomArbitrage.MIN_PROFIT_BASIS_POINTS()).to.equal(MIN_PROFIT_BASIS_POINTS);
      expect(await baseAtomArbitrage.MAX_GAS_COST_USD()).to.equal(MAX_GAS_COST_USD);
      expect(await baseAtomArbitrage.ETH_PRICE_USD()).to.equal(ETH_PRICE_USD);
    });

    it("Should have correct Base DEX addresses", async function () {
      expect(await baseAtomArbitrage.ADDRESSES_PROVIDER()).to.equal("0xe20fCBdBfFC4Dd138cE8b2E6FBb6CB49777ad64D");
      expect(await baseAtomArbitrage.BALANCER_VAULT()).to.equal("0xBA12222222228d8Ba445958a75a0704d566BF2C8");
      expect(await baseAtomArbitrage.CURVE_REGISTRY()).to.equal("0xF98B45FA17DE75FB1aD0e7aFD971b0ca00e379fC");
      expect(await baseAtomArbitrage.UNISWAP_ROUTER()).to.equal("0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24");
      expect(await baseAtomArbitrage.SUSHISWAP_ROUTER()).to.equal("0x6BDED42c6DA8FBf0d2bA55B2fa120C5e0c8D7891");
    });
  });

  describe("Gas Cost Calculations ($20 Maximum)", function () {
    it("Should calculate gas cost in USD correctly", async function () {
      const gasUnits = 500000; // 500k gas units
      const gasPriceGwei = 20; // 20 gwei

      const expectedCostUSD = (gasUnits * gasPriceGwei * 1e9 * ETH_PRICE_USD) / 1e18;
      const actualCostUSD = await baseAtomArbitrage.estimateGasCostUSD(gasUnits, gasPriceGwei);

      expect(actualCostUSD).to.equal(expectedCostUSD);
    });

    it("Should check if gas cost is under $20 maximum", async function () {
      const gasUnits = 300000;
      const lowGasPrice = 1; // Should be acceptable (under $20)
      const goodGasPrice = 20; // Should be acceptable (under $20)
      const highGasPrice = 50; // Should be too expensive (above $20)

      const [acceptableLow, costLow] = await baseAtomArbitrage.isGasCostAcceptable(gasUnits, lowGasPrice);
      const [acceptableGood, costGood] = await baseAtomArbitrage.isGasCostAcceptable(gasUnits, goodGasPrice);
      const [acceptableHigh, costHigh] = await baseAtomArbitrage.isGasCostAcceptable(gasUnits, highGasPrice);

      expect(acceptableLow).to.be.true; // Under $20 maximum
      expect(acceptableGood).to.be.true; // Under $20 maximum
      expect(acceptableHigh).to.be.false; // Above $20 maximum

      expect(costLow).to.be.lessThan(MAX_GAS_COST_USD);
      expect(costGood).to.be.lessThanOrEqual(MAX_GAS_COST_USD);
      expect(costHigh).to.be.greaterThan(MAX_GAS_COST_USD);
    });

    it("Should calculate maximum gas price for $20 limit", async function () {
      const gasUnits = 300000;
      const maxGasPrice = await baseAtomArbitrage.getMaxGasPriceForLimit(gasUnits);
      
      // Verify that using this gas price results in exactly $20 cost
      const costAtMaxPrice = await baseAtomArbitrage.estimateGasCostUSD(gasUnits, maxGasPrice);
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
          ethers.parseUnits("20", "gwei"), // maxGasPrice
          300000 // estimatedGasUnits
        ]
      );

      await expect(
        baseAtomArbitrage.connect(addr1).executeArbitrage(mockToken.target, amount, params)
      ).to.be.revertedWithCustomError(baseAtomArbitrage, "OwnableUnauthorizedAccount");
    });

    it("Should only allow owner to withdraw funds", async function () {
      await expect(
        baseAtomArbitrage.connect(addr1).withdrawETH()
      ).to.be.revertedWithCustomError(baseAtomArbitrage, "OwnableUnauthorizedAccount");

      await expect(
        baseAtomArbitrage.connect(addr1).withdrawToken(mockToken.target, 100)
      ).to.be.revertedWithCustomError(baseAtomArbitrage, "OwnableUnauthorizedAccount");
    });
  });

  describe("Flash Loan Limits", function () {
    it("Should reject flash loans exceeding $10M limit", async function () {
      const excessiveAmount = MAX_FLASH_LOAN_AMOUNT + ethers.parseEther("1");
      const params = "0x";

      await expect(
        baseAtomArbitrage.executeArbitrage(mockToken.target, excessiveAmount, params)
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
          300000 // estimatedGasUnits
        ]
      );

      // This should not revert due to amount limit (will revert for other reasons in test environment)
      try {
        await baseAtomArbitrage.executeArbitrage(mockToken.target, validAmount, params);
      } catch (error) {
        expect(error.message).to.not.include("Amount exceeds $10M limit");
      }
    });
  });

  describe("Emergency Functions", function () {
    beforeEach(async function () {
      // Send some ETH and tokens to the contract
      await owner.sendTransaction({
        to: baseAtomArbitrage.target,
        value: ethers.parseEther("0.1")
      });
      
      await mockToken.transfer(baseAtomArbitrage.target, ethers.parseEther("100"));
    });

    it("Should allow owner to withdraw ETH", async function () {
      const initialBalance = await ethers.provider.getBalance(owner.address);
      
      await baseAtomArbitrage.withdrawETH();
      
      const finalBalance = await ethers.provider.getBalance(owner.address);
      expect(finalBalance).to.be.greaterThan(initialBalance);
    });

    it("Should allow owner to withdraw tokens", async function () {
      const contractBalance = await mockToken.balanceOf(baseAtomArbitrage.target);
      const initialOwnerBalance = await mockToken.balanceOf(owner.address);
      
      await baseAtomArbitrage.withdrawToken(mockToken.target, contractBalance);
      
      const finalOwnerBalance = await mockToken.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance + contractBalance);
    });

    it("Should allow emergency withdraw of all funds", async function () {
      const initialETHBalance = await ethers.provider.getBalance(owner.address);
      const initialTokenBalance = await mockToken.balanceOf(owner.address);
      
      // Emergency withdraw ETH
      await baseAtomArbitrage.emergencyWithdraw(ethers.ZeroAddress);
      
      // Emergency withdraw tokens
      await baseAtomArbitrage.emergencyWithdraw(mockToken.target);
      
      const finalETHBalance = await ethers.provider.getBalance(owner.address);
      const finalTokenBalance = await mockToken.balanceOf(owner.address);
      
      expect(finalETHBalance).to.be.greaterThan(initialETHBalance);
      expect(finalTokenBalance).to.be.greaterThan(initialTokenBalance);
    });
  });
});
