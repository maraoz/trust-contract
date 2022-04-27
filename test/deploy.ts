import { ethers } from 'hardhat';
import { expect } from 'chai';

import { Trust__factory } from '../typechain-types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

describe('Trust contract deployment', () => {
  let trustFactory: Trust__factory

  // Signers
  let deployer: SignerWithAddress
  let beneficiary: SignerWithAddress
  let trustee: SignerWithAddress

  // Dates
  let unlockDateFuture: number
  let unlockDatePast: number

  beforeEach(async () => {
    const signers = await ethers.getSigners();
    deployer = signers[0];
    beneficiary = signers[1];
    trustee = signers[2];

    trustFactory = await ethers.getContractFactory('Trust', deployer);

    const latestBlock = await ethers.provider.getBlock('latest');
    unlockDateFuture = latestBlock.timestamp + 1_000;
    unlockDatePast = latestBlock.timestamp - 1_000;
  });

  it('should deploy the contract with a valid beneficiary and unlock date', async function() {
    let trust = await trustFactory.deploy(beneficiary.address, unlockDateFuture);
    trust = await trust.deployed();

    expect(await trust.beneficiary()).to.be.equal(beneficiary.address);
    expect(await trust.unlockDate()).to.be.equal(unlockDateFuture);
  });

  it('should fail if beneficiary is invalid', async function() {
    await expect(trustFactory.deploy(ethers.constants.AddressZero, unlockDateFuture))
      .to.be.revertedWith('Beneficiary cannot be the zero address.');
  });

  it('should fail if unlock date is not in the future', async function() {
    await expect(trustFactory.deploy(beneficiary.address, unlockDatePast))
      .to.be.revertedWith('Unlock date must be in the future.');
  });

  it('should prevent funding on deployment', async function() {
    await expect(trustFactory.deploy(beneficiary.address, unlockDateFuture, { value: ethers.utils.parseEther('10') }))
      .to.be.revertedWith('Initial deposit must be zero.');
  });
});