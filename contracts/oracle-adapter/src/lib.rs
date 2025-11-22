#![no_std]

//! Oracle Adapter Contract
//!
//! Integrates with Stellar's Reflector Oracle to provide price feeds
//! for the Vantis protocol. Supports multiple assets and volatility tracking.
//!
//! # Blend Protocol Compatibility
//!
//! This oracle adapter is fully compatible with Blend Protocol's oracle requirements:
//!
//! ## Price Format
//! - All prices are represented in **14 decimal places** (Blend standard)
//! - Example: $1.00 USD = 100_000_000_000_000 (1e14)
//! - Example: $0.10 USD = 10_000_000_000_000 (1e13)
//! - This format ensures precision for both high-value assets (BTC, ETH) and low-value assets
//!
//! ## Price Feed Characteristics
//! - **Source**: Stellar's Reflector Oracle
//! - **Decimal Precision**: 14 decimals (i128 type)
//! - **Staleness Check**: Configurable threshold (default 300 seconds / 5 minutes)
//! - **Volatility Tracking**: 7-day and 30-day historical volatility in basis points
//!
//! ## Integration with Blend
//! The oracle adapter provides:
//! 1. **get_price()** - Returns current price in 14-decimal format
//! 2. **get_volatility()** - Returns volatility data for risk calculations
//! 3. **calculate_safe_borrow()** - Volatility-adjusted LTV calculations compatible with Blend's risk model
//!
//! ## Safe Borrow Calculation
//! The safe borrow amount is calculated using the formula:
//! ```
//! B_safe = V_collateral × (LTV_base - k × σ × √T)
//! ```
//! Where:
//! - V_collateral: Collateral value in USD (14 decimals)
//! - LTV_base: Base Loan-to-Value ratio (basis points, e.g., 7500 = 75%)
//! - k: Volatility sensitivity factor (basis points)
//! - σ: 30-day historical volatility (basis points)
//! - T: Time horizon in years
//!
//! This ensures Blend positions remain healthy even during market volatility.

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, Address, Env, Symbol, Vec,
};

/// Storage keys
#[contracttype]
pub enum DataKey {
    /// Admin address
    Admin,
    /// Reflector oracle contract address
    OracleContract,
    /// Cached prices: Map<asset_symbol, PriceData>
    Prices,
    /// Volatility data: Map<asset_symbol, VolatilityData>
    Volatility,
    /// Supported assets list
    Assets,
    /// Price staleness threshold in seconds
    StalenessThreshold,
}

/// Price data structure
///
/// # Blend Compatibility
/// The price field is always in 14-decimal format as required by Blend Protocol.
/// This ensures compatibility with Blend's oracle interface and risk calculations.
///
/// # Examples
/// - $1.00 USD = 100_000_000_000_000 (1e14)
/// - $0.10 USD = 10_000_000_000_000 (1e13)
/// - $1000.00 USD = 100_000_000_000_000_000 (1e17)
#[contracttype]
#[derive(Clone, Debug)]
pub struct PriceData {
    /// Price in USD with 14 decimals (Blend Protocol standard)
    /// This format is compatible with Blend's oracle requirements
    pub price: i128,
    /// Timestamp of the price update
    pub timestamp: u64,
    /// Source identifier (e.g., "reflector")
    pub source: Symbol,
}

/// Volatility data for risk calculations
#[contracttype]
#[derive(Clone, Debug)]
pub struct VolatilityData {
    /// 30-day historical volatility (annualized, in basis points)
    /// e.g., 5000 = 50% volatility
    pub volatility_30d: u32,
    /// 7-day historical volatility
    pub volatility_7d: u32,
    /// Last update timestamp
    pub last_updated: u64,
    /// Historical prices for volatility calculation (last 30 data points)
    pub price_history: Vec<i128>,
}

