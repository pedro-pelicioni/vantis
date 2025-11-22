//! Tests for the Blend Adapter contract
//!
//! Comprehensive test suite covering:
//! - Initialization and configuration
//! - Asset registration
//! - Collateral operations (deposit/withdraw)
//! - Borrow/repay operations
//! - Position queries and health factor calculations
//! - Error cases and edge conditions

#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Env};

// ============ Initialization Tests ============

#[test]
fn test_initialize() {
    let env = Env::default();
    let contract_id = env.register(BlendAdapterContract, ());
    let client = BlendAdapterContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let blend_pool = Address::generate(&env);
    let oracle = Address::generate(&env);
    let usdc = Address::generate(&env);

    client.initialize(&admin, &blend_pool, &oracle, &usdc);

    assert_eq!(client.admin(), admin);
    assert_eq!(client.blend_pool().unwrap(), blend_pool);
}

#[test]
#[should_panic(expected = "Already initialized")]
fn test_cannot_reinitialize() {
    let env = Env::default();
    let contract_id = env.register(BlendAdapterContract, ());
    let client = BlendAdapterContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let blend_pool = Address::generate(&env);
    let oracle = Address::generate(&env);
    let usdc = Address::generate(&env);

    client.initialize(&admin, &blend_pool, &oracle, &usdc);
    // Should panic on second initialization
    client.initialize(&admin, &blend_pool, &oracle, &usdc);
}

// ============ Asset Registration Tests ============

#[test]
fn test_register_asset() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(BlendAdapterContract, ());
    let client = BlendAdapterContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let blend_pool = Address::generate(&env);
    let oracle = Address::generate(&env);
    let usdc = Address::generate(&env);
    let xlm = Address::generate(&env);

    client.initialize(&admin, &blend_pool, &oracle, &usdc);

    // Register XLM as collateral with reserve index 0
    let result = client.register_asset(&admin, &xlm, &0);
    assert!(result.is_ok());
}

#[test]
fn test_register_multiple_assets() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(BlendAdapterContract, ());
    let client = BlendAdapterContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let blend_pool = Address::generate(&env);
    let oracle = Address::generate(&env);
    let usdc = Address::generate(&env);
    let xlm = Address::generate(&env);
    let btc = Address::generate(&env);

    client.initialize(&admin, &blend_pool, &oracle, &usdc);

    // Register multiple assets
    assert!(client.register_asset(&admin, &xlm, &0).is_ok());
    assert!(client.register_asset(&admin, &btc, &1).is_ok());
}

#[test]
fn test_register_asset_unauthorized() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(BlendAdapterContract, ());
    let client = BlendAdapterContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let unauthorized = Address::generate(&env);
    let blend_pool = Address::generate(&env);
    let oracle = Address::generate(&env);
    let usdc = Address::generate(&env);
    let xlm = Address::generate(&env);

    client.initialize(&admin, &blend_pool, &oracle, &usdc);

    // Non-admin should not be able to register assets
    let result = client.register_asset(&unauthorized, &xlm, &0);
    assert!(result.is_err());
    assert_eq!(result.unwrap_err().unwrap(), AdapterError::Unauthorized);
}

// ============ Collateral Operation Tests ============

#[test]
fn test_deposit_collateral_invalid_amount() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(BlendAdapterContract, ());
    let client = BlendAdapterContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let blend_pool = Address::generate(&env);
    let oracle = Address::generate(&env);
    let usdc = Address::generate(&env);
    let user = Address::generate(&env);
    let xlm = Address::generate(&env);

    client.initialize(&admin, &blend_pool, &oracle, &usdc);
    client.register_asset(&admin, &xlm, &0).unwrap();

    // Test zero amount
    let result = client.deposit_collateral(&user, &xlm, &0);
    assert!(result.is_err());
    assert_eq!(result.unwrap_err().unwrap(), AdapterError::InvalidAmount);

    // Test negative amount
    let result = client.deposit_collateral(&user, &xlm, &-100);
    assert!(result.is_err());
    assert_eq!(result.unwrap_err().unwrap(), AdapterError::InvalidAmount);
}

#[test]
fn test_deposit_collateral_unsupported_asset() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(BlendAdapterContract, ());
    let client = BlendAdapterContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let blend_pool = Address::generate(&env);
    let oracle = Address::generate(&env);
    let usdc = Address::generate(&env);
    let user = Address::generate(&env);
    let unsupported_asset = Address::generate(&env);

    client.initialize(&admin, &blend_pool, &oracle, &usdc);

    // Try to deposit unsupported asset
    let result = client.deposit_collateral(&user, &unsupported_asset, &1000);
    assert!(result.is_err());
    assert_eq!(result.unwrap_err().unwrap(), AdapterError::AssetNotSupported);
}

