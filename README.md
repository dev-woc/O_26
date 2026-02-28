# Project Beacon - Crypto-Enabled Community Services Platform

A blockchain-based platform empowering homeless individuals in Orlando, FL through earned cryptocurrency rewards and essential service access.

## 🌟 Overview

Project Beacon creates an ecosystem where individuals experiencing homelessness can earn BeaconCoin (BEACON) through community service, volunteer work, and skill development. These coins can be redeemed for essential services like food, transportation, shelter, and healthcare.

### Key Features

- **Earn BEACON**: Complete activities like cleanup, verification tasks, and community service
- **Spend BEACON**: Redeem coins at partner locations for essential services
- **Build Wealth**: Crypto-backed coin value grows over time, protecting against inflation
- **Community Impact**: Transparent tracking of contributions and assistance

## 💰 Economics

### BEACON Value Model
- **Starting Value**: $0.80 per BEACON
- **Crypto-Backed**: Reserves held in Bitcoin, Ethereum, Solana, and stablecoins
- **Growth Potential**: 5-15% annual appreciation protecting against inflation
- **Service Fee**: 20% platform fee for sustainability

### Real-World Example
```
Domino's Pizza (Orlando, FL):
Year 1: 30 BEACON (2.5 hours work) = 1 pizza
Year 5: 20-27 BEACON (1.7-2.2 hours work) = 1 pizza
Result: Same pizza requires LESS work over time!
```

## 🏗️ Technical Architecture

### Backend
- **Framework**: Node.js + TypeScript + Express
- **Database**: PostgreSQL with spatial extensions
- **Blockchain**: Polygon integration for low-cost transactions
- **Authentication**: JWT tokens with role-based access

### Database Schema
- Volunteers with unique ID system (VOL-x###)
- Admins with tracking system (ADMIN-x###)
- Comprehensive audit logging
- Transaction management with crypto integration

## 🚀 Quick Start (Draft 1)

### Prerequisites
```bash
- Node.js 18+
- PostgreSQL 14+
- Git
```

### Installation
```bash
# Clone repository
git clone https://github.com/yourusername/project-beacon.git
cd project-beacon

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Set up database
npm run db:setup

# Start development server
npm run dev
```

### API Endpoints (Draft 1)

#### Volunteer Registration
```http
POST /api/draft1/volunteer/signup
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securepass",
  "phone": "+1-555-0123",
  "organization": "Local Shelter"
}
```

#### Volunteer Login
```http
POST /api/draft1/volunteer/login
{
  "volunteerId": "VOL-4A44001",
  "password": "securepass"
}
```

#### Admin Login
```http
POST /api/draft1/admin/login
{
  "adminId": "ADMIN-4A44001",
  "password": "adminpass"
}
```

## 🆔 ID System

### Volunteer IDs (VOL-x###)
- Format: `VOL-{hex_initials}{increment}`
- Example: John Mason → `VOL-4A4D001`
- Hex conversion: J(4A) + M(4D) = 4A4D
- Auto-increment for duplicate initials

### Admin IDs (ADMIN-x###)
- Format: `ADMIN-{hex_initials}{increment}`
- Example: Alice Brown → `ADMIN-4142001`
- Same hex logic as volunteers

## 📁 Project Structure

```
project-beacon/
├── src/
│   ├── services/
│   │   ├── draft1/
│   │   │   ├── draft1Service.ts
│   │   │   └── idGenerationService.ts
│   │   ├── databaseService.ts
│   │   ├── auditService.ts
│   │   └── transactionService.ts
│   ├── routes/
│   │   └── draft1Routes.ts
│   └── types/
│       └── volunteer.types.ts
├── docs/
│   ├── API_SPECIFICATION.md
│   ├── TOKENOMICS_AND_EXCHANGE_RATES.md
│   ├── CRYPTO_BACKING_STRATEGIES.md
│   └── VOLUNTEER_API_SPECIFICATION.md
├── DATABASE_SCHEMA.sql
├── package.json
└── README.md
```

## 🧪 Testing

```bash
# Run tests
npm test

# Test coverage
npm run test:coverage

# Health check
curl http://localhost:3000/api/draft1/health
```

## 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f api
```

## 📊 Monitoring

### Health Endpoints
- `/api/draft1/health` - API health status
- `/api/draft1/examples` - ID generation examples

### Database Monitoring
- Connection pool status
- Query performance metrics
- Audit log tracking

## 🔧 Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/beacon
DB_HOST=localhost
DB_PORT=5432
DB_NAME=beacon
DB_USER=beacon_user
DB_PASSWORD=secure_password

# Authentication
JWT_SECRET=your-super-secret-jwt-key

# Server
PORT=3000
NODE_ENV=development

# Crypto (Future)
POLYGON_RPC_URL=https://polygon-rpc.com
PRIVATE_KEY=your-wallet-private-key
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines
- TypeScript strict mode
- Comprehensive error handling
- Audit logging for all admin actions
- Database transactions for consistency
- JWT authentication for all endpoints

## 📋 Roadmap

### ✅ Draft 1 (Current)
- [x] Volunteer registration with unique IDs
- [x] Admin login system
- [x] Basic authentication
- [x] Database schema foundation

### 🔄 Draft 2 (Next)
- [ ] Task management system
- [ ] Coin distribution by admins
- [ ] Activity logging and verification
- [ ] Basic reporting dashboard

### 🚀 Draft 3 (Future)
- [ ] Partner integration
- [ ] Service redemption system
- [ ] Mobile app development
- [ ] Blockchain integration

### 🌟 Full Platform
- [ ] Multi-city expansion
- [ ] Advanced analytics
- [ ] Automated crypto rebalancing
- [ ] Community governance features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Coalition for the Homeless of Central Florida
- Orlando community partners
- Open source crypto and blockchain communities
- Contributors and supporters of this mission

## 📞 Contact

- **Project Lead**: Jordan Mason
- **Email**: contact@projectbeacon.org
- **Website**: https://projectbeacon.org

---

**Building dignity and opportunity through technology** 🌟