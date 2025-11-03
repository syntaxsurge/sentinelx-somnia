// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IGuardableContract {
  function pause() external;
  function unpause() external;
  function paused() external view returns (bool);
}

/// @title GuardianHub
/// @notice Routes SentinelX operator actions to registered guardable contracts.
contract GuardianHub {
  address public owner;
  mapping(address => bool) public operators;
  mapping(address => bool) public registered;

  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
  event OperatorUpdated(address indexed operator, bool allowed);
  event TargetRegistered(address indexed target);
  event TargetUnregistered(address indexed target);
  event TargetPaused(address indexed target, address indexed operator);
  event TargetUnpaused(address indexed target, address indexed operator);

  error NotOwner();
  error NotOperator();
  error TargetNotRegistered();

  constructor(address initialOwner) {
    owner = initialOwner == address(0) ? msg.sender : initialOwner;
    emit OwnershipTransferred(address(0), owner);
  }

  modifier onlyOwner() {
    if (msg.sender != owner) revert NotOwner();
    _;
  }

  modifier onlyOperator() {
    if (!(operators[msg.sender] || msg.sender == owner)) revert NotOperator();
    _;
  }

  function transferOwnership(address newOwner) external onlyOwner {
    require(newOwner != address(0), "new owner is zero");
    emit OwnershipTransferred(owner, newOwner);
    owner = newOwner;
  }

  function setOperator(address operator, bool allowed) external onlyOwner {
    operators[operator] = allowed;
    emit OperatorUpdated(operator, allowed);
  }

  function registerTarget(address target) external onlyOwner {
    require(target != address(0), "target is zero");
    registered[target] = true;
    emit TargetRegistered(target);
  }

  function unregisterTarget(address target) external onlyOwner {
    registered[target] = false;
    emit TargetUnregistered(target);
  }

  function pauseTarget(address target) external onlyOperator {
    if (!registered[target]) revert TargetNotRegistered();
    IGuardableContract guardable = IGuardableContract(target);
    if (!guardable.paused()) {
      guardable.pause();
      emit TargetPaused(target, msg.sender);
    }
  }

  function unpauseTarget(address target) external onlyOperator {
    if (!registered[target]) revert TargetNotRegistered();
    IGuardableContract guardable = IGuardableContract(target);
    if (guardable.paused()) {
      guardable.unpause();
      emit TargetUnpaused(target, msg.sender);
    }
  }
}
