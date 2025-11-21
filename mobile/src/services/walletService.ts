import {Keypair, Server, TransactionBuilder, Operation, Asset, Networks} from '@stellar/stellar-sdk';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STELLAR_NETWORK = Networks.TESTNET; // Change to Networks.PUBLIC for mainnet
const HORIZON_URL = 'https://horizon-testnet.stellar.org'; // Change for mainnet

export interface WalletAccount {
  publicKey: string;
  secretKey?: string; // Only stored encrypted
  balance: string;
  assets: AssetBalance[];
}

export interface AssetBalance {
  assetCode: string;
  assetIssuer?: string;
  balance: string;
  limit?: string;
}

export interface Transaction {
  id: string;
  type: 'payment' | 'credit' | 'installment';
  amount: string;
  asset: string;
  from: string;
  to: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  installments?: InstallmentInfo;
}

export interface InstallmentInfo {
  total: number;
  current: number;
  amount: string;
  dueDate: number;
}

class WalletService {
  private server: Server;
  private currentAccount: WalletAccount | null = null;

  constructor() {
    this.server = new Server(HORIZON_URL);
  }

  // Generate new wallet
  async generateWallet(): Promise<{publicKey: string; secretKey: string}> {
    const keypair = Keypair.random();
    return {
      publicKey: keypair.publicKey(),
      secretKey: keypair.secret(),
    };
  }

  // Connect to existing wallet (OpenZeppelin Smart Account compatible)
  async connectWallet(publicKey: string): Promise<WalletAccount> {
    try {
      const account = await this.server.loadAccount(publicKey);
      
      const balances: AssetBalance[] = account.balances.map(balance => ({
        assetCode: balance.asset_code || 'XLM',
        assetIssuer: balance.asset_issuer,
        balance: balance.balance,
        limit: balance.limit,
      }));

      const walletAccount: WalletAccount = {
        publicKey: account.accountId(),
        balance: balances.find(b => b.assetCode === 'XLM')?.balance || '0',
        assets: balances,
      };

      this.currentAccount = walletAccount;
      await this.saveWallet(publicKey);
      
      return walletAccount;
    } catch (error) {
      throw new Error(`Failed to connect wallet: ${error}`);
    }
  }

  // Save wallet connection
  async saveWallet(publicKey: string): Promise<void> {
    await AsyncStorage.setItem('wallet_public_key', publicKey);
  }

  // Get saved wallet
  async getSavedWallet(): Promise<string | null> {
    return await AsyncStorage.getItem('wallet_public_key');
  }

  // Disconnect wallet
  async disconnectWallet(): Promise<void> {
    await AsyncStorage.removeItem('wallet_public_key');
    this.currentAccount = null;
  }

  // Get current account
  getCurrentAccount(): WalletAccount | null {
    return this.currentAccount;
  }

  // Refresh account balance
  async refreshAccount(): Promise<WalletAccount> {
    if (!this.currentAccount) {
      throw new Error('No wallet connected');
    }
    return await this.connectWallet(this.currentAccount.publicKey);
  }

  // Send payment (wallet to wallet)
  async sendPayment(
    destination: string,
    amount: string,
    assetCode: string = 'XLM',
    assetIssuer?: string,
  ): Promise<string> {
    if (!this.currentAccount) {
      throw new Error('No wallet connected');
    }

    // In a real implementation, you would need the secret key
    // For now, this is a placeholder that returns a transaction hash
    // In production, use OpenZeppelin Smart Account for signing
    
    const asset = assetCode === 'XLM' 
      ? Asset.native() 
      : new Asset(assetCode, assetIssuer!);

    // This is a mock transaction - in real app, use Smart Account signing
    const transactionHash = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return transactionHash;
  }

  // Get transaction history
  async getTransactionHistory(limit: number = 20): Promise<Transaction[]> {
    if (!this.currentAccount) {
      return [];
    }

    // Mock transactions - in real app, fetch from Stellar network
    return [
      {
        id: 'tx_1',
        type: 'payment',
        amount: '100.00',
        asset: 'XLM',
        from: this.currentAccount.publicKey,
        to: 'G...',
        timestamp: Date.now() - 86400000,
        status: 'completed',
      },
    ];
  }

  // Request credit (using collateral)
  async requestCredit(
    amount: string,
    collateralAsset: string,
    collateralAmount: string,
  ): Promise<string> {
    if (!this.currentAccount) {
      throw new Error('No wallet connected');
    }

    // Mock credit request - in real app, interact with Soroban smart contract
    const creditId = `credit_${Date.now()}`;
    return creditId;
  }

  // Get credit information
  async getCreditInfo(): Promise<{
    totalCredit: string;
    usedCredit: string;
    availableCredit: string;
    ltv: number;
    collateralValue: string;
  }> {
    // Mock data - in real app, fetch from smart contract
    return {
      totalCredit: '5000.00',
      usedCredit: '1200.00',
      availableCredit: '3800.00',
      ltv: 0.6,
      collateralValue: '2000.00',
    };
  }
}

export const walletService = new WalletService();

