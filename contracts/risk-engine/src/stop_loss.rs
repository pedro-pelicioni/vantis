//! Stop-loss mechanism for pre-liquidation protection
//!
//! Allows users to opt-in to automatic collateral swaps when their
//! position approaches liquidation, avoiding the liquidation penalty.
//! Integrates with Blend adapter for position queries and operations.

use soroban_sdk::{contracttype, Address, Vec};
use blend_adapter::RequestType;

/// Stop-loss configuration for a user
#[contracttype]
#[derive(Clone, Debug)]
pub struct StopLossConfig {
    /// User address
    pub user: Address,
    /// Is stop-loss enabled
    pub enabled: bool,
    /// Health factor threshold to trigger (basis points)
    /// Default: 10200 (1.02)
    pub trigger_threshold: i128,
    /// Target health factor after stop-loss (basis points)
    /// Default: 10500 (1.05)
    pub target_health: i128,
    /// Assets to swap in order of preference
    pub swap_order: Vec<Address>,
    /// Maximum slippage tolerance (basis points)
    /// Default: 100 (1%)
    pub max_slippage: u32,
    /// Minimum swap amount (to avoid dust)
    pub min_swap_amount: i128,
}

/// Stop-loss execution result
#[contracttype]
#[derive(Clone, Debug)]
pub struct StopLossResult {
    /// Amount of collateral swapped
    pub collateral_swapped: i128,
    /// Asset that was swapped
    pub asset_swapped: Address,
    /// USDC received from swap
    pub usdc_received: i128,
    /// Debt reduced
    pub debt_reduced: i128,
    /// New health factor after stop-loss
    pub new_health_factor: i128,
    /// Slippage incurred (basis points)
    pub slippage: u32,
}

/// Calculate the amount of collateral to swap to reach target health
///
/// # Arguments
/// * `current_collateral` - Current weighted collateral value
/// * `current_debt` - Current total debt
/// * `current_health` - Current health factor (basis points)
/// * `target_health` - Target health factor (basis points)
///
/// # Returns
/// Amount of collateral to swap (in collateral terms)
pub fn calculate_swap_amount(
    current_collateral: i128,
    current_debt: i128,
    current_health: i128,
    target_health: i128,
) -> i128 {
    if current_debt == 0 || current_health >= target_health {
        return 0;
    }

    // To increase health factor:
    // new_health = (collateral - swap) / (debt - usdc_received)
    // Assuming 1:1 swap (no slippage for calculation)
    // target = (C - S) / (D - S)
    // target * (D - S) = C - S
    // target*D - target*S = C - S
    // target*D - C = target*S - S
    // target*D - C = S*(target - 1)
    // S = (target*D - C) / (target - 1)

    let target_normalized = target_health * current_debt / 10000;
    let numerator = target_normalized - current_collateral;
    let denominator = target_health - 10000; // target - 1.0 in basis points

    if denominator <= 0 {
        return 0;
    }

    // Convert back from basis points
    let swap_amount = numerator * 10000 / denominator;

    // Can't swap more than available collateral
    if swap_amount > current_collateral {
        current_collateral
    } else if swap_amount < 0 {
        0
    } else {
        swap_amount
    }
}

/// Check if stop-loss should trigger
///
/// # Arguments
/// * `health_factor` - Current health factor (basis points)
/// * `trigger_threshold` - Threshold to trigger stop-loss (basis points)
/// * `liquidation_threshold` - Threshold for liquidation (basis points)
///
/// # Returns
/// * `true` if stop-loss should trigger
/// * `false` if position is either healthy or already liquidatable
pub fn should_trigger_stop_loss(
    health_factor: i128,
    trigger_threshold: i128,
    liquidation_threshold: i128,
) -> bool {
    // Stop-loss triggers when:
    // 1. Health is below trigger threshold (critical zone)
    // 2. Health is still above liquidation threshold (not yet liquidatable)
    health_factor <= trigger_threshold && health_factor >= liquidation_threshold
}

/// Apply slippage to expected output
///
/// # Arguments
/// * `expected_output` - Expected output from swap
/// * `max_slippage` - Maximum slippage in basis points
///
/// # Returns
/// Minimum acceptable output after slippage
pub fn calculate_min_output(expected_output: i128, max_slippage: u32) -> i128 {
    expected_output * (10000 - max_slippage as i128) / 10000
}

/// Build a Blend withdraw collateral request for stop-loss
///
/// This creates a WithdrawCollateral request to be submitted to Blend
/// as part of the stop-loss mechanism.
///
/// # Arguments
/// * `collateral_asset` - The collateral asset to withdraw
/// * `amount` - Amount to withdraw
///
/// # Returns
/// A Request configured for Blend's withdraw operation
pub fn build_blend_withdraw_request(
    collateral_asset: Address,
    amount: i128,
) -> blend_adapter::Request {
    blend_adapter::Request {
        request_type: RequestType::WithdrawCollateral,
        address: collateral_asset,
        amount,
    }
}

/// Build a Blend repay request for stop-loss
///
/// This creates a Repay request to be submitted to Blend
/// to reduce debt as part of the stop-loss mechanism.
///
/// # Arguments
/// * `usdc_asset` - The USDC token address
/// * `amount` - Amount to repay
///
/// # Returns
/// A Request configured for Blend's repay operation
pub fn build_blend_repay_request(
    usdc_asset: Address,
    amount: i128,
) -> blend_adapter::Request {
    blend_adapter::Request {
        request_type: RequestType::Repay,
        address: usdc_asset,
        amount,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_should_trigger_stop_loss() {
        // In critical zone (1.0 < HF < 1.02)
        assert!(should_trigger_stop_loss(10100, 10200, 10000)); // HF = 1.01
        assert!(should_trigger_stop_loss(10050, 10200, 10000)); // HF = 1.005

        // At exact trigger
        assert!(should_trigger_stop_loss(10200, 10200, 10000)); // HF = 1.02

        // Healthy, no trigger
        assert!(!should_trigger_stop_loss(11000, 10200, 10000)); // HF = 1.1
        assert!(!should_trigger_stop_loss(10500, 10200, 10000)); // HF = 1.05

        // Already liquidatable, stop-loss too late
        assert!(!should_trigger_stop_loss(9900, 10200, 10000)); // HF = 0.99
    }

    #[test]
    fn test_calculate_swap_amount() {
        // Position: 1000 collateral, 1000 debt, HF = 1.0
        // Target: HF = 1.05
        let swap = calculate_swap_amount(
            1000,   // collateral
            1000,   // debt
            10000,  // HF = 1.0
            10500,  // target HF = 1.05
        );

        // After swap:
        // (1000 - swap) / (1000 - swap) should = 1.05
        // This is a simplification; actual swap would need to account for
        // the fact that swapping reduces both collateral and debt
        assert!(swap > 0);
    }

    #[test]
    fn test_calculate_swap_amount_healthy() {
        // Already healthy, no swap needed
        let swap = calculate_swap_amount(
            1200,   // collateral
            1000,   // debt
            12000,  // HF = 1.2
            10500,  // target HF = 1.05
        );
        assert_eq!(swap, 0);
    }

    #[test]
    fn test_calculate_min_output() {
        // 1000 expected with 1% slippage
        let min = calculate_min_output(1000, 100);
        assert_eq!(min, 990); // 99% of 1000

        // 1000 expected with 5% slippage
        let min = calculate_min_output(1000, 500);
        assert_eq!(min, 950); // 95% of 1000
    }
}
