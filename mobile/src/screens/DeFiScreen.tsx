import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {useTheme} from '../theme/ThemeContext';
import {useWallet} from '../contexts/WalletContext';
import {StatusBar} from '../components/StatusBar';
import {Ionicons} from '@expo/vector-icons';
import {spacing, borderRadius, colors} from '../theme/colors';

export const DeFiScreen: React.FC = () => {
  const {colors: themeColors} = useTheme();
  const {account, isConnected} = useWallet();

  if (!isConnected || !account) {
    return (
      <View style={[styles.container, {backgroundColor: themeColors.bgPrimary}]}>
        <StatusBar />
        <View style={styles.content}>
          <Ionicons name="wallet-outline" size={64} color={themeColors.textSecondary} />
          <Text style={[styles.text, {color: themeColors.textSecondary}]}>
            Connect your wallet to view tokens
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, {backgroundColor: themeColors.bgPrimary}]}>
      <StatusBar />
      <View style={styles.content}>
        <Text style={[styles.title, {color: themeColors.textPrimary}]}>
          Your Tokens
        </Text>
        {account.assets.map((asset, index) => (
          <View
            key={index}
            style={[
              styles.tokenCard,
              {
                backgroundColor: themeColors.bgCard,
                borderColor: themeColors.borderColor,
              },
            ]}>
            <View style={styles.tokenInfo}>
              <View style={[styles.tokenIcon, {backgroundColor: `${colors.accentTeal}20`}]}>
                <Ionicons name="wallet" size={24} color={colors.accentTeal} />
              </View>
              <View style={styles.tokenDetails}>
                <Text style={[styles.tokenName, {color: themeColors.textPrimary}]}>
                  {asset.assetCode}
                </Text>
                <Text style={[styles.tokenBalance, {color: themeColors.textSecondary}]}>
                  {asset.balance} {asset.assetCode}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 80,
  },
  content: {
    padding: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  tokenCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  tokenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  tokenIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenDetails: {
    flex: 1,
  },
  tokenName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  tokenBalance: {
    fontSize: 14,
  },
  text: {
    fontSize: 16,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});

