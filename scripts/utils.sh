#!/bin/bash
# Vantis Protocol - Utility Functions
# Reusable functions for deployment and testing

set -e

# Source config if not already loaded
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/config.sh"

# =============================================================================
# Build Functions
# =============================================================================

build_contracts() {
    log_step "Building all contracts..."
    cd "$CONTRACTS_DIR"

    stellar contract build

    log_success "All contracts built successfully"

    # Verify WASM files exist
    for wasm in "$ORACLE_WASM" "$BLEND_ADAPTER_WASM" "$VANTIS_POOL_WASM" "$RISK_ENGINE_WASM" "$BORROW_LIMIT_WASM"; do
        if [[ ! -f "${TARGET_DIR}/${wasm}" ]]; then
            log_error "WASM file not found: ${wasm}"
            exit 1
        fi
        log_info "Found: ${wasm}"
    done
}

# =============================================================================
# Deploy Functions
# =============================================================================

deploy_contract() {
    local wasm_file=$1
    local contract_name=$2
    local source_account=$3

    log_step "Deploying ${contract_name}..."

    # Check if already deployed
    local existing=$(get_deployment_address "$contract_name")
    if [[ -n "$existing" ]]; then
        log_warning "${contract_name} already deployed at: ${existing}"
        echo "$existing"
        return
    fi

    local result=$(stellar contract deploy \
        --wasm "${TARGET_DIR}/${wasm_file}" \
        --source "${source_account}" \
        --network testnet \
        2>&1)

    local contract_id=$(echo "$result" | grep -oE 'C[A-Z0-9]{55}' | head -1)

    if [[ -z "$contract_id" ]]; then
        log_error "Failed to deploy ${contract_name}: ${result}"
        exit 1
    fi

    save_deployment_address "$contract_name" "$contract_id"
    log_success "${contract_name} deployed: ${contract_id}"
    echo "$contract_id"
}

# =============================================================================
# Contract Invocation Functions
# =============================================================================

invoke_contract() {
    local contract_id=$1
    local function_name=$2
    local source_account=$3
    shift 3
    local args=("$@")

    # Build the command with proper quoting
    local cmd="stellar contract invoke --id '${contract_id}' --source '${source_account}' --network testnet -- ${function_name}"

    for arg in "${args[@]}"; do
        cmd="${cmd} ${arg}"
    done

    # Log the full command being executed (for debugging)
    if [[ "${VERBOSE:-false}" == "true" ]]; then
        log_info "📋 Executing contract invocation:"
        log_info "   Contract ID: ${contract_id}"
        log_info "   Function: ${function_name}"
        log_info "   Source: ${source_account}"
        log_info "   Arguments: ${args[@]}"
        log_info "   Full Command: ${cmd}"
    fi

    local result
    local stderr_output
    
    # Capture both stdout and stderr separately for better debugging
    result=$(eval "$cmd" 2>&1)
    local exit_code=$?

    # Log the full response for debugging
    if [[ "${VERBOSE:-false}" == "true" ]]; then
        log_info "📤 Contract invocation response:"
        log_info "   Exit Code: ${exit_code}"
        log_info "   Output: ${result}"
    fi

    if [[ $exit_code -ne 0 ]]; then
        log_error "❌ Invocation failed with exit code ${exit_code}"
        log_error "   Contract: ${contract_id}"
        log_error "   Function: ${function_name}"
        log_error "   Error Output: ${result}" >&2
        return 1
    fi

    # Extract transaction hash if present (64 character hex string)
    local tx_hash=$(echo "$result" | grep -oE '[a-f0-9]{64}' | head -1)
    if [[ -n "$tx_hash" ]]; then
        echo "TX:${tx_hash}"
    else
        echo "$result"
    fi
}

# Read-only contract call (no auth required)
read_contract() {
    local contract_id=$1
    local function_name=$2
    shift 2
    local args=("$@")

    local cmd="stellar contract invoke --id '${contract_id}' --network testnet --source 'admin' -- ${function_name}"

    for arg in "${args[@]}"; do
        cmd="${cmd} ${arg}"
    done

    # Log the full command being executed (for debugging)
    if [[ "${VERBOSE:-false}" == "true" ]]; then
        log_info "📖 Executing read-only contract call:"
        log_info "   Contract ID: ${contract_id}"
        log_info "   Function: ${function_name}"
        log_info "   Arguments: ${args[@]}"
        log_info "   Full Command: ${cmd}"
    fi

    local result
    result=$(eval "$cmd" 2>&1)
    local exit_code=$?

    # Log the full response for debugging
    if [[ "${VERBOSE:-false}" == "true" ]]; then
        log_info "📥 Read-only contract response:"
        log_info "   Exit Code: ${exit_code}"
        log_info "   Output: ${result}"
    fi

    echo "$result"
}

