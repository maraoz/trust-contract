import { ethers } from 'hardhat';
import { expect } from 'chai';

import { Trust__factory } from '../typechain-types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

describe('Trust contract factory', () => {
  let trustFactory: Trust__factory
  let beneficiary: SignerWithAddress
  let trustee: SignerWithAddress

  beforeEach(async () => {
    const signers = await ethers.getSigners();
    const deployer = signers[0];
    beneficiary = signers[1];
    trustee = signers[2];

    trustFactory = await ethers.getContractFactory('Trust', deployer);
  });

  it('should deploy the contract with a valid beneficiary and unlock date', async function() {
    const latestBlock = await ethers.provider.getBlock('latest');
    const unlockDate = latestBlock.timestamp + Math.floor(Math.random() * 1_000);
  
    const trust = await trustFactory.deploy(beneficiary.address, unlockDate);

    await trust.deployed();
  });

  it('should revert with an invalid beneficiary', async function() {
    const latestBlock = await ethers.provider.getBlock('latest');
    const unlockDate = latestBlock.timestamp + Math.floor(Math.random() * 1_000);
  
    await expect(trustFactory.deploy(ethers.constants.AddressZero, unlockDate)).to.be.revertedWith('Beneficiary cannot be the zero address.');
  });

  it('should revert with an invalid unlock date', async function() {
    const latestBlock = await ethers.provider.getBlock('latest');
    const unlockDate = latestBlock.timestamp - Math.floor(Math.random() * 1_000);
  
    await expect(trustFactory.deploy(beneficiary.address, unlockDate)).to.be.revertedWith('Unlock date must be in the future.');
  });
});