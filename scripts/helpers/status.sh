#!/bin/bash
# =============================================================================
# Vantis Protocol - Deployment Status Helper
# =============================================================================
#
# Shows the current deployment status and contract addresses.
#
# Usage:
#   ./scripts/helpers/status.sh
#
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "${SCRIPT_DIR}/config.sh"

main() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════════╗"
    echo "║           Vantis Protocol - Deployment Status                    ║"
    echo "╚═══════════════════════════════════════════════════════════════════╝"
    echo ""

    echo -e "${CYAN}Network:${NC} ${NETWORK}"
    echo -e "${CYAN}RPC URL:${NC} ${SOROBAN_RPC_URL}"
    echo ""

    if [[ ! -f "$DEPLOYMENT_FILE" ]]; then
        log_warning "No deployment found. Run deploy-testnet.sh first."
        exit 0
    fi

    echo -e "${GREEN}Deployed Contracts:${NC}"
    echo "──────────────────────────────────────────────────────────────────────"

    # Read and display all deployments
    while IFS="=" read -r key value; do
        key=$(echo "$key" | tr -d '"' | tr -d ' ')
        value=$(echo "$value" | tr -d '"' | tr -d ',' | tr -d ' ')
        if [[ -n "$key" ]] && [[ -n "$value" ]]; then
            printf "${BLUE}%-25s${NC} %s\n" "$key:" "$value"
        fi
    done < <(jq -r 'to_entries[] | "\(.key)=\(.value)"' "$DEPLOYMENT_FILE")

    echo ""
    echo "──────────────────────────────────────────────────────────────────────"
    echo -e "${CYAN}Deployment file:${NC} ${DEPLOYMENT_FILE}"
    echo ""

    # Check contract health
    log_step "Checking contract health..."

    local oracle_addr=$(get_deployment_address "oracle_adapter")
    local pool_addr=$(get_deployment_address "vantis_pool")
    local risk_addr=$(get_deployment_address "risk_engine")

    if [[ -n "$oracle_addr" ]]; then
        local oracle_check=$(stellar contract invoke --id "$oracle_addr" --network testnet --source admin -- get_assets 2>&1)
        if [[ $? -eq 0 ]]; then
            echo -e "${GREEN}✓${NC} Oracle Adapter is responding"
        else
            echo -e "${RED}✗${NC} Oracle Adapter not responding"
        fi
    fi

    if [[ -n "$pool_addr" ]]; then
        local pool_check=$(stellar contract invoke --id "$pool_addr" --network testnet --source admin -- admin 2>&1)
        if [[ $? -eq 0 ]]; then
            echo -e "${GREEN}✓${NC} Vantis Pool is responding"
        else
            echo -e "${RED}✗${NC} Vantis Pool not responding"
        fi
    fi

    if [[ -n "$risk_addr" ]]; then
        local risk_check=$(stellar contract invoke --id "$risk_addr" --network testnet --source admin -- admin 2>&1)
        if [[ $? -eq 0 ]]; then
            echo -e "${GREEN}✓${NC} Risk Engine is responding"
        else
            echo -e "${RED}✗${NC} Risk Engine not responding"
        fi
    fi

    echo ""
}

main "$@"