#[test]
fn test_withdraw_collateral_invalid_amount() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(BlendAdapterContract, ());
    let client = BlendAdapterContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let blend_pool = Address::generate(&env);
    let oracle = Address::generate(&env);
    let usdc = Address::generate(&env);
    let user = Address::generate(&env);
    let xlm = Address::generate(&env);

    client.initialize(&admin, &blend_pool, &oracle, &usdc);
    client.register_asset(&admin, &xlm, &0).unwrap();

    // Test zero amount
    let result = client.withdraw_collateral(&user, &xlm, &0);
    assert!(result.is_err());
    assert_eq!(result.unwrap_err().unwrap(), AdapterError::InvalidAmount);
}

#[test]
fn test_withdraw_collateral_unsupported_asset() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(BlendAdapterContract, ());
    let client = BlendAdapterContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let blend_pool = Address::generate(&env);
    let oracle = Address::generate(&env);
    let usdc = Address::generate(&env);
    let user = Address::generate(&env);
    let unsupported_asset = Address::generate(&env);

    client.initialize(&admin, &blend_pool, &oracle, &usdc);

    // Try to withdraw unsupported asset
    let result = client.withdraw_collateral(&user, &unsupported_asset, &1000);
    assert!(result.is_err());
    assert_eq!(result.unwrap_err().unwrap(), AdapterError::AssetNotSupported);
}

// ============ Borrow/Repay Operation Tests ============

#[test]
fn test_borrow_invalid_amount() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(BlendAdapterContract, ());
    let client = BlendAdapterContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let blend_pool = Address::generate(&env);
    let oracle = Address::generate(&env);
    let usdc = Address::generate(&env);
    let user = Address::generate(&env);

    client.initialize(&admin, &blend_pool, &oracle, &usdc);

    // Test zero amount
    let result = client.borrow(&user, &0);
    assert!(result.is_err());
    assert_eq!(result.unwrap_err().unwrap(), AdapterError::InvalidAmount);

    // Test negative amount
    let result = client.borrow(&user, &-100);
    assert!(result.is_err());
    assert_eq!(result.unwrap_err().unwrap(), AdapterError::InvalidAmount);
}

#[test]
fn test_repay_invalid_amount() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(BlendAdapterContract, ());
    let client = BlendAdapterContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let blend_pool = Address::generate(&env);
    let oracle = Address::generate(&env);
    let usdc = Address::generate(&env);
    let user = Address::generate(&env);

    client.initialize(&admin, &blend_pool, &oracle, &usdc);

    // Test zero amount
    let result = client.repay(&user, &0);
    assert!(result.is_err());
    assert_eq!(result.unwrap_err().unwrap(), AdapterError::InvalidAmount);

    // Test negative amount
    let result = client.repay(&user, &-100);
    assert!(result.is_err());
    assert_eq!(result.unwrap_err().unwrap(), AdapterError::InvalidAmount);
}

// ============ Position Query Tests ============

#[test]
fn test_get_positions_empty() {
    let env = Env::default();
    let contract_id = env.register(BlendAdapterContract, ());
    let client = BlendAdapterContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let blend_pool = Address::generate(&env);
    let oracle = Address::generate(&env);
    let usdc = Address::generate(&env);
    let user = Address::generate(&env);

    client.initialize(&admin, &blend_pool, &oracle, &usdc);

    let positions = client.get_positions(&user).unwrap();
    assert!(positions.collateral.is_empty());
    assert!(positions.liabilities.is_empty());
    assert!(positions.supply.is_empty());
}

// ============ Health Factor Tests ============

#[test]
fn test_get_health_factor_no_positions() {
    let env = Env::default();
    let contract_id = env.register(BlendAdapterContract, ());
    let client = BlendAdapterContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let blend_pool = Address::generate(&env);
    let oracle = Address::generate(&env);
    let usdc = Address::generate(&env);
    let user = Address::generate(&env);

    client.initialize(&admin, &blend_pool, &oracle, &usdc);

    let result = client.get_health_factor(&user).unwrap();
    // With no liabilities, health factor should be MAX
    assert_eq!(result.health_factor, i128::MAX);
    assert!(!result.is_liquidatable);
    assert_eq!(result.total_collateral, 0);
    assert_eq!(result.total_liabilities, 0);
}

// ============ Pool Configuration Tests ============

#[test]
fn test_get_pool_config() {
    let env = Env::default();
    let contract_id = env.register(BlendAdapterContract, ());
    let client = BlendAdapterContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let blend_pool = Address::generate(&env);
    let oracle = Address::generate(&env);
    let usdc = Address::generate(&env);

    client.initialize(&admin, &blend_pool, &oracle, &usdc);

    let config = client.get_pool_config().unwrap();
    assert_eq!(config.bstop_rate, 100);
    assert_eq!(config.status, 0);
    assert_eq!(config.max_positions, 10);
}

