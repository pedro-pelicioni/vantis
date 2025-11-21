//! Health factor calculations and utilities

use soroban_sdk::contracttype;

/// Health factor thresholds (in basis points where 10000 = 1.0)
pub const HEALTH_FACTOR_HEALTHY: i128 = 11000;      // 1.1 - healthy
pub const HEALTH_FACTOR_WARNING: i128 = 10500;      // 1.05 - warning zone
pub const HEALTH_FACTOR_CRITICAL: i128 = 10200;     // 1.02 - pre-liquidation
pub const HEALTH_FACTOR_LIQUIDATION: i128 = 10000;  // 1.0 - liquidation threshold
pub const HEALTH_FACTOR_TARGET: i128 = 10500;       // 1.05 - target after liquidation

/// Health status of a position
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum HealthStatus {
    /// Health factor > 1.1 - position is healthy
    Healthy,
    /// Health factor between 1.0 and 1.1 - warning state
    Warning,
    /// Health factor around 1.02 - pre-liquidation trigger
    Critical,
    /// Health factor < 1.0 - position can be liquidated
    Liquidatable,
}

/// Health factor data
#[contracttype]
#[derive(Clone, Debug)]
pub struct HealthFactor {
    /// Health factor value (basis points, 10000 = 1.0)
    pub value: i128,
    /// Current health status
    pub status: HealthStatus,
    /// Total collateral value (weighted)
    pub collateral_value: i128,
    /// Total debt value
    pub debt_value: i128,
    /// Amount needed to reach healthy state (if unhealthy)
    pub shortfall: i128,
    /// Amount that can be withdrawn while staying healthy
    pub available_to_withdraw: i128,
}

impl HealthFactor {
    /// Create a new health factor calculation
    pub fn calculate(collateral_value: i128, debt_value: i128) -> Self {
        let value = if debt_value == 0 {
            i128::MAX
        } else {
            collateral_value * 10000 / debt_value
        };

        let status = if value >= HEALTH_FACTOR_HEALTHY {
            HealthStatus::Healthy
        } else if value >= HEALTH_FACTOR_CRITICAL {
            HealthStatus::Warning
        } else if value >= HEALTH_FACTOR_LIQUIDATION {
            HealthStatus::Critical
        } else {
            HealthStatus::Liquidatable
        };

        // Calculate shortfall: how much collateral needed to reach healthy
        let shortfall = if value < HEALTH_FACTOR_HEALTHY && debt_value > 0 {
            // Need: collateral / debt >= 1.1
            // collateral_needed = debt * 1.1 - current_collateral
            let needed = debt_value * HEALTH_FACTOR_HEALTHY / 10000;
            if needed > collateral_value {
                needed - collateral_value
            } else {
                0
            }
        } else {
            0
        };

        // Calculate available to withdraw (while staying at 1.1)
        let available_to_withdraw = if debt_value == 0 {
            collateral_value
        } else {
            // min_collateral = debt * 1.1
            let min_collateral = debt_value * HEALTH_FACTOR_HEALTHY / 10000;
            if collateral_value > min_collateral {
                collateral_value - min_collateral
            } else {
                0
            }
        };

        Self {
            value,
            status,
            collateral_value,
            debt_value,
            shortfall,
            available_to_withdraw,
        }
    }

    /// Check if position is healthy
    pub fn is_healthy(&self) -> bool {
        matches!(self.status, HealthStatus::Healthy)
    }

    /// Check if position can be liquidated
    pub fn is_liquidatable(&self) -> bool {
        matches!(self.status, HealthStatus::Liquidatable)
    }

    /// Check if position should trigger stop-loss
    pub fn should_trigger_stop_loss(&self) -> bool {
        matches!(self.status, HealthStatus::Critical)
    }
}

/// Calculate the amount of collateral to liquidate to restore health
///
/// # Arguments
/// * `current_collateral` - Current weighted collateral value
/// * `current_debt` - Current total debt
/// * `liquidation_penalty` - Penalty in basis points (e.g., 500 = 5%)
/// * `target_health` - Target health factor after liquidation (basis points)
///
/// # Returns
/// (collateral_to_liquidate, debt_to_repay)
pub fn calculate_liquidation_amount(
    current_collateral: i128,
    current_debt: i128,
    liquidation_penalty: u32,
    target_health: i128,
) -> (i128, i128) {
    if current_debt == 0 {
        return (0, 0);
    }

    // We want: (collateral - sold) / (debt - repaid) = target_health / 10000
    // With: sold = repaid * (1 + penalty)
    //
    // Solving: (C - R*(1+p)) / (D - R) = H
    // C - R*(1+p) = H*(D - R) / 10000
    // C - R*(1+p) = H*D/10000 - H*R/10000
    // C - H*D/10000 = R*(1+p) - H*R/10000
    // C - H*D/10000 = R*((1+p) - H/10000)
    // R = (C - H*D/10000) / ((1+p) - H/10000)

    let penalty_factor = 10000 + liquidation_penalty as i128;
    let target_collateral = target_health * current_debt / 10000;
    let collateral_excess = current_collateral - target_collateral;

    if collateral_excess >= 0 {
        // Already healthy or would be healthy, no liquidation needed
        return (0, 0);
    }

    let deficit = -collateral_excess;
    let denominator = penalty_factor - target_health;

    if denominator <= 0 {
        // Edge case: would require liquidating everything
        return (current_collateral, current_debt);
    }

    let debt_to_repay = deficit * 10000 / denominator;
    let collateral_to_liquidate = debt_to_repay * penalty_factor / 10000;

    // Cap at total position
    let debt_to_repay = debt_to_repay.min(current_debt);
    let collateral_to_liquidate = collateral_to_liquidate.min(current_collateral);

    (collateral_to_liquidate, debt_to_repay)
}
