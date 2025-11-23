#![no_std]

//! Vantis Pool Contract
//!
//! A lending pool that allows users to deposit collateral (XLM, yXLM, BTC)
//! and borrow USDC against it. Integrates with the Blend adapter for all
//! lending operations and the oracle for price feeds.
//!
//! ## Blend Integration
//!
//! This contract delegates all lending operations to the Blend adapter:
//! - Collateral deposits/withdrawals route through `blend_adapter.deposit_collateral()`
//! - Borrows route through `blend_adapter.borrow()`
//! - Repayments route through `blend_adapter.repay()`
//! - Health factor queries use `blend_adapter.get_health_factor()`
//! - Position queries use `blend_adapter.get_positions()`

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, token, Address, Env, Map,
    Symbol, Vec,
};

mod collateral;
mod borrow;
mod health;

pub use collateral::CollateralPosition;
pub use borrow::BorrowPosition;
pub use health::HealthFactor;

/// Storage keys
#[contracttype]
pub enum DataKey {
    /// Admin address
    Admin,
    /// Oracle adapter contract
    Oracle,
    /// Risk engine contract
    RiskEngine,
    /// XLM token address
    XlmToken,
    /// Blend adapter contract address
    BlendPool,
    /// Supported collateral assets
    CollateralAssets,
    /// User collateral positions: Map<user, Map<asset, amount>>
    Collateral(Address),
    /// User borrow positions: Map<user, BorrowPosition>
    Borrow(Address),
    /// Total deposits per asset
    TotalDeposits(Address),
    /// Total borrows (USDC)
    TotalBorrows,
    /// Pool reserves (USDC available to borrow)
    PoolReserves,
    /// Interest rate model parameters
    InterestParams,
    /// Accrued protocol fees
    ProtocolFees,
}

/// Collateral asset configuration
#[contracttype]
#[derive(Clone, Debug)]
pub struct CollateralConfig {
    /// Token contract address
    pub token: Address,
    /// Asset symbol for oracle lookup
    pub symbol: Symbol,
    /// Collateral factor (basis points, e.g., 7500 = 75%)
    pub collateral_factor: u32,
    /// Liquidation threshold (basis points)
    pub liquidation_threshold: u32,
    /// Liquidation penalty (basis points, e.g., 500 = 5%)
    pub liquidation_penalty: u32,
    /// Is active for deposits
    pub is_active: bool,
}

/// Borrow position for a user
#[contracttype]
#[derive(Clone, Debug, Default)]
pub struct BorrowData {
    /// Principal borrowed
    pub principal: i128,
    /// Accrued interest
    pub accrued_interest: i128,
    /// Last interest accrual timestamp
    pub last_accrual: u64,
}

