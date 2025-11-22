#!/bin/bash
# =============================================================================
# Vantis Protocol - Contract Invocation Helper
# =============================================================================
#
# Helper script to invoke contract functions easily.
#
# Usage:
#   ./scripts/helpers/invoke.sh <contract> <function> [args...]
#
# Examples:
#   ./scripts/helpers/invoke.sh oracle_adapter get_price --asset XLM
#   ./scripts/helpers/invoke.sh vantis_pool admin
#   ./scripts/helpers/invoke.sh risk_engine get_params
#
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "${SCRIPT_DIR}/config.sh"

# Check arguments
if [[ $# -lt 2 ]]; then
    echo "Usage: $0 <contract> <function> [args...]"
    echo ""
    echo "Available contracts:"
    echo "  - oracle_adapter"
    echo "  - blend_adapter"
    echo "  - vantis_pool"
    echo "  - risk_engine"
    echo "  - borrow_limit_policy"
    echo ""
    echo "Examples:"
    echo "  $0 oracle_adapter get_assets"
    echo "  $0 vantis_pool admin"
    echo "  $0 risk_engine get_params"
    exit 1
fi

CONTRACT_NAME=$1
FUNCTION_NAME=$2
shift 2

# Get contract address
CONTRACT_ADDRESS=$(get_deployment_address "$CONTRACT_NAME")

if [[ -z "$CONTRACT_ADDRESS" ]]; then
    log_error "Contract ${CONTRACT_NAME} not found in deployment file"
    log_info "Available contracts:"
    cat "$DEPLOYMENT_FILE" | jq -r 'keys[]'
    exit 1
fi

log_info "Contract: ${CONTRACT_NAME}"
log_info "Address: ${CONTRACT_ADDRESS}"
log_info "Function: ${FUNCTION_NAME}"

# Build command
CMD="stellar contract invoke \
    --id ${CONTRACT_ADDRESS} \
    --network testnet \
    --source admin \
    -- ${FUNCTION_NAME}"

# Add remaining arguments
for arg in "$@"; do
    CMD="${CMD} ${arg}"
done

log_info "Executing: ${CMD}"
echo ""

# Execute
eval "$CMD"
