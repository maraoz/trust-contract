import { ethers } from 'hardhat';
import { Trust } from '../../typechain-types';

export async function waitUntilWalletUnlocked(trust: Trust) {
  const latestBlock = await ethers.provider.getBlock('latest');
  const unlockDate = await trust.unlockDate();

  const delta = unlockDate.sub(latestBlock.timestamp);

  if (delta.gt(0)) {
    await ethers.provider.send('evm_increaseTime', [ Number(delta) ]);
  }
}