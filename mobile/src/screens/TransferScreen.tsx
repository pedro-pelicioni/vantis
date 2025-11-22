import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {useTheme} from '../theme/ThemeContext';
import {useWallet} from '../contexts/WalletContext';
import {walletService} from '../services/walletService';
import {LoadingSpinner} from '../components/LoadingSpinner';
import {spacing, borderRadius, colors} from '../theme/colors';

export const TransferScreen: React.FC = () => {
  const navigation = useNavigation();
  const {colors: themeColors} = useTheme();
  const {account, refreshAccount, loadTransactions} = useWallet();
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [asset, setAsset] = useState('XLM');
  const [isSending, setIsSending] = useState(false);
  const insets = useSafeAreaInsets();

  const handleSend = async () => {
    if (!destination.trim()) {
      Alert.alert('Error', 'Please enter a destination address');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!account) {
      Alert.alert('Error', 'No wallet connected');
      return;
    }

    const balance = parseFloat(account.balance);
    if (parseFloat(amount) > balance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    try {
      setIsSending(true);
      const txHash = await walletService.sendPayment(destination.trim(), amount, asset);
      
      Alert.alert('Success', `Transaction sent!\nHash: ${txHash}`, [
        {
          text: 'OK',
          onPress: async () => {
            await refreshAccount();
            await loadTransactions();
            navigation.goBack();
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send transaction');
    } finally {
      setIsSending(false);
    }
  };

  const setMaxAmount = () => {
    if (account) {
      setAmount(account.balance);
    }
  };

  if (isSending) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: themeColors.bgPrimary}]}>
      <View style={styles.content}>
        <View style={[styles.header, {paddingTop: insets.top}]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={themeColors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.title, {color: themeColors.textPrimary}]}>
            Send Payment
          </Text>
        </View>

        <View
          style={[
            styles.balanceCard,
            {
              backgroundColor: themeColors.bgCard,
              borderColor: themeColors.borderColor,
            },
          ]}>
          <Text style={[styles.balanceLabel, {color: themeColors.textSecondary}]}>
            Available Balance
          </Text>
          <Text style={[styles.balanceAmount, {color: themeColors.textPrimary}]}>
            {account?.balance || '0.00'} {asset}
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={[styles.label, {color: themeColors.textPrimary}]}>
            Destination Address
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: themeColors.bgCard,
                borderColor: themeColors.borderColor,
                color: themeColors.textPrimary,
              },
            ]}
            placeholder="Enter Stellar public key (G...)"
            placeholderTextColor={themeColors.textSecondary}
            value={destination}
            onChangeText={setDestination}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={styles.amountRow}>
            <View style={styles.amountInputContainer}>
              <Text style={[styles.label, {color: themeColors.textPrimary}]}>
                Amount
              </Text>
              <View style={styles.amountInputRow}>
                <TextInput
                  style={[
                    styles.amountInput,
                    {
                      backgroundColor: themeColors.bgCard,
                      borderColor: themeColors.borderColor,
                      color: themeColors.textPrimary,
                    },
                  ]}
                  placeholder="0.00"
                  placeholderTextColor={themeColors.textSecondary}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                />
                <TouchableOpacity
                  style={[
                    styles.maxButton,
                    {
                      backgroundColor: colors.accentTeal,
                    },
                  ]}
                  onPress={setMaxAmount}>
                  <Text
                    style={[
                      styles.maxButtonText,
                      {
                        color: themeColors.bgPrimary,
                      },
                    ]}>
                    MAX
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.assetSelector}>
              <Text style={[styles.label, {color: themeColors.textPrimary}]}>
                Asset
              </Text>
              <TouchableOpacity
                style={[
                  styles.assetButton,
                  {
                    backgroundColor: themeColors.bgCard,
                    borderColor: themeColors.borderColor,
                  },
                ]}>
                <Text style={[styles.assetText, {color: themeColors.textPrimary}]}>
                  {asset}
                </Text>
                <Ionicons name="chevron-down" size={20} color={themeColors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: colors.accentTeal,
              },
            ]}
            onPress={handleSend}
            activeOpacity={0.8}>
            <Ionicons name="send" size={20} color={themeColors.bgPrimary} />
            <Text
              style={[
                styles.sendButtonText,
                {
                  color: themeColors.bgPrimary,
                },
              ]}>
              Send Payment
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
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  backButton: {
    marginRight: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  balanceCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
  },
  form: {
    gap: spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    fontSize: 16,
  },
  amountRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  amountInputContainer: {
    flex: 2,
  },
  amountInputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  amountInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    fontSize: 18,
    fontWeight: '600',
  },
  maxButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.small,
    justifyContent: 'center',
  },
  maxButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  assetSelector: {
    flex: 1,
  },
  assetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    marginTop: spacing.sm * 4,
  },
  assetText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  sendButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
});

