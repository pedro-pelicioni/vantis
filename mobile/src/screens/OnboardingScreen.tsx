import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../theme/ThemeContext';
import {StatusBar} from '../components/StatusBar';
import {spacing, borderRadius, colors} from '../theme/colors';

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation();
  const {colors: themeColors} = useTheme();

  const createAccount = () => {
    // Navigate to wallet connection after onboarding
    navigation.navigate('WalletConnect' as never);
  };

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: themeColors.bgPrimary}]}>
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
            To keep your account secure, Vantis App uses passkeys, a
            passwordless authentication method protected by your device biometric
            verification.
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
              },
            ]}
            onPress={createAccount}
            activeOpacity={0.8}>
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