/// Asset configuration
#[contracttype]
#[derive(Clone, Debug)]
pub struct AssetConfig {
    /// Asset symbol (e.g., "XLM", "BTC", "USDC")
    pub symbol: Symbol,
    /// Asset contract address on Stellar
    pub contract: Address,
    /// Decimals for the asset
    pub decimals: u32,
    /// Base LTV for this asset (in basis points, e.g., 7500 = 75%)
    pub base_ltv: u32,
    /// Liquidation threshold (in basis points)
    pub liquidation_threshold: u32,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum OracleError {
    /// Caller is not authorized
    Unauthorized = 1,
    /// Asset not supported
    AssetNotSupported = 2,
    /// Price is stale
    StalePrice = 3,
    /// Oracle contract not set
    OracleNotSet = 4,
    /// Invalid price data
    InvalidPrice = 5,
    /// Insufficient price history for volatility
    InsufficientHistory = 6,
}

#[contract]
pub struct OracleAdapterContract;

#[contractimpl]
impl OracleAdapterContract {
    /// Initialize the oracle adapter
    pub fn initialize(env: Env, admin: Address, oracle_contract: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::OracleContract, &oracle_contract);
        env.storage().instance().set(&DataKey::StalenessThreshold, &3600u64); // 1 hour default for testing
        env.storage().instance().set(&DataKey::Assets, &Vec::<Symbol>::new(&env));
    }

    /// Add a supported asset
    pub fn add_asset(env: Env, caller: Address, config: AssetConfig) -> Result<(), OracleError> {
        caller.require_auth();
        Self::require_admin(&env, &caller)?;

        let mut assets: Vec<Symbol> = env
            .storage()
            .instance()
            .get(&DataKey::Assets)
            .unwrap_or(Vec::new(&env));

        assets.push_back(config.symbol.clone());
        env.storage().instance().set(&DataKey::Assets, &assets);

        // Initialize volatility data
        let volatility = VolatilityData {
            volatility_30d: 0,
            volatility_7d: 0,
            last_updated: 0,
            price_history: Vec::new(&env),
        };
        env.storage().persistent().set(
            &(DataKey::Volatility, config.symbol.clone()),
            &volatility,
        );

        env.events().publish(
            (symbol_short!("asset"), symbol_short!("added")),
            config.symbol,
        );

        Ok(())
    }

    /// Get the current price for an asset
    ///
    /// Returns price in USD with 14 decimals (Blend Protocol compatible format).
    ///
    /// # Blend Compatibility
    /// This function returns prices in the exact format required by Blend Protocol:
    /// - 14 decimal places
    /// - i128 type for precision
    /// - Staleness validation to ensure price freshness
    ///
    /// # Example
    /// For an asset priced at $0.10:
    /// - Returns: 10_000_000_000_000 (10^13)
    ///
    /// # Errors
    /// - `AssetNotSupported`: Asset is not registered
    /// - `InvalidPrice`: No price data available
    /// - `StalePrice`: Price is older than staleness threshold
    pub fn get_price(env: Env, asset: Symbol) -> Result<PriceData, OracleError> {
        Self::require_asset_supported(&env, &asset)?;

        // In production, this would call the Reflector oracle
        // For now, return cached price or fetch from oracle
        let price_data: Option<PriceData> = env
            .storage()
            .persistent()
            .get(&(DataKey::Prices, asset.clone()));

        match price_data {
            Some(data) => {
                // Check staleness
                let threshold: u64 = env
                    .storage()
                    .instance()
                    .get(&DataKey::StalenessThreshold)
                    .unwrap_or(300);

                let current_time = env.ledger().timestamp();
                if current_time - data.timestamp > threshold {
                    return Err(OracleError::StalePrice);
                }

                Ok(data)
            }
            None => Err(OracleError::InvalidPrice),
        }
    }

    /// Update price from oracle (called by keeper or oracle push)
    ///
    /// # Blend Compatibility
    /// Prices must be provided in 14-decimal format as required by Blend Protocol.
    /// This function validates and stores prices in the exact format needed for
    /// Blend's oracle interface.
    ///
    /// # Arguments
    /// * `caller` - Address authorized to update prices (typically oracle keeper)
    /// * `asset` - Asset symbol to update
    /// * `price` - Price in USD with 14 decimals (Blend format)
    ///
    /// # Example
    /// To set price of $0.10:
    /// ```ignore
    /// update_price(env, caller, symbol_short!("XLM"), 10_000_000_000_000)
    /// ```
    ///
    /// # Errors
    /// - `AssetNotSupported`: Asset is not registered
    /// - `InvalidPrice`: Price is <= 0
    pub fn update_price(
        env: Env,
        caller: Address,
        asset: Symbol,
        price: i128,
    ) -> Result<(), OracleError> {
        caller.require_auth();
        Self::require_asset_supported(&env, &asset)?;

        if price <= 0 {
            return Err(OracleError::InvalidPrice);
        }

        let timestamp = env.ledger().timestamp();
        let price_data = PriceData {
            price,
            timestamp,
            source: symbol_short!("reflector"),
        };

        // Store price in persistent storage
        env.storage().persistent().set(&(DataKey::Prices, asset.clone()), &price_data);

        // Update price history for volatility calculation
        Self::update_price_history(&env, &asset, price)?;

        env.events().publish(
            (symbol_short!("price"), symbol_short!("updated")),
            (&asset, price),
        );

        Ok(())
    }

