import { ethers } from 'hardhat';
import { expect } from 'chai';

import { Trust__factory } from '../typechain-types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

describe('Trust contract', () => {
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

  it('Should deploy the contract', async function() {
    
    const latestBlock = await ethers.provider.getBlock('latest');
    const unlockDate = latestBlock.timestamp + Math.floor(Math.random() * 1_000);
  
    const trust = await trustFactory.deploy(ethers.constants.AddressZero, unlockDate);

    await trust.deployed();
  });
});