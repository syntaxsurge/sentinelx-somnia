// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./GuardablePausable.sol";

/// @title SOMIPaymentGuarded
/// @notice Example paywall contract that depends on native SOMI payments and SentinelX guardianship.
contract SOMIPaymentGuarded is GuardablePausable {
  address public immutable owner;
  uint256 public immutable accessFee;

  mapping(address => bool) public hasAccess;

  event AccessGranted(address indexed account, uint256 paid);
  event Withdrawn(address indexed to, uint256 amount);

  error OnlyOwner();

  modifier onlyOwner() {
    if (msg.sender != owner) revert OnlyOwner();
    _;
  }

  constructor(address guardianHub, uint256 feeWei) {
    owner = msg.sender;
    accessFee = feeWei;
    _initializeGuardian(guardianHub);
  }

  function payToAccess() external payable whenNotPaused {
    require(msg.value == accessFee, "incorrect amount");
    hasAccess[msg.sender] = true;
    emit AccessGranted(msg.sender, msg.value);
  }

  function withdraw(address payable to) external onlyOwner {
    require(to != address(0), "invalid receiver");
    uint256 balance = address(this).balance;
    to.transfer(balance);
    emit Withdrawn(to, balance);
  }
}
