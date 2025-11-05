// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title DemoOracle
/// @notice Simple price oracle with owner-controlled updates for demo incidents.
contract DemoOracle {
  address public owner;
  int256 public price;
  uint8 public immutable decimals;
  uint256 public updatedAt;

  event PriceUpdated(int256 price, uint256 timestamp);
  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

  modifier onlyOwner() {
    require(msg.sender == owner, "DemoOracle: not owner");
    _;
  }

  constructor(int256 initialPrice, uint8 _decimals) {
    owner = msg.sender;
    price = initialPrice;
    decimals = _decimals;
    updatedAt = block.timestamp;
    emit OwnershipTransferred(address(0), msg.sender);
    emit PriceUpdated(initialPrice, updatedAt);
  }

  function setPrice(int256 newPrice) external onlyOwner {
    price = newPrice;
    updatedAt = block.timestamp;
    emit PriceUpdated(newPrice, updatedAt);
  }

  function transferOwnership(address newOwner) external onlyOwner {
    require(newOwner != address(0), "DemoOracle: owner required");
    emit OwnershipTransferred(owner, newOwner);
    owner = newOwner;
  }

  function latestRoundData()
    external
    view
    returns (uint80, int256, uint256, uint256, uint80)
  {
    return (0, price, updatedAt, updatedAt, 0);
  }

  function latestAnswer() external view returns (int256) {
    return price;
  }
}
