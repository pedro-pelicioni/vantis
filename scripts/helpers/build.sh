#!/bin/bash
# =============================================================================
# Vantis Protocol - Build Helper
# =============================================================================
#
# Helper script to build contracts with various options.
#
# Usage:
#   ./scripts/helpers/build.sh [options]
#
# Options:
#   --release       Build in release mode (default)
#   --debug         Build in debug mode
#   --contract <n>  Build specific contract only
#   --clean         Clean before building
#   --help          Show this help message
#
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "${SCRIPT_DIR}/config.sh"

# Defaults
BUILD_MODE="release"
SPECIFIC_CONTRACT=""
CLEAN_FIRST=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --release)
            BUILD_MODE="release"
            shift
            ;;
        --debug)
            BUILD_MODE="debug"
            shift
            ;;
        --contract)
            SPECIFIC_CONTRACT="$2"
            shift 2
            ;;
        --clean)
            CLEAN_FIRST=true
            shift
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --release       Build in release mode (default)"
            echo "  --debug         Build in debug mode"
            echo "  --contract <n>  Build specific contract only"
            echo "  --clean         Clean before building"
            echo "  --help          Show this help message"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Main
main() {
    log_step "Building Vantis contracts..."

    cd "$CONTRACTS_DIR"

    # Clean if requested
    if [[ "$CLEAN_FIRST" == "true" ]]; then
        log_info "Cleaning build artifacts..."
        cargo clean
    fi

    # Build
    if [[ -n "$SPECIFIC_CONTRACT" ]]; then
        log_info "Building ${SPECIFIC_CONTRACT}..."
        stellar contract build --package "$SPECIFIC_CONTRACT"
    else
        log_info "Building all contracts..."
        stellar contract build
    fi

    # Optimize WASMs
    if [[ "$BUILD_MODE" == "release" ]]; then
        log_info "Optimizing WASM files..."
        for wasm in "${TARGET_DIR}"/*.wasm; do
            if [[ -f "$wasm" ]]; then
                local name=$(basename "$wasm")
                stellar contract optimize --wasm "$wasm" 2>/dev/null || true
                log_info "Optimized: ${name}"
            fi
        done
    fi

    # List built contracts
    log_success "Build complete!"
    echo ""
    log_info "Built contracts:"
    ls -lh "${TARGET_DIR}"/*.wasm 2>/dev/null || log_warning "No WASM files found"
}

main "$@"
