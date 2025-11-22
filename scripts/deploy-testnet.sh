#!/bin/bash
# =============================================================================
# Vantis Protocol - Testnet Deployment Script
# =============================================================================
#
# This script deploys all Vantis Protocol contracts to Stellar testnet.
#
# Usage:
#   ./scripts/deploy-testnet.sh [options]
#
# Options:
#   --reset     Reset deployment and redeploy all contracts
#   --build     Build contracts before deploying
#   --help      Show this help message
#
# Prerequisites:
#   - Stellar CLI installed (stellar --version)
#   - Rust and cargo installed
#   - wasm32-unknown-unknown target installed
#
# =============================================================================

set -e

# Source configuration and utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/config.sh"
source "${SCRIPT_DIR}/utils.sh"

# =============================================================================
# Command Line Arguments
# =============================================================================

RESET_DEPLOYMENT=false
BUILD_CONTRACTS=true

while [[ $# -gt 0 ]]; do
    case $1 in
        --reset)
            RESET_DEPLOYMENT=true
            shift
            ;;
        --build)
            BUILD_CONTRACTS=true
            shift
            ;;
        --no-build)
            BUILD_CONTRACTS=false
            shift
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --reset     Reset deployment and redeploy all contracts"
            echo "  --build     Build contracts before deploying (default)"
            echo "  --no-build  Skip building contracts"
            echo "  --help      Show this help message"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# =============================================================================
# Main Deployment Script
# =============================================================================

main() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════════╗"
    echo "║           Vantis Protocol - Testnet Deployment                   ║"
    echo "╚═══════════════════════════════════════════════════════════════════╝"
    echo ""

    # Check prerequisites
    log_step "Checking prerequisites..."
    check_command "stellar"
    check_command "cargo"
    check_command "jq"
    check_command "curl"
    log_success "All prerequisites met"

    # Reset if requested
    if [[ "$RESET_DEPLOYMENT" == "true" ]]; then
        reset_deployment
    fi

    # Create deployments directory
    mkdir -p "$DEPLOYMENTS_DIR"

    # Initialize deployment file
    if [[ ! -f "$DEPLOYMENT_FILE" ]]; then
        echo "{}" > "$DEPLOYMENT_FILE"
    fi

    # Build contracts
    if [[ "$BUILD_CONTRACTS" == "true" ]]; then
        build_contracts
    fi

    # Create and fund admin account
    log_step "Setting up admin account..."
    ADMIN_ADDRESS=$(create_funded_account "admin")
    save_deployment_address "admin" "$ADMIN_ADDRESS"
    log_success "Admin account: ${ADMIN_ADDRESS}"

    # Deploy tokens (USDC mock for testnet)
    deploy_mock_tokens

    # Deploy contracts in dependency order
    deploy_all_contracts

    # Initialize contracts
    initialize_all_contracts

    # Configure contracts
    configure_contracts

    # Print summary
    print_deployment_summary
}

# =============================================================================
# Deploy Mock Tokens
# =============================================================================

deploy_mock_tokens() {
    log_step "Deploying mock tokens for testnet..."

    # For testnet, we'll use the native XLM and deploy a mock USDC
    # The native XLM SAC address on testnet
    local xlm_sac="CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC"
    save_deployment_address "token_XLM" "$xlm_sac"
    log_info "Using native XLM SAC: ${xlm_sac}"

    # Deploy mock USDC token
    ADMIN_ADDRESS=$(get_deployment_address "admin")

    # For simplicity, we'll use a placeholder for USDC
    # In production, you'd use the actual USDC SAC
    local usdc_placeholder="CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA"
    save_deployment_address "token_USDC" "$usdc_placeholder"
    log_info "Using USDC placeholder: ${usdc_placeholder}"

    log_success "Mock tokens configured"
}

# =============================================================================
# Deploy All Contracts
# =============================================================================

deploy_all_contracts() {
    log_step "Deploying all contracts..."

    ADMIN_ADDRESS=$(get_deployment_address "admin")

    # 1. Deploy Oracle Adapter
    ORACLE_ADDRESS=$(deploy_contract "$ORACLE_WASM" "oracle_adapter" "admin")

    # 2. Deploy Blend Adapter
    BLEND_ADAPTER_ADDRESS=$(deploy_contract "$BLEND_ADAPTER_WASM" "blend_adapter" "admin")

    # 3. Deploy Vantis Pool
    POOL_ADDRESS=$(deploy_contract "$VANTIS_POOL_WASM" "vantis_pool" "admin")

    # 4. Deploy Risk Engine
    RISK_ENGINE_ADDRESS=$(deploy_contract "$RISK_ENGINE_WASM" "risk_engine" "admin")

    # 5. Deploy Borrow Limit Policy
    BORROW_LIMIT_ADDRESS=$(deploy_contract "$BORROW_LIMIT_WASM" "borrow_limit_policy" "admin")

    log_success "All contracts deployed"
}

