//! Collateral management types and utilities

use soroban_sdk::{contracttype, Address, Map};

/// Represents a user's collateral position
#[contracttype]
#[derive(Clone, Debug)]
pub struct CollateralPosition {
    /// Owner of the position
    pub owner: Address,
    /// Map of asset address to deposited amount
    pub balances: Map<Address, i128>,
    /// Total collateral value in USD (14 decimals)
    pub total_value_usd: i128,
    /// Weighted collateral value (after applying collateral factors)
    pub weighted_value_usd: i128,
    /// Last update timestamp
    pub last_updated: u64,
}

/// Collateral operation types
#[contracttype]
#[derive(Clone, Debug)]
pub enum CollateralOperation {
    /// Deposit collateral
    Deposit,
    /// Withdraw collateral
    Withdraw,
    /// Liquidation sale
    Liquidate,
}

/// Calculate weighted collateral value for an asset
///
/// # Arguments
/// * `amount` - Amount of the asset
/// * `price` - Price in USD (14 decimals)
/// * `collateral_factor` - Collateral factor in basis points (e.g., 7500 = 75%)
/// * `decimals` - Asset decimals
///
/// # Returns
/// Weighted collateral value in USD (14 decimals)
pub fn calculate_weighted_value(
    amount: i128,
    price: i128,
    collateral_factor: u32,
    decimals: u32,
) -> i128 {
    // value = amount * price / 10^decimals
    // weighted = value * collateral_factor / 10000
    let base: i128 = 10i128.pow(decimals);
    let value = amount * price / base;
    value * collateral_factor as i128 / 10000
}

/// Check if a withdrawal would make position unhealthy
pub fn is_withdrawal_safe(
    current_weighted_value: i128,
    withdrawal_weighted_value: i128,
    current_debt: i128,
    min_health_factor: i128, // in basis points, 10000 = 1.0
) -> bool {
    let new_weighted_value = current_weighted_value - withdrawal_weighted_value;

    if current_debt == 0 {
        return true;
    }

    let health_factor = new_weighted_value * 10000 / current_debt;
    health_factor >= min_health_factor
}
