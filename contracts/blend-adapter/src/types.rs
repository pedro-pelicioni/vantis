//! Blend Protocol types for integration
//!
//! These types mirror the Blend Protocol's data structures for interacting
//! with Blend lending pools.

use soroban_sdk::{contracttype, Address, Vec};

/// Request types for Blend pool operations
///
/// These correspond to the actions that can be performed on a Blend pool
/// via the `submit` function.
#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum RequestType {
    /// Supply an asset as collateral
    SupplyCollateral = 0,
    /// Withdraw collateral
    WithdrawCollateral = 1,
    /// Supply liquidity to the pool (lender)
    SupplyLiquidity = 2,
    /// Withdraw supplied liquidity
    WithdrawLiquidity = 3,
    /// Borrow an asset from the pool
    Borrow = 4,
    /// Repay borrowed asset
    Repay = 5,
    /// Fill an auction (for liquidations)
    FillUserLiquidationAuction = 6,
    /// Fill a bad debt auction
    FillBadDebtAuction = 7,
    /// Fill an interest auction
    FillInterestAuction = 8,
    /// Delete a liquidation auction
    DeleteLiquidationAuction = 9,
}

/// A request to submit to a Blend pool
#[contracttype]
#[derive(Clone, Debug)]
pub struct Request {
    /// The type of operation to perform
    pub request_type: RequestType,
    /// The asset address for this operation
    pub address: Address,
    /// The amount for this operation (token amount with decimals)
    pub amount: i128,
}

/// User's positions in a Blend pool
#[contracttype]
#[derive(Clone, Debug)]
pub struct Positions {
    /// Collateral positions: Map of asset index to amount
    /// Represented as a flat vector: [index0, amount0, index1, amount1, ...]
    pub collateral: Vec<(u32, i128)>,
    /// Liability positions (borrows): Map of asset index to amount
    pub liabilities: Vec<(u32, i128)>,
    /// Supply positions (lending): Map of asset index to amount
    pub supply: Vec<(u32, i128)>,
}

/// Reserve configuration for a Blend pool asset
#[contracttype]
#[derive(Clone, Debug)]
pub struct ReserveConfig {
    /// Index of the reserve in the pool
    pub index: u32,
    /// Number of decimals for the asset
    pub decimals: u32,
    /// Collateral factor (basis points, e.g., 7500 = 75%)
    pub c_factor: u32,
    /// Liability factor (basis points)
    pub l_factor: u32,
    /// Utilization at which the interest rate model kinks
    pub util: u32,
    /// Maximum utilization allowed
    pub max_util: u32,
    /// Base interest rate (basis points per year)
    pub r_base: u32,
    /// Interest rate slope below optimal utilization
    pub r_one: u32,
    /// Interest rate slope above optimal utilization
    pub r_two: u32,
    /// Interest rate slope at max utilization
    pub r_three: u32,
    /// Reactivity parameter for interest rate updates
    pub reactivity: u32,
}

/// Reserve data for a Blend pool asset
#[contracttype]
#[derive(Clone, Debug)]
pub struct ReserveData {
    /// Current borrow rate (scaled)
    pub b_rate: i128,
    /// Current supply rate (scaled)
    pub d_rate: i128,
    /// Interest rate modifier
    pub ir_mod: i128,
    /// Total bTokens (borrower tokens)
    pub b_supply: i128,
    /// Total dTokens (lender tokens)
    pub d_supply: i128,
    /// Backstop credit
    pub backstop_credit: i128,
    /// Last update timestamp
    pub last_time: u64,
}

/// Pool configuration
#[contracttype]
#[derive(Clone, Debug)]
pub struct PoolConfig {
    /// Oracle contract address
    pub oracle: Address,
    /// Base fee for borrowing (basis points)
    pub bstop_rate: u32,
    /// Pool status (0 = active, 1 = on-ice, 2 = frozen)
    pub status: u32,
    /// Maximum number of positions allowed
    pub max_positions: u32,
}

/// Auction data for liquidations
#[contracttype]
#[derive(Clone, Debug)]
pub struct AuctionData {
    /// Bid amount
    pub bid: i128,
    /// Lot amount
    pub lot: i128,
    /// Block number when auction started
    pub block: u32,
}

/// Result of a health factor calculation
#[contracttype]
#[derive(Clone, Debug)]
pub struct HealthFactorResult {
    /// Health factor in basis points (10000 = 1.0, >10000 = healthy)
    pub health_factor: i128,
    /// Total collateral value in base currency
    pub total_collateral: i128,
    /// Total liability value in base currency
    pub total_liabilities: i128,
    /// Whether position is liquidatable
    pub is_liquidatable: bool,
}
