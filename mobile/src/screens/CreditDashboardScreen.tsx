import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Ionicons} from '@expo/vector-icons';
import {useTheme} from '../theme/ThemeContext';
import {useWallet} from '../contexts/WalletContext';
import {walletService} from '../services/walletService';
import {SkeletonCard} from '../components/SkeletonLoader';
import {spacing, borderRadius, colors} from '../theme/colors';

export const CreditDashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const {colors: themeColors} = useTheme();
  const {account} = useWallet();
  const [creditInfo, setCreditInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCreditInfo();
  }, []);

  const loadCreditInfo = async () => {
    try {
      setIsLoading(true);
      const info = await walletService.getCreditInfo();
      setCreditInfo(info);
    } catch (error) {
      console.error('Error loading credit info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCreditInfo();
    setRefreshing(false);
  };

  const ltvPercentage = creditInfo ? Math.round(creditInfo.ltv * 100) : 0;
  const ltvColor =
    ltvPercentage < 50
      ? colors.accentGreen
      : ltvPercentage < 75
      ? colors.accentTeal
      : colors.accentRed;

  if (isLoading && !creditInfo) {
    return (
      <ScrollView
        style={[styles.container, {backgroundColor: themeColors.bgPrimary}]}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: themeColors.bgPrimary}]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, {color: themeColors.textPrimary}]}>
            Credit Dashboard
          </Text>
          <TouchableOpacity
            style={styles.requestButton}
            onPress={() => navigation.navigate('RequestCredit' as never)}>
            <Ionicons name="add-circle" size={20} color={colors.accentTeal} />
            <Text style={[styles.requestButtonText, {color: colors.accentTeal}]}>
              Request Credit
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: themeColors.bgCard,
              borderColor: themeColors.borderColor,
            },
          ]}>
          <Text style={[styles.summaryLabel, {color: themeColors.textSecondary}]}>
            Total Credit Limit
          </Text>
          <Text style={[styles.summaryAmount, {color: themeColors.textPrimary}]}>
            ${creditInfo?.totalCredit || '0.00'}
          </Text>

          <View style={styles.creditBar}>
            <View
              style={[
                styles.creditBarFill,
                {
                  width: `${creditInfo ? (creditInfo.usedCredit / creditInfo.totalCredit) * 100 : 0}%`,
                  backgroundColor: ltvColor,
                },
              ]}
            />
          </View>

          <View style={styles.creditDetails}>
            <View style={styles.creditDetailItem}>
              <Text style={[styles.detailLabel, {color: themeColors.textSecondary}]}>
                Used
              </Text>
              <Text style={[styles.detailValue, {color: themeColors.textPrimary}]}>
                ${creditInfo?.usedCredit || '0.00'}
              </Text>
            </View>
            <View style={styles.creditDetailItem}>
              <Text style={[styles.detailLabel, {color: themeColors.textSecondary}]}>
                Available
              </Text>
              <Text style={[styles.detailValue, {color: colors.accentTeal}]}>
                ${creditInfo?.availableCredit || '0.00'}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.metricsCard,
            {
              backgroundColor: themeColors.bgCard,
              borderColor: themeColors.borderColor,
            },
          ]}>
          <Text style={[styles.cardTitle, {color: themeColors.textPrimary}]}>
            Risk Metrics
          </Text>

          <View style={styles.metricRow}>
            <View style={styles.metricItem}>
              <Ionicons name="trending-up" size={24} color={ltvColor} />
              <Text style={[styles.metricLabel, {color: themeColors.textSecondary}]}>
                LTV Ratio
              </Text>
              <Text style={[styles.metricValue, {color: ltvColor}]}>
                {ltvPercentage}%
              </Text>
            </View>

            <View style={styles.metricItem}>
              <Ionicons name="shield" size={24} color={colors.accentTeal} />
              <Text style={[styles.metricLabel, {color: themeColors.textSecondary}]}>
                Collateral Value
              </Text>
              <Text style={[styles.metricValue, {color: themeColors.textPrimary}]}>
                ${creditInfo?.collateralValue || '0.00'}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.actionsCard,
            {
              backgroundColor: themeColors.bgCard,
              borderColor: themeColors.borderColor,
            },
          ]}>
          <Text style={[styles.cardTitle, {color: themeColors.textPrimary}]}>
            Quick Actions
          </Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('AddCollateral' as never)}>
            <Ionicons name="add" size={20} color={colors.accentTeal} />
            <Text style={[styles.actionText, {color: themeColors.textPrimary}]}>
              Add Collateral
            </Text>
            <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('PayCredit' as never)}>
            <Ionicons name="card" size={20} color={colors.accentTeal} />
            <Text style={[styles.actionText, {color: themeColors.textPrimary}]}>
              Pay Credit
            </Text>
            <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  requestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
  },
  requestButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryCard: {
    padding: spacing.xl,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  summaryAmount: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  creditBar: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  creditBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  creditDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  creditDetailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  detailValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  metricsCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  metricRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
  },
  metricLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  actionsCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
});

