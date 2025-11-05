// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AgentInbox {
    address public operator;
    mapping(address => bool) public allowlist;

    event Proposed(bytes32 indexed id, address indexed target, bytes data, string rationale);
    event Executed(bytes32 indexed id, address indexed target, bytes result);
    event AllowlistUpdated(address indexed target, bool allowed);

    modifier onlyOperator() {
        require(msg.sender == operator, "AgentInbox: not operator");
        _;
    }

    constructor(address _operator) {
        require(_operator != address(0), "AgentInbox: invalid operator");
        operator = _operator;
    }

    function setOperator(address _operator) external onlyOperator {
        require(_operator != address(0), "AgentInbox: invalid operator");
        operator = _operator;
    }

    function setAllow(address target, bool allowed) external onlyOperator {
        allowlist[target] = allowed;
        emit AllowlistUpdated(target, allowed);
    }

    function propose(bytes32 id, address target, bytes calldata data, string calldata rationale) external onlyOperator {
        emit Proposed(id, target, data, rationale);
    }

    function execute(bytes32 id, address target, bytes calldata data) external onlyOperator {
        require(allowlist[target], "AgentInbox: target not allowed");
        (bool ok, bytes memory result) = target.call(data);
        require(ok, "AgentInbox: call failed");
        emit Executed(id, target, result);
    }
}
