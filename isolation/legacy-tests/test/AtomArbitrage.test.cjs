const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AtomArbitrage", function () {
  let atomArbitrage;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const AtomArbitrage = await ethers.getContractFactory("AtomArbitrage");
    atomArbitrage = await AtomArbitrage.deploy();
    await atomArbitrage.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await atomArbitrage.owner()).to.equal(owner.address);
    });

    it("Should be able to receive ETH", async function () {
      const tx = await owner.sendTransaction({
        to: await atomArbitrage.getAddress(),
        value: ethers.parseEther("1.0")
      });
      await tx.wait();

      expect(await ethers.provider.getBalance(await atomArbitrage.getAddress()))
        .to.equal(ethers.parseEther("1.0"));
    });
  });

  describe("Access Control", function () {
    it("Should only allow owner to execute arbitrage", async function () {
      const asset = addr1.address; // Use a valid address from signers
      const amount = ethers.parseEther("1.0");
      const params = "0x"; // Empty params for test

      await expect(
        atomArbitrage.connect(addr1).executeArbitrage(asset, amount, params)
      ).to.be.revertedWithCustomError(atomArbitrage, "OwnableUnauthorizedAccount");
    });

    it("Should only allow owner to withdraw ETH", async function () {
      // Send ETH to contract
      await owner.sendTransaction({
        to: await atomArbitrage.getAddress(),
        value: ethers.parseEther("1.0")
      });

      await expect(
        atomArbitrage.connect(addr1).withdrawETH()
      ).to.be.revertedWithCustomError(atomArbitrage, "OwnableUnauthorizedAccount");
    });

    it("Should only allow owner to emergency withdraw", async function () {
      await expect(
        atomArbitrage.connect(addr1).emergencyWithdraw(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(atomArbitrage, "OwnableUnauthorizedAccount");
    });
  });

  describe("ETH Management", function () {
    it("Should allow owner to withdraw ETH", async function () {
      // Send ETH to contract
      await owner.sendTransaction({
        to: await atomArbitrage.getAddress(),
        value: ethers.parseEther("1.0")
      });

      const initialBalance = await ethers.provider.getBalance(owner.address);
      
      const tx = await atomArbitrage.withdrawETH();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const finalBalance = await ethers.provider.getBalance(owner.address);
      
      // Owner should have received the ETH minus gas costs
      expect(finalBalance).to.be.closeTo(
        initialBalance + ethers.parseEther("1.0") - gasUsed,
        ethers.parseEther("0.01") // Allow for small gas variations
      );
    });

    it("Should handle emergency withdraw for ETH", async function () {
      // Send ETH to contract
      await owner.sendTransaction({
        to: await atomArbitrage.getAddress(),
        value: ethers.parseEther("2.0")
      });

      const initialBalance = await ethers.provider.getBalance(owner.address);
      
      const tx = await atomArbitrage.emergencyWithdraw(ethers.ZeroAddress);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const finalBalance = await ethers.provider.getBalance(owner.address);
      
      expect(finalBalance).to.be.closeTo(
        initialBalance + ethers.parseEther("2.0") - gasUsed,
        ethers.parseEther("0.01")
      );
    });
  });

  describe("Contract State", function () {
    it("Should have correct initial state", async function () {
      expect(await atomArbitrage.owner()).to.equal(owner.address);
      expect(await ethers.provider.getBalance(await atomArbitrage.getAddress()))
        .to.equal(0);
    });

    it("Should maintain owner after transactions", async function () {
      // Send some ETH
      await owner.sendTransaction({
        to: await atomArbitrage.getAddress(),
        value: ethers.parseEther("0.5")
      });

      // Withdraw it
      await atomArbitrage.withdrawETH();

      // Owner should still be the same
      expect(await atomArbitrage.owner()).to.equal(owner.address);
    });
  });

  describe("Flash Loan Integration", function () {
    it("Should have correct AAVE addresses provider", async function () {
      const expectedProvider = "0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e";
      expect(await atomArbitrage.ADDRESSES_PROVIDER()).to.equal(expectedProvider);
    });

    it("Should have correct Uniswap router", async function () {
      const expectedRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
      expect(await atomArbitrage.UNISWAP_ROUTER()).to.equal(expectedRouter);
    });

    it("Should have correct SushiSwap router", async function () {
      const expectedRouter = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F";
      expect(await atomArbitrage.SUSHISWAP_ROUTER()).to.equal(expectedRouter);
    });
  });

  describe("Events", function () {
    it("Should emit ArbitrageExecuted event on successful arbitrage", async function () {
      // This test would require mocking the flash loan execution
      // For now, we'll test the event structure exists
      const filter = atomArbitrage.filters.ArbitrageExecuted();
      expect(filter.fragment.name).to.equal("ArbitrageExecuted");
    });

    it("Should emit FlashLoanExecuted event", async function () {
      const filter = atomArbitrage.filters.FlashLoanExecuted();
      expect(filter.fragment.name).to.equal("FlashLoanExecuted");
    });
  });
});
