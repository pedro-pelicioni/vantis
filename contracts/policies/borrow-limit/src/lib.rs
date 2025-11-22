#![no_std]

//! Borrow Limit Policy
//!
//! A policy contract for OpenZeppelin Smart Accounts that enforces
//! borrowing limits for the Vantis protocol.
//!
//! This policy:
//! - Limits maximum borrow amount per transaction
//! - Tracks cumulative borrows within a time window
//! - Enforces rate limiting on borrow operations

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, Address, BytesN, Env, Vec,
};

/// Storage keys for the policy
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    /// Admin of the policy
    Admin,
    /// Configuration for a specific account + rule combination
    /// Key: (account_address, rule_id)
    Config(Address, BytesN<32>),
    /// Usage tracking for a specific account + rule
    /// Key: (account_address, rule_id)
    Usage(Address, BytesN<32>),
}

/// Policy configuration
#[contracttype]
#[derive(Clone, Debug)]
pub struct BorrowLimitConfig {
    /// Maximum borrow amount per transaction
    pub max_per_tx: i128,
    /// Maximum cumulative borrow within the time window
    pub max_cumulative: i128,
    /// Time window for cumulative limit (in seconds)
    pub time_window: u64,
    /// Pool contract address this policy applies to
    pub pool_contract: Address,
}

/// Usage tracking
#[contracttype]
#[derive(Clone, Debug, Default)]
pub struct BorrowUsage {
    /// Cumulative borrowed amount in current window
    pub cumulative_borrowed: i128,
    /// Window start timestamp
    pub window_start: u64,
}

/// Installation parameters for the policy
#[contracttype]
#[derive(Clone, Debug)]
pub struct InstallParams {
    /// Maximum borrow per transaction
    pub max_per_tx: i128,
    /// Maximum cumulative borrow in time window
    pub max_cumulative: i128,
    /// Time window in seconds
    pub time_window: u64,
    /// Pool contract address
    pub pool_contract: Address,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum PolicyError {
    /// Caller is not authorized
    Unauthorized = 1,
    /// Borrow amount exceeds per-transaction limit
    ExceedsPerTxLimit = 2,
    /// Borrow amount exceeds cumulative limit
    ExceedsCumulativeLimit = 3,
    /// Invalid parameters
    InvalidParams = 4,
    /// Policy not installed for this account/rule
    NotInstalled = 5,
    /// Invalid function call (not a borrow)
    InvalidFunction = 6,
}

#[contract]
pub struct BorrowLimitPolicy;

#[contractimpl]
impl BorrowLimitPolicy {
    /// Initialize the policy contract
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
    }

    // ============ Policy Trait Implementation ============
    // These functions implement the OpenZeppelin Policy interface

    /// Install the policy for a specific account and rule
    ///
    /// Called when the policy is attached to a context rule in a smart account.
    /// Sets up the configuration for this account/rule combination.
    pub fn install(
        env: Env,
        account: Address,
        rule_id: BytesN<32>,
        params: InstallParams,
    ) -> Result<(), PolicyError> {
        // Validate params
        if params.max_per_tx <= 0 || params.max_cumulative <= 0 || params.time_window == 0 {
            return Err(PolicyError::InvalidParams);
        }

        let config = BorrowLimitConfig {
            max_per_tx: params.max_per_tx,
            max_cumulative: params.max_cumulative,
            time_window: params.time_window,
            pool_contract: params.pool_contract,
        };

        // Store config keyed by account + rule_id
        env.storage()
            .persistent()
            .set(&DataKey::Config(account.clone(), rule_id.clone()), &config);

        // Initialize usage tracking
        let usage = BorrowUsage {
            cumulative_borrowed: 0,
            window_start: env.ledger().timestamp(),
        };
        env.storage()
            .persistent()
            .set(&DataKey::Usage(account.clone(), rule_id.clone()), &usage);

        env.events().publish(
            (symbol_short!("policy"), symbol_short!("install")),
            (&account, &rule_id),
        );

        Ok(())
    }

    /// Check if the policy can enforce (read-only pre-check)
    ///
    /// This is called before `enforce` to do a read-only validation.
    /// Returns true if the borrow would be allowed, false otherwise.
    pub fn can_enforce(
        env: Env,
        account: Address,
        rule_id: BytesN<32>,
        _target_contract: Address,
        _function: soroban_sdk::Symbol,
        args: Vec<soroban_sdk::Val>,
    ) -> Result<bool, PolicyError> {
        let config: BorrowLimitConfig = env
            .storage()
            .persistent()
            .get(&DataKey::Config(account.clone(), rule_id.clone()))
            .ok_or(PolicyError::NotInstalled)?;

        // Extract borrow amount from args
        // Assuming borrow(user: Address, amount: i128) signature
        let amount = Self::extract_borrow_amount(&env, &args)?;

        // Check per-transaction limit
        if amount > config.max_per_tx {
            return Ok(false);
        }

        // Get current usage
        let mut usage: BorrowUsage = env
            .storage()
            .persistent()
            .get(&DataKey::Usage(account.clone(), rule_id.clone()))
            .unwrap_or_default();

        // Check if we need to reset the window
        let current_time = env.ledger().timestamp();
        if current_time >= usage.window_start + config.time_window {
            // Window expired, would reset
            usage.cumulative_borrowed = 0;
        }

        // Check cumulative limit
        if usage.cumulative_borrowed + amount > config.max_cumulative {
            return Ok(false);
        }

        Ok(true)
    }

