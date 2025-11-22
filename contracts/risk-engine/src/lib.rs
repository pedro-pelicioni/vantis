#![no_std]

//! Risk Engine Contract
//!
//! Manages risk for the Vantis protocol including:
//! - Volatility-adjusted LTV calculations
//! - Automated stop-loss execution
//! - Partial liquidation mechanism
//! - Health factor monitoring
//! - Integration with Blend adapter for position queries

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, Address, Env, Symbol, Vec,
};

mod volatility;
mod stop_loss;
mod liquidation;

pub use volatility::VolatilityAdjustedLTV;
pub use stop_loss::StopLossConfig;
pub use liquidation::LiquidationResult;

/// Storage keys
#[contracttype]
pub enum DataKey {
    /// Admin address
    Admin,
    /// Oracle adapter contract
    Oracle,
    /// Vantis pool contract
    Pool,
    /// Blend adapter contract for position queries
    BlendAdapter,
    /// USDC token for swaps
    UsdcToken,
    /// Swap router/DEX contract
    SwapRouter,
    /// Risk parameters
    RiskParams,
    /// User stop-loss configurations
    StopLoss(Address),
    /// Liquidator whitelist
    Liquidators,
    /// Protocol treasury for fees
    Treasury,
}

/// Global risk parameters
#[contracttype]
#[derive(Clone, Debug)]
pub struct RiskParameters {
    /// K factor for volatility adjustment (basis points)
    /// Higher = more conservative borrowing limits during volatility
    pub k_factor: u32,
    /// Time horizon for volatility calculation (days)
    pub time_horizon_days: u32,
    /// Health factor threshold for stop-loss trigger (basis points)
    /// e.g., 10200 = 1.02
    pub stop_loss_threshold: i128,
    /// Health factor threshold for liquidation (basis points)
    /// e.g., 10000 = 1.0
    pub liquidation_threshold: i128,
    /// Target health factor after liquidation (basis points)
    /// e.g., 10500 = 1.05
    pub target_health_factor: i128,
    /// Liquidation penalty (basis points)
    /// e.g., 500 = 5%
    pub liquidation_penalty: u32,
    /// Protocol fee from liquidations (basis points)
    /// e.g., 100 = 1%
    pub protocol_fee: u32,
    /// Minimum collateral factor (basis points)
    /// Floor for volatility-adjusted LTV
    pub min_collateral_factor: u32,
}

impl Default for RiskParameters {
    fn default() -> Self {
        Self {
            k_factor: 100,                  // 1%
            time_horizon_days: 30,
            stop_loss_threshold: 10200,     // 1.02
            liquidation_threshold: 10000,   // 1.0
            target_health_factor: 10500,    // 1.05
            liquidation_penalty: 500,       // 5%
            protocol_fee: 100,              // 1%
            min_collateral_factor: 3000,    // 30% minimum
        }
    }
}

/// User's stop-loss configuration
#[contracttype]
#[derive(Clone, Debug)]
pub struct UserStopLossConfig {
    /// Is stop-loss enabled
    pub enabled: bool,
    /// Custom threshold (0 = use global)
    pub custom_threshold: i128,
    /// Assets to swap in priority order
    pub swap_priority: Vec<Address>,
    /// Maximum slippage for swaps (basis points)
    pub max_slippage: u32,
}

