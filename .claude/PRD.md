# Project Beacon — Product Requirements Document

**Version:** 1.0
**Date:** 2026-02-28
**Project Lead:** Jordan Mason
**Contact:** contact@projectbeacon.org

---

## 1. Executive Summary

Project Beacon is a blockchain-enabled community services platform that creates an earn-and-spend ecosystem for individuals experiencing homelessness in Orlando, FL. Users earn BeaconCoin (BEACON) by completing community service activities, job training, and daily engagement tasks. Those coins are redeemed at a network of partner locations for essential services including food, transportation, personal care, and housing assistance.

The platform addresses a core failure in traditional aid systems: fragmentation, lack of autonomy, and zero incentive for community participation. By attaching real, spendable value to positive behaviors, Project Beacon creates dignity through agency rather than dependency through charity. Transparent blockchain ledgers ensure accountability for donors, nonprofits, and city stakeholders, while a closed-loop economy prevents speculation and keeps value circulating within the community.

The MVP delivers a Next.js web application providing the admin dashboard, volunteer management portal, and coin distribution tools — the operational backbone required before the mobile consumer app can launch. The consumer-facing mobile app (React Native) follows in Phase 3 once the backend services, smart contracts, and partner network are established.

**MVP Goal:** Launch a production-ready web admin and volunteer portal with BEACON coin distribution capability, backed by a PostgreSQL database and stubbed blockchain layer, deployable to Vercel + Neon within 90 days.

---

## 2. Mission

**Mission Statement:** To build dignity and opportunity for Orlando's unsheltered community through transparent, earned value exchange — turning community contribution into purchasing power for essential services.

### Core Principles

1. **Earned Dignity** — Value is gained through contribution, not charity, preserving individual agency and self-worth.
2. **Privacy First** — No SSN, no permanent address required. Pseudonymous identifiers with user-controlled data sharing.
3. **Closed-Loop Stability** — BEACON is not tradeable on external exchanges. Value is purpose-driven, not speculative.
4. **Radical Transparency** — Every transaction is auditable on-chain. Donors and partners see exactly where value flows.
5. **Sustainable Economics** — A 15% platform fee and crypto-backed reserves enable long-term independence from grant funding.

---

## 3. Target Users

### 3.1 Primary Users — Unsheltered Individuals

| Attribute | Description |
|-----------|-------------|
| Location | Greater Orlando, FL (street dwellers, shelter/transitional housing) |
| Tech Access | Basic smartphone (Android/iOS); some rely on physical card access |
| Digital Literacy | Low to moderate; interface must be intuitive with offline fallback |
| Key Needs | Food, transportation, personal hygiene, healthcare, housing assistance |
| Pain Points | Fragmented aid systems, lack of financial autonomy, no proof of contribution |

**Persona: "Marcus"** — 34, living in a transitional shelter downtown. Has an Android phone. Wants to earn coins doing weekend cleanup to save up for a bus pass and groceries without asking anyone for help.

### 3.2 Secondary Users — Volunteers

| Attribute | Description |
|-----------|-------------|
| Profile | Non-profit staff, community members, social workers |
| Tech Literacy | Moderate to high; uses web app on laptop/tablet |
| Key Needs | Verify activities, track hours, distribute coins, see impact |
| Pain Points | Manual tracking, no unified platform, no audit trail for distributions |

**Persona: "Dr. Sarah"** — Case manager at the Coalition for the Homeless. Verifies submitted cleanup activities and distributes coin rewards. Needs simple workflows and clear reporting for her grant applications.

### 3.3 Partner Organizations

| Attribute | Description |
|-----------|-------------|
| Types | Local businesses, food services, transit, nonprofits, healthcare |
| Key Needs | Simple QR redemption, guaranteed settlement, impact reporting |
| Pain Points | Complex payment processing, no way to serve unbanked customers |

### 3.4 Admins

| Attribute | Description |
|-----------|-------------|
| Profile | Project Beacon staff, senior coordinators |
| Tech Literacy | High |
| Key Needs | Coin minting/distribution controls, audit logs, system health dashboards |
| Pain Points | Fraud prevention, regulatory compliance, reserve management |

