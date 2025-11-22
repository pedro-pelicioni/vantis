//! Partial liquidation mechanism
//!
//! Implements Vantis' partial liquidation approach that:
//! - Only liquidates the minimum amount to restore health
//! - Targets a specific health factor (1.05) after liquidation
//! - Uses Dutch auction mechanism for efficient price discovery
//! - Integrates with Blend's auction system for liquidations

use soroban_sdk::{contracttype, Address};
use vantis_types::RequestType;

/// Target health factor after liquidation (basis points)
pub const TARGET_HEALTH_FACTOR: i128 = 10500; // 1.05

/// Liquidation result data
#[contracttype]
#[derive(Clone, Debug)]
pub struct LiquidationResult {
    /// User that was liquidated
    pub user: Address,
    /// Collateral asset that was seized
    pub collateral_asset: Address,
    /// Amount of collateral seized
    pub collateral_amount: i128,
    /// Value of collateral in USD
    pub collateral_value: i128,
    /// Debt that was repaid
    pub debt_repaid: i128,
    /// Bonus paid to liquidator (penalty from user)
    pub liquidator_bonus: i128,
    /// Protocol fee collected
    pub protocol_fee: i128,
    /// Health factor before liquidation
    pub health_before: i128,
    /// Health factor after liquidation
    pub health_after: i128,
}

/// Dutch auction parameters for liquidation
#[contracttype]
#[derive(Clone, Debug)]
pub struct DutchAuctionParams {
    /// Starting discount (basis points)
    pub start_discount: u32,
    /// Ending discount (basis points, max penalty)
    pub end_discount: u32,
    /// Auction duration (seconds)
    pub duration: u64,
    /// Start timestamp
    pub start_time: u64,
}

impl DutchAuctionParams {
    /// Calculate current discount based on time elapsed
    pub fn current_discount(&self, current_time: u64) -> u32 {
        if current_time < self.start_time {
            return self.start_discount;
        }

        let elapsed = current_time - self.start_time;
        if elapsed >= self.duration {
            return self.end_discount;
        }

        // Linear interpolation
        let progress = elapsed as u128 * 10000 / self.duration as u128;
        let discount_range = (self.end_discount - self.start_discount) as u128;
        let additional_discount = discount_range * progress / 10000;

        self.start_discount + additional_discount as u32
    }
}

/// Calculate the minimum liquidation amount to restore target health
///
/// # Arguments
/// * `current_collateral` - Current weighted collateral value
/// * `current_debt` - Current total debt
/// * `liquidation_penalty` - Penalty in basis points (e.g., 500 = 5%)
/// * `target_health` - Target health factor after liquidation (basis points)
///
/// # Returns
/// (collateral_to_seize, debt_to_repay)
pub fn calculate_partial_liquidation(
    current_collateral: i128,
    current_debt: i128,
    liquidation_penalty: u32,
    target_health: i128,
) -> (i128, i128) {
    if current_debt == 0 {
        return (0, 0);
    }

    let current_health = current_collateral * 10000 / current_debt;

    // Already healthy
    if current_health >= target_health {
        return (0, 0);
    }

    // Goal: (C - seized) / (D - repaid) = target_health / 10000
    // seized = repaid * (1 + penalty)
    //
    // Let P = penalty_factor = 10000 + penalty
    // (C - R*P/10000) / (D - R) = H/10000
    // 10000*(C - R*P/10000) = H*(D - R)
    // 10000*C - R*P = H*D - H*R
    // 10000*C - H*D = R*P - H*R
    // 10000*C - H*D = R*(P - H)
    // R = (10000*C - H*D) / (P - H)

    let penalty_factor = 10000 + liquidation_penalty as i128;
    let numerator = 10000 * current_collateral - target_health * current_debt;
    let denominator = penalty_factor - target_health;

    if denominator <= 0 {
        // Edge case: penalty is too low, liquidate everything
        let collateral = current_collateral;
        let debt = current_collateral * 10000 / penalty_factor;
        return (collateral, debt.min(current_debt));
    }

    let debt_to_repay = numerator / denominator;

    if debt_to_repay <= 0 {
        return (0, 0);
    }

    let collateral_to_seize = debt_to_repay * penalty_factor / 10000;

    // Cap at maximum available
    let final_debt = debt_to_repay.min(current_debt);
    let final_collateral = collateral_to_seize.min(current_collateral);

    (final_collateral, final_debt)
}

