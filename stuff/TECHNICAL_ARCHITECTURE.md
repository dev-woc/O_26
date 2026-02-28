# Project Beacon - Technical Architecture

## Technology Stack Overview

### Frontend (Mobile App)
- **Framework**: React Native
  - Cross-platform iOS/Android development
  - Single codebase maintenance
  - Native performance
  - Large developer ecosystem

### Backend API
- **Runtime**: Node.js
- **Framework**: Express.js with TypeScript
- **Authentication**: JWT with refresh tokens
- **Validation**: Joi/Yup for request validation
- **Documentation**: OpenAPI/Swagger

### Database
- **Primary Database**: PostgreSQL
  - ACID compliance for financial transactions
  - Strong consistency guarantees
  - JSON support for flexible schemas
  - Excellent performance and reliability

- **Caching Layer**: Redis
  - Session management
  - API response caching
  - Real-time features support

### Blockchain Integration
- **Primary Choice**: Polygon (MATIC)
  - Low transaction fees (~$0.001)
  - Fast confirmation times (2-3 seconds)
  - Ethereum compatibility
  - Strong ecosystem support
  - Environmental sustainability

- **Alternative**: Solana
  - Ultra-low fees
  - High throughput
  - Growing ecosystem

### Smart Contract Development
- **Language**: Solidity (for Polygon)
- **Framework**: Hardhat
- **Testing**: Chai, Mocha
- **Deployment**: Hardhat Deploy

### Infrastructure & DevOps
- **Cloud Provider**: AWS
- **Container Orchestration**: Docker + ECS
- **API Gateway**: AWS API Gateway
- **CDN**: CloudFront
- **Monitoring**: CloudWatch + DataDog

### Security & Privacy
- **Wallet Management**: MetaMask SDK / WalletConnect
- **Encryption**: AES-256 for sensitive data
- **Key Management**: AWS KMS
- **Rate Limiting**: Express Rate Limit
- **CORS**: Configured for security

## System Architecture

### High-Level Architecture

```
[Mobile App] → [API Gateway] → [Backend Services] → [Database]
     ↓              ↓              ↓                    ↓
[Wallet SDK] → [Blockchain RPC] → [Smart Contracts] → [Polygon Network]
```

### Microservices Architecture

#### User Service
- User registration and authentication
- Profile management
- Privacy controls
- Identity verification (minimal)

#### Wallet Service
- Wallet creation and management
- Transaction processing
- Balance tracking
- Transaction history

#### Earning Service
- Activity validation
- Reward calculation
- Task management
- Achievement tracking

#### Partner Service
- Partner onboarding
- Service catalog management
- Redemption processing
- Settlement handling

#### Location Service
- Geospatial data management
- Partner location mapping
- Proximity calculations
- Accessibility information

#### Analytics Service
- User behavior tracking (anonymized)
- Transaction analytics
- Impact measurement
- Reporting dashboard

## Database Schema Design

### Core Entities

#### Users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unique_identifier VARCHAR(255) UNIQUE NOT NULL, -- QR code
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    privacy_settings JSONB DEFAULT '{}'
);
```

#### Transactions
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID REFERENCES users(id),
    to_user_id UUID,
    partner_id UUID,
    amount DECIMAL(18,8) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- 'earn', 'redeem', 'transfer'
    blockchain_hash VARCHAR(66),
    status VARCHAR(20) DEFAULT 'pending',
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Partners
```sql
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'business', 'nonprofit', 'service'
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    services JSONB,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Activities
```sql
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    activity_type VARCHAR(100) NOT NULL,
    description TEXT,
    reward_amount DECIMAL(18,8),
    verification_method VARCHAR(50),
    verified_by UUID,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Smart Contract Architecture

### BeaconToken Contract
```solidity
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract BeaconToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    
    constructor() ERC20("BeaconCoin", "BEACON") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }
    
    function burn(address from, uint256 amount) public onlyRole(BURNER_ROLE) {
        _burn(from, amount);
    }
}
```

### ActivityValidator Contract
```solidity
contract ActivityValidator is AccessControl {
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    
    struct Activity {
        address user;
        string activityType;
        uint256 rewardAmount;
        bool validated;
        uint256 timestamp;
    }
    
    mapping(bytes32 => Activity) public activities;
    
    function submitActivity(
        bytes32 activityId,
        address user,
        string memory activityType,
        uint256 rewardAmount
    ) external onlyRole(VALIDATOR_ROLE) {
        // Activity validation logic
    }
}
```

## API Design

### RESTful API Structure

#### Authentication Endpoints
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh JWT token

#### User Management
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile
- `GET /api/v1/users/balance` - Get wallet balance
- `GET /api/v1/users/transactions` - Get transaction history

#### Activities & Earning
- `GET /api/v1/activities` - List available activities
- `POST /api/v1/activities/submit` - Submit completed activity
- `GET /api/v1/activities/history` - Get user's activity history

#### Partners & Services
- `GET /api/v1/partners` - List partners by location
- `GET /api/v1/partners/:id/services` - Get partner services
- `POST /api/v1/redemptions` - Redeem coins for services

#### Blockchain Integration
- `POST /api/v1/blockchain/transfer` - Initiate coin transfer
- `GET /api/v1/blockchain/status/:txHash` - Check transaction status

## Security Implementation

### Authentication & Authorization
- JWT tokens with short expiration (15 minutes)
- Refresh tokens with longer expiration (7 days)
- Role-based access control (RBAC)
- Multi-factor authentication for partners

### Data Protection
- Encryption at rest for sensitive data
- TLS 1.3 for data in transit
- API rate limiting and DDoS protection
- Input validation and sanitization

### Blockchain Security
- Multi-signature wallets for fund management
- Time-locked contract upgrades
- Regular security audits
- Formal verification of critical functions

### Privacy Measures
- Minimal data collection
- Pseudonymous user identifiers
- GDPR compliance framework
- Data retention policies

## Scalability & Performance

### Database Optimization
- Proper indexing strategy
- Connection pooling
- Read replicas for analytics
- Partitioning for large tables

### Caching Strategy
- Redis for session management
- API response caching
- CDN for static assets
- Database query result caching

### Monitoring & Alerting
- Application performance monitoring
- Database performance metrics
- Blockchain network monitoring
- Real-time error tracking

## Development & Deployment

### CI/CD Pipeline
- Automated testing (unit, integration, e2e)
- Code quality checks (ESLint, SonarQube)
- Automated deployments
- Environment management (dev, staging, prod)

### Testing Strategy
- Unit tests (90%+ coverage)
- Integration tests for API endpoints
- Smart contract testing with Hardhat
- Mobile app testing with Detox

### Environment Management
- Docker containers for consistency
- Infrastructure as Code (Terraform)
- Secret management with AWS Secrets Manager
- Environment-specific configurations