#[test]
fn test_get_reserve() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(BlendAdapterContract, ());
    let client = BlendAdapterContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let blend_pool = Address::generate(&env);
    let oracle = Address::generate(&env);
    let usdc = Address::generate(&env);
    let xlm = Address::generate(&env);

    client.initialize(&admin, &blend_pool, &oracle, &usdc);
    client.register_asset(&admin, &xlm, &0).unwrap();

    let reserve = client.get_reserve(&xlm).unwrap();
    assert_eq!(reserve.b_rate, 1_0000000);
    assert_eq!(reserve.d_rate, 1_0000000);
    assert_eq!(reserve.ir_mod, 1_0000000);
}

#[test]
fn test_get_reserve_unsupported_asset() {
    let env = Env::default();
    let contract_id = env.register(BlendAdapterContract, ());
    let client = BlendAdapterContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let blend_pool = Address::generate(&env);
    let oracle = Address::generate(&env);
    let usdc = Address::generate(&env);
    let unsupported = Address::generate(&env);

    client.initialize(&admin, &blend_pool, &oracle, &usdc);

    let result = client.get_reserve(&unsupported);
    assert!(result.is_err());
    assert_eq!(result.unwrap_err().unwrap(), AdapterError::AssetNotSupported);
}

#[test]
fn test_get_reserve_list() {
    let env = Env::default();
    let contract_id = env.register(BlendAdapterContract, ());
    let client = BlendAdapterContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let blend_pool = Address::generate(&env);
    let oracle = Address::generate(&env);
    let usdc = Address::generate(&env);

    client.initialize(&admin, &blend_pool, &oracle, &usdc);

    let reserves = client.get_reserve_list().unwrap();
    assert!(reserves.is_empty());
}

// ============ Admin Functions Tests ============

#[test]
fn test_set_blend_pool() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(BlendAdapterContract, ());
    let client = BlendAdapterContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let blend_pool = Address::generate(&env);
    let new_blend_pool = Address::generate(&env);
    let oracle = Address::generate(&env);
    let usdc = Address::generate(&env);

    client.initialize(&admin, &blend_pool, &oracle, &usdc);
    assert_eq!(client.blend_pool().unwrap(), blend_pool);

    client.set_blend_pool(&admin, &new_blend_pool).unwrap();
    assert_eq!(client.blend_pool().unwrap(), new_blend_pool);
}

#[test]
fn test_set_blend_pool_unauthorized() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(BlendAdapterContract, ());
    let client = BlendAdapterContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let unauthorized = Address::generate(&env);
    let blend_pool = Address::generate(&env);
    let new_blend_pool = Address::generate(&env);
    let oracle = Address::generate(&env);
    let usdc = Address::generate(&env);

    client.initialize(&admin, &blend_pool, &oracle, &usdc);

    let result = client.set_blend_pool(&unauthorized, &new_blend_pool);
    assert!(result.is_err());
    assert_eq!(result.unwrap_err().unwrap(), AdapterError::Unauthorized);
}

// ============ Multi-Operation Tests ============

#[test]
fn test_submit_empty_requests() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(BlendAdapterContract, ());
    let client = BlendAdapterContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let blend_pool = Address::generate(&env);
    let oracle = Address::generate(&env);
    let usdc = Address::generate(&env);
    let user = Address::generate(&env);

    client.initialize(&admin, &blend_pool, &oracle, &usdc);

    let requests = Vec::new(&env);
    let result = client.submit(&user, &requests);
    assert!(result.is_ok());
}

#[test]
fn test_submit_multiple_requests() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(BlendAdapterContract, ());
    let client = BlendAdapterContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let blend_pool = Address::generate(&env);
    let oracle = Address::generate(&env);
    let usdc = Address::generate(&env);
    let user = Address::generate(&env);
    let xlm = Address::generate(&env);

    client.initialize(&admin, &blend_pool, &oracle, &usdc);
    client.register_asset(&admin, &xlm, &0).unwrap();

    // Create multiple requests
    let request1 = Request {
        request_type: RequestType::SupplyCollateral,
        address: xlm.clone(),
        amount: 1000,
    };
    let request2 = Request {
        request_type: RequestType::Borrow,
        address: usdc.clone(),
        amount: 500,
    };

    let mut requests = Vec::new(&env);
    requests.push_back(request1);
    requests.push_back(request2);

    let result = client.submit(&user, &requests);
    assert!(result.is_ok());
}
