import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Ionicons} from '@expo/vector-icons';
import {useTheme} from '../theme/ThemeContext';
import {useWallet} from '../contexts/WalletContext';
import {StatusBar} from '../components/StatusBar';
import {spacing, borderRadius, colors} from '../theme/colors';

export const PayModeScreen: React.FC = () => {
  const navigation = useNavigation();
  const {colors: themeColors} = useTheme();
  const {isConnected} = useWallet();

  const paymentOptions = [
    {
      title: 'Send',
      subtitle: 'Transfer to another wallet',
      icon: 'send',
      onPress: () => navigation.navigate('Transfer' as never),
    },
    {
      title: 'Receive',
      subtitle: 'Show your wallet address',
      icon: 'download',
      onPress: () => navigation.navigate('Receive' as never),
    },
    {
      title: 'Credit Dashboard',
      subtitle: 'View credit and collateral',
      icon: 'trending-up',
      onPress: () => navigation.navigate('CreditDashboard' as never),
    },
  ];

  if (!isConnected) {
    return (
      <View style={[styles.container, {backgroundColor: themeColors.bgPrimary}]}>
        <StatusBar />
        <View style={styles.emptyState}>
          <Ionicons name="wallet-outline" size={64} color={themeColors.textSecondary} />
          <Text style={[styles.emptyText, {color: themeColors.textPrimary}]}>
            Connect your wallet to use payment features
          </Text>
          <TouchableOpacity
            style={[styles.connectButton, {backgroundColor: colors.accentTeal}]}
            onPress={() => navigation.navigate('WalletConnect' as never)}>
            <Text style={[styles.connectButtonText, {color: themeColors.bgPrimary}]}>
              Connect Wallet
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, {backgroundColor: themeColors.bgPrimary}]}>
      <StatusBar />
      <View style={styles.content}>
        <Text style={[styles.title, {color: themeColors.textPrimary}]}>
          Payment Options
        </Text>

        {paymentOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionCard,
              {
                backgroundColor: themeColors.bgCard,
                borderColor: themeColors.borderColor,
              },
            ]}
            onPress={option.onPress}
            activeOpacity={0.7}>
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: `${colors.accentTeal}20`,
                },
              ]}>
              <Ionicons name={option.icon as any} size={24} color={colors.accentTeal} />
            </View>
            <View style={styles.optionInfo}>
              <Text style={[styles.optionTitle, {color: themeColors.textPrimary}]}>
                {option.title}
              </Text>
              <Text style={[styles.optionSubtitle, {color: themeColors.textSecondary}]}>
                {option.subtitle}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={themeColors.textSecondary}
            />
          </TouchableOpacity>
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
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  optionSubtitle: {
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  connectButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.medium,
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