---

## 4. MVP Scope

### 4.1 In Scope (MVP — Phase 1 & 2)

#### Core Functionality
- ✅ Admin authentication (email + password + 2FA)
- ✅ Volunteer registration with unique ID system (VOL-x###)
- ✅ Admin login with elevated role (ADMIN-x###)
- ✅ Role-based access control (user, volunteer, admin)
- ✅ BEACON coin distribution by admins to user wallets
- ✅ Bulk coin distribution for task completion batches
- ✅ Task creation, assignment, and approval workflow
- ✅ Activity submission and verification queue
- ✅ Admin dashboard with distribution history and impact stats
- ✅ Volunteer dashboard with hours tracked and earnings
- ✅ Audit logging for all admin and coin actions
- ✅ Daily earning caps (50 BEACON/day per user)
- ✅ Transaction history with filterable views

#### Technical
- ✅ Next.js 15 web application (App Router)
- ✅ PostgreSQL via Neon Serverless
- ✅ Drizzle ORM with schema migrations
- ✅ JWT authentication with refresh tokens (15 min access / 7 day refresh)
- ✅ API rate limiting
- ✅ Comprehensive audit trail table
- ✅ Vitest unit and integration tests

#### Deployment
- ✅ Vercel deployment (web app)
- ✅ Neon Postgres (database)
- ✅ Environment-based configuration

### 4.2 Out of Scope (Future Phases)

#### Consumer Mobile App
- ❌ React Native iOS/Android mobile app
- ❌ QR code identity system for unsheltered users
- ❌ Physical card fallback access
- ❌ Offline-capable mobile wallet

#### Blockchain
- ❌ Live Polygon mainnet deployment (BeaconToken ERC-20)
- ❌ Smart contract activity validation on-chain
- ❌ On-chain service redemption contract
- ❌ IPFS proof storage
- ❌ Multi-sig admin wallets for production

#### Partner Network
- ❌ Partner onboarding portal
- ❌ POS QR redemption scanning interface
- ❌ Automated crypto-to-fiat settlement for partners
- ❌ Partner dashboard and reporting

#### Advanced Tokenomics
- ❌ Crypto-backed reserve management (BTC/ETH/SOL basket)
- ❌ Automated BEACON value appreciation schedule
- ❌ DeFi yield farming integration
- ❌ Community governance voting

#### Multi-City
- ❌ Multi-city expansion infrastructure
- ❌ Geographic sharding

---

## 5. User Stories

### Primary Stories

**Story 1 — Admin Coin Distribution**
> As an admin, I want to distribute BEACON coins to a specific user with a reason and amount, so that I can reward them for completing verified community activities.

*Example:* Admin selects Marcus's account, enters 25 BEACON, selects "volunteer_reward", adds note "Lake Eola cleanup x5 hours". Coins credited, transaction logged with blockchain hash (stubbed in MVP).

**Story 2 — Volunteer Activity Verification**
> As a volunteer, I want to review submitted activity evidence (photos, GPS, notes) and approve or reject it, so that only legitimate work earns rewards.

*Example:* Dr. Sarah sees 8 pending cleanup submissions in her queue. She reviews photos, marks 7 approved, 1 rejected with reason. System queues coin minting for the 7 approved.

**Story 3 — Task Management**
> As an admin, I want to create tasks, assign them to volunteers, and approve completions, so that I can coordinate verification work across my volunteer network.

*Example:* Admin creates "Verify weekend activity submissions", assigns to Jane (VOL-4A4D001), sets 4-hour estimate and 30 BEACON reward. Jane completes it; admin approves with +5 BEACON bonus.

**Story 4 — Volunteer Registration**
> As a new volunteer, I want to register with my organization and skills, so that I can be matched to appropriate verification tasks.

*Example:* Jane registers with name, email, phone, "Orlando Coalition" org, skills: `["counseling", "spanish_fluent"]`, availability JSON. Receives VOL-4A4D001 ID.

**Story 5 — Bulk Distribution**
> As an admin, I want to distribute coins to multiple users in one action, so that I can efficiently run weekly volunteer appreciation programs.

*Example:* Admin uploads or builds a list of 20 recipients with individual amounts and notes. Single confirmation submits all distributions, returning a summary of successes/failures.

**Story 6 — Impact Dashboard**
> As an admin, I want to see coins distributed, activities verified, and volunteers active in a given period, so that I can report program impact to grantors.

*Example:* Monthly view shows: 45 active volunteers, 142 tasks completed, 5,670 BEACON distributed, 892 users helped. Exportable for grant reporting.

**Story 7 — Volunteer Dashboard**
> As a volunteer, I want to see my hours, tasks completed, and BEACON earned this month, so that I can track my personal contribution and unlock achievement badges.

*Example:* Jane sees: 45.5 hours, 18 tasks, 345 BEACON earned, "Activity Expert" badge unlocked at 100 verifications.

**Story 8 — Audit Log Review**
> As an admin, I want every coin distribution and admin action to be permanently logged with timestamps and the acting user, so that the system is fraud-resistant and grant-auditable.

*Example:* Auditor queries `GET /admin/audit-log?action=distribute_coins&dateFrom=2026-01-01` and sees full immutable history.

---

## 6. Core Architecture & Patterns

### 6.1 High-Level Architecture (MVP)

```
Browser (Next.js App Router)
    ↓ Server Actions / API Routes
Next.js API Layer (JWT auth middleware)
    ↓
Service Layer (TypeScript)
    ↓
Drizzle ORM
    ↓
Neon Serverless PostgreSQL

[Future] Blockchain Layer (Polygon)
    ↓ Smart Contract Calls
ActivityValidator.sol + BeaconToken.sol + ServiceRedemption.sol
```

### 6.2 Directory Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── admin/
│   │   │   ├── distribute/
│   │   │   ├── tasks/
│   │   │   ├── reports/
│   │   │   └── audit-log/
│   │   └── volunteer/
│   │       ├── tasks/
│   │       ├── activities/
│   │       └── dashboard/
│   └── api/
│       ├── auth/
│       ├── admin/
│       │   ├── distribute-coins/
│       │   ├── tasks/
│       │   └── reports/
│       └── volunteers/
│           ├── tasks/
│           └── activities/
├── components/
│   ├── ui/          (shadcn/ui primitives)
│   ├── forms/
│   ├── charts/      (Recharts wrappers)
│   └── tables/
├── lib/
│   ├── auth.ts
│   ├── db.ts        (Drizzle client)
│   └── blockchain.ts (stub → real Polygon later)
├── db/
│   ├── schema.ts    (Drizzle schema)
│   └── migrations/
└── services/
    ├── coinService.ts
    ├── taskService.ts
    ├── volunteerService.ts
    └── auditService.ts
```

### 6.3 Key Design Patterns

- **Server Components + Server Actions** — Data fetching co-located with UI; form mutations via server actions for security
- **Role-Based Route Groups** — `(auth)`, `(dashboard)` groups with middleware guarding access by role
- **Service Layer Isolation** — Business logic in `/services`; API routes are thin wrappers
- **Audit-by-Default** — Every mutation in service layer calls `auditService.log()` before returning
- **Blockchain Abstraction** — `lib/blockchain.ts` provides a `BlockchainService` interface; MVP uses stub implementation; Polygon real implementation swapped in Phase 4 without changing service layer callers

---

## 7. Core Features

### 7.1 ID Generation System

Unique human-readable IDs based on hex-encoded initials:

```
Format: VOL-{hex_initials}{3-digit-increment}
John Mason → J(4A) + M(4D) = VOL-4A4D001
Duplicate initials → VOL-4A4D002, VOL-4A4D003...

Admin: ADMIN-{hex_initials}{increment}
Alice Brown → A(41) + B(42) = ADMIN-4142001
```

### 7.2 Coin Distribution Engine

| Feature | Detail |
|---------|--------|
| Single distribution | Amount, recipient, type, description, optional taskId |
| Bulk distribution | Array of up to 100 recipients, atomic or best-effort mode |
| Distribution types | `volunteer_reward`, `task_completion`, `bonus`, `emergency_assistance` |
| Admin limits | Per-admin `maxCoinDistributionAmount` (e.g., 500 BEACON/transaction) |
| Daily cap | 50 BEACON/day per recipient (anti-gaming) |
| Approval flow | Standard distributions: auto-approved; >100 BEACON: requires second admin |

### 7.3 Task Management

Lifecycle: `open → assigned → in_progress → completed → approved/rejected`

| Role | Capability |
|------|-----------|
| Admin | Create, assign, approve/reject, adjust reward |
| Volunteer | View available, accept, update progress, submit completion with evidence |

### 7.4 Activity Verification Queue

Unsheltered users submit activities (photo + GPS + notes). Volunteers review and approve/reject. Admin can override. Approved activities trigger coin minting (via blockchain stub in MVP, live Polygon in Phase 4).

**Verification methods:** `photo`, `gps`, `peer_verification`, `admin_approval`

### 7.5 Admin Dashboard

- Real-time coin distribution totals by type
- Active vs. inactive volunteers
- Task completion rates and average time
- Distribution history with full audit trail
- Export-ready impact report (JSON/CSV)

### 7.6 Volunteer Dashboard

- Hours worked, tasks completed, BEACON earned (current month)
- Achievement badges (e.g., "Activity Expert" at 100 verifications)
- Weekly progress chart (Recharts)
- Upcoming task deadlines

### 7.7 Audit Logging

Every write operation records: `actor_id`, `actor_role`, `action`, `entity_type`, `entity_id`, `changes_json`, `ip_address`, `timestamp`. Immutable; no delete endpoint.

---

## 8. Technology Stack

### 8.1 Current Stack (MVP Web App)

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 15.5.x |
| Language | TypeScript | ^5 |
| UI Components | shadcn/ui + Radix UI | latest |
| Styling | Tailwind CSS | ^4 |
| ORM | Drizzle ORM | ^0.45.x |
| Database | Neon Serverless PostgreSQL | ^1.0.x |
| Auth | Neon Auth + JWT | ^0.1.0-beta |
| Charts | Recharts | ^3.7.x |
| Drag-and-Drop | @dnd-kit | ^6.3.x |
| Validation | Zod | ^4.3.x |
| Testing | Vitest + Testing Library | ^4.0.x |
| Linting/Format | Biome | 2.2.0 |
| Notifications | Sonner | ^2.0.x |

### 8.2 Future Stack (Phase 3–4)

| Layer | Technology |
|-------|-----------|
| Mobile App | React Native + Expo |
| Blockchain | Polygon (MATIC) ERC-20 |
| Smart Contracts | Solidity ^0.8.19 + Hardhat |
| Contract Libraries | OpenZeppelin (AccessControl, Pausable, ReentrancyGuard) |
| Wallet SDK | ethers.js / WalletConnect |
| Proof Storage | IPFS |
| Key Management | AWS KMS / HSM |
| Caching | Redis |
| Cloud | AWS (ECS, API Gateway, CloudFront, Secrets Manager) |
| Monitoring | DataDog + CloudWatch |
| Price Oracle | Chainlink |

### 8.3 Token Reserve Strategy (Post-MVP)

Recommended: **Hybrid Conservative Model** — 1 BEACON = $0.85 USD

| Asset | Allocation | Rationale |
|-------|-----------|-----------|
| Bitcoin (BTC) | 40% | Inflation hedge, store of value |
| Ethereum (ETH) | 30% | Smart contract utility |
| Stablecoins (USDC) | 20% | Short-term stability |
| Solana (SOL) | 10% | Low-fee transactions |

Target: 5–10% annual BEACON appreciation. Floor guarantee: $0.80 minimum value. 7-day price smoothing to prevent volatility spikes.

---

## 9. Security & Configuration

### 9.1 Authentication

- JWT access tokens (15-minute expiry) + refresh tokens (7-day expiry)
- Role-based access control: `user | volunteer | partner | admin`
- Admin endpoints require 2FA (TOTP)
- Admin coin distributions >100 BEACON require dual-admin approval

### 9.2 Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...@neon.tech/beacon

# Authentication
JWT_SECRET=...
JWT_REFRESH_SECRET=...
NEON_AUTH_SECRET=...

# App
NEXT_PUBLIC_APP_URL=https://beacon.projectbeacon.org
NODE_ENV=production

# Blockchain (Phase 4)
POLYGON_RPC_URL=https://polygon-rpc.com
BEACON_TOKEN_ADDRESS=0x...
ACTIVITY_VALIDATOR_ADDRESS=0x...
ADMIN_WALLET_PRIVATE_KEY=...  # AWS KMS-managed in production
```

### 9.3 Security Scope

**In Scope (MVP)**
- Input validation via Zod on all endpoints
- SQL injection prevention via Drizzle parameterized queries
- CSRF protection via Next.js server actions
- Rate limiting: 100 req/min (general), 5 req/min (auth), 10 req/min (distributions)
- Audit logging for all admin actions
- Encrypted passwords (bcrypt)

**In Scope (Phase 4)**
- Smart contract reentrancy protection (OpenZeppelin NonReentrant)
- Multi-signature wallets for reserve fund management
- Time-locked contract upgrades (48-hour delay)
- Regular smart contract security audits
- AML compliance hooks

**Out of Scope (MVP)**
- DDoS mitigation (handled by Vercel/CDN layer)
- Formal smart contract audits (pre-blockchain)

---

## 10. API Specification

### Base URL
```
https://api.projectbeacon.org/v1
```

### Auth Header
```
Authorization: Bearer {jwt-access-token}
```

### Standard Response Envelope
```json
{
  "success": true,
  "data": { ... },
  "meta": { "timestamp": "2026-02-28T00:00:00Z", "version": "1.0.0" }
}
```

### Core Endpoints (MVP)

| Method | Path | Role | Description |
|--------|------|------|-------------|
| `POST` | `/auth/register` | Public | Register device/user |
| `POST` | `/auth/login` | Public | Login, receive JWT |
| `POST` | `/auth/refresh` | Authenticated | Refresh access token |
| `POST` | `/volunteers/register` | Public | Register volunteer |
| `POST` | `/volunteers/login` | Public | Volunteer login |
| `GET` | `/volunteers/profile` | Volunteer | Get own profile |
| `PUT` | `/volunteers/profile` | Volunteer | Update profile |
| `GET` | `/volunteers/tasks/available` | Volunteer | Browse open tasks |
| `POST` | `/volunteers/tasks/:id/accept` | Volunteer | Accept a task |
| `PUT` | `/volunteers/tasks/:id/progress` | Volunteer | Update progress |
| `POST` | `/volunteers/tasks/:id/complete` | Volunteer | Submit completion |
| `GET` | `/volunteers/dashboard/stats` | Volunteer | Dashboard data |
| `POST` | `/admin/login` | Admin | Admin login (+ 2FA) |
| `POST` | `/admin/distribute-coins` | Admin | Single distribution |
| `POST` | `/admin/distribute-coins/bulk` | Admin | Bulk distribution |
| `GET` | `/admin/distributions` | Admin | Distribution history |
| `POST` | `/admin/tasks` | Admin | Create task |
| `POST` | `/admin/tasks/:id/assign` | Admin | Assign to volunteer |
| `POST` | `/admin/tasks/:id/approve` | Admin | Approve completion |
| `GET` | `/admin/dashboard/stats` | Admin | Admin dashboard data |
| `GET` | `/admin/reports/impact` | Admin | Impact report |
| `GET` | `/admin/audit-log` | Admin | Immutable audit log |

### Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `AUTH_001` | 401 | Invalid credentials |
| `AUTH_002` | 401 | Token expired |
| `AUTH_003` | 403 | Insufficient permissions |
| `ADMIN_004` | 400 | Coin distribution limit exceeded |
| `DISTRIBUTION_003` | 400 | Daily cap exceeded for recipient |
| `TASK_002` | 409 | Task already assigned |
| `VOLUNTEER_004` | 409 | Email already registered |

---

## 11. Database Schema (Key Tables)

```sql
-- Volunteers / Staff
CREATE TABLE volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id VARCHAR(20) UNIQUE NOT NULL,  -- VOL-4A4D001
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  organization VARCHAR(255),
  skills JSONB DEFAULT '[]',
  availability JSONB DEFAULT '{}',
  role VARCHAR(20) DEFAULT 'volunteer',      -- volunteer | admin
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Admins (extends volunteers)
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id UUID REFERENCES volunteers(id),
  admin_id VARCHAR(20) UNIQUE NOT NULL,      -- ADMIN-4142001
  admin_level VARCHAR(20) DEFAULT 'standard',
  can_distribute_coins BOOLEAN DEFAULT true,
  max_coin_distribution_amount DECIMAL(18,8) DEFAULT 500,
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_secret VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Users (unsheltered individuals)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_identifier VARCHAR(255) UNIQUE NOT NULL,  -- QR code
  wallet_address VARCHAR(42) UNIQUE,
  coin_balance DECIMAL(18,8) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  privacy_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(30) DEFAULT 'open',
  estimated_hours DECIMAL(5,2),
  reward_amount DECIMAL(18,8),
  due_date TIMESTAMP,
  required_skills JSONB DEFAULT '[]',
  created_by UUID REFERENCES admins(id),
  assigned_to UUID REFERENCES volunteers(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Coin Distributions
CREATE TABLE coin_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES users(id),
  volunteer_id UUID REFERENCES volunteers(id),
  task_id UUID REFERENCES tasks(id),
  admin_id UUID REFERENCES admins(id),
  amount DECIMAL(18,8) NOT NULL,
  distribution_type VARCHAR(50) NOT NULL,
  description TEXT,
  approval_status VARCHAR(20) DEFAULT 'approved',
  blockchain_hash VARCHAR(66),
  distribution_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Audit Log (immutable)
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL,
  actor_role VARCHAR(20) NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  changes_json JSONB,
  ip_address INET,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 12. Success Criteria

### MVP Definition of Done

A successful MVP delivers:
- ✅ Admins can log in with 2FA and distribute BEACON coins to users
- ✅ Volunteers can register, accept tasks, and submit completions
- ✅ Admins can review and approve volunteer task completions
- ✅ All coin distributions are logged with full audit trail
- ✅ Admin dashboard renders distribution summaries and volunteer metrics
- ✅ Volunteer dashboard shows hours, earnings, and progress
- ✅ Bulk distribution handles 100 recipients without timeout
- ✅ JWT auth with refresh tokens works end-to-end
- ✅ Vitest coverage ≥ 70% on service layer
- ✅ Deployment to Vercel + Neon is one-command via CI/CD

### Quality Indicators

- Page load times < 2 seconds on 4G mobile
- Zero PII exposed in API responses (masked identifiers only)
- All admin actions produce audit log entries
- Rate limiting blocks >100 req/min per user
- No SQL injection surface areas (Drizzle parameterized queries enforced)

### UX Goals

- New volunteer completes registration in < 3 minutes
- Admin distributes coins to a single user in < 60 seconds
- Dashboard loads with no loading spinners > 500ms (server-side rendering)
- Mobile-responsive layout functional on 375px viewport

---

## 13. Implementation Phases

### Phase 1 — Foundation (Weeks 1–4)

**Goal:** Working auth system, database schema, and basic admin/volunteer CRUD.

- ✅ Database schema (Drizzle) — all core tables with migrations
- ✅ Volunteer registration + unique ID generation (VOL-x###)
- ✅ Admin login with 2FA (TOTP)
- ✅ JWT auth middleware + route guards
- ✅ Role-based access (volunteer vs. admin dashboard routes)
- ✅ Audit logging service (all mutations)
- ✅ Basic volunteer profile CRUD

**Validation:** Auth flows tested end-to-end. `/admin` routes inaccessible to volunteer role.

---

### Phase 2 — Core Operations (Weeks 5–9)

**Goal:** Full coin distribution engine, task management, and activity verification.

- ✅ Single and bulk coin distribution endpoints
- ✅ Daily earning cap enforcement (50 BEACON/day)
- ✅ Admin coin distribution limit enforcement
- ✅ Task lifecycle (create → assign → complete → approve)
- ✅ Activity submission with photo/GPS evidence upload
- ✅ Activity verification queue for volunteers
- ✅ Admin and volunteer dashboards with Recharts visualizations
- ✅ Impact report endpoint (JSON + CSV export)

**Validation:** 500 simulated distributions complete within 10 seconds. All task state transitions produce audit log entries.

---

### Phase 3 — Mobile Consumer App (Weeks 10–18)

**Goal:** React Native app for unsheltered individuals — wallet, earning, and map.

- ✅ React Native + Expo project setup
- ✅ Anonymous registration (device ID, no email/SSN)
- ✅ QR code identity and physical card fallback
- ✅ Digital wallet (balance, transaction history)
- ✅ Available activities map (location-based, geofenced)
- ✅ Activity submission (photo + GPS + notes)
- ✅ Daily check-in with streak tracking
- ✅ Partner directory with service costs in BEACON
- ✅ Service redemption (generates BEACON-XXXXXX code)
- ✅ Push notifications for verification results

**Validation:** New user onboarded and earns first BEACON within 5 minutes. Redemption code generated and scannable at partner POS.

---

### Phase 4 — Blockchain + Partner Portal (Weeks 19–30)

**Goal:** Live Polygon deployment, partner onboarding, and crypto-backed reserves.

- ✅ BeaconToken ERC-20 deployed to Polygon mainnet
- ✅ ActivityValidator smart contract live
- ✅ ServiceRedemption smart contract live
- ✅ IPFS proof storage for activity evidence
- ✅ Multi-sig admin wallets (3-of-5)
- ✅ Partner onboarding portal (web)
- ✅ Partner QR redemption scanning app
- ✅ Automated crypto-to-fiat settlement for partners
- ✅ Crypto reserve management dashboard (BTC/ETH/USDC/SOL)
- ✅ Chainlink price oracle integration
- ✅ Smart contract security audit (professional)
- ✅ $0.85 USD valuation model implementation

**Validation:** End-to-end earn-to-spend flow on Polygon testnet (Mumbai) passing full Hardhat test suite. Partner settlement processed within 24 hours.

---

## 14. Future Considerations

### Post-MVP Platform Enhancements

- **Gamification Engine** — Achievement badges, leaderboards, seasonal challenges. "Activity Expert" (100 verifications), "Community Champion" (50 BEACON donated), etc.
- **Savings Goals** — Users set target amounts (e.g., 230 BEACON for a hostel night) and the app tracks progress with projected timelines.
- **Skill Development Tracks** — Partner with job training centers; course completions earn higher-rate BEACON (12–25 BEACON/hour vs. base 5).
- **Multi-Language Support** — Spanish, Creole (per Orlando demographics). Design for low-literacy icons.
- **Community Governance** — Governance token for long-term users to vote on reserve allocation changes and major platform decisions.

### Tokenomics Evolution

- Transition from 1:1 USD peg to **$0.85 model** at launch for 118% revenue increase
- Year 2: Introduce gradual appreciation schedule (+3.5%/year) toward USD parity by Year 5
- Year 3: Activate crypto-backed reserves with Chainlink oracle price smoothing
- Year 4+: Automated rebalancing algorithms; DeFi yield farming on stable portion of reserves

### Integration Opportunities

- **LYNX (Orlando public transit)** — Direct BEACON-to-bus-pass redemption API
- **Second Harvest Food Bank** — POS integration for hot meal redemptions
- **Orlando Health** — Clinic co-pay assistance redemption
- **Florida Department of Economic Opportunity** — Employment tracking integration
- **Coalition for the Homeless of Central Florida** — Advisory board + data sharing

### Multi-City Expansion

Platform designed for geographic replication: Orlando → Tampa → Jacksonville → statewide. Each city gets isolated BEACON supply, local partner network, and city-branded token name (e.g., "TampaCoin").

---

## 15. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| **Regulatory scrutiny of BEACON as a security** | Medium | High | Legal opinion establishing utility token status before Phase 4 launch; no investment return promises; closed-loop design prevents speculation; retain crypto-specialized counsel |
| **Low adoption among unsheltered users** | Medium | High | Extensive community research phase (similar to Austin MyPass 2-year approach); advisory board of homeless individuals; physical card fallback; multi-language support from day one |
| **Smart contract exploit / fund loss** | Low | Critical | Professional audit pre-mainnet; OpenZeppelin battle-tested libraries; multi-sig wallets; emergency pause mechanism; 20% stablecoin reserve minimum; insurance fund (10% of fees) |
| **Partner network too small at consumer launch** | High | Medium | Onboard Coalition for the Homeless and Christian Service Center as anchor partners pre-launch; offer 0% platform fee for first 6 months; guaranteed settlement removes friction |
| **Grant funding gap before self-sustaining revenue** | Medium | High | 15% service fee model reaches break-even at ~420 active users ($18,750/month); pursue federal homeless services grants ($500K) and corporate CSR funding in parallel; 13-month reserve fund from initial raise |

---

## 16. Appendix

### Related Documents

| Document | Location | Description |
|----------|----------|-------------|
| API Specification | `stuff/API_SPECIFICATION.md` | Full REST API reference |
| Volunteer API | `stuff/VOLUNTEER_API_SPECIFICATION.md` | Volunteer & admin endpoints |
| Technical Architecture | `stuff/TECHNICAL_ARCHITECTURE.md` | System design details |
| Blockchain Integration | `stuff/BLOCKCHAIN_INTEGRATION.md` | Smart contracts & integration |
| Tokenomics | `stuff/TOKENOMICS_AND_EXCHANGE_RATES.md` | Exchange rates & fee model |
| Alternative Valuations | `stuff/ALTERNATIVE_COIN_VALUATIONS.md` | $0.85 vs $1.00 BEACON model analysis |
| Crypto Backing | `stuff/CRYPTO_BACKING_STRATEGIES.md` | Reserve management strategies |
| Competitive Research | `stuff/COMPETITIVE_RESEARCH.md` | GoodDollar, Circles UBI, Austin MyPass analysis |

### Key External References

- [Polygon Network](https://polygon.technology) — Primary blockchain
- [OpenZeppelin Contracts](https://openzeppelin.com/contracts/) — Smart contract security
- [GoodDollar](https://gooddollar.org) — UBI blockchain precedent (300K users)
- [Austin MyPass](https://mypass.io) — Digital identity for homeless (community research model)
- [Coalition for the Homeless of Central Florida](https://www.centralfloridahomeless.org) — Anchor partner

### BEACON Valuation Decision Points

The README references $0.80 (starting value) while TOKENOMICS uses $1.00 (stable peg) and ALTERNATIVE_COIN_VALUATIONS recommends $0.85 as the optimal launch value for 118% revenue increase over the $1.00 model. **Recommendation: Launch at $0.85 with transparent user education and dual-currency displays (BEACON + USD equivalent).**

### Current Codebase Notes

The existing repo is scaffolded as a Next.js 15 app with Neon + Drizzle (package name is a legacy template name "link-in-bio-page-builder" — should be renamed to "project-beacon"). Core dependencies align well with MVP requirements. Recharts is already installed for dashboard visualizations. Existing `drizzle/` migrations directory and `tests/` structure are ready to extend.

---

*Built with dignity and opportunity through technology — Project Beacon, Orlando FL*
