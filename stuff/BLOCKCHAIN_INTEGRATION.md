# Project Beacon - Blockchain Integration Architecture

## Overview

Project Beacon's blockchain integration leverages Polygon (MATIC) as the primary network to provide low-cost, fast transactions while maintaining Ethereum compatibility. The system implements a custom ERC-20 token (BeaconCoin) with specialized smart contracts for activity validation, service redemption, and partner settlement.

## Blockchain Platform Selection

### Primary Network: Polygon (MATIC)

**Rationale**:
- **Low Transaction Costs**: ~$0.001 per transaction
- **Fast Confirmation**: 2-3 second block times
- **Ethereum Compatibility**: Existing tooling and ecosystem
- **Environmental Sustainability**: Proof-of-Stake consensus
- **Strong Infrastructure**: Established RPC providers and tools
- **Developer Ecosystem**: Extensive documentation and support

**Network Details**:
- **Mainnet Chain ID**: 137
- **Testnet (Mumbai)**: Chain ID 80001
- **Block Explorer**: PolygonScan
- **RPC Endpoints**: Infura, Alchemy, QuickNode

### Backup Network: Celo

**Rationale for Backup**:
- **Mobile-First Design**: Optimized for mobile devices
- **Ultra-Low Fees**: Minimal transaction costs
- **Stable Token Support**: Built-in stablecoin ecosystem
- **Carbon Negative**: Environmental sustainability

## Token Architecture

