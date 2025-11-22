import React, {useState, useMemo} from 'react';
import {View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Alert, Modal} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Ionicons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../theme/ThemeContext';
import {useWallet} from '../contexts/WalletContext';
import {StatusBar} from '../components/StatusBar';
import {VantisLogo} from '../components/VantisLogo';
import {spacing, borderRadius, colors} from '../theme/colors';

const {width} = Dimensions.get('window');
const CARD_WIDTH = width - spacing.xl * 2;
const CARD_HEIGHT = CARD_WIDTH * 0.63; // Standard credit card ratio

export const CardVisualScreen: React.FC = () => {
  const navigation = useNavigation();
  const {colors: themeColors, isDark} = useTheme();
  const {account} = useWallet();
  const insets = useSafeAreaInsets();
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [isCardBlocked, setIsCardBlocked] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showVirtualCardModal, setShowVirtualCardModal] = useState(false);

  // Get full card number (complete, for modal display)
  const fullCardNumber = account?.cardNumber || '**** **** **** ****';
  
  // Format card number for visual display on card (masked: first 4 + last 4)
  // This is what appears on the card visual itself
  const cardNumber = useMemo(() => {
    const rawNumber = account?.cardNumber;
    
    if (!rawNumber || rawNumber === '**** **** **** ****') {
      return '**** **** **** ****';
    }
    
    // Remove all spaces and non-digit characters to get only digits
    const digitsOnly = rawNumber.replace(/\D/g, '');
    
    // Debug: log to see what we're working with
    console.log('Card number formatting:', {
      raw: rawNumber,
      digitsOnly,
      length: digitsOnly.length,
    });
    
    // Must have exactly 16 digits
    if (digitsOnly.length !== 16) {
      console.warn('Invalid card number length:', digitsOnly.length);
      return '**** **** **** ****';
    }
    
    // Extract first 4 and last 4 digits
    const first4 = digitsOnly.substring(0, 4);
    const last4 = digitsOnly.substring(12, 16);
    
    // Return masked format: "1234 **** **** 5678"
    const masked = `${first4} **** **** ${last4}`;
    console.log('Masked card number:', masked);
    return masked;
  }, [account?.cardNumber]);
  
  // Format full card number for modal (complete, with spaces)
  const displayFullCardNumber = useMemo(() => {
    if (!fullCardNumber || fullCardNumber === '**** **** **** ****') {
      return '**** **** **** ****';
    }
    
    // Remove all spaces and non-digit characters
    const digitsOnly = fullCardNumber.replace(/\D/g, '');
    
    // Must have exactly 16 digits
    if (digitsOnly.length !== 16) {
      return fullCardNumber; // Return as is if invalid
    }
    
    // Format with spaces: "1234 5678 9012 3456"
    return `${digitsOnly.substring(0, 4)} ${digitsOnly.substring(4, 8)} ${digitsOnly.substring(8, 12)} ${digitsOnly.substring(12, 16)}`;
  }, [fullCardNumber]);
  const cvv = '123';
  const expiryDate = '12/28';
  const cardholderName = account?.publicKey ? 'SELF-CUSTODIAL' : 'YOUR NAME';

  const handleBlockCard = () => {
    Alert.alert(
      isCardBlocked ? 'Unblock Card' : 'Block Card',
      isCardBlocked
        ? 'Are you sure you want to unblock this card?'
        : 'Are you sure you want to block this card? It will be disabled for all transactions.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: isCardBlocked ? 'Unblock' : 'Block',
          style: 'destructive',
          onPress: () => {
            setIsCardBlocked(!isCardBlocked);
            setShowBlockModal(false);
            Alert.alert(
              'Success',
              isCardBlocked ? 'Card has been unblocked' : 'Card has been blocked',
            );
          },
        },
      ],
    );
  };

  return (
    <ScrollView 
      style={[styles.container, {backgroundColor: themeColors.bgPrimary}]}
      contentContainerStyle={{paddingBottom: insets.bottom + 80}}>
      <StatusBar />
      <View style={[styles.header, {paddingTop: insets.top}]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: themeColors.textPrimary}]}>
          Your Card
        </Text>
        <View style={styles.placeholder} />
      </View>
      <View style={styles.cardContainer}>
        <LinearGradient
          colors={isDark ? [colors.accentTeal, colors.accentTealDark] : [colors.accentTealDark, colors.accentTeal]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={[styles.card, isCardBlocked && styles.cardBlocked]}>
          {isCardBlocked && (
            <View style={styles.blockedOverlay}>
              <Ionicons name="lock-closed" size={48} color="#FFFFFF" />
              <Text style={styles.blockedText}>CARD BLOCKED</Text>
            </View>
          )}
          <View style={styles.cardHeader}>
            <VantisLogo size="small" variant="light" showText={false} />
            <Ionicons name="wifi" size={24} color="rgba(255, 255, 255, 0.9)" />
          </View>

          <View style={styles.cardNumberContainer}>
            <Text style={styles.cardNumber} testID="card-number-display">
              {cardNumber}
            </Text>
          </View>

          <View style={styles.cardMiddle}>
            <View style={styles.cardholderSection}>
              <Text style={styles.cardLabel}>CARDHOLDER</Text>
              <Text style={styles.cardName}>{cardholderName}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.cardInfo}>
          <TouchableOpacity
            style={[styles.infoCard, {backgroundColor: themeColors.bgCard, borderColor: themeColors.borderColor}]}
            onPress={() => setShowVirtualCardModal(true)}
            activeOpacity={0.7}>
            <Ionicons name="card" size={24} color={colors.accentTeal} />
            <View style={styles.infoText}>
              <Text style={[styles.infoTitle, {color: themeColors.textPrimary}]}>
                Virtual Card
              </Text>
              <Text style={[styles.infoSubtitle, {color: themeColors.textSecondary}]}>
                Use this card for online purchases
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.infoCard, {backgroundColor: themeColors.bgCard, borderColor: themeColors.borderColor}]}
            onPress={() => setShowBlockModal(true)}
            activeOpacity={0.7}>
            <Ionicons 
              name={isCardBlocked ? "lock-closed" : "shield-checkmark"} 
              size={24} 
              color={isCardBlocked ? colors.accentRed : colors.accentTeal} 
            />
            <View style={styles.infoText}>
              <Text style={[styles.infoTitle, {color: themeColors.textPrimary}]}>
                {isCardBlocked ? 'Card Blocked' : 'Secure'}
              </Text>
              <Text style={[styles.infoSubtitle, {color: themeColors.textSecondary}]}>
                {isCardBlocked 
                  ? 'Card is currently blocked'
                  : 'Protected by OpenZeppelin Smart Accounts'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showVirtualCardModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowVirtualCardModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {backgroundColor: themeColors.bgCard}]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, {color: themeColors.textPrimary}]}>
                Card Details
              </Text>
              <TouchableOpacity onPress={() => setShowVirtualCardModal(false)}>
                <Ionicons name="close" size={24} color={themeColors.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.cardDetailsContainer}>
              <View style={[styles.detailRow, {borderBottomColor: themeColors.borderColor}]}>
                <Text style={[styles.detailLabel, {color: themeColors.textSecondary}]}>
                  Card Number
                </Text>
                <Text style={[styles.detailValue, {color: themeColors.textPrimary}]}>
                  {displayFullCardNumber}
                </Text>
              </View>
              
              <View style={[styles.detailRow, {borderBottomColor: themeColors.borderColor}]}>
                <Text style={[styles.detailLabel, {color: themeColors.textSecondary}]}>
                  Cardholder Name
                </Text>
                <Text style={[styles.detailValue, {color: themeColors.textPrimary}]}>
                  {cardholderName}
                </Text>
              </View>
              
              <View style={[styles.detailRow, {borderBottomColor: themeColors.borderColor}]}>
                <Text style={[styles.detailLabel, {color: themeColors.textSecondary}]}>
                  Valid Thru
                </Text>
                <Text style={[styles.detailValue, {color: themeColors.textPrimary}]}>
                  {expiryDate}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <View style={styles.cvvDetailRow}>
                  <Text style={[styles.detailLabel, {color: themeColors.textSecondary}]}>
                    CVV
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowCardDetails(!showCardDetails)}
                    style={styles.eyeButtonDetail}>
                    <Ionicons
                      name={showCardDetails ? 'eye' : 'eye-off'}
                      size={20}
                      color={themeColors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.detailValue, {color: themeColors.textPrimary}]}>
                  {showCardDetails ? cvv : '***'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showBlockModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBlockModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {backgroundColor: themeColors.bgCard}]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, {color: themeColors.textPrimary}]}>
                {isCardBlocked ? 'Unblock Card' : 'Block Card'}
              </Text>
              <TouchableOpacity onPress={() => setShowBlockModal(false)}>
                <Ionicons name="close" size={24} color={themeColors.textPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalText, {color: themeColors.textSecondary}]}>
              {isCardBlocked
                ? 'Unblocking your card will allow all transactions to proceed normally.'
                : 'Blocking your card will prevent all transactions. You can unblock it anytime.'}
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel, {borderColor: themeColors.borderColor}]}
                onPress={() => setShowBlockModal(false)}>
                <Text style={[styles.modalButtonText, {color: themeColors.textPrimary}]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm, {backgroundColor: isCardBlocked ? colors.accentTeal : colors.accentRed}]}
                onPress={handleBlockCard}>
                <Text style={[styles.modalButtonText, {color: '#FFFFFF'}]}>
                  {isCardBlocked ? 'Unblock' : 'Block'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  cardContainer: {
    padding: spacing.xl,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBlocked: {
    opacity: 0.5,
  },
  blockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: borderRadius.large,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  blockedText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: spacing.md,
    letterSpacing: 2,
  },
  cardNumberContainer: {
    marginVertical: spacing.lg,
  },
  cardNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 4,
    fontFamily: 'monospace',
  },
  cardMiddle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardholderSection: {
    flex: 1,
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
    alignItems: 'flex-end',
  },
  cardExpiryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardInfo: {
    gap: spacing.md,
  },
  infoCard: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    gap: spacing.md,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  infoSubtitle: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.large,
    borderTopRightRadius: borderRadius.large,
    padding: spacing.xl,
    paddingBottom: spacing.xl * 2,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
  },
  modalButtonCancel: {
    borderWidth: 1,
  },
  modalButtonConfirm: {},
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardDetailsContainer: {
    marginTop: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  cvvDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  eyeButtonDetail: {
    padding: spacing.xs,
  },
});

