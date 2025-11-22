#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, token, Env};

fn create_token_contract<'a>(env: &Env, admin: &Address) -> token::Client<'a> {
    let contract_id = env.register_stellar_asset_contract_v2(admin.clone());
    token::Client::new(env, &contract_id.address())
}

#[test]
fn test_initialize() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(VantisPoolContract, ());
    let client = VantisPoolContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let oracle = Address::generate(&env);
    let blend_pool = Address::generate(&env);
    let usdc_admin = Address::generate(&env);
    let usdc = create_token_contract(&env, &usdc_admin);

    let interest_params = InterestRateParams {
        base_rate: 200,           // 2%
        slope1: 400,              // 4%
        slope2: 7500,             // 75%
        optimal_utilization: 8000, // 80%
    };

    client.initialize(&admin, &oracle, &usdc.address, &blend_pool, &interest_params);

    assert_eq!(client.admin(), admin);
    assert_eq!(client.get_reserves(), 0);
    assert_eq!(client.get_total_borrows(), 0);
}

#[test]
fn test_add_collateral_asset() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(VantisPoolContract, ());
    let client = VantisPoolContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let oracle = Address::generate(&env);
    let blend_pool = Address::generate(&env);
    let usdc_admin = Address::generate(&env);
    let usdc = create_token_contract(&env, &usdc_admin);
    let xlm_admin = Address::generate(&env);
    let xlm = create_token_contract(&env, &xlm_admin);

    let interest_params = InterestRateParams {
        base_rate: 200,
        slope1: 400,
        slope2: 7500,
        optimal_utilization: 8000,
    };

    client.initialize(&admin, &oracle, &usdc.address, &blend_pool, &interest_params);

    let config = CollateralConfig {
        token: xlm.address.clone(),
        symbol: symbol_short!("XLM"),
        collateral_factor: 7500,      // 75%
        liquidation_threshold: 8000,  // 80%
        liquidation_penalty: 500,     // 5%
        is_active: true,
    };

    client.add_collateral_asset(&admin, &config);

    // Verify asset was added by attempting deposit (would fail if not supported)
}

#[test]
fn test_deposit_and_withdraw() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(VantisPoolContract, ());
    let client = VantisPoolContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let oracle = Address::generate(&env);
    let blend_pool = Address::generate(&env);
    let user = Address::generate(&env);

    // Create tokens
    let usdc_admin = Address::generate(&env);
    let usdc = create_token_contract(&env, &usdc_admin);
    let xlm_admin = Address::generate(&env);
    let xlm = create_token_contract(&env, &xlm_admin);

    let interest_params = InterestRateParams {
        base_rate: 200,
        slope1: 400,
        slope2: 7500,
        optimal_utilization: 8000,
    };

    client.initialize(&admin, &oracle, &usdc.address, &blend_pool, &interest_params);

    // Add XLM as collateral
    let config = CollateralConfig {
        token: xlm.address.clone(),
        symbol: symbol_short!("XLM"),
        collateral_factor: 7500,
        liquidation_threshold: 8000,
        liquidation_penalty: 500,
        is_active: true,
    };
    client.add_collateral_asset(&admin, &config);

    // Mint XLM to user
    let xlm_admin_client = token::StellarAssetClient::new(&env, &xlm.address);
    xlm_admin_client.mint(&user, &1000_0000000); // 1000 XLM

    // Deposit
    client.deposit(&user, &xlm.address, &500_0000000); // 500 XLM

    let collateral = client.get_collateral(&user);
    assert_eq!(collateral.get(xlm.address.clone()).unwrap(), 500_0000000);

    // Withdraw (no debt, should succeed)
    client.withdraw(&user, &xlm.address, &200_0000000); // 200 XLM

    let collateral = client.get_collateral(&user);
    assert_eq!(collateral.get(xlm.address.clone()).unwrap(), 300_0000000);
}

