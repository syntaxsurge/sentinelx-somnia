// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title DemoPausable
/// @notice Guardable contract used to demonstrate SentinelX pause workflows.
contract DemoPausable {
  address public owner;
  address public guardianHub;
  bool public paused;

  event OwnerUpdated(address indexed previousOwner, address indexed newOwner);
  event GuardianHubUpdated(address indexed previousGuardianHub, address indexed newGuardianHub);
  event Paused(address indexed caller);
  event Unpaused(address indexed caller);

  modifier onlyOwner() {
    require(msg.sender == owner, "DemoPausable: not owner");
    _;
  }

  modifier onlyGuardianHub() {
    require(msg.sender == guardianHub, "DemoPausable: not guardian hub");
    _;
  }

  modifier whenNotPaused() {
    require(!paused, "DemoPausable: paused");
    _;
  }

  constructor() {
    owner = msg.sender;
    emit OwnerUpdated(address(0), msg.sender);
  }

  function transferOwnership(address newOwner) external onlyOwner {
    require(newOwner != address(0), "DemoPausable: owner required");
    emit OwnerUpdated(owner, newOwner);
    owner = newOwner;
  }

  function setGuardianHub(address newGuardianHub) external onlyOwner {
    require(newGuardianHub != address(0), "DemoPausable: guardian hub required");
    emit GuardianHubUpdated(guardianHub, newGuardianHub);
    guardianHub = newGuardianHub;
  }

  function pause() external onlyGuardianHub {
    paused = true;
    emit Paused(msg.sender);
  }

  function unpause() external onlyOwner {
    paused = false;
    emit Unpaused(msg.sender);
  }

  /// @notice Example protected function that illustrates pause state enforcement.
  function doWork() external whenNotPaused returns (uint256) {
    return block.number;
  }
}