    /// Enforce the policy (state-changing)
    ///
    /// Called during authorization to enforce the policy rules.
    /// Updates usage tracking after successful authorization.
    pub fn enforce(
        env: Env,
        account: Address,
        rule_id: BytesN<32>,
        _target_contract: Address,
        _function: soroban_sdk::Symbol,
        args: Vec<soroban_sdk::Val>,
    ) -> Result<(), PolicyError> {
        let config: BorrowLimitConfig = env
            .storage()
            .persistent()
            .get(&DataKey::Config(account.clone(), rule_id.clone()))
            .ok_or(PolicyError::NotInstalled)?;

        let amount = Self::extract_borrow_amount(&env, &args)?;

        // Check per-transaction limit
        if amount > config.max_per_tx {
            return Err(PolicyError::ExceedsPerTxLimit);
        }

        // Get and update usage
        let mut usage: BorrowUsage = env
            .storage()
            .persistent()
            .get(&DataKey::Usage(account.clone(), rule_id.clone()))
            .unwrap_or_default();

        let current_time = env.ledger().timestamp();

        // Reset window if expired
        if current_time >= usage.window_start + config.time_window {
            usage.cumulative_borrowed = 0;
            usage.window_start = current_time;
        }

        // Check cumulative limit
        if usage.cumulative_borrowed + amount > config.max_cumulative {
            return Err(PolicyError::ExceedsCumulativeLimit);
        }

        // Update usage
        usage.cumulative_borrowed += amount;
        env.storage()
            .persistent()
            .set(&DataKey::Usage(account.clone(), rule_id.clone()), &usage);

        env.events().publish(
            (symbol_short!("borrow"), symbol_short!("enforce")),
            (&account, amount),
        );

        Ok(())
    }

    /// Uninstall the policy for a specific account and rule
    ///
    /// Called when the policy is removed from a context rule.
    /// Cleans up all storage associated with this account/rule.
    pub fn uninstall(
        env: Env,
        account: Address,
        rule_id: BytesN<32>,
    ) -> Result<(), PolicyError> {
        // Remove config
        env.storage()
            .persistent()
            .remove(&DataKey::Config(account.clone(), rule_id.clone()));

        // Remove usage tracking
        env.storage()
            .persistent()
            .remove(&DataKey::Usage(account.clone(), rule_id.clone()));

        env.events().publish(
            (symbol_short!("policy"), symbol_short!("uninstall")),
            (&account, &rule_id),
        );

        Ok(())
    }

    // ============ View Functions ============

    /// Get the current configuration for an account/rule
    pub fn get_config(
        env: Env,
        account: Address,
        rule_id: BytesN<32>,
    ) -> Option<BorrowLimitConfig> {
        env.storage()
            .persistent()
            .get(&DataKey::Config(account, rule_id))
    }

    /// Get current usage for an account/rule
    pub fn get_usage(
        env: Env,
        account: Address,
        rule_id: BytesN<32>,
    ) -> Option<BorrowUsage> {
        env.storage()
            .persistent()
            .get(&DataKey::Usage(account, rule_id))
    }

    /// Get remaining borrow capacity for an account/rule
    pub fn remaining_capacity(
        env: Env,
        account: Address,
        rule_id: BytesN<32>,
    ) -> Result<i128, PolicyError> {
        let config: BorrowLimitConfig = env
            .storage()
            .persistent()
            .get(&DataKey::Config(account.clone(), rule_id.clone()))
            .ok_or(PolicyError::NotInstalled)?;

        let mut usage: BorrowUsage = env
            .storage()
            .persistent()
            .get(&DataKey::Usage(account.clone(), rule_id.clone()))
            .unwrap_or_default();

        let current_time = env.ledger().timestamp();

        // Reset if window expired
        if current_time >= usage.window_start + config.time_window {
            usage.cumulative_borrowed = 0;
        }

        let remaining = config.max_cumulative - usage.cumulative_borrowed;
        let capped = remaining.min(config.max_per_tx);

        Ok(if capped > 0 { capped } else { 0 })
    }

    // ============ Admin Functions ============

    /// Update the configuration for an account/rule (admin only)
    pub fn update_config(
        env: Env,
        caller: Address,
        account: Address,
        rule_id: BytesN<32>,
        params: InstallParams,
    ) -> Result<(), PolicyError> {
        caller.require_auth();
        Self::require_admin(&env, &caller)?;

        if params.max_per_tx <= 0 || params.max_cumulative <= 0 || params.time_window == 0 {
            return Err(PolicyError::InvalidParams);
        }

        let config = BorrowLimitConfig {
            max_per_tx: params.max_per_tx,
            max_cumulative: params.max_cumulative,
            time_window: params.time_window,
            pool_contract: params.pool_contract,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Config(account, rule_id), &config);

        Ok(())
    }

    /// Get admin address
    pub fn admin(env: Env) -> Result<Address, PolicyError> {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(PolicyError::Unauthorized)
    }

    // ============ Internal Functions ============

    fn require_admin(env: &Env, caller: &Address) -> Result<(), PolicyError> {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        if *caller != admin {
            return Err(PolicyError::Unauthorized);
        }
        Ok(())
    }

    /// Extract borrow amount from function arguments
    ///
    /// Assumes the borrow function signature is: borrow(user: Address, amount: i128)
    fn extract_borrow_amount(env: &Env, args: &Vec<soroban_sdk::Val>) -> Result<i128, PolicyError> {
        // Borrow function has signature: borrow(user: Address, amount: i128)
        // The amount is the second argument (index 1)
        if args.len() < 2 {
            return Err(PolicyError::InvalidFunction);
        }

        // Try to extract the amount from args[1]
        use soroban_sdk::TryFromVal;
        let amount: i128 = i128::try_from_val(env, &args.get(1).unwrap())
            .map_err(|_| PolicyError::InvalidFunction)?;

        if amount <= 0 {
            return Err(PolicyError::InvalidParams);
        }

        Ok(amount)
    }
}

#[cfg(test)]
mod test;