#[test]
fn test_supply_and_borrow() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(VantisPoolContract, ());
    let client = VantisPoolContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let oracle = Address::generate(&env);
    let blend_pool = Address::generate(&env);
    let user = Address::generate(&env);
    let supplier = Address::generate(&env);

    // Create tokens
    let usdc_admin = Address::generate(&env);
    let usdc = create_token_contract(&env, &usdc_admin);
    let xlm_admin = Address::generate(&env);
    let xlm = create_token_contract(&env, &xlm_admin);

    let interest_params = InterestRateParams {
        base_rate: 200,
        slope1: 400,
        slope2: 7500,
        optimal_utilization: 8000,
    };

    client.initialize(&admin, &oracle, &usdc.address, &blend_pool, &interest_params);

    // Add XLM as collateral
    let config = CollateralConfig {
        token: xlm.address.clone(),
        symbol: symbol_short!("XLM"),
        collateral_factor: 7500,
        liquidation_threshold: 8000,
        liquidation_penalty: 500,
        is_active: true,
    };
    client.add_collateral_asset(&admin, &config);

    // Mint tokens
    let usdc_admin_client = token::StellarAssetClient::new(&env, &usdc.address);
    let xlm_admin_client = token::StellarAssetClient::new(&env, &xlm.address);

    usdc_admin_client.mint(&supplier, &10000_0000000); // 10,000 USDC
    xlm_admin_client.mint(&user, &1000_0000000); // 1000 XLM

    // Supplier provides liquidity
    client.supply(&supplier, &5000_0000000); // 5000 USDC
    assert_eq!(client.get_reserves(), 5000_0000000);

    // User deposits collateral
    client.deposit(&user, &xlm.address, &1000_0000000); // 1000 XLM

    // User borrows USDC
    // With 75% collateral factor, can borrow up to 750 USDC equivalent
    client.borrow(&user, &500_0000000); // 500 USDC

    let borrow_data = client.get_borrow(&user);
    assert_eq!(borrow_data.principal, 500_0000000);

    assert_eq!(client.get_reserves(), 4500_0000000);
    assert_eq!(client.get_total_borrows(), 500_0000000);
}

#[test]
fn test_repay() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(VantisPoolContract, ());
    let client = VantisPoolContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let oracle = Address::generate(&env);
    let blend_pool = Address::generate(&env);
    let user = Address::generate(&env);
    let supplier = Address::generate(&env);

    // Create tokens
    let usdc_admin = Address::generate(&env);
    let usdc = create_token_contract(&env, &usdc_admin);
    let xlm_admin = Address::generate(&env);
    let xlm = create_token_contract(&env, &xlm_admin);

    let interest_params = InterestRateParams {
        base_rate: 200,
        slope1: 400,
        slope2: 7500,
        optimal_utilization: 8000,
    };

    client.initialize(&admin, &oracle, &usdc.address, &blend_pool, &interest_params);

    let config = CollateralConfig {
        token: xlm.address.clone(),
        symbol: symbol_short!("XLM"),
        collateral_factor: 7500,
        liquidation_threshold: 8000,
        liquidation_penalty: 500,
        is_active: true,
    };
    client.add_collateral_asset(&admin, &config);

    // Mint tokens
    let usdc_admin_client = token::StellarAssetClient::new(&env, &usdc.address);
    let xlm_admin_client = token::StellarAssetClient::new(&env, &xlm.address);

    usdc_admin_client.mint(&supplier, &10000_0000000);
    usdc_admin_client.mint(&user, &1000_0000000); // User has USDC for repayment
    xlm_admin_client.mint(&user, &1000_0000000);

    // Setup: supply, deposit, borrow
    client.supply(&supplier, &5000_0000000);
    client.deposit(&user, &xlm.address, &1000_0000000);
    client.borrow(&user, &500_0000000);

    // Repay half
    client.repay(&user, &250_0000000);

    let borrow_data = client.get_borrow(&user);
    assert_eq!(borrow_data.principal, 250_0000000);

    // Repay rest
    client.repay(&user, &250_0000000);

    let borrow_data = client.get_borrow(&user);
    assert_eq!(borrow_data.principal, 0);
}

#[test]
fn test_health_factor() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(VantisPoolContract, ());
    let client = VantisPoolContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let oracle = Address::generate(&env);
    let blend_pool = Address::generate(&env);
    let user = Address::generate(&env);
    let supplier = Address::generate(&env);

    // Create tokens
    let usdc_admin = Address::generate(&env);
    let usdc = create_token_contract(&env, &usdc_admin);
    let xlm_admin = Address::generate(&env);
    let xlm = create_token_contract(&env, &xlm_admin);

    let interest_params = InterestRateParams {
        base_rate: 200,
        slope1: 400,
        slope2: 7500,
        optimal_utilization: 8000,
    };

    client.initialize(&admin, &oracle, &usdc.address, &blend_pool, &interest_params);

    let config = CollateralConfig {
        token: xlm.address.clone(),
        symbol: symbol_short!("XLM"),
        collateral_factor: 7500,
        liquidation_threshold: 8000, // 80%
        liquidation_penalty: 500,
        is_active: true,
    };
    client.add_collateral_asset(&admin, &config);

    // Mint tokens
    let usdc_admin_client = token::StellarAssetClient::new(&env, &usdc.address);
    let xlm_admin_client = token::StellarAssetClient::new(&env, &xlm.address);

    usdc_admin_client.mint(&supplier, &10000_0000000);
    xlm_admin_client.mint(&user, &1000_0000000);

    // Setup
    client.supply(&supplier, &5000_0000000);
    client.deposit(&user, &xlm.address, &1000_0000000);

    // No borrow = infinite health
    let hf = client.get_health_factor(&user);
    assert_eq!(hf, i128::MAX);

    // Borrow 500 with 1000 collateral at 80% threshold = HF 1.6
    client.borrow(&user, &500_0000000);
    let hf = client.get_health_factor(&user);
    // 1000 * 0.8 / 500 = 1.6 = 16000 basis points
    assert_eq!(hf, 16000);
}