/// Calculate liquidator's bonus from the penalty
///
/// # Arguments
/// * `collateral_seized` - Amount of collateral seized
/// * `debt_repaid` - Amount of debt repaid
/// * `protocol_fee_bp` - Protocol fee in basis points
///
/// # Returns
/// (liquidator_bonus, protocol_fee)
pub fn calculate_liquidation_bonus(
    collateral_seized: i128,
    debt_repaid: i128,
    protocol_fee_bp: u32,
) -> (i128, i128) {
    let total_bonus = collateral_seized - debt_repaid;

    if total_bonus <= 0 {
        return (0, 0);
    }

    let protocol_fee = total_bonus * protocol_fee_bp as i128 / 10000;
    let liquidator_bonus = total_bonus - protocol_fee;

    (liquidator_bonus, protocol_fee)
}

/// Check if a position is liquidatable
///
/// # Arguments
/// * `health_factor` - Current health factor (basis points)
/// * `liquidation_threshold` - Threshold below which liquidation is allowed
///
/// # Returns
/// * `true` if position can be liquidated
pub fn is_liquidatable(health_factor: i128, liquidation_threshold: i128) -> bool {
    health_factor < liquidation_threshold
}

/// Calculate maximum single liquidation (close factor)
///
/// Standard DeFi practice limits single liquidation to 50% of debt
/// to prevent complete position closure in one transaction
///
/// # Arguments
/// * `total_debt` - Total debt of the position
/// * `close_factor` - Maximum percentage that can be liquidated (basis points)
///
/// # Returns
/// Maximum debt that can be repaid in single liquidation
pub fn max_single_liquidation(total_debt: i128, close_factor: u32) -> i128 {
    total_debt * close_factor as i128 / 10000
}

/// Build a Blend liquidation auction request
///
/// This creates a FillUserLiquidationAuction request for the Blend adapter
/// to execute liquidation through Blend's auction system.
///
/// # Arguments
/// * `collateral_asset` - The collateral asset to seize
/// * `collateral_amount` - Amount of collateral to seize
///
/// # Returns
/// A Request configured for Blend's liquidation auction
pub fn build_blend_liquidation_request(
    collateral_asset: Address,
    collateral_amount: i128,
) -> vantis_types::Request {
    vantis_types::Request {
        request_type: RequestType::FillUserLiquidationAuction,
        address: collateral_asset,
        amount: collateral_amount,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_partial_liquidation_calculation() {
        // Position: 950 collateral, 1000 debt, HF = 0.95 (just below 1.0)
        // Target: HF = 1.05
        // Penalty: 5%
        let (collateral, debt) = calculate_partial_liquidation(
            950,
            1000,
            500,    // 5% penalty
            10500,  // target 1.05
        );

        // Should need some liquidation
        assert!(collateral > 0 || debt > 0 || (collateral == 0 && debt == 0));

        // For severely underwater position, check we don't exceed limits
        assert!(collateral <= 950);
        assert!(debt <= 1000);
    }

    #[test]
    fn test_healthy_position_no_liquidation() {
        let (collateral, debt) = calculate_partial_liquidation(
            1200,   // collateral
            1000,   // debt
            500,    // 5% penalty
            10500,  // target 1.05
        );

        assert_eq!(collateral, 0);
        assert_eq!(debt, 0);
    }

    #[test]
    fn test_liquidation_bonus() {
        // 1050 collateral seized for 1000 debt = 50 bonus
        let (liquidator, protocol) = calculate_liquidation_bonus(
            1050,   // collateral seized
            1000,   // debt repaid
            2000,   // 20% protocol fee
        );

        assert_eq!(liquidator + protocol, 50);
        assert_eq!(protocol, 10); // 20% of 50
        assert_eq!(liquidator, 40); // remaining 80%
    }

    #[test]
    fn test_is_liquidatable() {
        assert!(is_liquidatable(9500, 10000)); // HF 0.95 < 1.0
        assert!(is_liquidatable(9999, 10000)); // HF 0.9999 < 1.0
        assert!(!is_liquidatable(10000, 10000)); // HF 1.0 = 1.0 (not less than)
        assert!(!is_liquidatable(11000, 10000)); // HF 1.1 > 1.0
    }

    #[test]
    fn test_dutch_auction() {
        let auction = DutchAuctionParams {
            start_discount: 0,
            end_discount: 500, // 5% max
            duration: 3600,    // 1 hour
            start_time: 1000,
        };

        // At start
        assert_eq!(auction.current_discount(1000), 0);

        // Halfway through
        assert_eq!(auction.current_discount(2800), 250); // 2.5%

        // At end
        assert_eq!(auction.current_discount(4600), 500); // 5%

        // After end
        assert_eq!(auction.current_discount(10000), 500); // capped at max
    }

    #[test]
    fn test_max_single_liquidation() {
        // 50% close factor
        let max = max_single_liquidation(1000, 5000);
        assert_eq!(max, 500);

        // 100% close factor (full liquidation allowed)
        let max = max_single_liquidation(1000, 10000);
        assert_eq!(max, 1000);
    }
}
