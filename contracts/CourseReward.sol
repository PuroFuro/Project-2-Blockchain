// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title  CourseReward
/// @notice Reward distribution contract for students who complete a course.
///         The owner (lecturer) funds the contract with ETH and configures
///         who is eligible (whitelist), how much they receive (base amount
///         or per-tier amount), and when the claim window closes (deadline).
///         Each whitelisted student may call {claim} exactly once.
contract CourseReward {
    // ---------------------------------------------------------------------
    // State variables
    // ---------------------------------------------------------------------

    /// @notice Deployer of the contract; only address allowed to configure it.
    address public owner;

    /// @notice Default reward (in wei) paid to students who are not assigned
    ///         to a specific tier, or whose tier amount has not been set.
    uint256 public rewardAmount;

    /// @notice Unix timestamp after which {claim} reverts. Zero means no
    ///         deadline is enforced.
    uint256 public claimDeadline;

    /// @notice Running total of ETH (in wei) that has already been paid out.
    uint256 public totalClaimed;

    /// @notice When true, only whitelisted addresses may call {claim}.
    bool public whitelistEnabled;

    /// @notice Records whether an address has already claimed its reward.
    mapping(address => bool) public hasClaimed;

    /// @notice Addresses approved to claim while the whitelist is enabled.
    mapping(address => bool) public whitelist;

    /// @notice Tier assignment per student. Tier 0 means "default reward".
    mapping(address => uint8) public studentTier;

    /// @notice Reward amount (in wei) per non-default tier (tier > 0).
    mapping(uint8 => uint256) public tierAmount;

    // ---------------------------------------------------------------------
    // Events
    // ---------------------------------------------------------------------

    event RewardClaimed(address indexed student, uint256 amount, uint8 tier);
    event AmountChanged(uint256 oldAmount, uint256 newAmount);
    event WhitelistUpdated(address indexed student, bool allowed);
    event WhitelistToggled(bool enabled);
    event TierAssigned(address indexed student, uint8 tier);
    event TierAmountSet(uint8 indexed tier, uint256 amount);
    event DeadlineUpdated(uint256 newDeadline);
    event Deposited(address indexed from, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);

    // ---------------------------------------------------------------------
    // Modifiers
    // ---------------------------------------------------------------------

    modifier onlyOwner() {
        require(msg.sender == owner, "CourseReward: caller is not the owner");
        _;
    }

    modifier beforeDeadline() {
        require(
            claimDeadline == 0 || block.timestamp <= claimDeadline,
            "CourseReward: claim period has ended"
        );
        _;
    }

    // ---------------------------------------------------------------------
    // Constructor
    // ---------------------------------------------------------------------

    constructor(uint256 _rewardAmount) {
        owner = msg.sender;
        rewardAmount = _rewardAmount;
        whitelistEnabled = true;
    }

    // ---------------------------------------------------------------------
    // Owner-only configuration
    // ---------------------------------------------------------------------

    function setRewardAmount(uint256 _newAmount) external onlyOwner {
        uint256 old = rewardAmount;
        rewardAmount = _newAmount;
        emit AmountChanged(old, _newAmount);
    }

    function setDeadline(uint256 _timestamp) external onlyOwner {
        require(
            _timestamp == 0 || _timestamp > block.timestamp,
            "CourseReward: deadline must be in the future"
        );
        claimDeadline = _timestamp;
        emit DeadlineUpdated(_timestamp);
    }

    function setWhitelistEnabled(bool _enabled) external onlyOwner {
        whitelistEnabled = _enabled;
        emit WhitelistToggled(_enabled);
    }

    function addToWhitelist(address _student) external onlyOwner {
        require(_student != address(0), "CourseReward: zero address");
        whitelist[_student] = true;
        emit WhitelistUpdated(_student, true);
    }

    function removeFromWhitelist(address _student) external onlyOwner {
        whitelist[_student] = false;
        emit WhitelistUpdated(_student, false);
    }

    function addManyToWhitelist(address[] calldata _students) external onlyOwner {
        for (uint256 i = 0; i < _students.length; i++) {
            address s = _students[i];
            if (s == address(0)) continue;
            whitelist[s] = true;
            emit WhitelistUpdated(s, true);
        }
    }

    function setTierAmount(uint8 _tier, uint256 _amount) external onlyOwner {
        require(_tier > 0, "CourseReward: tier 0 is reserved");
        tierAmount[_tier] = _amount;
        emit TierAmountSet(_tier, _amount);
    }

    function assignTier(address _student, uint8 _tier) external onlyOwner {
        require(_student != address(0), "CourseReward: zero address");
        studentTier[_student] = _tier;
        emit TierAssigned(_student, _tier);
    }

    function withdraw(uint256 _amount) external onlyOwner {
        require(_amount <= address(this).balance, "CourseReward: insufficient balance");
        (bool ok, ) = payable(owner).call{value: _amount}("");
        require(ok, "CourseReward: withdraw failed");
        emit Withdrawn(owner, _amount);
    }

    // ---------------------------------------------------------------------
    // Student action
    // ---------------------------------------------------------------------

    function claim() external beforeDeadline {
        if (whitelistEnabled) {
            require(whitelist[msg.sender], "CourseReward: not whitelisted");
        }
        require(!hasClaimed[msg.sender], "CourseReward: already claimed");

        uint8 tier = studentTier[msg.sender];
        uint256 payout = tier == 0 ? rewardAmount : tierAmount[tier];
        if (payout == 0) {
            payout = rewardAmount;
        }
        require(payout > 0, "CourseReward: reward not configured");
        require(address(this).balance >= payout, "CourseReward: contract underfunded");

        hasClaimed[msg.sender] = true;
        totalClaimed += payout;

        (bool ok, ) = payable(msg.sender).call{value: payout}("");
        require(ok, "CourseReward: transfer failed");

        emit RewardClaimed(msg.sender, payout, tier);
    }

    // ---------------------------------------------------------------------
    // Views & funding helpers
    // ---------------------------------------------------------------------

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function previewReward(address _student) external view returns (uint256) {
        uint8 tier = studentTier[_student];
        uint256 payout = tier == 0 ? rewardAmount : tierAmount[tier];
        if (payout == 0) payout = rewardAmount;
        return payout;
    }

    function deposit() external payable {
        require(msg.value > 0, "CourseReward: zero deposit");
        emit Deposited(msg.sender, msg.value);
    }

    receive() external payable {
        emit Deposited(msg.sender, msg.value);
    }
}