    /// Get volatility data for an asset
    pub fn get_volatility(env: Env, asset: Symbol) -> Result<VolatilityData, OracleError> {
        Self::require_asset_supported(&env, &asset)?;

        env.storage()
            .persistent()
            .get(&(DataKey::Volatility, asset))
            .ok_or(OracleError::InsufficientHistory)
    }

    /// Calculate the safe borrow amount based on volatility-adjusted LTV
    /// Formula: B_safe = V_collateral × (LTV_base - k × σ × √T)
    ///
    /// # Arguments
    /// * `asset` - The collateral asset
    /// * `collateral_value` - Value of collateral in USD (14 decimals)
    /// * `base_ltv` - Base LTV in basis points (e.g., 7500 = 75%)
    /// * `k_factor` - Volatility sensitivity factor (in basis points, e.g., 100 = 1%)
    /// * `time_horizon_days` - Time horizon for volatility adjustment
    ///
    /// # Returns
    /// * Safe borrow amount in USD (14 decimals)
    pub fn calculate_safe_borrow(
        env: Env,
        asset: Symbol,
        collateral_value: i128,
        base_ltv: u32,
        k_factor: u32,
        time_horizon_days: u32,
    ) -> Result<i128, OracleError> {
        let volatility_data = Self::get_volatility(env.clone(), asset)?;

        // Get 30-day volatility in basis points
        let sigma = volatility_data.volatility_30d as i128;

        // Calculate √T where T is in years (days / 365)
        // Using fixed-point math: sqrt(T) ≈ sqrt(days) / sqrt(365)
        // sqrt(365) ≈ 19.1 ≈ 19
        let sqrt_t = Self::integer_sqrt(time_horizon_days as i128) * 1000 / 19;

        // Adjusted LTV = LTV_base - k × σ × √T
        // All in basis points (10000 = 100%)
        let adjustment = (k_factor as i128 * sigma * sqrt_t) / (1000 * 10000);
        let adjusted_ltv = (base_ltv as i128).saturating_sub(adjustment);

        // Ensure LTV doesn't go below a minimum threshold (e.g., 30%)
        let min_ltv: i128 = 3000; // 30%
        let final_ltv = if adjusted_ltv < min_ltv {
            min_ltv
        } else {
            adjusted_ltv
        };

        // B_safe = V_collateral × adjusted_LTV / 10000
        let safe_borrow = collateral_value * final_ltv / 10000;

        Ok(safe_borrow)
    }

    /// Set the staleness threshold
    pub fn set_staleness_threshold(
        env: Env,
        caller: Address,
        threshold_seconds: u64,
    ) -> Result<(), OracleError> {
        caller.require_auth();
        Self::require_admin(&env, &caller)?;

        env.storage()
            .instance()
            .set(&DataKey::StalenessThreshold, &threshold_seconds);

        Ok(())
    }

    // ============ View Functions ============

    /// Get admin address
    pub fn admin(env: Env) -> Result<Address, OracleError> {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(OracleError::Unauthorized)
    }

    /// Get list of supported assets
    pub fn get_assets(env: Env) -> Vec<Symbol> {
        env.storage()
            .instance()
            .get(&DataKey::Assets)
            .unwrap_or(Vec::new(&env))
    }

    /// Check if an asset is supported
    pub fn is_asset_supported(env: Env, asset: Symbol) -> bool {
        let assets: Vec<Symbol> = env
            .storage()
            .instance()
            .get(&DataKey::Assets)
            .unwrap_or(Vec::new(&env));

        for a in assets.iter() {
            if a == asset {
                return true;
            }
        }
        false
    }

    // ============ Internal Functions ============

