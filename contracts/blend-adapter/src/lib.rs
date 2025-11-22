#![no_std]

//! Blend Adapter Contract
//!
//! This contract provides an interface between the Vantis protocol and
//! Blend Protocol lending pools. It handles:
//! - Depositing collateral into Blend pools
//! - Borrowing assets from Blend pools
//! - Repaying loans
//! - Querying positions and health factors
//!
//! The adapter abstracts away the complexity of Blend's request-based
//! interface and provides a simpler API for Vantis operations.

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, token, Address, Env, Vec,
};

// Re-export types from the shared types crate
pub use vantis_types::{
    AuctionData, HealthFactorResult, PoolConfig, Positions, Request, RequestType, ReserveConfig,
    ReserveData,
};

/// Storage keys for the adapter
#[contracttype]
pub enum DataKey {
    /// Admin address
    Admin,
    /// Blend pool contract address
    BlendPool,
    /// Oracle contract for price feeds
    Oracle,
    /// USDC token address (primary borrow asset)
    UsdcToken,
    /// Supported collateral assets mapping: asset -> reserve index
    AssetIndex(Address),
    /// Cached reserve configs
    ReserveConfig(Address),
}

/// Adapter errors
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum AdapterError {
    /// Caller is not authorized
    Unauthorized = 1,
    /// Asset is not supported
    AssetNotSupported = 2,
    /// Blend pool not configured
    PoolNotConfigured = 3,
    /// Invalid amount
    InvalidAmount = 4,
    /// Blend operation failed
    BlendOperationFailed = 5,
    /// Insufficient balance
    InsufficientBalance = 6,
    /// Position would be unhealthy
    UnhealthyPosition = 7,
    /// Already initialized
    AlreadyInitialized = 8,
}

#[contract]
pub struct BlendAdapterContract;