### BeaconCoin (BEACON) Token Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract BeaconToken is ERC20, AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    // Maximum supply to prevent unlimited inflation
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**18; // 100 million tokens
    
    // Daily minting limits per role
    mapping(bytes32 => uint256) public dailyMintLimits;
    mapping(bytes32 => uint256) public dailyMintUsed;
    mapping(bytes32 => uint256) public lastMintDay;
    
    event TokensMinted(address indexed to, uint256 amount, string reason);
    event TokensBurned(address indexed from, uint256 amount, string reason);
    event DailyLimitUpdated(bytes32 role, uint256 newLimit);
    
    constructor() ERC20("BeaconCoin", "BEACON") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
        _setupRole(BURNER_ROLE, msg.sender);
        _setupRole(PAUSER_ROLE, msg.sender);
        
        // Set initial daily limits
        dailyMintLimits[MINTER_ROLE] = 10000 * 10**18; // 10,000 tokens per day
    }
    
    function mint(address to, uint256 amount, string calldata reason) 
        public 
        onlyRole(MINTER_ROLE) 
        nonReentrant 
        whenNotPaused 
    {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        require(_checkDailyLimit(MINTER_ROLE, amount), "Exceeds daily mint limit");
        
        _mint(to, amount);
        emit TokensMinted(to, amount, reason);
    }
    
    function burn(address from, uint256 amount, string calldata reason) 
        public 
        onlyRole(BURNER_ROLE) 
        nonReentrant 
    {
        _burn(from, amount);
        emit TokensBurned(from, amount, reason);
    }
    
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    function _checkDailyLimit(bytes32 role, uint256 amount) internal returns (bool) {
        uint256 today = block.timestamp / 1 days;
        
        if (lastMintDay[role] < today) {
            dailyMintUsed[role] = 0;
            lastMintDay[role] = today;
        }
        
        if (dailyMintUsed[role] + amount > dailyMintLimits[role]) {
            return false;
        }
        
        dailyMintUsed[role] += amount;
        return true;
    }
    
    function setDailyMintLimit(bytes32 role, uint256 newLimit) 
        public 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        dailyMintLimits[role] = newLimit;
        emit DailyLimitUpdated(role, newLimit);
    }
    
    function _beforeTokenTransfer(address from, address to, uint256 amount) 
        internal 
        whenNotPaused 
        override 
    {
        super._beforeTokenTransfer(from, to, amount);
    }
}
```

## Core Smart Contracts

### 1. Activity Validation Contract

```solidity
contract ActivityValidator is AccessControl, ReentrancyGuard {
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    struct ActivityType {
        string name;
        uint256 baseReward;
        uint256 maxDailyCompletions;
        bool requiresManualValidation;
        bool isActive;
    }
    
    struct ActivitySubmission {
        bytes32 activityTypeId;
        address user;
        uint256 reward;
        string proofHash; // IPFS hash of proof data
        ActivityStatus status;
        uint256 submittedAt;
        address validatedBy;
        uint256 validatedAt;
    }
    
    enum ActivityStatus { SUBMITTED, VALIDATED, REJECTED, EXPIRED }
    
    mapping(bytes32 => ActivityType) public activityTypes;
    mapping(bytes32 => ActivitySubmission) public submissions;
    mapping(address => mapping(bytes32 => uint256)) public dailyCompletions;
    mapping(address => uint256) public lastActivityDay;
    
    BeaconToken public immutable beaconToken;
    
    event ActivitySubmitted(bytes32 indexed submissionId, address indexed user, bytes32 activityTypeId);
    event ActivityValidated(bytes32 indexed submissionId, address indexed validator, uint256 reward);
    event ActivityRejected(bytes32 indexed submissionId, address indexed validator, string reason);
    
    constructor(address _beaconToken) {
        beaconToken = BeaconToken(_beaconToken);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    function submitActivity(
        bytes32 activityTypeId,
        string calldata proofHash
    ) external returns (bytes32 submissionId) {
        ActivityType memory activityType = activityTypes[activityTypeId];
        require(activityType.isActive, "Activity type not active");
        
        // Check daily limits
        uint256 today = block.timestamp / 1 days;
        if (lastActivityDay[msg.sender] < today) {
            // Reset daily counters for all activity types
            lastActivityDay[msg.sender] = today;
        }
        
        require(
            dailyCompletions[msg.sender][activityTypeId] < activityType.maxDailyCompletions,
            "Daily limit exceeded"
        );
        
        submissionId = keccak256(abi.encodePacked(msg.sender, activityTypeId, block.timestamp));
        
        submissions[submissionId] = ActivitySubmission({
            activityTypeId: activityTypeId,
            user: msg.sender,
            reward: activityType.baseReward,
            proofHash: proofHash,
            status: ActivityStatus.SUBMITTED,
            submittedAt: block.timestamp,
            validatedBy: address(0),
            validatedAt: 0
        });
        
        dailyCompletions[msg.sender][activityTypeId]++;
        
        if (!activityType.requiresManualValidation) {
            _autoValidateActivity(submissionId);
        }
        
        emit ActivitySubmitted(submissionId, msg.sender, activityTypeId);
        return submissionId;
    }
    
    function validateActivity(bytes32 submissionId, bool approved, string calldata reason) 
        external 
        onlyRole(VALIDATOR_ROLE) 
        nonReentrant 
    {
        ActivitySubmission storage submission = submissions[submissionId];
        require(submission.status == ActivityStatus.SUBMITTED, "Invalid status");
        require(block.timestamp - submission.submittedAt <= 7 days, "Submission expired");
        
        if (approved) {
            submission.status = ActivityStatus.VALIDATED;
            submission.validatedBy = msg.sender;
            submission.validatedAt = block.timestamp;
            
            // Mint tokens to user
            beaconToken.mint(submission.user, submission.reward, "Activity completion");
            
            emit ActivityValidated(submissionId, msg.sender, submission.reward);
        } else {
            submission.status = ActivityStatus.REJECTED;
            emit ActivityRejected(submissionId, msg.sender, reason);
        }
    }
    
    function _autoValidateActivity(bytes32 submissionId) internal {
        ActivitySubmission storage submission = submissions[submissionId];
        submission.status = ActivityStatus.VALIDATED;
        submission.validatedBy = address(this); // Contract as validator
        submission.validatedAt = block.timestamp;
        
        beaconToken.mint(submission.user, submission.reward, "Auto-validated activity");
        
        emit ActivityValidated(submissionId, address(this), submission.reward);
    }
}
```

### 2. Service Redemption Contract

```solidity
contract ServiceRedemption is AccessControl, ReentrancyGuard {
    bytes32 public constant PARTNER_ROLE = keccak256("PARTNER_ROLE");
    
    struct ServiceOffer {
        address partner;
        string name;
        uint256 cost;
        bool isActive;
        uint256 dailyLimit;
        mapping(address => uint256) userDailyRedemptions;
        mapping(address => uint256) lastRedemptionDay;
    }
    
    struct Redemption {
        bytes32 serviceId;
        address user;
        address partner;
        uint256 cost;
        RedemptionStatus status;
        uint256 createdAt;
        uint256 fulfilledAt;
        string redemptionCode;
    }
    
    enum RedemptionStatus { PENDING, CONFIRMED, FULFILLED, CANCELLED, REFUNDED }
    
    mapping(bytes32 => ServiceOffer) public services;
    mapping(bytes32 => Redemption) public redemptions;
    
    BeaconToken public immutable beaconToken;
    
    event ServiceCreated(bytes32 indexed serviceId, address indexed partner, uint256 cost);
    event RedemptionCreated(bytes32 indexed redemptionId, address indexed user, bytes32 serviceId);
    event RedemptionFulfilled(bytes32 indexed redemptionId, address indexed partner);
    
    constructor(address _beaconToken) {
        beaconToken = BeaconToken(_beaconToken);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    function createService(
        bytes32 serviceId,
        string calldata name,
        uint256 cost,
        uint256 dailyLimit
    ) external onlyRole(PARTNER_ROLE) {
        ServiceOffer storage service = services[serviceId];
        service.partner = msg.sender;
        service.name = name;
        service.cost = cost;
        service.dailyLimit = dailyLimit;
        service.isActive = true;
        
        emit ServiceCreated(serviceId, msg.sender, cost);
    }
    
    function redeemService(bytes32 serviceId) 
        external 
        nonReentrant 
        returns (bytes32 redemptionId) 
    {
        ServiceOffer storage service = services[serviceId];
        require(service.isActive, "Service not available");
        require(beaconToken.balanceOf(msg.sender) >= service.cost, "Insufficient balance");
        
        // Check daily limits
        uint256 today = block.timestamp / 1 days;
        if (service.lastRedemptionDay[msg.sender] < today) {
            service.userDailyRedemptions[msg.sender] = 0;
            service.lastRedemptionDay[msg.sender] = today;
        }
        
        require(
            service.userDailyRedemptions[msg.sender] < service.dailyLimit,
            "Daily redemption limit exceeded"
        );
        
        // Generate unique redemption ID and code
        redemptionId = keccak256(abi.encodePacked(msg.sender, serviceId, block.timestamp));
        string memory code = _generateRedemptionCode(redemptionId);
        
        // Burn tokens from user
        beaconToken.burn(msg.sender, service.cost, "Service redemption");
        
        redemptions[redemptionId] = Redemption({
            serviceId: serviceId,
            user: msg.sender,
            partner: service.partner,
            cost: service.cost,
            status: RedemptionStatus.CONFIRMED,
            createdAt: block.timestamp,
            fulfilledAt: 0,
            redemptionCode: code
        });
        
        service.userDailyRedemptions[msg.sender]++;
        
        emit RedemptionCreated(redemptionId, msg.sender, serviceId);
        return redemptionId;
    }
    
    function fulfillRedemption(bytes32 redemptionId) 
        external 
        onlyRole(PARTNER_ROLE) 
        nonReentrant 
    {
        Redemption storage redemption = redemptions[redemptionId];
        require(redemption.partner == msg.sender, "Not authorized");
        require(redemption.status == RedemptionStatus.CONFIRMED, "Invalid status");
        
        redemption.status = RedemptionStatus.FULFILLED;
        redemption.fulfilledAt = block.timestamp;
        
        emit RedemptionFulfilled(redemptionId, msg.sender);
    }
    
    function _generateRedemptionCode(bytes32 redemptionId) internal pure returns (string memory) {
        bytes32 hash = keccak256(abi.encodePacked("BEACON", redemptionId));
        bytes memory alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        
        bytes memory code = new bytes(8);
        for (uint256 i = 0; i < 8; i++) {
            code[i] = alphabet[uint256(hash[i]) % alphabet.length];
        }
        
        return string(code);
    }
}
```

## Integration Architecture

### Backend Integration Service

```typescript
interface BlockchainService {
  // Wallet Management
  generateWallet(): Promise<WalletCredentials>;
  importWallet(privateKey: string): Promise<WalletInfo>;
  getBalance(address: string): Promise<bigint>;
  
  // Transaction Management
  sendTransaction(tx: TransactionRequest): Promise<TransactionResponse>;
  getTransactionStatus(hash: string): Promise<TransactionStatus>;
  estimateGas(tx: TransactionRequest): Promise<bigint>;
  
  // Smart Contract Interactions
  submitActivity(activityData: ActivitySubmission): Promise<string>;
  validateActivity(submissionId: string, approved: boolean): Promise<string>;
  createRedemption(serviceId: string, userAddress: string): Promise<string>;
  fulfillRedemption(redemptionId: string): Promise<string>;
  
  // Event Monitoring
  subscribeToEvents(eventTypes: string[]): Promise<EventSubscription>;
  getEventLogs(filter: EventFilter): Promise<EventLog[]>;
}
```

### Mobile App Integration

```typescript
// Wallet Provider Hook
const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState>();
  const [isConnected, setIsConnected] = useState(false);
  
  const connectWallet = async () => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
      const signer = new ethers.Wallet(privateKey, provider);
      
      setWallet({ provider, signer, address: signer.address });
      setIsConnected(true);
    } catch (error) {
      throw new Error('Failed to connect wallet');
    }
  };
  
  const sendTransaction = async (tx: TransactionRequest) => {
    if (!wallet) throw new Error('Wallet not connected');
    
    const transaction = await wallet.signer.sendTransaction(tx);
    return transaction.hash;
  };
  
  return { wallet, isConnected, connectWallet, sendTransaction };
};

