import { ethers } from 'hardhat';
import { expect } from 'chai';
import { waitUntilWalletUnlocked } from './lib/time';
import { deployTrustContract } from './lib/contract';

import { Trust__factory } from '../typechain-types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

describe('Trust contract onlyBeneficiary', () => {
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

    await trustee.sendTransaction({ 
      to: trust.address, 
      value: ethers.utils.parseEther('100')
    })
  });

  it('should prevent withdrawing from a locked wallet', async function() {
    const trust = Trust__factory.connect(trustAddress, beneficiary);
    await expect(trust.withdraw()).to.be.revertedWith('Wallet is locked.');
  });

  it('should allow beneficiary to withdraw from an unlocked wallet', async function() {
    const trust = Trust__factory.connect(trustAddress, beneficiary);

    await waitUntilWalletUnlocked(trust);
    await ethers.provider.send('evm_mine', []);

    const beneficiaryBalancePreTx = await ethers.provider.getBalance(beneficiary.address);
    const trustBalancePreTx = await ethers.provider.getBalance(trust.address);
    
    const tx = trust.withdraw();
    await expect(tx)
      .to.emit(trust, 'Withdrawn')
      .withArgs(beneficiary.address, trustBalancePreTx);
    const receipt = await (await tx).wait()
    const gasCost = receipt.gasUsed.mul(receipt.effectiveGasPrice);

    const trustBalance = await ethers.provider.getBalance(trust.address);
    const beneficiaryBalance = await ethers.provider.getBalance(beneficiary.address);
    expect(trustBalance).to.be.equal(ethers.utils.parseEther('0'));
    expect(beneficiaryBalance).to.be.equal(beneficiaryBalancePreTx.sub(gasCost).add(trustBalancePreTx));
  });

  it('should prevent non beneficiaries from withdrawing', async function() {
    const trust = Trust__factory.connect(trustAddress, trustee);

    await waitUntilWalletUnlocked(trust);
    await expect(trust.withdraw()).to.be.revertedWith('Sender is not the beneficiary.');
  });

  it('should allow beneficiary to transfer trust to another address', async function () {
    const trust = Trust__factory.connect(trustAddress, beneficiary);
    await expect(trust.transferBeneficiary(trustee.address))
      .to.emit(trust, 'NewBeneficiary')
      .withArgs(beneficiary.address, trustee.address);

    const newBeneficiary = await trust.beneficiary();
    expect(newBeneficiary).to.be.equal(trustee.address);
  });
});