#[contractimpl]
impl BlendAdapterContract {
    /// Initialize the Blend adapter
    ///
    /// # Arguments
    /// * `admin` - Admin address for the adapter
    /// * `blend_pool` - Address of the Blend pool to interact with
    /// * `oracle` - Oracle contract for price feeds
    /// * `usdc_token` - USDC token address for borrowing
    pub fn initialize(
        env: Env,
        admin: Address,
        blend_pool: Address,
        oracle: Address,
        usdc_token: Address,
    ) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::BlendPool, &blend_pool);
        env.storage().instance().set(&DataKey::Oracle, &oracle);
        env.storage().instance().set(&DataKey::UsdcToken, &usdc_token);
    }

    /// Register a supported collateral asset
    ///
    /// # Arguments
    /// * `caller` - Must be admin
    /// * `asset` - Asset token address
    /// * `reserve_index` - Index of the asset in the Blend pool
    pub fn register_asset(
        env: Env,
        caller: Address,
        asset: Address,
        reserve_index: u32,
    ) -> Result<(), AdapterError> {
        caller.require_auth();
        Self::require_admin(&env, &caller)?;

        env.storage()
            .persistent()
            .set(&DataKey::AssetIndex(asset.clone()), &reserve_index);

        env.events().publish(
            (symbol_short!("asset"), symbol_short!("register")),
            (&asset, reserve_index),
        );

        Ok(())
    }

    // ============ Collateral Operations ============

    /// Deposit collateral into the Blend pool
    ///
    /// This transfers the asset from the user to this contract, then
    /// submits a SupplyCollateral request to the Blend pool.
    ///
    /// # Arguments
    /// * `user` - User depositing collateral
    /// * `asset` - Collateral asset address
    /// * `amount` - Amount to deposit
    pub fn deposit_collateral(
        env: Env,
        user: Address,
        asset: Address,
        amount: i128,
    ) -> Result<(), AdapterError> {
        user.require_auth();

        if amount <= 0 {
            return Err(AdapterError::InvalidAmount);
        }

        Self::require_asset_supported(&env, &asset)?;
        let blend_pool = Self::get_blend_pool(&env)?;

        // Transfer asset from user to this contract
        let token_client = token::Client::new(&env, &asset);
        token_client.transfer(&user, &env.current_contract_address(), &amount);

        // Approve Blend pool to spend the tokens
        token_client.approve(&env.current_contract_address(), &blend_pool, &amount, &1000000);

        // Build and submit the request to Blend
        let request = Request {
            request_type: RequestType::SupplyCollateral,
            address: asset.clone(),
            amount,
        };

        let requests = Vec::from_array(&env, [request]);
        Self::submit_to_blend(&env, &user, &user, &requests)?;

        env.events().publish(
            (symbol_short!("deposit"), symbol_short!("collat")),
            (&user, &asset, amount),
        );

        Ok(())
    }

    /// Withdraw collateral from the Blend pool
    ///
    /// # Arguments
    /// * `user` - User withdrawing collateral
    /// * `asset` - Collateral asset address
    /// * `amount` - Amount to withdraw
    pub fn withdraw_collateral(
        env: Env,
        user: Address,
        asset: Address,
        amount: i128,
    ) -> Result<(), AdapterError> {
        user.require_auth();

        if amount <= 0 {
            return Err(AdapterError::InvalidAmount);
        }

        Self::require_asset_supported(&env, &asset)?;

        // Build and submit the request to Blend
        let request = Request {
            request_type: RequestType::WithdrawCollateral,
            address: asset.clone(),
            amount,
        };

        let requests = Vec::from_array(&env, [request]);
        Self::submit_to_blend(&env, &user, &user, &requests)?;

        env.events().publish(
            (symbol_short!("withdraw"), symbol_short!("collat")),
            (&user, &asset, amount),
        );

        Ok(())
    }

    // ============ Borrow Operations ============

    /// Borrow USDC from the Blend pool
    ///
    /// # Arguments
    /// * `user` - User borrowing
    /// * `amount` - Amount of USDC to borrow
    pub fn borrow(env: Env, user: Address, amount: i128) -> Result<(), AdapterError> {
        user.require_auth();

        if amount <= 0 {
            return Err(AdapterError::InvalidAmount);
        }

        let usdc = Self::get_usdc(&env)?;

        // Build and submit the request to Blend
        let request = Request {
            request_type: RequestType::Borrow,
            address: usdc.clone(),
            amount,
        };

        let requests = Vec::from_array(&env, [request]);
        Self::submit_to_blend(&env, &user, &user, &requests)?;

        env.events()
            .publish((symbol_short!("borrow"), user.clone()), amount);

        Ok(())
    }

    /// Repay borrowed USDC to the Blend pool
    ///
    /// # Arguments
    /// * `user` - User repaying
    /// * `amount` - Amount of USDC to repay
    pub fn repay(env: Env, user: Address, amount: i128) -> Result<(), AdapterError> {
        user.require_auth();

        if amount <= 0 {
            return Err(AdapterError::InvalidAmount);
        }

        let usdc = Self::get_usdc(&env)?;
        let blend_pool = Self::get_blend_pool(&env)?;

        // Transfer USDC from user to this contract
        let token_client = token::Client::new(&env, &usdc);
        token_client.transfer(&user, &env.current_contract_address(), &amount);

        // Approve Blend pool to spend the tokens
        token_client.approve(&env.current_contract_address(), &blend_pool, &amount, &1000000);

        // Build and submit the request to Blend
        let request = Request {
            request_type: RequestType::Repay,
            address: usdc.clone(),
            amount,
        };

        let requests = Vec::from_array(&env, [request]);
        Self::submit_to_blend(&env, &user, &user, &requests)?;

        env.events()
            .publish((symbol_short!("repay"), user.clone()), amount);

        Ok(())
    }

    // ============ Multi-Operation Submit ============

    /// Submit multiple operations to Blend in a single transaction
    ///
    /// This is useful for atomic operations like:
    /// - Deposit collateral + Borrow
    /// - Repay + Withdraw collateral
    ///
    /// # Arguments
    /// * `user` - User performing operations
    /// * `requests` - Vector of requests to submit
    pub fn submit(
        env: Env,
        user: Address,
        requests: Vec<Request>,
    ) -> Result<(), AdapterError> {
        user.require_auth();

        Self::submit_to_blend(&env, &user, &user, &requests)?;

        env.events().publish(
            (symbol_short!("submit"), user.clone()),
            requests.len(),
        );

        Ok(())
    }

    // ============ View Functions ============

    /// Get user's positions in the Blend pool
    ///
    /// Returns collateral, liabilities (borrows), and supply positions
    pub fn get_positions(env: Env, _user: Address) -> Result<Positions, AdapterError> {
        let _blend_pool = Self::get_blend_pool(&env)?;

        // In production, this would call blend_pool.get_positions(user)
        // For now, return empty positions as placeholder
        Ok(Positions {
            collateral: Vec::new(&env),
            liabilities: Vec::new(&env),
            supply: Vec::new(&env),
        })
    }

    /// Calculate health factor for a user
    ///
    /// Health factor = (collateral value * collateral factor) / liability value
    /// Returns value in basis points (10000 = 1.0)
    pub fn get_health_factor(env: Env, user: Address) -> Result<HealthFactorResult, AdapterError> {
        let _positions = Self::get_positions(env.clone(), user)?;

        // In production, this would:
        // 1. Get prices from oracle for each asset
        // 2. Get collateral factors from reserve configs
        // 3. Calculate weighted collateral value
        // 4. Calculate total liability value
        // 5. Compute health factor

        // Placeholder calculation
        let total_collateral: i128 = 0;
        let total_liabilities: i128 = 0;

        let health_factor = if total_liabilities == 0 {
            i128::MAX
        } else {
            total_collateral * 10000 / total_liabilities
        };

        Ok(HealthFactorResult {
            health_factor,
            total_collateral,
            total_liabilities,
            is_liquidatable: health_factor < 10000 && total_liabilities > 0,
        })
    }

    /// Get Blend pool configuration
    pub fn get_pool_config(env: Env) -> Result<PoolConfig, AdapterError> {
        let _blend_pool = Self::get_blend_pool(&env)?;

        // In production, call blend_pool.get_config()
        // Placeholder return
        Ok(PoolConfig {
            oracle: env
                .storage()
                .instance()
                .get(&DataKey::Oracle)
                .unwrap_or(env.current_contract_address()),
            bstop_rate: 100,
            status: 0,
            max_positions: 10,
        })
    }

    /// Get reserve data for an asset
    pub fn get_reserve(env: Env, asset: Address) -> Result<ReserveData, AdapterError> {
        Self::require_asset_supported(&env, &asset)?;
        let _blend_pool = Self::get_blend_pool(&env)?;

        // In production, call blend_pool.get_reserve(asset)
        // Placeholder return
        Ok(ReserveData {
            b_rate: 1_0000000,  // 1.0 scaled
            d_rate: 1_0000000,
            ir_mod: 1_0000000,
            b_supply: 0,
            d_supply: 0,
            backstop_credit: 0,
            last_time: env.ledger().timestamp(),
        })
    }

    /// Get list of reserve addresses in the Blend pool
    pub fn get_reserve_list(env: Env) -> Result<Vec<Address>, AdapterError> {
        let _blend_pool = Self::get_blend_pool(&env)?;

        // In production, call blend_pool.get_reserve_list()
        Ok(Vec::new(&env))
    }

    // ============ Admin Functions ============

    /// Get admin address
    pub fn admin(env: Env) -> Result<Address, AdapterError> {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(AdapterError::Unauthorized)
    }

    /// Get Blend pool address
    pub fn blend_pool(env: Env) -> Result<Address, AdapterError> {
        Self::get_blend_pool(&env)
    }

    /// Update Blend pool address
    pub fn set_blend_pool(
        env: Env,
        caller: Address,
        blend_pool: Address,
    ) -> Result<(), AdapterError> {
        caller.require_auth();
        Self::require_admin(&env, &caller)?;

        env.storage().instance().set(&DataKey::BlendPool, &blend_pool);
        Ok(())
    }

    // ============ Internal Functions ============

    fn require_admin(env: &Env, caller: &Address) -> Result<(), AdapterError> {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        if *caller != admin {
            return Err(AdapterError::Unauthorized);
        }
        Ok(())
    }

    fn require_asset_supported(env: &Env, asset: &Address) -> Result<(), AdapterError> {
        if !env
            .storage()
            .persistent()
            .has(&DataKey::AssetIndex(asset.clone()))
        {
            return Err(AdapterError::AssetNotSupported);
        }
        Ok(())
    }

    fn get_blend_pool(env: &Env) -> Result<Address, AdapterError> {
        env.storage()
            .instance()
            .get(&DataKey::BlendPool)
            .ok_or(AdapterError::PoolNotConfigured)
    }

    fn get_usdc(env: &Env) -> Result<Address, AdapterError> {
        env.storage()
            .instance()
            .get(&DataKey::UsdcToken)
            .ok_or(AdapterError::PoolNotConfigured)
    }

    /// Submit requests to the Blend pool
    ///
    /// In production, this calls the Blend pool's submit function:
    /// `blend_pool.submit(from, spender, to, requests)`
    fn submit_to_blend(
        env: &Env,
        from: &Address,
        to: &Address,
        requests: &Vec<Request>,
    ) -> Result<(), AdapterError> {
        let _blend_pool = Self::get_blend_pool(env)?;

        // In production, this would use the Blend SDK:
        // ```
        // use blend_contract_sdk::pool;
        // let pool_client = pool::Client::new(env, &blend_pool);
        // pool_client.submit(from, &env.current_contract_address(), to, requests);
        // ```

        // For now, emit an event indicating the submission
        env.events().publish(
            (symbol_short!("blend"), symbol_short!("submit")),
            (from, to, requests.len()),
        );

        Ok(())
    }
}

#[cfg(test)]
mod test;
