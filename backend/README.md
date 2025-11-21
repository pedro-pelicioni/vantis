# Vantis Backend

Backend API and services for the Vantis "Buy & Keep" Card application.

## Overview

The Vantis backend provides the core infrastructure for the smart credit system built on Soroban (Stellar). It handles credit issuance, collateral management, risk assessment, and fiat repayment processing.

## Architecture

### Core Services

1. **Credit Service**
   - Credit issuance and management
   - Credit limit calculations
   - Credit utilization tracking

2. **Collateral Service**
   - Asset collateralization
   - Collateral valuation
   - LTV (Loan-to-Value) calculations

3. **Risk Engine**
   - Volatility-adjusted LTV monitoring
   - Yield cushion management
   - Automated stop-loss execution
   - Partial liquidation processing

4. **Repayment Service**
   - Fiat payment processing
   - Repayment scheduling
   - Payment reconciliation

5. **Stellar/Soroban Integration**
   - Smart contract interactions
   - Transaction management
   - Account management

## Technical Stack

_To be defined based on requirements_

### Potential Technologies

- **Runtime**: Node.js, Python, or Rust
- **Framework**: Express.js, FastAPI, or Actix
- **Database**: PostgreSQL, MongoDB, or similar
- **Blockchain**: Stellar SDK, Soroban SDK
- **Message Queue**: Redis, RabbitMQ, or similar
- **Monitoring**: Prometheus, Grafana

## Key Features

### Credit Management

- Issue credit against crypto collateral
- Calculate dynamic credit limits based on asset volatility
- Track credit utilization and repayment status

### Risk Management

- **Volatility-Adjusted LTV**: Monitor and adjust LTV ratios based on asset volatility
- **Yield Cushion**: Track and utilize yield from staked assets
- **Automated Stop-Loss**: Execute automated liquidation when risk thresholds are breached
- **Partial Liquidation**: Minimize user impact through partial liquidation mechanisms

### Repayment Processing

- Process fiat payments for credit repayment
- Integrate with payment processors
- Handle payment reconciliation and settlement

### Soroban Integration

- Deploy and interact with Soroban smart contracts
- Manage Stellar accounts and transactions
- Handle asset transfers and swaps

## API Endpoints

_To be documented as development progresses_

### Credit Endpoints
- `POST /api/credit/issue` - Issue new credit
- `GET /api/credit/:id` - Get credit details
- `GET /api/credit/user/:userId` - Get user's credit history

### Collateral Endpoints
- `POST /api/collateral/deposit` - Deposit collateral
- `POST /api/collateral/withdraw` - Withdraw collateral
- `GET /api/collateral/:id` - Get collateral details

### Risk Endpoints
- `GET /api/risk/assessment/:accountId` - Get risk assessment
- `POST /api/risk/liquidation` - Trigger liquidation (admin)

### Repayment Endpoints
- `POST /api/repayment/initiate` - Initiate repayment
- `GET /api/repayment/:id` - Get repayment status
- `POST /api/repayment/webhook` - Payment webhook handler

## Setup

### Prerequisites

- Node.js/Python/Rust (depending on chosen stack)
- PostgreSQL or chosen database
- Stellar/Soroban testnet access
- Redis (for caching/queues)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd vantis/backend

# Install dependencies
npm install  # or pip install, cargo build, etc.

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run migrate  # or equivalent

# Start the development server
npm run dev  # or equivalent
```

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/vantis

# Stellar/Soroban
STELLAR_NETWORK=testnet
STELLAR_SECRET_KEY=your_secret_key
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org

# Redis
REDIS_URL=redis://localhost:6379

# API
API_PORT=3000
API_KEY=your_api_key

# Payment Processing
PAYMENT_PROVIDER_API_KEY=your_payment_provider_key
```

## Development

### Running Tests

```bash
npm test  # or equivalent
```

### Code Style

Follow the project's code style guidelines and use linters/formatters as configured.

### Database Migrations

```bash
# Create a new migration
npm run migrate:create migration_name

# Run migrations
npm run migrate

# Rollback migrations
npm run migrate:rollback
```

## Security Considerations

- **Secret Management**: Use secure secret management (e.g., AWS Secrets Manager, HashiCorp Vault)
- **API Authentication**: Implement robust authentication and authorization
- **Rate Limiting**: Implement rate limiting to prevent abuse
- **Input Validation**: Validate all inputs to prevent injection attacks
- **Audit Logging**: Log all critical operations for audit purposes

## Monitoring & Observability

- **Logging**: Structured logging for all operations
- **Metrics**: Track key metrics (credit issuance, repayments, liquidations)
- **Alerts**: Set up alerts for critical events (high risk, failed payments)
- **Health Checks**: Implement health check endpoints

## Deployment

_Deployment instructions will be added here_

## Contributing

See the main [README.md](../README.md) for contributing guidelines.

## License

_To be defined_
