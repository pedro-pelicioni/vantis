// Helper script to initialize Risk Engine contract
// This is a workaround for the Stellar CLI's inability to parse custom structs

use std::env;
use std::process::Command;

fn main() {
    let args: Vec<String> = env::args().collect();
    
    if args.len() < 8 {
        eprintln!("Usage: init-risk-engine <risk_engine_addr> <admin_addr> <oracle_addr> <pool_addr> <usdc_addr> <blend_adapter_addr> <k_factor> <time_horizon_days> [other_params...]");
        std::process::exit(1);
    }
    
    let risk_engine = &args[1];
    let admin = &args[2];
    let oracle = &args[3];
    let pool = &args[4];
    let usdc = &args[5];
    let blend_adapter = &args[6];
    let k_factor = &args[7];
    let time_horizon_days = &args[8];
    let stop_loss_threshold = args.get(9).map(|s| s.as_str()).unwrap_or("10200");
    let liquidation_threshold = args.get(10).map(|s| s.as_str()).unwrap_or("10000");
    let target_health_factor = args.get(11).map(|s| s.as_str()).unwrap_or("10500");
    let liquidation_penalty = args.get(12).map(|s| s.as_str()).unwrap_or("500");
    let protocol_fee = args.get(13).map(|s| s.as_str()).unwrap_or("100");
    let min_collateral_factor = args.get(14).map(|s| s.as_str()).unwrap_or("3000");
    
    // Build the stellar contract invoke command
    let output = Command::new("stellar")
        .arg("contract")
        .arg("invoke")
        .arg("--id")
        .arg(risk_engine)
        .arg("--source")
        .arg("admin")
        .arg("--network")
        .arg("testnet")
        .arg("--")
        .arg("initialize")
        .arg("--admin")
        .arg(admin)
        .arg("--oracle")
        .arg(oracle)
        .arg("--pool")
        .arg(pool)
        .arg("--usdc_token")
        .arg(usdc)
        .arg("--blend_adapter")
        .arg(blend_adapter)
        .arg("--params")
        .arg(format!(
            "{{\"k_factor\":{},\"time_horizon_days\":{},\"stop_loss_threshold\":{},\"liquidation_threshold\":{},\"target_health_factor\":{},\"liquidation_penalty\":{},\"protocol_fee\":{},\"min_collateral_factor\":{}}}",
            k_factor, time_horizon_days, stop_loss_threshold, liquidation_threshold,
            target_health_factor, liquidation_penalty, protocol_fee, min_collateral_factor
        ))
        .output();
    
    match output {
        Ok(output) => {
            println!("{}", String::from_utf8_lossy(&output.stdout));
            if !output.status.success() {
                eprintln!("{}", String::from_utf8_lossy(&output.stderr));
                std::process::exit(output.status.code().unwrap_or(1));
            }
        }
        Err(e) => {
            eprintln!("Failed to execute stellar command: {}", e);
            std::process::exit(1);
        }
    }
}
