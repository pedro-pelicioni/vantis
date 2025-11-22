import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../theme/ThemeContext';
import {useWallet} from '../contexts/WalletContext';
import {StatusBar} from '../components/StatusBar';
import {passkeyService} from '../services/passkeyService';
import {walletService} from '../services/walletService';
import {spacing, borderRadius, colors} from '../theme/colors';

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation();
  const {colors: themeColors} = useTheme();
  const insets = useSafeAreaInsets();
  const {connectWallet} = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const createAccount = async () => {
    try {
      setIsLoading(true);

      // Check if passkeys are supported
      const supported = await passkeyService.isSupported();
      if (!supported) {
        Alert.alert(
          'Passkeys Not Supported',
          'Your device does not support passkeys. Please enable biometric authentication in your device settings.',
        );
        setIsLoading(false);
        return;
      }

      // Register a new passkey
      const passkeyAccount = await passkeyService.register('user');

      // Generate a wallet and link it to the passkey
      const {publicKey} = await walletService.generateWallet();
      
      // Connect wallet with the passkey account
      const walletAccount = await walletService.connectWallet(publicKey);
      
      // Link passkey to wallet
      await passkeyService.linkContractAddress(
        passkeyAccount.credentialId,
        publicKey,
      );

      // Connect to wallet context
      await connectWallet(publicKey);

      // Navigate to home
      navigation.navigate('Home' as never);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Failed to create account with passkey',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: themeColors.bgPrimary}]}
      contentContainerStyle={{paddingTop: insets.top}}>
      <StatusBar />
      <View style={styles.content}>
        <View style={styles.illustrationSection}>
          <View
            style={[
              styles.illustrationBg,
              {
                backgroundColor: colors.accentTealDark,
                opacity: 0.3,
              },
            ]}
          />
          <View style={styles.illustrationElements}>
            <Text style={styles.keyIcon}>🔑</Text>
            <View
              style={[
                styles.biometricIcon,
                {
                  backgroundColor: 'rgba(255, 215, 0, 0.9)',
                },
              ]}>
              <Text style={styles.biometricIconText}>👤</Text>
            </View>
            <View
              style={[
                styles.lockIcon,
                {
                  backgroundColor: 'rgba(255, 215, 0, 0.9)',
                },
              ]}>
              <Text style={styles.lockIconText}>🔒</Text>
            </View>
          </View>
        </View>

        <View style={styles.textSection}>
          <Text
            style={[
              styles.title,
              {
                color: colors.accentTeal,
              },
            ]}>
            A secure and easy way to access your account
          </Text>
          <Text
            style={[
              styles.description,
              {
                color: themeColors.textPrimary,
              },
            ]}>
            Vantis uses passkeys powered by WebAuthn and secp256r1 cryptography.
            Your account is secured by your device's biometric authentication
            (fingerprint or face ID). No passwords, no seed phrases - just two taps
            to create your self-custodial smart wallet.
          </Text>

          <View style={styles.terms}>
            <Text
              style={[
                styles.termsText,
                {
                  color: themeColors.textSecondary,
                },
              ]}>
              By continuing, I accept the{' '}
              <Text
                style={[
                  styles.termsLink,
                  {
                    color: colors.accentTeal,
                  },
                ]}>
                Terms & Conditions
              </Text>
              .
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.createBtn,
              {
                backgroundColor: colors.accentTeal,
                opacity: isLoading ? 0.6 : 1,
              },
            ]}
            onPress={createAccount}
            activeOpacity={0.8}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color={themeColors.bgPrimary} />
            ) : (
              <>
                <Text
                  style={[
                    styles.btnText,
                    {
                      color: themeColors.bgPrimary,
                    },
                  ]}>
                  Set passkey and create account
                </Text>
                <Text style={styles.btnIcon}>🔑</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity>
            <Text
              style={[
                styles.learnMore,
                {
                  color: colors.accentTeal,
                },
              ]}>
              Learn more about passkeys
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    flexDirection: 'column',
  },
  illustrationSection: {
    flex: 1,
    position: 'relative',
    minHeight: 300,
    overflow: 'hidden',
  },
  illustrationBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 200,
    transform: [{scale: 1.5}],
  },
  illustrationElements: {
    position: 'relative',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  keyIcon: {
    fontSize: 80,
    transform: [{rotate: '-15deg'}],
  },
  biometricIcon: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  biometricIconText: {
    fontSize: 30,
  },
  lockIcon: {
    position: 'absolute',
    bottom: '20%',
    right: '10%',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIconText: {
    fontSize: 30,
  },
  textSection: {
    padding: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.md,
    lineHeight: 36,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  terms: {
    marginBottom: spacing.lg,
  },
  termsText: {
    fontSize: 14,
    textAlign: 'center',
  },
  termsLink: {
    textDecorationLine: 'underline',
  },
  createBtn: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.md,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  btnIcon: {
    fontSize: 20,
  },
  learnMore: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

