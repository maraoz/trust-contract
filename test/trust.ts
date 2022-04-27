import { ethers } from 'hardhat';
import { expect } from 'chai';

import { Trust__factory } from '../typechain-types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { waitUntilWalletUnlocked } from './lib/time';
import { deployTrustContract } from './lib/contract';

describe('Trust contract funding', () => {
  let trustAddress: string

  // Signers
  let deployer: SignerWithAddress
  let beneficiary: SignerWithAddress
  let trustee: SignerWithAddress

  beforeEach(async () => {
    const signers = await ethers.getSigners();
    deployer = signers[0];
    beneficiary = signers[1];
    trustee = signers[2];

    const latestBlock = await ethers.provider.getBlock('latest');
    const unlockDate = latestBlock.timestamp + 1_000;
    const trust = await deployTrustContract(deployer, beneficiary.address, unlockDate);
    trustAddress = trust.address;
  });

  it('should allow funding contract via tx', async function () {
    let trust = Trust__factory.connect(trustAddress, trustee);

    const value = ethers.utils.parseEther('100');
    const tx = trustee.sendTransaction({ 
      to: trust.address, 
      value
    })

    let balance = await ethers.provider.getBalance(trust.address);
    await expect(tx)
      .to.emit(trust, 'Deposited')
      .withArgs(trustee.address, beneficiary.address, value, balance.add(value));

    balance = await ethers.provider.getBalance(trust.address);
    expect(balance).to.be.equal(ethers.utils.parseEther('100'));
  });

  it('should fail if funding amount is zero', async function () {
    let trust = Trust__factory.connect(trustAddress, trustee);

    const tx = trustee.sendTransaction({ 
      to: trust.address, 
      value: ethers.utils.parseEther('0')
    })
    await expect(tx).to.be.revertedWith('Deposit must be greater than zero.')
  });

  it('should prevent funding an unlocked contract', async function () {
    let trust = Trust__factory.connect(trustAddress, trustee);

    await waitUntilWalletUnlocked(trust);

    const tx = trustee.sendTransaction({ 
      to: trust.address, 
      value: ethers.utils.parseEther('100')
    })
    await expect(tx).to.be.revertedWith("Wallet is unlocked, can't deposit.");
  });
});