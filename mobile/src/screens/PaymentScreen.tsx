import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import {useWallet} from '../contexts/WalletContext';
import {VantisLogo} from '../components/VantisLogo';
import {spacing, borderRadius, colors} from '../theme/colors';

interface PaymentScreenParams {
  amount?: string;
  merchant?: string;
}

export const PaymentScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = (route.params as PaymentScreenParams) || {};
  const {account} = useWallet();
  const [amount] = useState(params.amount || '100.00');
  const insets = useSafeAreaInsets();
  const [installments] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [cardAnimation] = useState(new Animated.Value(0));
  const [successAnimation] = useState(new Animated.Value(0));
  const [checkmarkAnimation] = useState(new Animated.Value(0));

  const installmentAmount = amount ? (parseFloat(amount) / installments).toFixed(2) : '0.00';
  
  const {width} = Dimensions.get('window');
  const CARD_WIDTH = width - spacing.xl * 2;
  const CARD_HEIGHT = CARD_WIDTH * 0.63;

  const processPayment = async () => {
    try {
      // Go directly to success screen
      setShowSuccess(true);
      
      // Animate success screen
      Animated.sequence([
        Animated.timing(successAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(checkmarkAnimation, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        navigation.goBack();
      }, 3000);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Payment failed');
    }
  };

  useEffect(() => {
    // Animate card appearance
    Animated.timing(cardAnimation, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Auto-process payment after showing card for 3 seconds
    const timer = setTimeout(() => {
      processPayment();
    }, 3000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (showSuccess) {
    const checkmarkScale = checkmarkAnimation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 1.2, 1],
    });

    const checkmarkOpacity = checkmarkAnimation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 1, 1],
    });

    return (
      <View style={styles.successContainer}>
        <Animated.View
          style={[
            styles.successContent,
            {
              opacity: successAnimation,
              transform: [
                {
                  scale: successAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}>
          <Animated.View
            style={[
              styles.checkmarkContainer,
              {
                transform: [{scale: checkmarkScale}],
                opacity: checkmarkOpacity,
              },
            ]}>
            <View style={styles.checkmarkCircle}>
              <Ionicons name="checkmark" size={64} color="#FFFFFF" />
            </View>
          </Animated.View>

          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successMessage}>
            {installments > 1
              ? `${installments}x of USD ${installmentAmount} each\n\nTotal: USD ${amount}`
              : `Your payment of USD ${amount} has been processed successfully.`}
          </Text>
        </Animated.View>
      </View>
    );
  }

  // Format card number for display
  const formatCardNumber = (cardNumber: string | undefined): string => {
    if (!cardNumber || cardNumber === '**** **** **** ****') {
      return '**** **** **** ****';
    }
    const digits = cardNumber.replace(/\D/g, '');
    if (digits.length === 16) {
      const first4 = digits.substring(0, 4);
      const last4 = digits.substring(12, 16);
      return `${first4} **** **** ${last4}`;
    }
    return '**** **** **** ****';
  };

  const cardNumber = formatCardNumber(account?.cardNumber);


  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top}]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardPaymentOverlay}>
        <Animated.View
          style={[
            styles.cardPaymentContainer,
            {
              opacity: cardAnimation,
              transform: [
                {
                  scale: cardAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}>
          <View style={styles.cardPaymentHeader}>
            <Text style={[styles.cardPaymentTitle, {color: '#FFFFFF'}]}>
              Processing Payment
            </Text>
            <Text style={[styles.cardPaymentSubtitle, {color: 'rgba(255, 255, 255, 0.7)'}]}>
              Hold card near reader
            </Text>
          </View>

          <View style={styles.cardDisplayContainer}>
            <LinearGradient
              colors={['#FFB700', '#358FDC']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={[
                styles.paymentCardVisual,
                {
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT,
                },
              ]}>
              <View style={styles.cardHeader}>
                <VantisLogo size="small" variant="light" showText={false} />
                <Ionicons name="wifi" size={24} color="rgba(255, 255, 255, 0.9)" />
              </View>

              <View style={styles.cardNumberContainer}>
                <Text style={styles.cardNumberText}>{cardNumber}</Text>
              </View>

              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.cardLabel}>CARDHOLDER</Text>
                  <Text style={styles.cardName}>
                    {account?.publicKey ? 'SELF-CUSTODIAL' : 'YOUR NAME'}
                  </Text>
                </View>
                <View>
                  <Text style={styles.cardLabel}>VALID THRU</Text>
                  <Text style={styles.cardExpiry}>12/28</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
  },
  cardPaymentOverlay: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardPaymentContainer: {
    width: '100%',
    alignItems: 'center',
    padding: spacing.xl,
  },
  cardPaymentHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  cardPaymentTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  cardPaymentSubtitle: {
    fontSize: 16,
  },
  cardDisplayContainer: {
    marginBottom: spacing.xl,
  },
  paymentCardVisual: {
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chipContainer: {
    width: 50,
    height: 40,
  },
  chip: {
    width: 40,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  cardNumberContainer: {
    marginVertical: spacing.lg,
  },
  cardNumberText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 4,
    fontFamily: 'monospace',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  cardExpiry: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  successContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  successContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkContainer: {
    marginBottom: spacing.xl,
  },
  checkmarkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 16,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
});

