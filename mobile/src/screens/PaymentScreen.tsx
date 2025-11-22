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
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {useTheme} from '../theme/ThemeContext';
import {useWallet} from '../contexts/WalletContext';
import {LoadingSpinner} from '../components/LoadingSpinner';
import {spacing, borderRadius, colors} from '../theme/colors';

interface PaymentScreenParams {
  amount?: string;
  merchant?: string;
}

export const PaymentScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = (route.params as PaymentScreenParams) || {};
  const {colors: themeColors} = useTheme();
  const {account} = useWallet();
  const [amount, setAmount] = useState(params.amount || '');
  const [merchant, setMerchant] = useState(params.merchant || '');
  const insets = useSafeAreaInsets();
  const [installments, setInstallments] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const installmentOptions = [1, 2, 3, 4, 5, 6, 10, 12];
  const installmentAmount = amount ? (parseFloat(amount) / installments).toFixed(2) : '0.00';

  const handlePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!account) {
      Alert.alert('Error', 'No wallet connected');
      return;
    }

    try {
      setIsProcessing(true);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Payment Scheduled',
        `Payment of ${amount} ${installments > 1 ? `split into ${installments} installments` : ''} has been scheduled.\n\nFirst installment: ${installmentAmount}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
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
            Make Payment
          </Text>
        </View>

        <View
          style={[
            styles.paymentCard,
            {
              backgroundColor: themeColors.bgCard,
              borderColor: themeColors.borderColor,
            },
          ]}>
          <View style={styles.merchantSection}>
            <Ionicons name="storefront" size={32} color={colors.accentTeal} />
            <Text style={[styles.merchantName, {color: themeColors.textPrimary}]}>
              {merchant || 'Merchant Name'}
            </Text>
          </View>

          <View style={styles.amountSection}>
            <Text style={[styles.amountLabel, {color: themeColors.textSecondary}]}>
              Total Amount
            </Text>
            <TextInput
              style={[
                styles.amountInput,
                {
                  color: themeColors.textPrimary,
                },
              ]}
              placeholder="0.00"
              placeholderTextColor={themeColors.textSecondary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={styles.installmentsSection}>
          <Text style={[styles.sectionTitle, {color: themeColors.textPrimary}]}>
            Choose Installments
          </Text>
          <Text style={[styles.sectionSubtitle, {color: themeColors.textSecondary}]}>
            Pay in {installments} {installments === 1 ? 'payment' : 'payments'} of{' '}
            {installmentAmount}
          </Text>

          <View style={styles.installmentOptions}>
            {installmentOptions.map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.installmentOption,
                  {
                    backgroundColor:
                      installments === option
                        ? colors.accentTeal
                        : themeColors.bgCard,
                    borderColor:
                      installments === option
                        ? colors.accentTeal
                        : themeColors.borderColor,
                  },
                ]}
                onPress={() => setInstallments(option)}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.installmentText,
                    {
                      color:
                        installments === option
                          ? themeColors.bgPrimary
                          : themeColors.textPrimary,
                    },
                  ]}>
                  {option}x
                </Text>
                {installments === option && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={themeColors.bgPrimary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {installments > 1 && (
          <View
            style={[
              styles.installmentInfo,
              {
                backgroundColor: themeColors.bgCard,
                borderColor: themeColors.borderColor,
              },
            ]}>
            <Ionicons name="information-circle" size={20} color={colors.accentTeal} />
            <View style={styles.installmentInfoText}>
              <Text style={[styles.infoTitle, {color: themeColors.textPrimary}]}>
                Installment Plan
              </Text>
              <Text style={[styles.infoText, {color: themeColors.textSecondary}]}>
                {installments} payments of {installmentAmount} each
              </Text>
              <Text style={[styles.infoText, {color: themeColors.textSecondary}]}>
                Total: {amount || '0.00'}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.payButton,
            {
              backgroundColor: colors.accentTeal,
            },
          ]}
          onPress={handlePayment}
          activeOpacity={0.8}>
          <Ionicons name="card" size={20} color={themeColors.bgPrimary} />
          <Text
            style={[
              styles.payButtonText,
              {
                color: themeColors.bgPrimary,
              },
            ]}>
            {installments > 1
              ? `Pay ${installmentAmount} (1/${installments})`
              : `Pay ${amount || '0.00'}`}
          </Text>
        </TouchableOpacity>
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
  paymentCard: {
    padding: spacing.xl,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    marginBottom: spacing.xl,
  },
  merchantSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  merchantName: {
    fontSize: 20,
    fontWeight: '600',
  },
  amountSection: {
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '700',
    textAlign: 'center',
    minWidth: 200,
  },
  installmentsSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  sectionSubtitle: {
    fontSize: 16,
    marginBottom: spacing.lg,
  },
  installmentOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  installmentOption: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: borderRadius.medium,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  installmentText: {
    fontSize: 18,
    fontWeight: '700',
  },
  installmentInfo: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  installmentInfoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    gap: spacing.sm,
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
});

