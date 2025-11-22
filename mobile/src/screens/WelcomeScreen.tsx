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
import {Ionicons} from '@expo/vector-icons';
import {useTheme} from '../theme/ThemeContext';
import {useWallet} from '../contexts/WalletContext';
import {StatusBar} from '../components/StatusBar';
import {VantisLogo} from '../components/VantisLogo';
import {passkeyService} from '../services/passkeyService';
import {walletService} from '../services/walletService';
import {spacing, borderRadius, colors} from '../theme/colors';

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const {colors: themeColors} = useTheme();
  const insets = useSafeAreaInsets();
  const {connectWallet} = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const createAccount = () => {
    navigation.navigate('Onboarding' as never);
  };

  const handleLogin = async () => {
    try {
      setIsLoginLoading(true);

      // Check if passkeys are supported
      const supported = await passkeyService.isSupported();
      if (!supported) {
        Alert.alert(
          'Passkeys Not Supported',
          'Your device does not support passkeys. Please enable biometric authentication in your device settings.',
        );
        setIsLoginLoading(false);
        return;
      }

      // Authenticate with passkey
      const passkeyAccount = await passkeyService.authenticate();

      if (!passkeyAccount.contractAddress) {
        // If no contract address linked, navigate to wallet connect
        navigation.navigate('WalletConnect' as never);
        setIsLoginLoading(false);
        return;
      }

      // Connect wallet using the linked contract address
      const walletAccount = await walletService.connectWallet(
        passkeyAccount.contractAddress,
      );

      // Connect to wallet context
      await connectWallet(passkeyAccount.contractAddress);

      // Navigate to home
      navigation.navigate('Home' as never);
    } catch (error: any) {
      if (error.message.includes('No passkey account found')) {
        // No passkey found, navigate to onboarding
        navigation.navigate('Onboarding' as never);
      } else {
        Alert.alert('Error', error.message || 'Failed to sign in with passkey');
      }
    } finally {
      setIsLoginLoading(false);
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
            <VantisLogo size="large" variant="light" showText={true} />
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
            Pay later in installments{'\n'}and hold your crypto
          </Text>

          <View style={styles.carouselIndicators}>
            <View style={styles.indicator} />
            <View style={[styles.indicator, styles.indicatorActive]} />
            <View style={styles.indicator} />
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
            disabled={isLoading || isLoginLoading}>
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
                  Create an account
                </Text>
                <Text style={styles.btnIcon}>🔑</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.loginLink}>
            <Text style={[styles.loginText, {color: themeColors.textSecondary}]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading || isLoginLoading}>
              {isLoginLoading ? (
                <ActivityIndicator size="small" color={colors.accentTeal} />
              ) : (
                <Text
                  style={[
                    styles.loginLinkText,
                    {
                      color: colors.accentTeal,
                    },
                  ]}>
                  Sign in with passkey
                </Text>
              )}
            </TouchableOpacity>
          </View>
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
    alignItems: 'center',
    justifyContent: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  textSection: {
    padding: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: spacing.lg,
    lineHeight: 42,
    textAlign: 'center',
  },
  carouselIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  indicatorActive: {
    backgroundColor: colors.accentTeal,
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
  loginLink: {
    flexDirection: 'row',
    fontSize: 14,
  },
  loginText: {
    fontSize: 14,
  },
  loginLinkText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

