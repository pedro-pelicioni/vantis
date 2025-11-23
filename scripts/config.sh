#!/bin/bash
# Vantis Protocol - Testnet Configuration
# This file contains all configuration variables for testnet deployment

set -e

# =============================================================================
# Network Configuration
# =============================================================================
export NETWORK="testnet"
export SOROBAN_RPC_URL="https://soroban-testnet.stellar.org"
export SOROBAN_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
export HORIZON_URL="https://horizon-testnet.stellar.org"
export FRIENDBOT_URL="https://friendbot.stellar.org"

# =============================================================================
# Directory Paths
# =============================================================================
export PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export CONTRACTS_DIR="${PROJECT_ROOT}/contracts"
export SCRIPTS_DIR="${PROJECT_ROOT}/scripts"
export DEPLOYMENTS_DIR="${PROJECT_ROOT}/deployments"
export TARGET_DIR="${CONTRACTS_DIR}/target/wasm32v1-none/release"

# =============================================================================
# Contract Names
# =============================================================================
export CONTRACTS=(
    "oracle-adapter"
    "blend-adapter"
    "vantis-pool"
    "risk-engine"
    "borrow-limit-policy"
)

# Contract WASM file names (derived from crate names with underscores)
export ORACLE_WASM="oracle_adapter.wasm"
export BLEND_ADAPTER_WASM="blend_adapter.wasm"
export VANTIS_POOL_WASM="vantis_pool.wasm"
export RISK_ENGINE_WASM="risk_engine.wasm"
export BORROW_LIMIT_WASM="borrow_limit_policy.wasm"

# =============================================================================
# Deployment Configuration
# =============================================================================
export DEPLOYMENT_FILE="${DEPLOYMENTS_DIR}/${NETWORK}.json"

# =============================================================================
# Default Risk Parameters
# =============================================================================
export DEFAULT_K_FACTOR=100              # 1% volatility sensitivity
export DEFAULT_TIME_HORIZON_DAYS=30
export DEFAULT_STOP_LOSS_THRESHOLD=10200 # 1.02 health factor
export DEFAULT_LIQUIDATION_THRESHOLD=10000 # 1.0 health factor
export DEFAULT_TARGET_HEALTH_FACTOR=10500 # 1.05 health factor
export DEFAULT_LIQUIDATION_PENALTY=500   # 5%
export DEFAULT_PROTOCOL_FEE=100          # 1%
export DEFAULT_MIN_COLLATERAL_FACTOR=3000 # 30% minimum LTV

# =============================================================================
# Interest Rate Parameters
# =============================================================================
export DEFAULT_BASE_RATE=200              # 2% base APR
export DEFAULT_SLOPE1=400                 # 4% slope below optimal
export DEFAULT_SLOPE2=7500                # 75% slope above optimal
export DEFAULT_OPTIMAL_UTILIZATION=8000   # 80% optimal utilization

# =============================================================================
# Collateral Asset Configuration
# =============================================================================
# XLM configuration
export XLM_COLLATERAL_FACTOR=7500        # 75%
export XLM_LIQUIDATION_THRESHOLD=8500    # 85%
export XLM_LIQUIDATION_PENALTY=500       # 5%

# =============================================================================
# Native Token Addresses (from Blend pool on testnet)
# =============================================================================
# Native XLM: Special Soroban address for native Stellar asset
export XLM_ADDRESS="CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4"

# Native USDC: Standard USDC contract on Stellar testnet
# Source: https://testnet.blend.capital/dashboard/?poolId=CCCJHH7GPF4AUS652AGSLOCYJDF3AJTOC4LHAZSUVXFG3UFONCHZYVYB
export USDC_ADDRESS="CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75"

# =============================================================================
# Blend Protocol Configuration
# =============================================================================
# Real Blend pool on testnet: https://testnet.blend.capital/dashboard/?poolId=CCCJHH7GPF4AUS652AGSLOCYJDF3AJTOC4LHAZSUVXFG3UFONCHZYVYB
export BLEND_POOL_ID="CCCJHH7GPF4AUS652AGSLOCYJDF3AJTOC4LHAZSUVXFG3UFONCHZYVYB"
export BLEND_DASHBOARD_URL="https://testnet.blend.capital/dashboard"

# =============================================================================
# Oracle Configuration
# =============================================================================
export PRICE_STALENESS_THRESHOLD=300     # 5 minutes

# =============================================================================
# Test Configuration
# =============================================================================
export TEST_DEPOSIT_AMOUNT=40000000      # 4 XLM (7 decimals) - collateral for USDC loan
export TEST_BORROW_AMOUNT=20000000       # 2 USDC (7 decimals) - realistic borrow based on 4 XLM collateral
export TEST_MINT_AMOUNT=50000000         # 5 XLM (7 decimals) - amount to mint to test users
export TEST_PRICE_XLM=10000000000000     # $0.10 with 14 decimals
export TEST_PRICE_BTC=4500000000000000000 # $45,000 with 14 decimals

