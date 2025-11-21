#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, vec, Env, IntoVal};

fn create_rule_id(env: &Env) -> BytesN<32> {
    BytesN::from_array(env, &[1u8; 32])
}

#[test]
fn test_initialize() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(BorrowLimitPolicy, ());
    let client = BorrowLimitPolicyClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin);

    assert_eq!(client.admin(), admin);
}

#[test]
fn test_install_and_get_config() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(BorrowLimitPolicy, ());
    let client = BorrowLimitPolicyClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let account = Address::generate(&env);
    let pool = Address::generate(&env);
    let rule_id = create_rule_id(&env);

    client.initialize(&admin);

    let params = InstallParams {
        max_per_tx: 1000_0000000,      // 1000 USDC
        max_cumulative: 5000_0000000,  // 5000 USDC per window
        time_window: 86400,            // 24 hours
        pool_contract: pool.clone(),
    };

    client.install(&account, &rule_id, &params);

    let config = client.get_config(&account, &rule_id);
    assert!(config.is_some());

    let config = config.unwrap();
    assert_eq!(config.max_per_tx, 1000_0000000);
    assert_eq!(config.max_cumulative, 5000_0000000);
    assert_eq!(config.time_window, 86400);
}

#[test]
fn test_can_enforce_within_limits() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(BorrowLimitPolicy, ());
    let client = BorrowLimitPolicyClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let account = Address::generate(&env);
    let pool = Address::generate(&env);
    let rule_id = create_rule_id(&env);

    client.initialize(&admin);

    let params = InstallParams {
        max_per_tx: 1000_0000000,
        max_cumulative: 5000_0000000,
        time_window: 86400,
        pool_contract: pool.clone(),
    };

    client.install(&account, &rule_id, &params);

    // Create args for borrow(user, amount)
    let borrow_amount: i128 = 500_0000000; // 500 USDC - within limits
    let args = vec![
        &env,
        account.clone().into_val(&env),
        borrow_amount.into_val(&env),
    ];

    let can_enforce = client.can_enforce(
        &account,
        &rule_id,
        &pool,
        &soroban_sdk::symbol_short!("borrow"),
        &args,
    );

    assert!(can_enforce);
}

#[test]
fn test_can_enforce_exceeds_per_tx() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(BorrowLimitPolicy, ());
    let client = BorrowLimitPolicyClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let account = Address::generate(&env);
    let pool = Address::generate(&env);
    let rule_id = create_rule_id(&env);

    client.initialize(&admin);

    let params = InstallParams {
        max_per_tx: 1000_0000000,
        max_cumulative: 5000_0000000,
        time_window: 86400,
        pool_contract: pool.clone(),
    };

    client.install(&account, &rule_id, &params);

    // Try to borrow more than per-tx limit
    let borrow_amount: i128 = 2000_0000000; // 2000 USDC - exceeds 1000 limit
    let args = vec![
        &env,
        account.clone().into_val(&env),
        borrow_amount.into_val(&env),
    ];

    let can_enforce = client.can_enforce(
        &account,
        &rule_id,
        &pool,
        &soroban_sdk::symbol_short!("borrow"),
        &args,
    );

    assert!(!can_enforce);
}

#[test]
fn test_enforce_updates_usage() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(BorrowLimitPolicy, ());
    let client = BorrowLimitPolicyClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let account = Address::generate(&env);
    let pool = Address::generate(&env);
    let rule_id = create_rule_id(&env);

    client.initialize(&admin);

    let params = InstallParams {
        max_per_tx: 1000_0000000,
        max_cumulative: 5000_0000000,
        time_window: 86400,
        pool_contract: pool.clone(),
    };

    client.install(&account, &rule_id, &params);

    // First borrow
    let borrow_amount: i128 = 500_0000000;
    let args = vec![
        &env,
        account.clone().into_val(&env),
        borrow_amount.into_val(&env),
    ];

    client.enforce(
        &account,
        &rule_id,
        &pool,
        &soroban_sdk::symbol_short!("borrow"),
        &args,
    );

    let usage = client.get_usage(&account, &rule_id).unwrap();
    assert_eq!(usage.cumulative_borrowed, 500_0000000);

    // Second borrow
    client.enforce(
        &account,
        &rule_id,
        &pool,
        &soroban_sdk::symbol_short!("borrow"),
        &args,
    );

    let usage = client.get_usage(&account, &rule_id).unwrap();
    assert_eq!(usage.cumulative_borrowed, 1000_0000000);
}

#[test]
fn test_remaining_capacity() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(BorrowLimitPolicy, ());
    let client = BorrowLimitPolicyClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let account = Address::generate(&env);
    let pool = Address::generate(&env);
    let rule_id = create_rule_id(&env);

    client.initialize(&admin);

    let params = InstallParams {
        max_per_tx: 1000_0000000,
        max_cumulative: 5000_0000000,
        time_window: 86400,
        pool_contract: pool.clone(),
    };

    client.install(&account, &rule_id, &params);

    // Initial capacity should be capped by per_tx limit
    let remaining = client.remaining_capacity(&account, &rule_id);
    assert_eq!(remaining, 1000_0000000); // min(5000, 1000) = 1000

    // After borrowing 500
    let borrow_amount: i128 = 500_0000000;
    let args = vec![
        &env,
        account.clone().into_val(&env),
        borrow_amount.into_val(&env),
    ];

    client.enforce(
        &account,
        &rule_id,
        &pool,
        &soroban_sdk::symbol_short!("borrow"),
        &args,
    );

    // Remaining should still be 1000 (per-tx limit) since cumulative is 4500
    let remaining = client.remaining_capacity(&account, &rule_id);
    assert_eq!(remaining, 1000_0000000);
}

#[test]
fn test_uninstall() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(BorrowLimitPolicy, ());
    let client = BorrowLimitPolicyClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let account = Address::generate(&env);
    let pool = Address::generate(&env);
    let rule_id = create_rule_id(&env);

    client.initialize(&admin);

    let params = InstallParams {
        max_per_tx: 1000_0000000,
        max_cumulative: 5000_0000000,
        time_window: 86400,
        pool_contract: pool,
    };

    client.install(&account, &rule_id, &params);
    assert!(client.get_config(&account, &rule_id).is_some());

    client.uninstall(&account, &rule_id);
    assert!(client.get_config(&account, &rule_id).is_none());
}

#[test]
#[should_panic(expected = "Error(Contract, #4)")] // InvalidParams
fn test_install_invalid_params() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(BorrowLimitPolicy, ());
    let client = BorrowLimitPolicyClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let account = Address::generate(&env);
    let pool = Address::generate(&env);
    let rule_id = create_rule_id(&env);

    client.initialize(&admin);

    // Invalid: max_per_tx is 0
    let params = InstallParams {
        max_per_tx: 0,
        max_cumulative: 5000_0000000,
        time_window: 86400,
        pool_contract: pool,
    };

    client.install(&account, &rule_id, &params);
}