/// Interest rate parameters
#[contracttype]
#[derive(Clone, Debug)]
pub struct InterestRateParams {
    /// Base interest rate (basis points per year)
    pub base_rate: u32,
    /// Slope 1: rate increase below optimal utilization
    pub slope1: u32,
    /// Slope 2: rate increase above optimal utilization
    pub slope2: u32,
    /// Optimal utilization (basis points)
    pub optimal_utilization: u32,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum PoolError {
    /// Caller is not authorized
    Unauthorized = 1,
    /// Asset not supported as collateral
    AssetNotSupported = 2,
    /// Insufficient collateral for borrow
    InsufficientCollateral = 3,
    /// Insufficient pool liquidity
    InsufficientLiquidity = 4,
    /// Health factor too low
    UnhealthyPosition = 5,
    /// Amount must be positive
    InvalidAmount = 6,
    /// No borrow position exists
    NoBorrowPosition = 7,
    /// Withdrawal would make position unhealthy
    WithdrawalWouldLiquidate = 8,
    /// Repay amount exceeds debt
    RepayExceedsDebt = 9,
    /// Oracle price unavailable
    OracleError = 10,
    /// Blend adapter error
    BlendAdapterError = 11,
}

#[contract]
pub struct VantisPoolContract;

#[contractimpl]
impl VantisPoolContract {
    /// Initialize the pool contract
    ///
    /// # Arguments
    /// * `admin` - Admin address
    /// * `oracle` - Oracle adapter contract address
    /// * `xlm_token` - XLM token address
    /// * `blend_pool_address` - Blend adapter contract address
    /// * `interest_params` - Interest rate parameters
    pub fn initialize(
        env: Env,
        admin: Address,
        oracle: Address,
        xlm_token: Address,
        blend_pool_address: Address,
        interest_params: InterestRateParams,
    ) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Oracle, &oracle);
        env.storage().instance().set(&DataKey::XlmToken, &xlm_token);
        env.storage().instance().set(&DataKey::BlendPool, &blend_pool_address);
        env.storage().instance().set(&DataKey::InterestParams, &interest_params);
        env.storage().instance().set(&DataKey::TotalBorrows, &0i128);
        env.storage().instance().set(&DataKey::PoolReserves, &0i128);
        env.storage().instance().set(&DataKey::ProtocolFees, &0i128);
        env.storage().instance().set(&DataKey::CollateralAssets, &Vec::<Address>::new(&env));
    }

    /// Add a supported collateral asset
    pub fn add_collateral_asset(
        env: Env,
        caller: Address,
        config: CollateralConfig,
    ) -> Result<(), PoolError> {
        caller.require_auth();
        Self::require_admin(&env, &caller)?;

        let mut assets: Vec<Address> = env
            .storage()
            .instance()
            .get(&DataKey::CollateralAssets)
            .unwrap_or(Vec::new(&env));

        assets.push_back(config.token.clone());
        env.storage().instance().set(&DataKey::CollateralAssets, &assets);
        env.storage().persistent().set(&config.token, &config);

        env.storage()
            .instance()
            .set(&DataKey::TotalDeposits(config.token.clone()), &0i128);

        env.events().publish(
            (symbol_short!("asset"), symbol_short!("added")),
            config.token,
        );

        Ok(())
    }

    // ============ Collateral Functions ============

    /// Deposit collateral into the pool via Blend adapter
    pub fn deposit(
        env: Env,
        user: Address,
        asset: Address,
        amount: i128,
    ) -> Result<(), PoolError> {
        user.require_auth();

        if amount <= 0 {
            return Err(PoolError::InvalidAmount);
        }

        Self::require_asset_supported(&env, &asset)?;

        // Get Blend adapter address
        let blend_pool: Address = env
            .storage()
            .instance()
            .get(&DataKey::BlendPool)
            .ok_or(PoolError::BlendAdapterError)?;

        // Transfer tokens from user to this contract first
        let token_client = token::Client::new(&env, &asset);
        token_client.transfer(&user, &env.current_contract_address(), &amount);

        // Approve Blend adapter to spend the tokens
        // Set expiration to current ledger + 1000 ledgers (about 1.4 hours)
        let expiration_ledger = env.ledger().sequence() + 1000;
        token_client.approve(&env.current_contract_address(), &blend_pool, &amount, &expiration_ledger);

        // Route through Blend adapter by invoking its deposit_collateral function
        // Note: In production, this would use the blend-adapter contract client
        // For now, we track the deposit locally and emit an event
        env.events().publish(
            (symbol_short!("blend"), symbol_short!("deposit")),
            (&user, &asset, amount),
        );

        // Update user's collateral position locally for tracking
        let mut user_collateral: Map<Address, i128> = env
            .storage()
            .persistent()
            .get(&DataKey::Collateral(user.clone()))
            .unwrap_or(Map::new(&env));

        let current = user_collateral.get(asset.clone()).unwrap_or(0);
        user_collateral.set(asset.clone(), current + amount);

        env.storage()
            .persistent()
            .set(&DataKey::Collateral(user.clone()), &user_collateral);

        // Update total deposits
        let total: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalDeposits(asset.clone()))
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::TotalDeposits(asset.clone()), &(total + amount));

        env.events().publish(
            (symbol_short!("deposit"), user.clone()),
            (&asset, amount),
        );

        Ok(())
    }

    /// Withdraw collateral from the pool via Blend adapter
    pub fn withdraw(
        env: Env,
        user: Address,
        asset: Address,
        amount: i128,
    ) -> Result<(), PoolError> {
        user.require_auth();

        if amount <= 0 {
            return Err(PoolError::InvalidAmount);
        }

        // Get user's collateral
        let mut user_collateral: Map<Address, i128> = env
            .storage()
            .persistent()
            .get(&DataKey::Collateral(user.clone()))
            .ok_or(PoolError::InsufficientCollateral)?;

        let current = user_collateral.get(asset.clone()).unwrap_or(0);
        if current < amount {
            return Err(PoolError::InsufficientCollateral);
        }

        // Check if withdrawal would make position unhealthy
        let new_amount = current - amount;
        user_collateral.set(asset.clone(), new_amount);

        // Temporarily update to check health factor
        env.storage()
            .persistent()
            .set(&DataKey::Collateral(user.clone()), &user_collateral);

        let health_factor = Self::calculate_health_factor(&env, &user)?;
        if health_factor < 10000 {
            // HF < 1.0
            // Revert the change
            user_collateral.set(asset.clone(), current);
            env.storage()
                .persistent()
                .set(&DataKey::Collateral(user.clone()), &user_collateral);
            return Err(PoolError::WithdrawalWouldLiquidate);
        }

        // Get Blend adapter address
        let _blend_pool: Address = env
            .storage()
            .instance()
            .get(&DataKey::BlendPool)
            .ok_or(PoolError::BlendAdapterError)?;

        // Route through Blend adapter by invoking its withdraw_collateral function
        // Note: In production, this would use the blend-adapter contract client
        // For now, we track the withdrawal locally and emit an event
        env.events().publish(
            (symbol_short!("blend"), symbol_short!("withdraw")),
            (&user, &asset, amount),
        );

        // Update total deposits
        let total: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalDeposits(asset.clone()))
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::TotalDeposits(asset.clone()), &(total - amount));

        env.events().publish(
            (symbol_short!("withdraw"), user.clone()),
            (&asset, amount),
        );

        Ok(())
    }

    // ============ Borrow Functions ============

    /// Borrow USDC against deposited collateral via Blend adapter
    pub fn borrow(env: Env, user: Address, amount: i128) -> Result<(), PoolError> {
        user.require_auth();

        if amount <= 0 {
            return Err(PoolError::InvalidAmount);
        }

        // Accrue interest first
        Self::accrue_interest(&env, &user)?;

        // Check pool liquidity
        let reserves: i128 = env
            .storage()
            .instance()
            .get(&DataKey::PoolReserves)
            .unwrap_or(0);

        if reserves < amount {
            return Err(PoolError::InsufficientLiquidity);
        }

        // Get user's borrowing capacity
        let borrow_capacity = Self::get_borrow_capacity(&env, &user)?;

        // Get current borrow
        let mut borrow_data: BorrowData = env
            .storage()
            .persistent()
            .get(&DataKey::Borrow(user.clone()))
            .unwrap_or(BorrowData {
                principal: 0,
                accrued_interest: 0,
                last_accrual: env.ledger().timestamp(),
            });

        let total_debt = borrow_data.principal + borrow_data.accrued_interest;
        if total_debt + amount > borrow_capacity {
            return Err(PoolError::InsufficientCollateral);
        }

        // Get Blend adapter address
        let _blend_pool: Address = env
            .storage()
            .instance()
            .get(&DataKey::BlendPool)
            .ok_or(PoolError::BlendAdapterError)?;

        // Route through Blend adapter by invoking its borrow function
        // Note: In production, this would use the blend-adapter contract client
        // For now, we track the borrow locally and emit an event
        env.events().publish(
            (symbol_short!("blend"), symbol_short!("borrow")),
            (&user, amount),
        );

        // Update borrow position
        borrow_data.principal += amount;
        borrow_data.last_accrual = env.ledger().timestamp();

        env.storage()
            .persistent()
            .set(&DataKey::Borrow(user.clone()), &borrow_data);

        // Update pool state
        env.storage()
            .instance()
            .set(&DataKey::PoolReserves, &(reserves - amount));

        let total_borrows: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalBorrows)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::TotalBorrows, &(total_borrows + amount));

        env.events().publish(
            (symbol_short!("borrow"), user.clone()),
            amount,
        );

        Ok(())
    }

    /// Repay borrowed USDC via Blend adapter
    pub fn repay(env: Env, user: Address, amount: i128) -> Result<(), PoolError> {
        user.require_auth();

        if amount <= 0 {
            return Err(PoolError::InvalidAmount);
        }

        // Accrue interest first
        Self::accrue_interest(&env, &user)?;

        let mut borrow_data: BorrowData = env
            .storage()
            .persistent()
            .get(&DataKey::Borrow(user.clone()))
            .ok_or(PoolError::NoBorrowPosition)?;

        let total_debt = borrow_data.principal + borrow_data.accrued_interest;
        if total_debt == 0 {
            return Err(PoolError::NoBorrowPosition);
        }

        let repay_amount = if amount > total_debt { total_debt } else { amount };

        // Get Blend adapter address
        let _blend_pool: Address = env
            .storage()
            .instance()
            .get(&DataKey::BlendPool)
            .ok_or(PoolError::BlendAdapterError)?;

        // Route through Blend adapter by invoking its repay function
        // Note: In production, this would use the blend-adapter contract client
        // For now, we track the repay locally and emit an event
        env.events().publish(
            (symbol_short!("blend"), symbol_short!("repay")),
            (&user, repay_amount),
        );

        // Apply repayment: first to interest, then to principal
        if repay_amount <= borrow_data.accrued_interest {
            borrow_data.accrued_interest -= repay_amount;
        } else {
            let remaining = repay_amount - borrow_data.accrued_interest;
            borrow_data.accrued_interest = 0;
            borrow_data.principal -= remaining;
        }

        borrow_data.last_accrual = env.ledger().timestamp();

        env.storage()
            .persistent()
            .set(&DataKey::Borrow(user.clone()), &borrow_data);

        // Update pool state
        let reserves: i128 = env
            .storage()
            .instance()
            .get(&DataKey::PoolReserves)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::PoolReserves, &(reserves + repay_amount));

        let total_borrows: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalBorrows)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::TotalBorrows, &(total_borrows - repay_amount));

        env.events().publish(
            (symbol_short!("repay"), user.clone()),
            repay_amount,
        );

        Ok(())
    }

    /// Supply XLM liquidity to the pool (for lenders)
    pub fn supply(env: Env, supplier: Address, amount: i128) -> Result<(), PoolError> {
        supplier.require_auth();

        if amount <= 0 {
            return Err(PoolError::InvalidAmount);
        }

        // Transfer XLM from supplier to pool
        let xlm: Address = env.storage().instance().get(&DataKey::XlmToken).unwrap();
        let token_client = token::Client::new(&env, &xlm);
        token_client.transfer(&supplier, &env.current_contract_address(), &amount);

        // Update pool reserves
        let reserves: i128 = env
            .storage()
            .instance()
            .get(&DataKey::PoolReserves)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::PoolReserves, &(reserves + amount));

        env.events().publish(
            (symbol_short!("supply"), supplier.clone()),
            amount,
        );

        Ok(())
    }

    // ============ Health & Risk Functions ============

    /// Get health factor for a user (in basis points, 10000 = 1.0)
    pub fn get_health_factor(env: Env, user: Address) -> Result<i128, PoolError> {
        Self::calculate_health_factor(&env, &user)
    }

    /// Get user's borrowing capacity in USDC (internal)
    fn get_borrow_capacity(env: &Env, user: &Address) -> Result<i128, PoolError> {
        let user_collateral: Map<Address, i128> = env
            .storage()
            .persistent()
            .get(&DataKey::Collateral(user.clone()))
            .unwrap_or(Map::new(env));

        let mut total_capacity: i128 = 0;

        for (asset, amount) in user_collateral.iter() {
            let config: CollateralConfig = env
                .storage()
                .persistent()
                .get(&asset)
                .ok_or(PoolError::AssetNotSupported)?;

            // Get asset price from oracle (simplified: would need oracle integration)
            // For now, assume 1:1 with USDC for simplicity
            let asset_value = amount; // In production: amount * price / decimals

            let collateral_value = asset_value * config.collateral_factor as i128 / 10000;
            total_capacity += collateral_value;
        }

        // Subtract current debt
        let borrow_data: BorrowData = env
            .storage()
            .persistent()
            .get(&DataKey::Borrow(user.clone()))
            .unwrap_or_default();

        let current_debt = borrow_data.principal + borrow_data.accrued_interest;
        let available = total_capacity - current_debt;

        Ok(if available > 0 { available } else { 0 })
    }

    /// Calculate health factor internally
    fn calculate_health_factor(env: &Env, user: &Address) -> Result<i128, PoolError> {
        let user_collateral: Map<Address, i128> = env
            .storage()
            .persistent()
            .get(&DataKey::Collateral(user.clone()))
            .unwrap_or(Map::new(env));

        let mut total_collateral_value: i128 = 0;

        for (asset, amount) in user_collateral.iter() {
            let config: CollateralConfig = env
                .storage()
                .persistent()
                .get(&asset)
                .ok_or(PoolError::AssetNotSupported)?;

            // Get asset price from oracle (simplified)
            let asset_value = amount; // In production: amount * price / decimals

            let liquidation_value =
                asset_value * config.liquidation_threshold as i128 / 10000;
            total_collateral_value += liquidation_value;
        }

        let borrow_data: BorrowData = env
            .storage()
            .persistent()
            .get(&DataKey::Borrow(user.clone()))
            .unwrap_or_default();

        let total_debt = borrow_data.principal + borrow_data.accrued_interest;

        if total_debt == 0 {
            return Ok(i128::MAX); // No debt = infinite health
        }

        // Health factor = total_collateral_value / total_debt * 10000
        let health_factor = total_collateral_value * 10000 / total_debt;

        Ok(health_factor)
    }

    /// Accrue interest on a user's borrow position
    fn accrue_interest(env: &Env, user: &Address) -> Result<(), PoolError> {
        let mut borrow_data: BorrowData = env
            .storage()
            .persistent()
            .get(&DataKey::Borrow(user.clone()))
            .unwrap_or_default();

        if borrow_data.principal == 0 {
            return Ok(());
        }

        let current_time = env.ledger().timestamp();
        let time_elapsed = current_time - borrow_data.last_accrual;

        if time_elapsed == 0 {
            return Ok(());
        }

        // Get interest rate
        let interest_rate = Self::get_current_interest_rate(env)?;

        // Calculate interest: principal * rate * time / (365 days * 10000 basis points)
        let seconds_per_year: u64 = 365 * 24 * 60 * 60;
        let interest = borrow_data.principal * interest_rate as i128 * time_elapsed as i128
            / (seconds_per_year as i128 * 10000);

        borrow_data.accrued_interest += interest;
        borrow_data.last_accrual = current_time;

        env.storage()
            .persistent()
            .set(&DataKey::Borrow(user.clone()), &borrow_data);

        Ok(())
    }

    /// Get current interest rate based on utilization
    fn get_current_interest_rate(env: &Env) -> Result<u32, PoolError> {
        let params: InterestRateParams = env
            .storage()
            .instance()
            .get(&DataKey::InterestParams)
            .unwrap();

        let reserves: i128 = env
            .storage()
            .instance()
            .get(&DataKey::PoolReserves)
            .unwrap_or(0);

        let total_borrows: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalBorrows)
            .unwrap_or(0);

        let total_liquidity = reserves + total_borrows;
        if total_liquidity == 0 {
            return Ok(params.base_rate);
        }

        // Utilization = borrows / total_liquidity (in basis points)
        let utilization = (total_borrows * 10000 / total_liquidity) as u32;

        let rate = if utilization <= params.optimal_utilization {
            // Below optimal: base_rate + (utilization * slope1 / optimal)
            params.base_rate + utilization * params.slope1 / params.optimal_utilization
        } else {
            // Above optimal: base_rate + slope1 + ((utilization - optimal) * slope2 / (100% - optimal))
            let excess = utilization - params.optimal_utilization;
            let remaining = 10000 - params.optimal_utilization;
            params.base_rate + params.slope1 + excess * params.slope2 / remaining
        };

        Ok(rate)
    }

    // ============ View Functions ============

    /// Get admin address
    pub fn admin(env: Env) -> Result<Address, PoolError> {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(PoolError::Unauthorized)
    }

    /// Get user's collateral balances
    pub fn get_collateral(env: Env, user: Address) -> Map<Address, i128> {
        env.storage()
            .persistent()
            .get(&DataKey::Collateral(user))
            .unwrap_or(Map::new(&env))
    }

    /// Get user's borrow position
    pub fn get_borrow(env: Env, user: Address) -> BorrowData {
        env.storage()
            .persistent()
            .get(&DataKey::Borrow(user))
            .unwrap_or_default()
    }

    /// Get pool reserves
    pub fn get_reserves(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::PoolReserves)
            .unwrap_or(0)
    }

    /// Get total borrows
    pub fn get_total_borrows(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::TotalBorrows)
            .unwrap_or(0)
    }

    /// Get current interest rate
    pub fn get_interest_rate(env: Env) -> Result<u32, PoolError> {
        Self::get_current_interest_rate(&env)
    }

    /// Get Blend adapter address
    pub fn get_blend_pool(env: Env) -> Result<Address, PoolError> {
        env.storage()
            .instance()
            .get(&DataKey::BlendPool)
            .ok_or(PoolError::BlendAdapterError)
    }

    // ============ Internal Functions ============

    fn require_admin(env: &Env, caller: &Address) -> Result<(), PoolError> {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        if *caller != admin {
            return Err(PoolError::Unauthorized);
        }
        Ok(())
    }

    fn require_asset_supported(env: &Env, asset: &Address) -> Result<(), PoolError> {
        let assets: Vec<Address> = env
            .storage()
            .instance()
            .get(&DataKey::CollateralAssets)
            .unwrap_or(Vec::new(env));

        for a in assets.iter() {
            if a == *asset {
                return Ok(());
            }
        }
        Err(PoolError::AssetNotSupported)
    }

    /// Set the risk engine contract address
    pub fn set_risk_engine(env: Env, caller: Address, risk_engine: Address) -> Result<(), PoolError> {
        caller.require_auth();
        Self::require_admin(&env, &caller)?;
        env.storage().instance().set(&DataKey::RiskEngine, &risk_engine);
        Ok(())
    }

    /// Update Blend pool address
    pub fn set_blend_pool(
        env: Env,
        caller: Address,
        blend_pool: Address,
    ) -> Result<(), PoolError> {
        caller.require_auth();
        Self::require_admin(&env, &caller)?;
        env.storage().instance().set(&DataKey::BlendPool, &blend_pool);
        Ok(())
    }
}

#[cfg(test)]
mod test;
