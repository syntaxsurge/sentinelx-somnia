// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MockAggregator {
  int256 private _answer;
  uint8 private immutable _decimals;
  uint256 private _updatedAt;

  constructor(uint8 decimals_, int256 initialAnswer) {
    _decimals = decimals_;
    _answer = initialAnswer;
    _updatedAt = block.timestamp;
  }

  function setAnswer(int256 answer) external {
    _answer = answer;
    _updatedAt = block.timestamp;
  }

  function decimals() external view returns (uint8) {
    return _decimals;
  }

  function latestRoundData()
    external
    view
    returns (
      uint80,
      int256,
      uint256,
      uint256,
      uint80
    )
  {
    return (1, _answer, _updatedAt, _updatedAt, 1);
  }
}
