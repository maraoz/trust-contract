//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Trust {
  address public beneficiary;
  uint public unlockDate;

  event Deposited(address indexed from, address indexed beneficiary, uint amount, uint balance);
  event Withdrawn(address indexed beneficiary, uint balance);
  event NewBeneficiary(address indexed from, address indexed to);

  modifier onlyBeneficiary {
    require(msg.sender == beneficiary);
    _;
  }

  constructor(address _beneficiary, uint _unlockDate) payable {
    require(_beneficiary != address(0), "Beneficiary cannot be the zero address.");
    require(_unlockDate > block.timestamp, "Unlock date must be in the future.");

    beneficiary = _beneficiary;
    unlockDate = _unlockDate;

    if (msg.value > 0) {
      emit Deposited(msg.sender, beneficiary, msg.value, address(this).balance);
    }
  }

  receive() external payable {
    require(block.timestamp < unlockDate, "Wallet is unlocked, can't deposit.");
    emit Deposited(msg.sender, beneficiary, msg.value, address(this).balance);
  }

  function withdraw() external {
    require(block.timestamp >= unlockDate, "Wallet is locked.");
    require(msg.sender == beneficiary, "Only beneficiary can withdraw.");

    payable(beneficiary).transfer(address(this).balance);
    emit Withdrawn(beneficiary, address(this).balance);
  }

  function transferBeneficiary(address _beneficiary) external onlyBeneficiary {
    require(_beneficiary != address(0), "Beneficiary cannot be the zero address.");

    beneficiary = _beneficiary;
    emit NewBeneficiary(msg.sender, beneficiary);
  }
}
