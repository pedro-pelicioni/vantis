import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Ionicons} from '@expo/vector-icons';
import {useTheme} from '../theme/ThemeContext';
import {useWallet} from '../contexts/WalletContext';
import {spacing, borderRadius, colors} from '../theme/colors';

const {width} = Dimensions.get('window');
const CARD_WIDTH = width - spacing.xl * 2;
const CARD_HEIGHT = CARD_WIDTH * 0.63; // Standard credit card ratio

export const CardVisualScreen: React.FC = () => {
  const navigation = useNavigation();
  const {colors: themeColors, isDark} = useTheme();
  const {account} = useWallet();

  const maskedPublicKey = account?.publicKey
    ? `${account.publicKey.slice(0, 4)} **** **** ${account.publicKey.slice(-4)}`
    : '**** **** **** ****';

  return (
    <View style={[styles.container, {backgroundColor: themeColors.bgPrimary}]}>
      <View style={styles.cardContainer}>
        <LinearGradient
          colors={isDark ? [colors.accentTeal, colors.accentTealDark] : [colors.accentTealDark, colors.accentTeal]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLogo}>VANTIS</Text>
            <Ionicons name="wifi" size={24} color="rgba(255, 255, 255, 0.9)" />
          </View>

          <View style={styles.cardNumberContainer}>
            <Text style={styles.cardNumber}>{maskedPublicKey}</Text>
          </View>

          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.cardLabel}>CARDHOLDER</Text>
              <Text style={styles.cardName}>
                {account?.publicKey ? 'SELF-CUSTODIAL' : 'YOUR NAME'}
              </Text>
            </View>
            <View style={styles.cardExpiry}>
              <Text style={styles.cardLabel}>VALID THRU</Text>
              <Text style={styles.cardExpiryText}>12/28</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.cardInfo}>
          <View style={[styles.infoCard, {backgroundColor: themeColors.bgCard, borderColor: themeColors.borderColor}]}>
            <Ionicons name="card" size={24} color={colors.accentTeal} />
            <View style={styles.infoText}>
              <Text style={[styles.infoTitle, {color: themeColors.textPrimary}]}>
                Virtual Card
              </Text>
              <Text style={[styles.infoSubtitle, {color: themeColors.textSecondary}]}>
                Use this card for online purchases
              </Text>
            </View>
          </View>

          <View style={[styles.infoCard, {backgroundColor: themeColors.bgCard, borderColor: themeColors.borderColor}]}>
            <Ionicons name="shield-checkmark" size={24} color={colors.accentTeal} />
            <View style={styles.infoText}>
              <Text style={[styles.infoTitle, {color: themeColors.textPrimary}]}>
                Secure
              </Text>
              <Text style={[styles.infoSubtitle, {color: themeColors.textSecondary}]}>
                Protected by OpenZeppelin Smart Accounts
              </Text>
            </View>
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
  cardLogo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
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
});

