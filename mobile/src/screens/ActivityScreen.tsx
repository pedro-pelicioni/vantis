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
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {useTheme} from '../theme/ThemeContext';
import {useWallet} from '../contexts/WalletContext';
import {Transaction} from '../services/walletService';
import {SkeletonCard} from '../components/SkeletonLoader';
import {spacing, borderRadius, colors} from '../theme/colors';

export const ActivityScreen: React.FC = () => {
  const navigation = useNavigation();
  const {colors: themeColors} = useTheme();
  const {account, transactions, loadTransactions, isLoading} = useWallet();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'payment' | 'credit' | 'installment'>('all');
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadTransactions();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return 'arrow-forward';
      case 'credit':
        return 'card';
      case 'installment':
        return 'calendar';
      default:
        return 'swap-horizontal';
    }
  };

  const getTransactionColor = (type: string, status: string) => {
    if (status === 'failed') return colors.accentRed;
    if (type === 'credit') return colors.accentTeal;
    return themeColors.textPrimary;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading && transactions.length === 0) {
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
    <View style={[styles.container, {backgroundColor: themeColors.bgPrimary}]}>
      <View style={[styles.header, {paddingTop: insets.top}]}>
        <Text style={[styles.title, {color: themeColors.textPrimary}]}>
          Activity
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('FilterActivity' as never)}>
          <Ionicons name="filter" size={24} color={themeColors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        {(['all', 'payment', 'credit', 'installment'] as const).map(filterType => (
          <TouchableOpacity
            key={filterType}
            style={[
              styles.filterButton,
              {
                backgroundColor:
                  filter === filterType ? colors.accentTeal : themeColors.bgCard,
                borderColor:
                  filter === filterType ? colors.accentTeal : themeColors.borderColor,
              },
            ]}
            onPress={() => setFilter(filterType)}>
            <Text
              style={[
                styles.filterText,
                {
                  color:
                    filter === filterType
                      ? themeColors.bgPrimary
                      : themeColors.textPrimary,
                },
              ]}>
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredTransactions.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-text" size={64} color={themeColors.textSecondary} />
          <Text style={[styles.emptyText, {color: themeColors.textPrimary}]}>
            No transactions found
          </Text>
          <Text style={[styles.emptySubtext, {color: themeColors.textSecondary}]}>
            Your transaction history will appear here
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          {filteredTransactions.map(transaction => (
            <TouchableOpacity
              key={transaction.id}
              style={[
                styles.transactionItem,
                {
                  backgroundColor: themeColors.bgCard,
                  borderColor: themeColors.borderColor,
                },
              ]}
              onPress={() =>
                navigation.navigate('TransactionDetail', {transaction} as never)
              }>
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: `${getTransactionColor(transaction.type, transaction.status)}20`,
                  },
                ]}>
                <Ionicons
                  name={getTransactionIcon(transaction.type)}
                  size={24}
                  color={getTransactionColor(transaction.type, transaction.status)}
                />
              </View>

              <View style={styles.transactionInfo}>
                <Text style={[styles.transactionType, {color: themeColors.textPrimary}]}>
                  {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                  {transaction.installments &&
                    ` (${transaction.installments.current}/${transaction.installments.total})`}
                </Text>
                <Text style={[styles.transactionDate, {color: themeColors.textSecondary}]}>
                  {formatDate(transaction.timestamp)}
                </Text>
              </View>

              <View style={styles.transactionAmount}>
                <Text
                  style={[
                    styles.amountText,
                    {
                      color: getTransactionColor(transaction.type, transaction.status),
                    },
                  ]}>
                  {transaction.status === 'pending' ? 'Pending' : ''}
                  {transaction.amount} {transaction.asset}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={themeColors.textSecondary}
                />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    gap: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
