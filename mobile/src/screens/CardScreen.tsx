import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {useTheme} from '../theme/ThemeContext';
import {useWallet} from '../contexts/WalletContext';
import {StatusBar} from '../components/StatusBar';
import {CardVisualScreen} from './CardVisualScreen';
import {spacing, borderRadius, colors} from '../theme/colors';

export const CardScreen: React.FC = () => {
  const navigation = useNavigation();
  const {colors: themeColors} = useTheme();
  const {account, isConnected} = useWallet();
  const insets = useSafeAreaInsets();

  if (!isConnected) {
    return (
      <View style={[styles.container, {backgroundColor: themeColors.bgPrimary}]}>
        <StatusBar />
        <View style={[styles.header, {paddingTop: insets.top}]}>
          <Text style={[styles.headerTitle, {color: themeColors.textPrimary}]}>
            Card
          </Text>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="card-outline" size={64} color={themeColors.textSecondary} />
          <Text style={[styles.emptyText, {color: themeColors.textPrimary}]}>
            Connect your wallet to view your card
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

  return <CardVisualScreen />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
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

