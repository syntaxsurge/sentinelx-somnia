// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title GuardablePausable
/// @notice Minimal pausability mixin controlled by a guardian address.
abstract contract GuardablePausable {
  address public guardian;
  bool private _paused;

  event GuardianUpdated(address indexed previousGuardian, address indexed newGuardian);
  event Paused(address indexed account);
  event Unpaused(address indexed account);

  error NotGuardian();

  modifier whenNotPaused() {
    require(!_paused, "GUARDIAN_PAUSED");
    _;
  }

  modifier onlyGuardian() {
    if (msg.sender != guardian) revert NotGuardian();
    _;
  }

  function _initializeGuardian(address initialGuardian) internal {
    require(guardian == address(0), "guardian already set");
    guardian = initialGuardian;
    emit GuardianUpdated(address(0), initialGuardian);
  }

  function updateGuardian(address newGuardian) external onlyGuardian {
    require(newGuardian != address(0), "guardian required");
    emit GuardianUpdated(guardian, newGuardian);
    guardian = newGuardian;
  }

  function pause() external onlyGuardian {
    _paused = true;
    emit Paused(msg.sender);
  }

  function unpause() external onlyGuardian {
    _paused = false;
    emit Unpaused(msg.sender);
  }

  function paused() public view returns (bool) {
    return _paused;
  }
}
