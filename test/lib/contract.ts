import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { Trust } from '../../typechain-types';

export async function deployTrustContract(deployer: SignerWithAddress, beneficiary: string, unlockDate: number): Promise<Trust> {
  const factory = await ethers.getContractFactory('Trust', deployer);

  let trust = await factory.deploy(beneficiary, unlockDate);
  trust = await trust.deployed();
  return trust;
}