# =============================================================================
# Initialize All Contracts
# =============================================================================

initialize_all_contracts() {
    log_step "Initializing all contracts..."

    # Get addresses
    ADMIN_ADDRESS=$(get_deployment_address "admin")
    ORACLE_ADDRESS=$(get_deployment_address "oracle_adapter")
    BLEND_ADAPTER_ADDRESS=$(get_deployment_address "blend_adapter")
    POOL_ADDRESS=$(get_deployment_address "vantis_pool")
    RISK_ENGINE_ADDRESS=$(get_deployment_address "risk_engine")
    USDC_ADDRESS=$(get_deployment_address "token_USDC")
    XLM_ADDRESS=$(get_deployment_address "token_XLM")

    # Mock Blend pool address (would be real Blend pool in production)
    MOCK_BLEND_POOL="CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFCT4"

    # 1. Initialize Oracle Adapter
    log_info "Initializing Oracle Adapter..."
    stellar contract invoke \
        --id "$ORACLE_ADDRESS" \
        --source admin \
        --network testnet \
        -- initialize \
        --admin "$ADMIN_ADDRESS" \
        --oracle_contract "$MOCK_BLEND_POOL" \
        2>/dev/null || log_warning "Oracle may already be initialized"

    # 2. Initialize Blend Adapter
    log_info "Initializing Blend Adapter..."
    stellar contract invoke \
        --id "$BLEND_ADAPTER_ADDRESS" \
        --source admin \
        --network testnet \
        -- initialize \
        --admin "$ADMIN_ADDRESS" \
        --blend_pool "$MOCK_BLEND_POOL" \
        --oracle "$ORACLE_ADDRESS" \
        --usdc_token "$USDC_ADDRESS" \
        2>/dev/null || log_warning "Blend Adapter may already be initialized"

    # 3. Initialize Vantis Pool
    log_info "Initializing Vantis Pool..."
    stellar contract invoke \
        --id "$POOL_ADDRESS" \
        --source admin \
        --network testnet \
        -- initialize \
        --admin "$ADMIN_ADDRESS" \
        --oracle "$ORACLE_ADDRESS" \
        --usdc_token "$USDC_ADDRESS" \
        --blend_pool_address "$BLEND_ADAPTER_ADDRESS" \
        --interest_params '{"base_rate":'"${DEFAULT_BASE_RATE}"',"slope1":'"${DEFAULT_SLOPE1}"',"slope2":'"${DEFAULT_SLOPE2}"',"optimal_utilization":'"${DEFAULT_OPTIMAL_UTILIZATION}"'}' \
        2>/dev/null || log_warning "Vantis Pool may already be initialized"

    # 4. Initialize Risk Engine
    log_info "Initializing Risk Engine..."
    stellar contract invoke \
        --id "$RISK_ENGINE_ADDRESS" \
        --source admin \
        --network testnet \
        -- initialize \
        --admin "$ADMIN_ADDRESS" \
        --oracle "$ORACLE_ADDRESS" \
        --pool "$POOL_ADDRESS" \
        --usdc_token "$USDC_ADDRESS" \
        --blend_adapter "$BLEND_ADAPTER_ADDRESS" \
        --params '{"k_factor":'"${DEFAULT_K_FACTOR}"',"time_horizon_days":'"${DEFAULT_TIME_HORIZON_DAYS}"',"stop_loss_threshold":'"${DEFAULT_STOP_LOSS_THRESHOLD}"',"liquidation_threshold":'"${DEFAULT_LIQUIDATION_THRESHOLD}"',"target_health_factor":'"${DEFAULT_TARGET_HEALTH_FACTOR}"',"liquidation_penalty":'"${DEFAULT_LIQUIDATION_PENALTY}"',"protocol_fee":'"${DEFAULT_PROTOCOL_FEE}"',"min_collateral_factor":'"${DEFAULT_MIN_COLLATERAL_FACTOR}"'}' \
        2>/dev/null || log_warning "Risk Engine may already be initialized"

    log_success "All contracts initialized"
}

# =============================================================================
# Configure Contracts
# =============================================================================

