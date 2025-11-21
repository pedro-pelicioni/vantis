//! Volatility-adjusted LTV calculations
//!
//! Implements the formula: B_safe = V_collateral × (LTV_base - k × σ × √T)
//! where:
//! - B_safe: Safe borrow amount
//! - V_collateral: Collateral value
//! - LTV_base: Base loan-to-value ratio
//! - k: Volatility sensitivity factor
//! - σ: Historical volatility (annualized)
//! - T: Time horizon in years

use soroban_sdk::contracttype;

/// Volatility-adjusted LTV data
#[contracttype]
#[derive(Clone, Debug)]
pub struct VolatilityAdjustedLTV {
    /// Asset symbol
    pub asset: soroban_sdk::Symbol,
    /// Base LTV (basis points)
    pub base_ltv: u32,
    /// Current volatility (basis points, annualized)
    pub volatility: u32,
    /// Adjusted LTV after volatility consideration (basis points)
    pub adjusted_ltv: u32,
    /// K factor used for calculation
    pub k_factor: u32,
    /// Time horizon used (days)
    pub time_horizon: u32,
}

/// Calculate adjusted LTV based on volatility
///
/// # Arguments
/// * `base_ltv` - Base LTV in basis points (e.g., 7500 = 75%)
/// * `volatility` - Annualized volatility in basis points (e.g., 5000 = 50%)
/// * `k_factor` - Sensitivity factor in basis points (e.g., 100 = 1%)
/// * `time_horizon_days` - Time horizon in days
/// * `min_ltv` - Minimum LTV floor in basis points
///
/// # Returns
/// Adjusted LTV in basis points
pub fn calculate_adjusted_ltv(
    base_ltv: u32,
    volatility: u32,
    k_factor: u32,
    time_horizon_days: u32,
    min_ltv: u32,
) -> u32 {
    // Calculate √T where T is time in years
    // √(days/365) = √days / √365 ≈ √days / 19.1
    let sqrt_days = integer_sqrt(time_horizon_days as i128);
    let sqrt_t = sqrt_days * 1000 / 19; // Scaled by 1000 for precision

    // Adjustment = k × σ × √T
    // All values in basis points, so normalize
    let adjustment = (k_factor as i128 * volatility as i128 * sqrt_t) / (1000 * 10000);

    // Adjusted LTV = base_ltv - adjustment
    let adjusted = (base_ltv as i128).saturating_sub(adjustment);

    // Apply minimum floor
    if adjusted < min_ltv as i128 {
        min_ltv
    } else {
        adjusted as u32
    }
}

/// Calculate safe borrow amount
///
/// # Arguments
/// * `collateral_value` - Collateral value (any precision)
/// * `adjusted_ltv` - Adjusted LTV in basis points
///
/// # Returns
/// Safe borrow amount (same precision as collateral_value)
pub fn calculate_safe_borrow(collateral_value: i128, adjusted_ltv: u32) -> i128 {
    collateral_value * adjusted_ltv as i128 / 10000
}

/// Calculate the effective interest rate considering yield offset
///
/// If yield > borrow rate, effective rate is negative (user earns)
///
/// # Arguments
/// * `borrow_rate` - Borrow interest rate (basis points per year)
/// * `yield_rate` - Yield from collateral (basis points per year)
/// * `principal` - Principal borrowed
/// * `collateral` - Collateral value
///
/// # Returns
/// Effective rate in basis points (can be negative)
pub fn calculate_effective_rate(
    borrow_rate: i32,
    yield_rate: i32,
    principal: i128,
    collateral: i128,
) -> i32 {
    if principal == 0 {
        return 0;
    }

    // Cost = P × r_borrow
    let cost = principal * borrow_rate as i128 / 10000;

    // Yield = C × r_yield
    let yield_earned = collateral * yield_rate as i128 / 10000;

    // Effective cost = Cost - Yield
    let effective_cost = cost - yield_earned;

    // Effective rate = effective_cost / principal * 10000
    (effective_cost * 10000 / principal) as i32
}

/// Integer square root using Newton's method
fn integer_sqrt(n: i128) -> i128 {
    if n <= 0 {
        return 0;
    }
    if n == 1 {
        return 1;
    }

    let mut x = n;
    let mut y = (x + 1) / 2;

    while y < x {
        x = y;
        y = (x + n / x) / 2;
    }

    x
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_adjusted_ltv_no_volatility() {
        let result = calculate_adjusted_ltv(
            7500,   // 75% base
            0,      // 0% volatility
            100,    // 1% k factor
            30,     // 30 days
            3000,   // 30% minimum
        );
        assert_eq!(result, 7500); // No adjustment without volatility
    }

    #[test]
    fn test_adjusted_ltv_with_volatility() {
        let result = calculate_adjusted_ltv(
            7500,   // 75% base
            5000,   // 50% volatility
            100,    // 1% k factor
            30,     // 30 days
            3000,   // 30% minimum
        );
        // Should be less than 75% due to volatility
        assert!(result < 7500);
        assert!(result >= 3000); // Above minimum
    }

    #[test]
    fn test_adjusted_ltv_floor() {
        let result = calculate_adjusted_ltv(
            5000,   // 50% base
            10000,  // 100% volatility (very high)
            500,    // 5% k factor (aggressive)
            90,     // 90 days
            3000,   // 30% minimum
        );
        // Should be reduced but may not hit floor depending on formula
        // The key is it's less than base and >= minimum
        assert!(result < 5000);
        assert!(result >= 3000);
    }

    #[test]
    fn test_safe_borrow_calculation() {
        let collateral = 1000_0000000i128; // 1000 units
        let ltv = 7500; // 75%

        let safe_borrow = calculate_safe_borrow(collateral, ltv);
        assert_eq!(safe_borrow, 750_0000000); // 750 units
    }

    #[test]
    fn test_effective_rate_positive() {
        // Borrow rate 10%, yield 5% -> effective 5%
        let rate = calculate_effective_rate(
            1000,   // 10% borrow
            500,    // 5% yield
            1000,   // principal
            1000,   // collateral
        );
        assert_eq!(rate, 500); // 5% net cost
    }

    #[test]
    fn test_effective_rate_negative() {
        // Borrow rate 5%, yield 10% -> effective -5% (earning)
        let rate = calculate_effective_rate(
            500,    // 5% borrow
            1000,   // 10% yield
            1000,   // principal
            1000,   // collateral
        );
        assert_eq!(rate, -500); // -5% (user earns)
    }

    #[test]
    fn test_integer_sqrt() {
        assert_eq!(integer_sqrt(0), 0);
        assert_eq!(integer_sqrt(1), 1);
        assert_eq!(integer_sqrt(4), 2);
        assert_eq!(integer_sqrt(9), 3);
        assert_eq!(integer_sqrt(100), 10);
        assert_eq!(integer_sqrt(30), 5); // √30 ≈ 5.47, floor is 5
    }
}