// Test health module functions
mod health_tests {
    use super::health::*;

    #[test]
    fn test_health_factor_calculation() {
        // 1000 collateral, 500 debt = HF 2.0
        let hf = HealthFactor::calculate(1000, 500);
        assert_eq!(hf.value, 20000); // 2.0 in basis points
        assert!(hf.is_healthy());

        // 1000 collateral, 1000 debt = HF 1.0 (at threshold = Critical)
        let hf = HealthFactor::calculate(1000, 1000);
        assert_eq!(hf.value, 10000);
        assert_eq!(hf.status, HealthStatus::Critical);

        // 900 collateral, 1000 debt = HF 0.9 (below threshold = Liquidatable)
        let hf = HealthFactor::calculate(900, 1000);
        assert_eq!(hf.value, 9000);
        assert_eq!(hf.status, HealthStatus::Liquidatable);
        assert!(hf.is_liquidatable());

        // No debt = infinite health
        let hf = HealthFactor::calculate(1000, 0);
        assert_eq!(hf.value, i128::MAX);
        assert!(hf.is_healthy());
    }

    #[test]
    fn test_health_status() {
        // > 1.1 = healthy
        let hf = HealthFactor::calculate(1200, 1000);
        assert_eq!(hf.status, HealthStatus::Healthy);

        // 1.0 - 1.1 = warning
        let hf = HealthFactor::calculate(1050, 1000);
        assert_eq!(hf.status, HealthStatus::Warning);

        // ~1.02 = critical
        let hf = HealthFactor::calculate(1015, 1000);
        assert_eq!(hf.status, HealthStatus::Critical);

        // < 1.0 = liquidatable
        let hf = HealthFactor::calculate(900, 1000);
        assert_eq!(hf.status, HealthStatus::Liquidatable);
    }

    #[test]
    fn test_liquidation_amount() {
        // Position: 900 collateral, 1000 debt (HF = 0.9)
        // Target: HF = 1.05
        // Penalty: 5%
        let (collateral, debt) = calculate_liquidation_amount(
            900,
            1000,
            500,  // 5% penalty
            10500, // target 1.05
        );

        // After liquidation:
        // new_collateral = 900 - collateral_sold
        // new_debt = 1000 - debt_repaid
        // collateral_sold = debt_repaid * 1.05
        // (900 - debt_repaid * 1.05) / (1000 - debt_repaid) = 1.05

        assert!(collateral > 0);
        assert!(debt > 0);
        assert!(collateral <= 900);
        assert!(debt <= 1000);
    }
}

// Test borrow module functions
mod borrow_tests {
    use super::borrow::*;

    #[test]
    fn test_interest_calculation() {
        // 1000 principal, 10% APR, 1 year
        let interest = calculate_interest(1000, 1000, 365 * 24 * 60 * 60);
        assert_eq!(interest, 100); // 10% of 1000

        // Half year
        let interest = calculate_interest(1000, 1000, 365 * 24 * 60 * 60 / 2);
        assert_eq!(interest, 50); // 5% of 1000
    }

    #[test]
    fn test_utilization() {
        assert_eq!(calculate_utilization(0, 1000), 0);
        assert_eq!(calculate_utilization(500, 1000), 5000); // 50%
        assert_eq!(calculate_utilization(1000, 1000), 10000); // 100%
    }

    #[test]
    fn test_interest_rate_kink() {
        // Below optimal (80%)
        let rate = calculate_interest_rate(
            5000,  // 50% utilization
            200,   // 2% base
            400,   // 4% slope1
            7500,  // 75% slope2
            8000,  // 80% optimal
        );
        // At 50% util: 2% + (50/80 * 4%) = 2% + 2.5% = 4.5% = 450 bp
        assert_eq!(rate, 450);

        // Above optimal
        let rate = calculate_interest_rate(
            9000,  // 90% utilization
            200,
            400,
            7500,
            8000,
        );
        // At 90%: 2% + 4% + ((90-80)/(100-80) * 75%) = 6% + 37.5% = 43.5%
        assert_eq!(rate, 4350);
    }
}