# =============================================================================
# Token Functions
# =============================================================================

deploy_token() {
    local name=$1
    local symbol=$2
    local decimals=$3
    local admin=$4

    log_step "Deploying ${symbol} token..."

    local existing=$(get_deployment_address "token_${symbol}")
    if [[ -n "$existing" ]]; then
        log_warning "${symbol} token already deployed at: ${existing}"
        echo "$existing"
        return
    fi

    # Deploy a SAC token wrapper
    # For testnet, we'll use the native XLM asset or create a custom token
    local result=$(stellar contract asset deploy \
        --asset "${symbol}:${admin}" \
        --source "${admin}" \
        --network testnet \
        2>&1)

    local token_id=$(echo "$result" | grep -oE 'C[A-Z0-9]{55}' | head -1)

    if [[ -n "$token_id" ]]; then
        save_deployment_address "token_${symbol}" "$token_id"
        log_success "${symbol} token deployed: ${token_id}"
        echo "$token_id"
    else
        log_warning "Could not deploy ${symbol} token as SAC, using placeholder"
        echo ""
    fi
}

mint_tokens() {
    local token_id=$1
    local to=$2
    local amount=$3
    local admin=$4

    log_info "Minting ${amount} tokens to ${to}..."

    invoke_contract "$token_id" "mint" "$admin" \
        "--to" "$to" \
        "--amount" "$amount"
}

# =============================================================================
# Test Assertion Functions
# =============================================================================

assert_equals() {
    local expected=$1
    local actual=$2
    local message=$3

    if [[ "$expected" == "$actual" ]]; then
        log_success "PASS: ${message}"
        return 0
    else
        log_error "FAIL: ${message}"
        log_error "  Expected: ${expected}"
        log_error "  Actual: ${actual}"
        return 1
    fi
}

assert_not_empty() {
    local value=$1
    local message=$2

    if [[ -n "$value" ]]; then
        log_success "PASS: ${message}"
        return 0
    else
        log_error "FAIL: ${message} (value is empty)"
        return 1
    fi
}

assert_contains() {
    local haystack=$1
    local needle=$2
    local message=$3

    if [[ "$haystack" == *"$needle"* ]]; then
        log_success "PASS: ${message}"
        return 0
    else
        log_error "FAIL: ${message}"
        log_error "  String '${haystack}' does not contain '${needle}'"
        return 1
    fi
}

assert_greater_than() {
    local value=$1
    local threshold=$2
    local message=$3

    if [[ "$value" -gt "$threshold" ]]; then
        log_success "PASS: ${message}"
        return 0
    else
        log_error "FAIL: ${message}"
        log_error "  ${value} is not greater than ${threshold}"
        return 1
    fi
}

# =============================================================================
# Test Runner Functions
# =============================================================================

run_test() {
    local test_name=$1
    local test_function=$2

    echo ""
    echo "=========================================="
    echo "TEST: ${test_name}"
    echo "=========================================="

    if $test_function; then
        log_success "TEST PASSED: ${test_name}"
        return 0
    else
        log_error "TEST FAILED: ${test_name}"
        return 1
    fi
}

# =============================================================================
# Blend Pool Configuration
# =============================================================================

# Configure the BlendAdapter to use the real Blend pool
configure_blend_adapter() {
    local blend_adapter=$1
    local blend_pool=$2
    local admin=$3

    log_info "Configuring BlendAdapter to use Blend pool: ${blend_pool}"

    local result=$(invoke_contract "$blend_adapter" "set_blend_pool" "$admin" \
        "--caller" "$admin" \
        "--blend_pool" "$blend_pool" 2>&1)

    if [[ "$result" == *"error"* ]] || [[ "$result" == *"Error"* ]]; then
        log_warning "Failed to configure BlendAdapter: ${result}"
        return 1
    fi

    log_success "BlendAdapter configured with Blend pool"
    return 0
}

# Get the Blend pool address from BlendAdapter
get_blend_pool_from_adapter() {
    local blend_adapter=$1

    local result=$(read_contract "$blend_adapter" "blend_pool" 2>&1)
    echo "$result" | grep -oE 'C[A-Z0-9]{55}' | head -1
}

# =============================================================================
# Cleanup Functions
# =============================================================================

cleanup_test_accounts() {
    log_step "Cleaning up test accounts..."
    rm -f "${DEPLOYMENTS_DIR}"/test_*_keys.json
    log_success "Test accounts cleaned up"
}

reset_deployment() {
    log_warning "Resetting deployment file..."
    rm -f "$DEPLOYMENT_FILE"
    echo "{}" > "$DEPLOYMENT_FILE"
    log_success "Deployment reset"
}