// Smart Contract Interaction Service
class ContractService {
  private activityContract: ethers.Contract;
  private redemptionContract: ethers.Contract;
  private tokenContract: ethers.Contract;
  
  constructor(provider: ethers.providers.Provider, signer: ethers.Signer) {
    this.activityContract = new ethers.Contract(
      ACTIVITY_CONTRACT_ADDRESS,
      ActivityValidatorABI,
      signer
    );
    
    this.redemptionContract = new ethers.Contract(
      REDEMPTION_CONTRACT_ADDRESS,
      ServiceRedemptionABI,
      signer
    );
    
    this.tokenContract = new ethers.Contract(
      TOKEN_CONTRACT_ADDRESS,
      BeaconTokenABI,
      signer
    );
  }
  
  async submitActivity(activityTypeId: string, proofHash: string): Promise<string> {
    const tx = await this.activityContract.submitActivity(activityTypeId, proofHash);
    return tx.hash;
  }
  
  async redeemService(serviceId: string): Promise<string> {
    const tx = await this.redemptionContract.redeemService(serviceId);
    return tx.hash;
  }
  
  async getBalance(address: string): Promise<string> {
    const balance = await this.tokenContract.balanceOf(address);
    return ethers.utils.formatEther(balance);
  }
}
```

## Transaction Flow Architecture

### Activity Earning Flow
1. **User submits activity** → Frontend captures proof data
2. **Proof uploaded to IPFS** → Decentralized storage
3. **Smart contract submission** → ActivityValidator.submitActivity()
4. **Manual validation** (if required) → Validator approves/rejects
5. **Token minting** → BeaconToken.mint() to user wallet
6. **Event emission** → Backend syncs with database

### Service Redemption Flow
1. **User selects service** → Frontend displays available services
2. **Redemption request** → ServiceRedemption.redeemService()
3. **Token burning** → BeaconToken.burn() from user wallet
4. **Code generation** → Unique redemption code created
5. **Partner fulfillment** → Partner scans/validates code
6. **Completion confirmation** → ServiceRedemption.fulfillRedemption()

## Gas Optimization Strategies

### 1. Batch Operations
```solidity
function batchValidateActivities(
    bytes32[] calldata submissionIds,
    bool[] calldata approvals
) external onlyRole(VALIDATOR_ROLE) {
    require(submissionIds.length == approvals.length, "Array mismatch");
    
    for (uint i = 0; i < submissionIds.length; i++) {
        _validateActivityInternal(submissionIds[i], approvals[i]);
    }
}
```

### 2. Efficient Data Structures
- Pack struct fields to minimize storage slots
- Use mappings instead of arrays for lookups
- Implement lazy deletion for expired records

### 3. Layer 2 Optimization
- Utilize Polygon's lower base fee
- Implement transaction queuing for non-urgent operations
- Use state channels for frequent micro-transactions

## Event Monitoring and Indexing

### Event Subscription Service
```typescript
class EventMonitoringService {
  private provider: ethers.providers.WebSocketProvider;
  private contracts: Map<string, ethers.Contract>;
  