/// Liquidation event data
#[contracttype]
#[derive(Clone, Debug)]
pub struct LiquidationEvent {
    /// User being liquidated
    pub user: Address,
    /// Liquidator address
    pub liquidator: Address,
    /// Collateral asset liquidated
    pub collateral_asset: Address,
    /// Amount of collateral seized
    pub collateral_seized: i128,
    /// Debt amount repaid
    pub debt_repaid: i128,
    /// Penalty amount
    pub penalty: i128,
    /// Protocol fee
    pub protocol_fee: i128,
    /// Timestamp
    pub timestamp: u64,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum RiskError {
    /// Caller is not authorized
    Unauthorized = 1,
    /// Position is not liquidatable
    NotLiquidatable = 2,
    /// Position is healthy, no stop-loss needed
    PositionHealthy = 3,
    /// Stop-loss not enabled for user
    StopLossNotEnabled = 4,
    /// Swap failed
    SwapFailed = 5,
    /// Invalid parameters
    InvalidParams = 6,
    /// Oracle error
    OracleError = 7,
    /// Pool error
    PoolError = 8,
    /// Insufficient collateral for swap
    InsufficientCollateral = 9,
    /// Blend adapter error
    BlendAdapterError = 10,
}

#[contract]
pub struct RiskEngineContract;

#[contractimpl]
impl RiskEngineContract {
    /// Initialize the risk engine
    ///
    /// # Arguments
    /// * `admin` - Admin address for the risk engine
    /// * `oracle` - Oracle adapter contract address
    /// * `pool` - Vantis pool contract address (for backward compatibility)
    /// * `usdc_token` - USDC token address
    /// * `blend_adapter` - Blend adapter contract address for position queries
    /// * `params` - Risk parameters
    pub fn initialize(
        env: Env,
        admin: Address,
        oracle: Address,
        pool: Address,
        usdc_token: Address,
        blend_adapter: Address,
        params: RiskParameters,
    ) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Oracle, &oracle);
        env.storage().instance().set(&DataKey::Pool, &pool);
        env.storage().instance().set(&DataKey::BlendAdapter, &blend_adapter);
        env.storage().instance().set(&DataKey::UsdcToken, &usdc_token);
        env.storage().instance().set(&DataKey::RiskParams, &params);
        env.storage().instance().set(&DataKey::Liquidators, &Vec::<Address>::new(&env));
    }

    /// Update risk parameters
    pub fn update_params(
        env: Env,
        caller: Address,
        params: RiskParameters,
    ) -> Result<(), RiskError> {
        caller.require_auth();
        Self::require_admin(&env, &caller)?;

        env.storage().instance().set(&DataKey::RiskParams, &params);

        env.events().publish(
            (symbol_short!("params"), symbol_short!("updated")),
            params.k_factor,
        );

        Ok(())
    }

    /// Set swap router for stop-loss
    pub fn set_swap_router(
        env: Env,
        caller: Address,
        router: Address,
    ) -> Result<(), RiskError> {
        caller.require_auth();
        Self::require_admin(&env, &caller)?;

        env.storage().instance().set(&DataKey::SwapRouter, &router);
        Ok(())
    }

    /// Set treasury address
    pub fn set_treasury(
        env: Env,
        caller: Address,
        treasury: Address,
    ) -> Result<(), RiskError> {
        caller.require_auth();
        Self::require_admin(&env, &caller)?;

        env.storage().instance().set(&DataKey::Treasury, &treasury);
        Ok(())
    }

    /// Get Blend adapter address
    pub fn get_blend_adapter(env: Env) -> Result<Address, RiskError> {
        env.storage()
            .instance()
            .get(&DataKey::BlendAdapter)
            .ok_or(RiskError::BlendAdapterError)
    }

    /// Set Blend adapter address (admin only)
    pub fn set_blend_adapter(
        env: Env,
        caller: Address,
        blend_adapter: Address,
    ) -> Result<(), RiskError> {
        caller.require_auth();
        Self::require_admin(&env, &caller)?;

        env.storage().instance().set(&DataKey::BlendAdapter, &blend_adapter);
        Ok(())
    }

    // ============ Volatility-Adjusted LTV ============

    /// Calculate safe borrow amount with volatility adjustment
    ///
    /// Formula: B_safe = V_collateral × (LTV_base - k × σ × √T)
    ///
    /// # Arguments
    /// * `asset` - Collateral asset symbol
    /// * `collateral_value` - Collateral value in USD (14 decimals)
    /// * `base_ltv` - Base LTV in basis points
    ///
    /// # Returns
    /// Safe borrow amount in USD
    pub fn calculate_safe_borrow(
        env: Env,
        asset: Symbol,
        collateral_value: i128,
        base_ltv: u32,
    ) -> Result<i128, RiskError> {
        let params: RiskParameters = env
            .storage()
            .instance()
            .get(&DataKey::RiskParams)
            .unwrap_or_default();

        let oracle: Address = env
            .storage()
            .instance()
            .get(&DataKey::Oracle)
            .ok_or(RiskError::OracleError)?;

        // Call oracle to get volatility and calculate adjusted LTV
        // In production, this would be a cross-contract call
        let adjusted_ltv = Self::calculate_adjusted_ltv(
            &env,
            &oracle,
            &asset,
            base_ltv,
            params.k_factor,
            params.time_horizon_days,
            params.min_collateral_factor,
        )?;

        let safe_borrow = collateral_value * adjusted_ltv as i128 / 10000;

        Ok(safe_borrow)
    }

    /// Get the adjusted LTV for an asset
    fn calculate_adjusted_ltv(
        env: &Env,
        _oracle: &Address,
        _asset: &Symbol,
        base_ltv: u32,
        k_factor: u32,
        time_horizon_days: u32,
        min_ltv: u32,
    ) -> Result<u32, RiskError> {
        // In production: call oracle.get_volatility(asset)
        // For now, use a placeholder volatility
        let volatility_bp: u32 = 5000; // 50% annualized volatility

        // Calculate √T where T is in years
        // √(days/365) ≈ √days / 19.1
        let sqrt_t = Self::integer_sqrt(time_horizon_days as i128) * 1000 / 19;

        // Adjustment = k × σ × √T / 10000 (normalize)
        let adjustment = (k_factor as i128 * volatility_bp as i128 * sqrt_t) / (1000 * 10000);

        // Adjusted LTV = base_ltv - adjustment
        let adjusted_ltv = (base_ltv as i128).saturating_sub(adjustment);

        // Apply minimum floor
        let final_ltv = if adjusted_ltv < min_ltv as i128 {
            min_ltv
        } else {
            adjusted_ltv as u32
        };

        env.events().publish(
            (symbol_short!("ltv"), symbol_short!("adjusted")),
            (base_ltv, final_ltv),
        );

        Ok(final_ltv)
    }

    // ============ Stop-Loss Functions ============

    /// Enable stop-loss for a user
    pub fn enable_stop_loss(
        env: Env,
        user: Address,
        config: UserStopLossConfig,
    ) -> Result<(), RiskError> {
        user.require_auth();

        if config.max_slippage > 1000 {
            // Max 10% slippage
            return Err(RiskError::InvalidParams);
        }

        env.storage()
            .persistent()
            .set(&DataKey::StopLoss(user.clone()), &config);

        env.events().publish(
            (symbol_short!("stoploss"), symbol_short!("enabled")),
            user,
        );

        Ok(())
    }

    /// Disable stop-loss for a user
    pub fn disable_stop_loss(env: Env, user: Address) -> Result<(), RiskError> {
        user.require_auth();

        env.storage()
            .persistent()
            .remove(&DataKey::StopLoss(user.clone()));

        env.events().publish(
            (symbol_short!("stoploss"), symbol_short!("disabled")),
            user,
        );

        Ok(())
    }

    /// Execute stop-loss for a user (callable by anyone when conditions met)
    ///
    /// Swaps volatile collateral to USDC to reduce debt exposure
    /// without incurring the liquidation penalty
    pub fn trigger_stop_loss(
        env: Env,
        caller: Address,
        user: Address,
    ) -> Result<i128, RiskError> {
        caller.require_auth();

        // Check stop-loss is enabled
        let config: UserStopLossConfig = env
            .storage()
            .persistent()
            .get(&DataKey::StopLoss(user.clone()))
            .ok_or(RiskError::StopLossNotEnabled)?;

        if !config.enabled {
            return Err(RiskError::StopLossNotEnabled);
        }

        let params: RiskParameters = env
            .storage()
            .instance()
            .get(&DataKey::RiskParams)
            .unwrap_or_default();

        // Get health factor from pool
        let health_factor = Self::get_user_health_factor(&env, &user)?;

        // Check if in stop-loss zone (critical but not liquidatable)
        let threshold = if config.custom_threshold > 0 {
            config.custom_threshold
        } else {
            params.stop_loss_threshold
        };

        if health_factor > threshold {
            return Err(RiskError::PositionHealthy);
        }

        if health_factor < params.liquidation_threshold {
            // Already liquidatable, stop-loss too late
            return Err(RiskError::NotLiquidatable);
        }

        // Calculate amount to swap to restore health
        let swap_amount = Self::calculate_stop_loss_amount(&env, &user, &params)?;

        // Execute swap (would call DEX in production)
        // For now, emit event and return the calculated amount
        env.events().publish(
            (symbol_short!("stoploss"), symbol_short!("trigger")),
            (&user, swap_amount),
        );

        Ok(swap_amount)
    }

    /// Calculate how much collateral to swap for stop-loss
    fn calculate_stop_loss_amount(
        env: &Env,
        _user: &Address,
        params: &RiskParameters,
    ) -> Result<i128, RiskError> {
        // In production: get collateral and debt from pool
        // Calculate amount needed to reach target health factor

        // Simplified: swap enough to increase HF from 1.02 to 1.05
        // Amount = (target_hf - current_hf) * debt / (1 + slippage)

        // Placeholder calculation
        let estimated_amount = params.target_health_factor - params.stop_loss_threshold;

        Ok(estimated_amount)
    }

    // ============ Liquidation Functions ============

    /// Add liquidator to whitelist
    pub fn add_liquidator(
        env: Env,
        caller: Address,
        liquidator: Address,
    ) -> Result<(), RiskError> {
        caller.require_auth();
        Self::require_admin(&env, &caller)?;

        let mut liquidators: Vec<Address> = env
            .storage()
            .instance()
            .get(&DataKey::Liquidators)
            .unwrap_or(Vec::new(&env));

        liquidators.push_back(liquidator.clone());
        env.storage()
            .instance()
            .set(&DataKey::Liquidators, &liquidators);

        Ok(())
    }

    /// Execute partial liquidation on an unhealthy position
    ///
    /// Only liquidates minimum amount needed to restore health to target
    pub fn liquidate(
        env: Env,
        liquidator: Address,
        user: Address,
        collateral_asset: Address,
        debt_to_repay: i128,
    ) -> Result<LiquidationEvent, RiskError> {
        liquidator.require_auth();

        let params: RiskParameters = env
            .storage()
            .instance()
            .get(&DataKey::RiskParams)
            .unwrap_or_default();

        // Check health factor
        let health_factor = Self::get_user_health_factor(&env, &user)?;

        if health_factor >= params.liquidation_threshold {
            return Err(RiskError::NotLiquidatable);
        }

        // Calculate maximum liquidatable amount
        let (max_collateral, max_debt) = Self::calculate_max_liquidation(
            &env,
            &user,
            &params,
        )?;

        let actual_debt_repay = if debt_to_repay > max_debt {
            max_debt
        } else {
            debt_to_repay
        };

        // Calculate collateral to seize (debt + penalty)
        let penalty_factor = 10000 + params.liquidation_penalty as i128;
        let collateral_to_seize = actual_debt_repay * penalty_factor / 10000;

        // Protocol fee
        let protocol_fee_amount = actual_debt_repay * params.protocol_fee as i128 / 10000;

        // Ensure we don't exceed max collateral
        let final_collateral = if collateral_to_seize > max_collateral {
            max_collateral
        } else {
            collateral_to_seize
        };

        // In production: execute the actual transfers
        // 1. Transfer USDC from liquidator to pool
        // 2. Transfer collateral from pool to liquidator
        // 3. Transfer protocol fee to treasury

        let event = LiquidationEvent {
            user: user.clone(),
            liquidator: liquidator.clone(),
            collateral_asset,
            collateral_seized: final_collateral,
            debt_repaid: actual_debt_repay,
            penalty: final_collateral - actual_debt_repay,
            protocol_fee: protocol_fee_amount,
            timestamp: env.ledger().timestamp(),
        };

        env.events().publish(
            (symbol_short!("liquidate"), symbol_short!("partial")),
            (&event.user, event.debt_repaid),
        );

        Ok(event)
    }

    /// Calculate maximum liquidation amounts for a user
    fn calculate_max_liquidation(
        _env: &Env,
        _user: &Address,
        params: &RiskParameters,
    ) -> Result<(i128, i128), RiskError> {
        // In production: get actual values from pool
        // For now, return placeholder values

        // Calculate minimum amount to reach target health factor
        let max_collateral = 1000_0000000i128; // Placeholder
        let max_debt = max_collateral * 10000
            / (10000 + params.liquidation_penalty as i128);

        Ok((max_collateral, max_debt))
    }

    // ============ Health Monitoring ============

    /// Get user's current health factor from Blend adapter
    fn get_user_health_factor(env: &Env, user: &Address) -> Result<i128, RiskError> {
        // Get Blend adapter address
        let blend_adapter: Address = env
            .storage()
            .instance()
            .get(&DataKey::BlendAdapter)
            .ok_or(RiskError::BlendAdapterError)?;

        // Call blend adapter's get_health_factor function
        // In production, this would be a cross-contract call to the Blend adapter
        // For now, we return a placeholder that would be replaced with actual call
        let _health_result = Self::query_blend_health_factor(env, &blend_adapter, user)?;

        // Placeholder: return healthy
        // In production: return health_result.health_factor
        Ok(11000) // 1.1
    }

    /// Query health factor from Blend adapter
    fn query_blend_health_factor(
        _env: &Env,
        _blend_adapter: &Address,
        _user: &Address,
    ) -> Result<vantis_types::HealthFactorResult, RiskError> {
        // In production, this would call:
        // let adapter_client = BlendAdapterContractClient::new(env, blend_adapter);
        // adapter_client.get_health_factor(user.clone())
        //     .map_err(|_| RiskError::BlendAdapterError)

        // Placeholder implementation
        Ok(vantis_types::HealthFactorResult {
            health_factor: 11000,
            total_collateral: 1000_0000000,
            total_liabilities: 900_0000000,
            is_liquidatable: false,
        })
    }

    /// Check if a position needs attention
    pub fn check_position_health(
        env: Env,
        user: Address,
    ) -> Result<(i128, Symbol), RiskError> {
        let params: RiskParameters = env
            .storage()
            .instance()
            .get(&DataKey::RiskParams)
            .unwrap_or_default();

        let health_factor = Self::get_user_health_factor(&env, &user)?;

        let status = if health_factor >= 11000 {
            symbol_short!("healthy")
        } else if health_factor >= params.stop_loss_threshold {
            symbol_short!("warning")
        } else if health_factor >= params.liquidation_threshold {
            symbol_short!("critical")
        } else {
            symbol_short!("liquidate")
        };

        Ok((health_factor, status))
    }

    // ============ View Functions ============

    /// Get admin address
    pub fn admin(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Admin).unwrap()
    }

    /// Get risk parameters
    pub fn get_params(env: Env) -> RiskParameters {
        env.storage()
            .instance()
            .get(&DataKey::RiskParams)
            .unwrap_or_default()
    }

    /// Get user's stop-loss config
    pub fn get_stop_loss_config(env: Env, user: Address) -> Option<UserStopLossConfig> {
        env.storage()
            .persistent()
            .get(&DataKey::StopLoss(user))
    }

    /// Check if address is a whitelisted liquidator
    pub fn is_liquidator(env: Env, address: Address) -> bool {
        let liquidators: Vec<Address> = env
            .storage()
            .instance()
            .get(&DataKey::Liquidators)
            .unwrap_or(Vec::new(&env));

        for l in liquidators.iter() {
            if l == address {
                return true;
            }
        }
        false
    }

    // ============ Internal Functions ============

    fn require_admin(env: &Env, caller: &Address) -> Result<(), RiskError> {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        if *caller != admin {
            return Err(RiskError::Unauthorized);
        }
        Ok(())
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
}

#[cfg(test)]
mod test;
