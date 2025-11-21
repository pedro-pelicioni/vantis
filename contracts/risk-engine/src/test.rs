#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, vec, Env};

#[test]
fn test_initialize() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(RiskEngineContract, ());
    let client = RiskEngineContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let oracle = Address::generate(&env);
    let pool = Address::generate(&env);
    let usdc = Address::generate(&env);

    let params = RiskParameters {
        k_factor: 100,
        time_horizon_days: 30,
        stop_loss_threshold: 10200,
        liquidation_threshold: 10000,
        target_health_factor: 10500,
        liquidation_penalty: 500,
        protocol_fee: 100,
        min_collateral_factor: 3000,
    };

    client.initialize(&admin, &oracle, &pool, &usdc, &params);

    assert_eq!(client.admin(), admin);

    let stored_params = client.get_params();
    assert_eq!(stored_params.k_factor, 100);
    assert_eq!(stored_params.liquidation_penalty, 500);
}

#[test]
fn test_update_params() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(RiskEngineContract, ());
    let client = RiskEngineContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let oracle = Address::generate(&env);
    let pool = Address::generate(&env);
    let usdc = Address::generate(&env);

    let initial_params = RiskParameters::default();
    client.initialize(&admin, &oracle, &pool, &usdc, &initial_params);

    // Update params
    let new_params = RiskParameters {
        k_factor: 200,  // Changed
        time_horizon_days: 60,  // Changed
        ..initial_params.clone()
    };

    client.update_params(&admin, &new_params);

    let stored = client.get_params();
    assert_eq!(stored.k_factor, 200);
    assert_eq!(stored.time_horizon_days, 60);
}

#[test]
fn test_enable_disable_stop_loss() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(RiskEngineContract, ());
    let client = RiskEngineContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let oracle = Address::generate(&env);
    let pool = Address::generate(&env);
    let usdc = Address::generate(&env);
    let user = Address::generate(&env);

    let params = RiskParameters::default();
    client.initialize(&admin, &oracle, &pool, &usdc, &params);

    // Enable stop-loss
    let config = UserStopLossConfig {
        enabled: true,
        custom_threshold: 10300,  // 1.03
        swap_priority: vec![&env],
        max_slippage: 100,  // 1%
    };

    client.enable_stop_loss(&user, &config);

    let stored = client.get_stop_loss_config(&user);
    assert!(stored.is_some());
    assert!(stored.clone().unwrap().enabled);
    assert_eq!(stored.unwrap().custom_threshold, 10300);

    // Disable stop-loss
    client.disable_stop_loss(&user);

    let stored = client.get_stop_loss_config(&user);
    assert!(stored.is_none());
}

#[test]
fn test_add_liquidator() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(RiskEngineContract, ());
    let client = RiskEngineContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let oracle = Address::generate(&env);
    let pool = Address::generate(&env);
    let usdc = Address::generate(&env);
    let liquidator = Address::generate(&env);

    let params = RiskParameters::default();
    client.initialize(&admin, &oracle, &pool, &usdc, &params);

    assert!(!client.is_liquidator(&liquidator));

    client.add_liquidator(&admin, &liquidator);

    assert!(client.is_liquidator(&liquidator));
}

#[test]
fn test_calculate_safe_borrow() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(RiskEngineContract, ());
    let client = RiskEngineContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let oracle = Address::generate(&env);
    let pool = Address::generate(&env);
    let usdc = Address::generate(&env);

    let params = RiskParameters {
        k_factor: 100,
        time_horizon_days: 30,
        min_collateral_factor: 3000,
        ..RiskParameters::default()
    };
    client.initialize(&admin, &oracle, &pool, &usdc, &params);

    // Calculate safe borrow
    let collateral_value = 1000_0000000i128; // 1000 USD
    let base_ltv = 7500; // 75%

    let safe_borrow = client.calculate_safe_borrow(
        &symbol_short!("XLM"),
        &collateral_value,
        &base_ltv,
    );

    // With volatility adjustment, safe borrow should be <= 75% of collateral
    let max_borrow = collateral_value * 7500 / 10000;
    assert!(safe_borrow <= max_borrow);
    assert!(safe_borrow > 0);
}

#[test]
fn test_check_position_health() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(RiskEngineContract, ());
    let client = RiskEngineContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let oracle = Address::generate(&env);
    let pool = Address::generate(&env);
    let usdc = Address::generate(&env);
    let user = Address::generate(&env);

    let params = RiskParameters::default();
    client.initialize(&admin, &oracle, &pool, &usdc, &params);

    // Check position (uses placeholder that returns healthy)
    let (health, status) = client.check_position_health(&user);

    // Placeholder returns 11000 (healthy)
    assert_eq!(health, 11000);
    assert_eq!(status, symbol_short!("healthy"));
}

// Test volatility module
mod volatility_tests {
    use super::volatility::*;

    #[test]
    fn test_volatility_adjusted_ltv() {
        // Base 75%, 50% volatility, 1% k, 30 days
        let adjusted = calculate_adjusted_ltv(7500, 5000, 100, 30, 3000);

        // Should be reduced from base
        assert!(adjusted < 7500);
        // Should be above minimum
        assert!(adjusted >= 3000);
    }

    #[test]
    fn test_effective_rate_calculation() {
        // When yield exceeds borrow rate
        let rate = calculate_effective_rate(500, 1000, 1000, 1000);
        assert!(rate < 0); // Negative = user earning

        // When borrow rate exceeds yield
        let rate = calculate_effective_rate(1000, 500, 1000, 1000);
        assert!(rate > 0); // Positive = user paying
    }
}

// Test stop-loss module
mod stop_loss_tests {
    use super::stop_loss::*;

    #[test]
    fn test_stop_loss_trigger_conditions() {
        // In critical zone
        assert!(should_trigger_stop_loss(10100, 10200, 10000));

        // Healthy
        assert!(!should_trigger_stop_loss(11000, 10200, 10000));

        // Already liquidatable
        assert!(!should_trigger_stop_loss(9500, 10200, 10000));
    }

    #[test]
    fn test_slippage_calculation() {
        let min_output = calculate_min_output(1000, 100); // 1% slippage
        assert_eq!(min_output, 990);
    }
}

// Test liquidation module
mod liquidation_tests {
    use super::liquidation::*;

    #[test]
    fn test_partial_liquidation() {
        // Unhealthy position
        let (collateral, debt) = calculate_partial_liquidation(
            900,    // 900 collateral
            1000,   // 1000 debt
            500,    // 5% penalty
            10500,  // target 1.05
        );

        assert!(collateral > 0);
        assert!(debt > 0);
        assert!(collateral <= 900);
        assert!(debt <= 1000);
    }

    #[test]
    fn test_liquidation_bonus_split() {
        let (liquidator, protocol) = calculate_liquidation_bonus(
            1050,  // seized
            1000,  // repaid
            2000,  // 20% protocol fee
        );

        assert_eq!(liquidator + protocol, 50);
        assert_eq!(protocol, 10);
        assert_eq!(liquidator, 40);
    }

    #[test]
    fn test_is_liquidatable_check() {
        assert!(is_liquidatable(9900, 10000));
        assert!(!is_liquidatable(10100, 10000));
    }
}
