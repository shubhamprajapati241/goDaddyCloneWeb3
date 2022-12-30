// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

async function main() {
  // Setup deployer account and variables
  const [deployer] = await ethers.getSigners();
  const NAME = "Eth Daddy";
  const SYMBOL = "ETHD";

  // Deployment contract
  const EthDaddy = await ethers.getContractFactory("ETHDaddy");
  const ethDaddy = await EthDaddy.deploy(NAME, SYMBOL);
  await ethDaddy.deployed();

  console.log(`Deployed Contract at : ${ethDaddy.address}\n`);

  // Listing 6 domains
  const names = [
    "shubh.eth",
    "swammy.eth",
    "sam.eth",
    "john.eth",
    "aman.eth",
    "aniket.eth",
  ];

  const costs = [
    tokens(10),
    tokens(25),
    tokens(20),
    tokens(2.5),
    tokens(3),
    tokens(2),
  ];

  for (var i = 0; i < names.length; i++) {
    const transaction = await ethDaddy
      .connect(deployer)
      .list(names[i], costs[i]);
    await transaction.wait();

    console.log(`Listed Domains ${i + 1} : ${names[i]}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
