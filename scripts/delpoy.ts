import { ethers } from "hardhat";

async function main() {

  let [deployer, wallet] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());
  
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
//   const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
  const ONE_DAY_IN_SECS = 1 * 24 * 60 * 60;
  const unlockTime = currentTimestampInSeconds + ONE_DAY_IN_SECS;

  const lockedAmountInput = "0.01";
  const lockedAmount = ethers.utils.parseEther(lockedAmountInput);

  const Trust = await ethers.getContractFactory("Trust");
  const trust = await Trust.deploy(deployer.address, unlockTime);
  
  await trust.deployed();
  console.log(`Trust which unlocks at ${unlockTime} deployed to: ${trust.address}`);

  // send ETH to trust
  const tx = await trust.connect(wallet).deposit({value: lockedAmount})
  console.log(tx.hash);
  await tx.wait();

  console.log(`Trust with ${lockedAmountInput} ETH deployed to: ${trust.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});