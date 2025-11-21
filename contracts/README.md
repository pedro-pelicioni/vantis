# Vantis Smart Contracts

Soroban smart contracts for the Vantis "Buy & Keep" Card protocol on Stellar.

## Smart Accounts

Vantis uses [OpenZeppelin Stellar Smart Accounts](https://docs.openzeppelin.com/stellar-contracts/accounts/smart-account) for user wallets. This provides:

- **Context Rules**: Define "what" actions are allowed per signer
- **Signers**: Define "who" can authorize transactions
- **Policies**: Define "how" constraints are enforced (limits, thresholds)

### Vantis Configuration

```
User Smart Account
├── Default Rule (User)
│   ├── Signer: user_owner_key
│   └── Policies: none (full control)
│
└── CallContract(vantis_pool) Rule (Vantis Backend)
    ├── Signer: vantis_backend_key
    └── Policies: [BorrowLimitPolicy]
```

## Contracts

### policies/borrow-limit
Custom policy for OpenZeppelin Smart Accounts that enforces borrowing limits.
- Maximum borrow per transaction
- Cumulative borrow limit within time window
- Rate limiting on borrow operations

### oracle-adapter
Price oracle integration with Reflector for asset prices and volatility.
- Real-time price feeds for XLM, yXLM, BTC
- Historical volatility tracking (7d, 30d)
- Volatility-adjusted LTV calculations

### vantis-pool
Lending pool for collateral deposits and USDC borrowing.
- Deposit collateral (XLM, yXLM, BTC)
- Borrow USDC against collateral
- Health factor monitoring
- Interest rate model (kink-based)

### risk-engine
Risk management with liquidation protection.
- Volatility-adjusted LTV: `B_safe = V × (LTV_base - kσ√T)`
- Automated stop-loss at HF ≈ 1.02
- Partial liquidation to HF = 1.05
- Dutch auction mechanism

## Dependencies

- `soroban-sdk = "22.0.0"`
- `stellar-accounts = "0.5.0"` (OpenZeppelin)

## Building

```bash
cd contracts
cargo build --release
```

## Testing

```bash
cargo test
```

## Deploying

```bash
# Install Stellar CLI
cargo install stellar-cli

# Deploy borrow-limit policy
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/borrow_limit_policy.wasm \
  --network testnet

# Deploy pool
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/vantis_pool.wasm \
  --network testnet
```

## Architecture

```
User (OZ Smart Account)
     │
     ├── Context: Default ──► Full control (user key)
     │
     ├── Context: CallContract(pool) ──► Borrow only (Vantis backend)
     │                                    └── BorrowLimitPolicy
     │
     ├── deposit collateral ──► Vantis Pool
     │                              │
     │                              ├── get price ──► Oracle Adapter
     │                              │
     │                              └── check health ──► Risk Engine
     │
     └── swipe card ──► Vantis Backend ──► borrow USDC ──► Vantis Pool
```

## Health Factor States

| State | Health Factor | Action |
|-------|---------------|--------|
| Healthy | > 1.1 | Normal operations |
| Warning | 1.02 - 1.1 | User notified |
| Critical | 1.0 - 1.02 | Stop-loss triggers (if enabled) |
| Liquidatable | < 1.0 | Partial liquidation |

## License

MIT
