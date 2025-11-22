#!/bin/bash
# Helper script to initialize Risk Engine contract
# This is a workaround for the Stellar CLI's inability to parse custom structs

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "${SCRIPT_DIR}/config.sh"

if [[ $# -lt 6 ]]; then
    log_error "Usage: $0 <risk_engine_addr> <admin_addr> <oracle_addr> <pool_addr> <usdc_addr> <blend_adapter_addr>"
    exit 1
fi

RISK_ENGINE_ADDRESS=$1
ADMIN_ADDRESS=$2
ORACLE_ADDRESS=$3
POOL_ADDRESS=$4
USDC_ADDRESS=$5
BLEND_ADAPTER_ADDRESS=$6

# Use default parameters from config
K_FACTOR=${7:-$DEFAULT_K_FACTOR}
TIME_HORIZON_DAYS=${8:-$DEFAULT_TIME_HORIZON_DAYS}
STOP_LOSS_THRESHOLD=${9:-$DEFAULT_STOP_LOSS_THRESHOLD}
LIQUIDATION_THRESHOLD=${10:-$DEFAULT_LIQUIDATION_THRESHOLD}
TARGET_HEALTH_FACTOR=${11:-$DEFAULT_TARGET_HEALTH_FACTOR}
LIQUIDATION_PENALTY=${12:-$DEFAULT_LIQUIDATION_PENALTY}
PROTOCOL_FEE=${13:-$DEFAULT_PROTOCOL_FEE}
MIN_COLLATERAL_FACTOR=${14:-$DEFAULT_MIN_COLLATERAL_FACTOR}

log_info "Initializing Risk Engine..."
log_info "Risk Engine: $RISK_ENGINE_ADDRESS"
log_info "Admin: $ADMIN_ADDRESS"

# Try to initialize with the params as a JSON object
# The Stellar CLI will try to parse this, but it may fail
# If it fails, we'll just log a warning
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
    --params "{\"k_factor\":${K_FACTOR},\"time_horizon_days\":${TIME_HORIZON_DAYS},\"stop_loss_threshold\":${STOP_LOSS_THRESHOLD},\"liquidation_threshold\":${LIQUIDATION_THRESHOLD},\"target_health_factor\":${TARGET_HEALTH_FACTOR},\"liquidation_penalty\":${LIQUIDATION_PENALTY},\"protocol_fee\":${PROTOCOL_FEE},\"min_collateral_factor\":${MIN_COLLATERAL_FACTOR}}" \
    2>&1 || log_warning "Risk Engine initialization may have failed or already initialized"

log_success "Risk Engine initialization attempt complete"