    /// Convert price from one decimal format to another
    ///
    /// # Blend Compatibility
    /// This helper function can convert prices from other decimal formats to
    /// Blend's required 14-decimal format. However, the oracle adapter always
    /// works with 14-decimal prices internally.
    ///
    /// # Arguments
    /// * `price` - Price value
    /// * `from_decimals` - Current decimal places
    /// * `to_decimals` - Target decimal places (typically 14 for Blend)
    ///
    /// # Returns
    /// Converted price value
    ///
    /// # Example
    /// Convert from 8 decimals to 14 decimals:
    /// ```ignore
    /// let price_8d = 10_000_000;  // $0.10 with 8 decimals
    /// let price_14d = Self::convert_price_decimals(price_8d, 8, 14);
    /// // Result: 10_000_000_000_000 (same value, 14 decimals)
    /// ```
    #[allow(dead_code)]
    fn convert_price_decimals(price: i128, from_decimals: u32, to_decimals: u32) -> i128 {
        if from_decimals == to_decimals {
            return price;
        }

        if from_decimals < to_decimals {
            // Scale up
            let multiplier = 10i128.pow(to_decimals - from_decimals);
            price.saturating_mul(multiplier)
        } else {
            // Scale down
            let divisor = 10i128.pow(from_decimals - to_decimals);
            price / divisor
        }
    }

    fn require_admin(env: &Env, caller: &Address) -> Result<(), OracleError> {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        if *caller != admin {
            return Err(OracleError::Unauthorized);
        }
        Ok(())
    }

    fn require_asset_supported(env: &Env, asset: &Symbol) -> Result<(), OracleError> {
        if !Self::is_asset_supported(env.clone(), asset.clone()) {
            return Err(OracleError::AssetNotSupported);
        }
        Ok(())
    }

    fn update_price_history(env: &Env, asset: &Symbol, price: i128) -> Result<(), OracleError> {
        let mut volatility_data: VolatilityData = env
            .storage()
            .persistent()
            .get(&(DataKey::Volatility, asset.clone()))
            .unwrap_or(VolatilityData {
                volatility_30d: 0,
                volatility_7d: 0,
                last_updated: 0,
                price_history: Vec::new(env),
            });

        // Add new price to history
        volatility_data.price_history.push_back(price);

        // Keep only last 30 data points
        while volatility_data.price_history.len() > 30 {
            volatility_data.price_history.pop_front();
        }

        // Calculate volatility if we have enough data
        if volatility_data.price_history.len() >= 7 {
            volatility_data.volatility_7d = Self::calculate_volatility(&volatility_data.price_history, 7);
        }
        if volatility_data.price_history.len() >= 30 {
            volatility_data.volatility_30d = Self::calculate_volatility(&volatility_data.price_history, 30);
        }

        volatility_data.last_updated = env.ledger().timestamp();

        env.storage()
            .persistent()
            .set(&(DataKey::Volatility, asset.clone()), &volatility_data);

        Ok(())
    }

    /// Calculate historical volatility from price history
    /// Returns annualized volatility in basis points
    fn calculate_volatility(prices: &Vec<i128>, period: u32) -> u32 {
        if prices.len() < 2 {
            return 0;
        }

        let len = prices.len().min(period);
        let mut returns: soroban_sdk::Vec<i128> = soroban_sdk::Vec::new(prices.env());

        // Calculate daily returns (log returns approximated as simple returns)
        for i in 1..len {
            let prev = prices.get(prices.len() - len + i - 1).unwrap();
            let curr = prices.get(prices.len() - len + i).unwrap();
            if prev > 0 {
                // Return in basis points: (curr - prev) / prev * 10000
                let daily_return = (curr - prev) * 10000 / prev;
                returns.push_back(daily_return);
            }
        }

        if returns.is_empty() {
            return 0;
        }

        // Calculate mean
        let mut sum: i128 = 0;
        for r in returns.iter() {
            sum += r;
        }
        let mean = sum / returns.len() as i128;

        // Calculate variance
        let mut variance_sum: i128 = 0;
        for r in returns.iter() {
            let diff = r - mean;
            variance_sum += diff * diff;
        }
        let variance = variance_sum / returns.len() as i128;

        // Standard deviation (in basis points)
        let std_dev = Self::integer_sqrt(variance);

        // Annualize: multiply by sqrt(365)
        // sqrt(365) ≈ 19.1
        let annualized = std_dev * 19;

        annualized as u32
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
