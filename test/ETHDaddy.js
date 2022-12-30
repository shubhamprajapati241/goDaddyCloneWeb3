const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("ETHDaddy", () => {
  let ethDaddy;

  let deployer, owner1;

  const NAME = "Eth Daddy";
  const SYMBOL = "ETHD";
  beforeEach(async () => {
    // Setup accounts
    [deployer, owner1] = await ethers.getSigners();

    // Deploy the contract
    const EthDaddy = await ethers.getContractFactory("ETHDaddy");
    ethDaddy = await EthDaddy.deploy(NAME, SYMBOL);

    // List a domain
    const transaction = await ethDaddy
      .connect(deployer)
      .list("jack.eth", tokens(10)); // tokens(10) = 10 * 10^18 = 10 ethers
    await transaction.wait();
  });

  describe("Deployment", () => {
    it("has a name", async () => {
      const name = await ethDaddy.name();
      expect(name).to.be.equal(NAME);
    });

    it("has a symbol", async () => {
      const symbol = await ethDaddy.symbol();
      expect(symbol).to.be.equal(SYMBOL);
    });

    it("Sets the owner", async () => {
      const result = await ethDaddy.owner();
      expect(result).to.be.equal(deployer.address);
    });

    // checking max supply
    it("Returns the max Supply", async () => {
      const result = await ethDaddy.maxSupply();
      expect(result).to.be.equal(1);
    });

    it("Returns the total supply", async () => {
      const result = await ethDaddy.totalSupply();
      expect(result).to.be.equal(0);
    });
  });

  describe("Domain", () => {
    it("Returns domain attribute", async () => {
      let domain = await ethDaddy.getDomains(1);
      expect(domain.name).to.be.equal("jack.eth");
      expect(domain.cost).to.be.equal(tokens(10));
      expect(domain.isOwned).to.be.equal(false);
    });
  });

  describe("Minting", () => {
    const ID = 1;
    const AMOUNT = ethers.utils.parseEther("10", "ether");

    beforeEach(async () => {
      const transaction = await ethDaddy
        .connect(owner1)
        .mint(ID, { value: AMOUNT });
      await transaction.wait();
    });

    it("Updates the owner", async () => {
      const owner = await ethDaddy.ownerOf(ID);
      expect(owner).to.be.equal(owner1.address);
    });

    it("Updates the domain status", async () => {
      const domain = await ethDaddy.getDomains(ID);
      expect(domain.isOwned).to.be.equal(true);
    });

    it("Updates the contract balance", async () => {
      const result = await ethDaddy.getBalance();
      expect(result).to.be.equal(AMOUNT);
    });

    it("Updates the total Supply", async () => {
      const result = await ethDaddy.totalSupply();
      expect(result).to.be.equal(1);
    });
  });

  describe("Withdrawing", () => {
    const ID = 1;
    const AMOUNT = ethers.utils.parseUnits("10", "ether");
    let balanceBefore;

    beforeEach(async () => {
      balanceBefore = await ethers.provider.getBalance(deployer.address);

      let transaction = await ethDaddy
        .connect(owner1)
        .mint(ID, { value: AMOUNT });
      await transaction.wait();

      transaction = await ethDaddy.connect(deployer).withDraw();
      await transaction.wait();
    });

    it("Updates the owner balane", async () => {
      const balanceAfter = await ethers.provider.getBalance(deployer.address);
      expect(balanceAfter).to.be.greaterThan(balanceBefore);
    });

    it("Updates the contact balance", async () => {
      const result = await ethDaddy.getBalance();
      expect(result).to.equal(0);
    });
  });
});
