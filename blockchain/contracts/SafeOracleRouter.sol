// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface AggregatorV3Interface {
  function decimals() external view returns (uint8);

  function latestRoundData()
    external
    view
    returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    );
}

/// @title SafeOracleRouter
/// @notice Aggregates Protofire Chainlink feeds and DIA adapters to produce a guarded price surface.
contract SafeOracleRouter {
  struct FeedConfig {
    address protofireFeed;
    address diaFeed;
    uint256 maxDeviationBps;
    uint256 staleAfter;
  }

  address public owner;
  mapping(bytes32 => FeedConfig) private _feeds;

  event FeedConfigured(bytes32 indexed key, address protofire, address dia, uint256 maxDeviationBps, uint256 staleAfter);
  event FeedRemoved(bytes32 indexed key);
  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

  error NotOwner();
  error InvalidFeed();

  constructor(address initialOwner) {
    owner = initialOwner == address(0) ? msg.sender : initialOwner;
    emit OwnershipTransferred(address(0), owner);
  }

  modifier onlyOwner() {
    if (msg.sender != owner) revert NotOwner();
    _;
  }

  function transferOwnership(address newOwner) external onlyOwner {
    require(newOwner != address(0), "new owner is zero");
    emit OwnershipTransferred(owner, newOwner);
    owner = newOwner;
  }

  function configureFeed(
    bytes32 key,
    address protofireFeed,
    address diaFeed,
    uint256 maxDeviationBps,
    uint256 staleAfter
  ) external onlyOwner {
    require(protofireFeed != address(0) && diaFeed != address(0), "feed required");
    require(maxDeviationBps > 0, "deviation required");
    require(staleAfter > 0, "stale window required");

    _feeds[key] = FeedConfig({
      protofireFeed: protofireFeed,
      diaFeed: diaFeed,
      maxDeviationBps: maxDeviationBps,
      staleAfter: staleAfter
    });

    emit FeedConfigured(key, protofireFeed, diaFeed, maxDeviationBps, staleAfter);
  }

  function removeFeed(bytes32 key) external onlyOwner {
    delete _feeds[key];
    emit FeedRemoved(key);
  }

  /// @notice Returns guarded price data for a feed key.
  function latest(
    bytes32 key
  )
    external
    view
    returns (
      int256 price,
      bool safe,
      bool bothFresh,
      int256 protofireAnswer,
      int256 diaAnswer,
      uint256 protofireUpdatedAt,
      uint256 diaUpdatedAt
    )
  {
    FeedConfig memory feed = _feeds[key];
    if (feed.protofireFeed == address(0) || feed.diaFeed == address(0)) revert InvalidFeed();

    (protofireAnswer, protofireUpdatedAt) = _read(AggregatorV3Interface(feed.protofireFeed));
    (diaAnswer, diaUpdatedAt) = _read(AggregatorV3Interface(feed.diaFeed));

    bool protoFresh = _isFresh(protofireUpdatedAt, feed.staleAfter);
    bool diaFresh = _isFresh(diaUpdatedAt, feed.staleAfter);
    bothFresh = protoFresh && diaFresh;

    if (protoFresh && !diaFresh) {
      price = protofireAnswer;
      safe = false;
      return (price, safe, bothFresh, protofireAnswer, diaAnswer, protofireUpdatedAt, diaUpdatedAt);
    }

    if (!protoFresh && diaFresh) {
      price = diaAnswer;
      safe = false;
      return (price, safe, bothFresh, protofireAnswer, diaAnswer, protofireUpdatedAt, diaUpdatedAt);
    }

    if (!protoFresh && !diaFresh) {
      if (protofireUpdatedAt >= diaUpdatedAt) {
        price = protofireAnswer;
      } else {
        price = diaAnswer;
      }
      safe = false;
      return (price, safe, bothFresh, protofireAnswer, diaAnswer, protofireUpdatedAt, diaUpdatedAt);
    }

    uint256 deviation = _deviationBps(protofireAnswer, diaAnswer);
    if (deviation > feed.maxDeviationBps) {
      price = _median(protofireAnswer, diaAnswer);
      safe = false;
    } else {
      price = _median(protofireAnswer, diaAnswer);
      safe = true;
    }

    return (price, safe, bothFresh, protofireAnswer, diaAnswer, protofireUpdatedAt, diaUpdatedAt);
  }

  function configuration(bytes32 key) external view returns (FeedConfig memory) {
    return _feeds[key];
  }

  function _read(AggregatorV3Interface feed) private view returns (int256 answer, uint256 updatedAt) {
    (, answer, , updatedAt, ) = feed.latestRoundData();
  }

  function _isFresh(uint256 updatedAt, uint256 staleAfter) private view returns (bool) {
    if (updatedAt == 0) return false;
    return block.timestamp - updatedAt <= staleAfter;
  }

  function _median(int256 a, int256 b) private pure returns (int256) {
    if (a > b) return (a + b) / 2;
    return (b + a) / 2;
  }

  function _deviationBps(int256 a, int256 b) private pure returns (uint256) {
    int256 diff = a > b ? a - b : b - a;
    int256 maxVal = a > b ? a : b;
    if (maxVal == 0) return 0;
    return uint256(diff * 10_000 / maxVal);
  }
}