  async subscribeToActivityEvents() {
    this.contracts.get('activity')?.on('ActivitySubmitted', 
      (submissionId, user, activityTypeId, event) => {
        this.handleActivitySubmitted({
          submissionId: submissionId.toString(),
          user,
          activityTypeId: activityTypeId.toString(),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash
        });
      }
    );
  }
  
  private async handleActivitySubmitted(eventData: ActivitySubmittedEvent) {
    // Update database with new activity submission
    await this.databaseService.createActivitySubmission(eventData);
    
    // Send notification to user
    await this.notificationService.sendActivitySubmittedNotification(eventData.user);
    
    // Queue for validation if manual verification required
    await this.validationQueue.addSubmission(eventData.submissionId);
  }
}
```

## Security Considerations

### Smart Contract Security
- **Access Control**: Role-based permissions for all sensitive functions
- **Reentrancy Protection**: NonReentrant modifier on external functions
- **Integer Overflow**: Using Solidity 0.8+ built-in protection
- **Time Manipulation**: Avoiding block.timestamp for critical logic
- **Front-running Protection**: Commit-reveal schemes where necessary

### Key Management
- **Hardware Security Modules**: For production key storage
- **Multi-signature Wallets**: For administrative functions
- **Key Rotation**: Regular rotation of sensitive keys
- **Separation of Concerns**: Different keys for different roles

### Monitoring and Alerting
- **Unusual Transaction Patterns**: Automated detection
- **Contract Pause Mechanisms**: Emergency stop functionality
- **Balance Monitoring**: Track token supply and distribution
- **Gas Price Alerts**: Monitor network congestion

## Deployment Strategy

### Testnet Deployment
1. **Mumbai Testnet**: Initial testing and development
2. **Feature Testing**: Comprehensive testing of all functions
3. **Security Audits**: Professional smart contract audits
4. **Community Testing**: Beta testing with real users

### Mainnet Deployment
1. **Gradual Rollout**: Progressive feature activation
2. **Monitoring**: Intensive monitoring during initial weeks
3. **Backup Plans**: Emergency procedures and rollback strategies
4. **Documentation**: Complete operational documentation

### Contract Upgradeability
- **Proxy Pattern**: OpenZeppelin's upgradeability framework
- **Timelocked Upgrades**: 48-hour delay for security
- **Multi-sig Governance**: Community governance for upgrades
- **Emergency Procedures**: Fast-track for critical security fixes

This blockchain integration approach provides a robust, secure, and scalable foundation for Project Beacon's cryptocurrency operations while maintaining user-friendly interfaces and operational efficiency.