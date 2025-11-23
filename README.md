# Vantis

**The "Buy & Keep" Card - Smart Credit on Soroban**

Vantis is a revolutionary self-custodial smart wallet application that enables users to make purchases using credit while maintaining ownership of their assets. Built on the Soroban smart contract platform (Stellar), Vantis combines the flexibility of credit with the security of self-custody.

## Overview

Vantis addresses the limitations of traditional prepaid models by introducing a credit-based system with fiat repayment. Users can leverage their crypto assets as collateral to access credit, enabling them to "buy and keep" their purchases while maintaining full control over their digital assets.

## Key Features

- **Smart Credit System**: Access credit using crypto assets as collateral
- **Fiat Repayment**: Repay credit using traditional fiat currency
- **Self-Custodial**: Users maintain full control over their assets
- **Asset Protection**: Multi-layer risk mitigation system to protect user collateral
- **Tax Efficiency**: Optimized structure for tax benefits
- **Operational Integration**: Seamless integration with existing financial systems

## Architecture

### Core Components

1. **Credit Engine**: Manages credit issuance and repayment
2. **Collateral Management**: Handles asset collateralization
3. **Risk Engine**: Multi-layer protection system
4. **Repayment System**: Fiat-based repayment mechanisms

### Technical Stack

- **Blockchain**: Stellar Network
- **Smart Contracts**: Soroban
- **Frontend**: Nuxt.js 3 (Vue.js)
- **Backend**: _To be defined_

## Asset Protection & Risk Engine

Vantis implements a comprehensive three-layer risk mitigation system:

1. **Layer 1: Volatility-Adjusted LTV (Prevention)**
   - Dynamic loan-to-value ratios adjusted for asset volatility
   - Prevents over-collateralization risks

2. **Layer 2: The Yield Cushion (Passive Defense)**
   - Utilizes yield from staked assets as a buffer
   - Provides passive protection against market fluctuations

3. **Layer 3: Automated Stop-Loss (Active Defense)**
   - Automated liquidation mechanisms
   - Partial liquidation to minimize user impact

## Implementation Roadmap

### Phase 1: POC (Proof of Concept)
- Core credit functionality
- Basic collateral management
- Initial risk parameters

### Phase 2: MVP (Minimum Viable Product)
- Full credit issuance
- Fiat repayment integration
- Basic risk engine

### Phase 3: V1 (Version 1)
- Complete feature set
- Advanced risk management
- Production-ready system

## Project Structure

```
vantis/
├── contracts/         # Soroban smart contracts
├── scripts/           # Deployment and testing scripts
├── frontend/          # Nuxt.js 3 frontend application
├── backend/           # Backend API and services
└── README.md          # This file
```

## Getting Started

### Prerequisites

- [Stellar CLI](https://developers.stellar.org/docs/tools/developer-tools/cli/stellar-cli) installed
- Rust toolchain with `wasm32-unknown-unknown` target

### Testing on Testnet

The recommended way to test the protocol is:

1. **Deploy contracts to testnet:**
   ```bash
   ./scripts/deploy-testnet.sh
   ```

2. **Run the E2E payment flow tests:**
   ```bash
   ./scripts/e2e-tests.sh --suite payment
   ```

This will test the complete "Buy & Keep" payment flow:
- Deposit collateral (XLM) → Blend Pool
- Borrow USDC (JIT funding for card swipe)
- Repay debt
- Withdraw collateral

### Deploy Script Options

```bash
./scripts/deploy-testnet.sh [options]

Options:
  --reset      Reset deployment and generate new contracts
  --no-build   Skip building contracts
  --skip-init  Skip contract initialization (for already-initialized contracts)
```

### Frontend

See [frontend/README.md](./frontend/README.md) for frontend setup instructions.

### Backend

See [backend/README.md](./backend/README.md) for backend setup instructions.

## Key Benefits

### Tax Efficiency
- Optimized structure for tax benefits
- Clear separation between credit and asset ownership

### Operational Integration
- Seamless integration with existing financial infrastructure
- Standard fiat payment rails

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## License

_To be defined_

## Contact

For questions or support, please contact the development team.