# =============================================================================
# Colors for output
# =============================================================================
export RED='\033[0;31m'
export GREEN='\033[0;32m'
export YELLOW='\033[1;33m'
export BLUE='\033[0;34m'
export PURPLE='\033[0;35m'
export CYAN='\033[0;36m'
export NC='\033[0m' # No Color

# =============================================================================
# Helper Functions
# =============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

# Check if a command exists
check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "$1 is not installed. Please install it first."
        exit 1
    fi
}

# Generate a new keypair and fund it via friendbot
# Returns the account ALIAS (name) on stdout for use with --source
# The public key is saved in the keys file and can be retrieved with get_account_public_key
#
# Special case: For "admin" account used in deployment, returns PUBLIC KEY
# (for backwards compatibility with deployment script)
create_funded_account() {
    local name=$1
    local keys_file="${DEPLOYMENTS_DIR}/${name}_keys.json"

    if [[ -f "$keys_file" ]]; then
        # Check if the key exists in stellar CLI
        if stellar keys address "${name}" &>/dev/null; then
            log_info "Using existing keypair for ${name}" >&2
            # For admin account in deploy script, return public key for backwards compatibility
            if [[ "$name" == "admin" ]]; then
                jq -r '.public_key' "$keys_file"
            else
                echo "$name"
            fi
            return
        else
            # Key file exists but CLI key is missing - we CANNOT recover the secret key
            # Must generate a completely new keypair
            log_warning "Keys file exists but CLI key missing for ${name}" >&2
            log_warning "Secret key is lost - generating NEW keypair (old contracts will have different admin)" >&2
            rm -f "$keys_file"
            # Fall through to generate new key
        fi
    fi

    log_info "Creating new keypair for ${name}..." >&2
    stellar keys generate "${name}" --network testnet 2>/dev/null || true

    # Get the public key
    local public_key=$(stellar keys address "${name}" 2>/dev/null)

    if [[ -z "$public_key" ]]; then
        log_error "Failed to generate keypair for ${name}" >&2
        exit 1
    fi

    # Get the secret key
    local secret_key=$(stellar keys show "${name}" 2>/dev/null)

    if [[ -z "$secret_key" ]]; then
        log_error "Failed to get secret key for ${name}" >&2
        exit 1
    fi

    log_info "Funding account via friendbot..." >&2
    curl -s "${FRIENDBOT_URL}?addr=${public_key}" > /dev/null

    # Save keys info (name, public key, and secret key)
    echo "{\"name\": \"${name}\", \"public_key\": \"${public_key}\", \"secret_key\": \"${secret_key}\"}" > "$keys_file"

    log_success "Account ${name} created and funded: ${public_key}" >&2

    # For admin account in deploy script, return public key for backwards compatibility
    if [[ "$name" == "admin" ]]; then
        echo "$public_key"
    else
        echo "$name"
    fi
}

# Get the public key for an account alias
get_account_public_key() {
    local name=$1
    stellar keys address "${name}" 2>/dev/null
}

# Get deployment address from file
get_deployment_address() {
    local contract_name=$1
    if [[ -f "$DEPLOYMENT_FILE" ]]; then
        jq -r ".${contract_name} // empty" "$DEPLOYMENT_FILE"
    fi
}

# Save deployment address to file
save_deployment_address() {
    local contract_name=$1
    local address=$2

    if [[ ! -f "$DEPLOYMENT_FILE" ]]; then
        echo "{}" > "$DEPLOYMENT_FILE"
    fi

    local tmp=$(mktemp)
    jq ".${contract_name} = \"${address}\"" "$DEPLOYMENT_FILE" > "$tmp" && mv "$tmp" "$DEPLOYMENT_FILE"
    log_success "Saved ${contract_name} address: ${address}"
}

# Wait for transaction confirmation
wait_for_tx() {
    local tx_hash=$1
    local max_attempts=30
    local attempt=0

    while [[ $attempt -lt $max_attempts ]]; do
        local status=$(curl -s "${HORIZON_URL}/transactions/${tx_hash}" | jq -r '.successful // "pending"')
        if [[ "$status" == "true" ]]; then
            return 0
        elif [[ "$status" == "false" ]]; then
            log_error "Transaction failed: ${tx_hash}"
            return 1
        fi
        sleep 2
        ((attempt++))
    done

    log_error "Transaction timeout: ${tx_hash}"
    return 1
}
