import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {useTheme} from '../theme/ThemeContext';
import {useWallet} from '../contexts/WalletContext';
import {StatusBar} from '../components/StatusBar';
import {spacing, borderRadius, colors} from '../theme/colors';

export const ReceiveScreen: React.FC = () => {
  const navigation = useNavigation();
  const {colors: themeColors} = useTheme();
  const {account} = useWallet();
  const insets = useSafeAreaInsets();
  const [copied, setCopied] = useState(false);

  const walletAddress = account?.publicKey || '';

  const copyToClipboard = () => {
    // In a real app, use Clipboard API
    Alert.alert('Copied!', 'Wallet address copied to clipboard');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple QR Code representation (in production, use a QR code library)
  const renderQRCode = () => {
    return (
      <View style={[styles.qrContainer, {backgroundColor: themeColors.bgCard, borderColor: themeColors.borderColor}]}>
        <View style={styles.qrGrid}>
          {Array.from({length: 25}).map((_, i) => (
            <View
              key={i}
              style={[
                styles.qrCell,
                {
                  backgroundColor: Math.random() > 0.5 ? themeColors.textPrimary : themeColors.bgCard,
                },
              ]}
            />
          ))}
        </View>
        <Text style={[styles.qrText, {color: themeColors.textSecondary}]}>
          Scan to receive
        </Text>
      </View>
    );
  };

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: themeColors.bgPrimary}]}
      contentContainerStyle={{paddingBottom: insets.bottom + 80}}>
      <StatusBar />
      <View
        style={[
          styles.header,
          {
            borderBottomColor: themeColors.borderColor,
            paddingTop: insets.top,
          },
        ]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: themeColors.textPrimary}]}>
          Receive
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {renderQRCode()}

        <View style={[styles.addressCard, {backgroundColor: themeColors.bgCard, borderColor: themeColors.borderColor}]}>
          <Text style={[styles.addressLabel, {color: themeColors.textSecondary}]}>
            Your Wallet Address
          </Text>
          <View style={styles.addressContainer}>
            <Text style={[styles.addressText, {color: themeColors.textPrimary}]} numberOfLines={1}>
              {walletAddress}
            </Text>
            <TouchableOpacity
              style={[styles.copyButton, {backgroundColor: colors.accentTeal}]}
              onPress={copyToClipboard}
              activeOpacity={0.8}>
              <Ionicons
                name={copied ? 'checkmark' : 'copy'}
                size={20}
                color={themeColors.bgPrimary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={colors.accentTeal} />
          <Text style={[styles.infoText, {color: themeColors.textSecondary}]}>
            Share this address to receive payments. Only send Stellar (XLM) or supported tokens to this address.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  qrContainer: {
    width: 250,
    height: 250,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  qrGrid: {
    width: 200,
    height: 200,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  qrCell: {
    width: '20%',
    height: '20%',
  },
  qrText: {
    fontSize: 12,
    textAlign: 'center',
  },
  addressCard: {
    width: '100%',
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  addressLabel: {
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  copyButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});

