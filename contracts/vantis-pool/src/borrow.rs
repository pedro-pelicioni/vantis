//! Borrow position types and utilities

use soroban_sdk::{contracttype, Address};

/// Represents a user's borrow position
#[contracttype]
#[derive(Clone, Debug)]
pub struct BorrowPosition {
    /// Owner of the position
    pub owner: Address,
    /// Principal amount borrowed (USDC)
    pub principal: i128,
    /// Accrued interest (USDC)
    pub accrued_interest: i128,
    /// Interest rate at time of borrow (basis points per year)
    pub borrow_rate: u32,
    /// Timestamp of last interest accrual
    pub last_accrual: u64,
    /// Timestamp of initial borrow
    pub borrow_time: u64,
}

impl BorrowPosition {
    /// Get total debt (principal + interest)
    pub fn total_debt(&self) -> i128 {
        self.principal + self.accrued_interest
    }

    /// Check if position has any debt
    pub fn has_debt(&self) -> bool {
        self.principal > 0 || self.accrued_interest > 0
    }
}

/// Calculate interest accrued over a period
///
/// # Arguments
/// * `principal` - Principal amount
/// * `rate` - Annual interest rate in basis points
/// * `time_elapsed` - Time elapsed in seconds
///
/// # Returns
/// Interest amount
pub fn calculate_interest(principal: i128, rate: u32, time_elapsed: u64) -> i128 {
    if principal <= 0 || rate == 0 || time_elapsed == 0 {
        return 0;
    }

    const SECONDS_PER_YEAR: u64 = 365 * 24 * 60 * 60;
    const BASIS_POINTS: i128 = 10000;

    // interest = principal * rate * time / (seconds_per_year * basis_points)
    principal * rate as i128 * time_elapsed as i128 / (SECONDS_PER_YEAR as i128 * BASIS_POINTS)
}

/// Calculate utilization rate
///
/// # Arguments
/// * `total_borrows` - Total amount borrowed from pool
/// * `total_liquidity` - Total liquidity in pool (borrows + reserves)
///
/// # Returns
/// Utilization rate in basis points (10000 = 100%)
pub fn calculate_utilization(total_borrows: i128, total_liquidity: i128) -> u32 {
    if total_liquidity == 0 {
        return 0;
    }

    (total_borrows * 10000 / total_liquidity) as u32
}

/// Calculate interest rate based on utilization (kink model)
///
/// # Arguments
/// * `utilization` - Current utilization in basis points
/// * `base_rate` - Base interest rate in basis points
/// * `slope1` - Rate slope below optimal utilization
/// * `slope2` - Rate slope above optimal utilization
/// * `optimal_utilization` - Optimal utilization threshold in basis points
///
/// # Returns
/// Interest rate in basis points per year
pub fn calculate_interest_rate(
    utilization: u32,
    base_rate: u32,
    slope1: u32,
    slope2: u32,
    optimal_utilization: u32,
) -> u32 {
    if utilization <= optimal_utilization {
        // Below optimal: linear increase with slope1
        base_rate + utilization * slope1 / optimal_utilization
    } else {
        // Above optimal: jump + steep increase with slope2
        let rate_at_optimal = base_rate + slope1;
        let excess = utilization - optimal_utilization;
        let remaining = 10000 - optimal_utilization;
        rate_at_optimal + excess * slope2 / remaining
    }
}