configure_contracts() {
    log_step "Configuring contracts..."

    ADMIN_ADDRESS=$(get_deployment_address "admin")
    ORACLE_ADDRESS=$(get_deployment_address "oracle_adapter")
    BLEND_ADAPTER_ADDRESS=$(get_deployment_address "blend_adapter")
    POOL_ADDRESS=$(get_deployment_address "vantis_pool")
    RISK_ENGINE_ADDRESS=$(get_deployment_address "risk_engine")
    XLM_ADDRESS=$(get_deployment_address "token_XLM")
    USDC_ADDRESS=$(get_deployment_address "token_USDC")

    # Add XLM as supported asset in Oracle
    log_info "Adding XLM to Oracle..."
    stellar contract invoke \
        --id "$ORACLE_ADDRESS" \
        --source admin \
        --network testnet \
        -- add_asset \
        --caller "$ADMIN_ADDRESS" \
        --config '{"symbol":"XLM","contract":"'"${XLM_ADDRESS}"'","decimals":7,"base_ltv":'"${XLM_COLLATERAL_FACTOR}"',"liquidation_threshold":'"${XLM_LIQUIDATION_THRESHOLD}"'}' \
        2>/dev/null || log_warning "XLM may already be added to Oracle"

    # Register XLM in Blend Adapter
    log_info "Registering XLM in Blend Adapter..."
    stellar contract invoke \
        --id "$BLEND_ADAPTER_ADDRESS" \
        --source admin \
        --network testnet \
        -- register_asset \
        --caller "$ADMIN_ADDRESS" \
        --asset "$XLM_ADDRESS" \
        --reserve_index 0 \
        2>/dev/null || log_warning "XLM may already be registered in Blend Adapter"

    # Add XLM as collateral asset in Pool
    log_info "Adding XLM as collateral in Pool..."
    stellar contract invoke \
        --id "$POOL_ADDRESS" \
        --source admin \
        --network testnet \
        -- add_collateral_asset \
        --caller "$ADMIN_ADDRESS" \
        --config '{"token":"'"${XLM_ADDRESS}"'","symbol":"XLM","collateral_factor":'"${XLM_COLLATERAL_FACTOR}"',"liquidation_threshold":'"${XLM_LIQUIDATION_THRESHOLD}"',"liquidation_penalty":'"${XLM_LIQUIDATION_PENALTY}"',"is_active":true}' \
        2>/dev/null || log_warning "XLM may already be added as collateral"

    # Link Risk Engine to Pool
    log_info "Linking Risk Engine to Pool..."
    stellar contract invoke \
        --id "$POOL_ADDRESS" \
        --source admin \
        --network testnet \
        -- set_risk_engine \
        --caller "$ADMIN_ADDRESS" \
        --risk_engine "$RISK_ENGINE_ADDRESS" \
        2>/dev/null || log_warning "Risk Engine may already be linked"

    # Set initial XLM price in Oracle
    log_info "Setting initial XLM price..."
    stellar contract invoke \
        --id "$ORACLE_ADDRESS" \
        --source admin \
        --network testnet \
        -- update_price \
        --caller "$ADMIN_ADDRESS" \
        --asset XLM \
        --price "$TEST_PRICE_XLM" \
        2>/dev/null || log_warning "Price update may have failed"

    log_success "Contracts configured"
}

# =============================================================================
# Print Deployment Summary
# =============================================================================

print_deployment_summary() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════════╗"
    echo "║                    Deployment Summary                             ║"
    echo "╚═══════════════════════════════════════════════════════════════════╝"
    echo ""

    echo -e "${CYAN}Network:${NC} ${NETWORK}"
    echo -e "${CYAN}RPC URL:${NC} ${SOROBAN_RPC_URL}"
    echo ""

    echo -e "${GREEN}Deployed Contracts:${NC}"
    echo "──────────────────────────────────────────────────────────────────────"

    if [[ -f "$DEPLOYMENT_FILE" ]]; then
        echo -e "${BLUE}Admin:${NC}              $(get_deployment_address 'admin')"
        echo -e "${BLUE}Oracle Adapter:${NC}     $(get_deployment_address 'oracle_adapter')"
        echo -e "${BLUE}Blend Adapter:${NC}      $(get_deployment_address 'blend_adapter')"
        echo -e "${BLUE}Vantis Pool:${NC}        $(get_deployment_address 'vantis_pool')"
        echo -e "${BLUE}Risk Engine:${NC}        $(get_deployment_address 'risk_engine')"
        echo -e "${BLUE}Borrow Limit Policy:${NC} $(get_deployment_address 'borrow_limit_policy')"
        echo ""
        echo -e "${BLUE}XLM Token:${NC}          $(get_deployment_address 'token_XLM')"
        echo -e "${BLUE}USDC Token:${NC}         $(get_deployment_address 'token_USDC')"
    fi

    echo ""
    echo "──────────────────────────────────────────────────────────────────────"
    echo -e "${CYAN}Deployment file:${NC} ${DEPLOYMENT_FILE}"
    echo ""
    log_success "Deployment complete!"
}

# =============================================================================
# Run Main
# =============================================================================

main "$@"
