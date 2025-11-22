// Passkey Service for Soroban Smart Wallets
// Based on: https://kalepail.com/blockchain/the-passkey-powered-future-of-web3
// Reference: https://github.com/kalepail/soroban-passkey

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

export interface PasskeyCredential {
  id: string;
  publicKey: string; // secp256r1 public key in base64
  rawId: ArrayBuffer;
  response: {
    clientDataJSON: string;
    attestationObject: string;
  };
}

export interface PasskeyAccount {
  credentialId: string;
  publicKey: string;
  contractAddress?: string; // Soroban contract address
  createdAt: number;
}

class PasskeyService {
  private readonly STORAGE_KEY = 'vantis_passkey_accounts';
  private readonly RP_ID = 'vantis.app'; // Relying Party ID
  private readonly RP_NAME = 'Vantis';

  // Check if passkeys are supported
  async isSupported(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      return false;
    }
  }

  // Register a new passkey (create account)
  async register(username: string): Promise<PasskeyAccount> {
    try {
      // Check if passkeys are supported
      const supported = await this.isSupported();
      if (!supported) {
        throw new Error('Passkeys are not supported on this device');
      }

      // For React Native, we'll use biometric authentication
      // In a full implementation, this would use WebAuthn API
      // For now, we'll create a mock passkey account with biometric verification
      
      const authenticated = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Create your passkey',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
        fallbackLabel: 'Use passcode',
      });

      if (!authenticated.success) {
        throw new Error('Biometric authentication failed');
      }

      // Generate a mock secp256r1 keypair
      // In production, this would use WebAuthn API to generate the actual keypair
      const credentialId = this.generateCredentialId();
      const publicKey = this.generateMockPublicKey();

      const passkeyAccount: PasskeyAccount = {
        credentialId,
        publicKey,
        createdAt: Date.now(),
      };

      // Store the passkey account
      await this.savePasskeyAccount(passkeyAccount);

      return passkeyAccount;
    } catch (error: any) {
      throw new Error(`Failed to register passkey: ${error.message || error}`);
    }
  }

  // Authenticate with existing passkey (sign in)
  async authenticate(): Promise<PasskeyAccount> {
    try {
      const supported = await this.isSupported();
      if (!supported) {
        throw new Error('Passkeys are not supported on this device');
      }

      // Get saved passkey accounts
      const accounts = await this.getPasskeyAccounts();
      if (accounts.length === 0) {
        throw new Error('No passkey account found. Please register first.');
      }

      // For now, use the first account (in production, show account picker)
      const account = accounts[0];

      // Authenticate with biometric
      const authenticated = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Sign in with your passkey',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
        fallbackLabel: 'Use passcode',
      });

      if (!authenticated.success) {
        throw new Error('Biometric authentication failed');
      }

      return account;
    } catch (error: any) {
      throw new Error(`Failed to authenticate: ${error.message || error}`);
    }
  }

  // Sign data with passkey (for transaction signing)
  async sign(account: PasskeyAccount, data: string): Promise<string> {
    try {
      // Authenticate first
      const authenticated = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Sign transaction',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (!authenticated.success) {
        throw new Error('Authentication required for signing');
      }

      // In production, this would use WebAuthn get() to sign the data
      // For now, return a mock signature
      // The actual signature would be verified by the Soroban contract's __check_auth
      return this.generateMockSignature(data, account.credentialId);
    } catch (error: any) {
      throw new Error(`Failed to sign: ${error.message || error}`);
    }
  }

  // Get all saved passkey accounts
  async getPasskeyAccounts(): Promise<PasskeyAccount[]> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return [];
      }
      return JSON.parse(stored);
    } catch (error) {
      return [];
    }
  }

  // Save passkey account
  private async savePasskeyAccount(account: PasskeyAccount): Promise<void> {
    const accounts = await this.getPasskeyAccounts();
    // Check if account already exists
    const existingIndex = accounts.findIndex(
      a => a.credentialId === account.credentialId,
    );
    if (existingIndex >= 0) {
      accounts[existingIndex] = account;
    } else {
      accounts.push(account);
    }
    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(accounts));
  }

  // Delete passkey account
  async deletePasskeyAccount(credentialId: string): Promise<void> {
    const accounts = await this.getPasskeyAccounts();
    const filtered = accounts.filter(a => a.credentialId !== credentialId);
    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  // Link Soroban contract address to passkey account
  async linkContractAddress(
    credentialId: string,
    contractAddress: string,
  ): Promise<void> {
    const accounts = await this.getPasskeyAccounts();
    const account = accounts.find(a => a.credentialId === credentialId);
    if (account) {
      account.contractAddress = contractAddress;
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(accounts));
    }
  }

  // Generate mock credential ID
  private generateCredentialId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Generate mock secp256r1 public key (base64)
  // In production, this would come from WebAuthn create() response
  private generateMockPublicKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    for (let i = 0; i < 88; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Generate mock signature
  // In production, this would come from WebAuthn get() response
  private generateMockSignature(data: string, credentialId: string): string {
    const combined = `${data}:${credentialId}:${Date.now()}`;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    for (let i = 0; i < 128; i++) {
      const index = (combined.charCodeAt(i % combined.length) + i) % chars.length;
      result += chars.charAt(index);
    }
    return result;
  }
}

export const passkeyService = new PasskeyService();

