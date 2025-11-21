import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../theme/ThemeContext';
import {StatusBar} from '../components/StatusBar';
import {Header} from '../components/Header';
import {spacing, borderRadius, colors} from '../theme/colors';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const {colors: themeColors} = useTheme();

  return (
    <View style={[styles.container, {backgroundColor: themeColors.bgPrimary}]}>
      <StatusBar />
      <Header showMenu={true} />

      <ScrollView style={styles.content}>
        <View style={styles.portfolioSection}>
          <Text style={[styles.portfolioLink, {color: themeColors.textSecondary}]}>
            Your portfolio >
          </Text>
          <Text style={[styles.balance, {color: themeColors.textPrimary}]}>
            US$ 0,00
          </Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.btn,
              styles.btnPrimary,
              {
                backgroundColor: colors.accentTeal,
              },
            ]}
            activeOpacity={0.8}>
            <Text
              style={[
                styles.btnText,
                {
                  color: themeColors.bgPrimary,
                },
              ]}>
              Add funds
            </Text>
            <Text style={styles.btnIcon}>↓</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.btn,
              styles.btnSecondary,
              {
                backgroundColor: themeColors.bgCard,
                borderColor: themeColors.borderColor,
              },
            ]}
            activeOpacity={0.8}>
            <Text style={[styles.btnText, {color: themeColors.textPrimary}]}>
              Send
            </Text>
            <Text style={styles.btnIcon}>↑</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardsGrid}>
          <View
            style={[
              styles.card,
              styles.gettingStartedCard,
              {
                backgroundColor: themeColors.bgCard,
              },
            ]}>
            <View style={styles.cardHeader}>
              <Text
                style={[
                  styles.cardTitle,
                  {
                    color: colors.accentTeal,
                  },
                ]}>
                Getting Started
              </Text>
              <TouchableOpacity>
                <Text
                  style={[
                    styles.cardLink,
                    {
                      color: colors.accentTeal,
                    },
                  ]}>
                  View all steps >
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.stepItem}>
              <Text style={styles.stepIcon}>👤</Text>
              <Text style={[styles.stepText, {color: themeColors.textPrimary}]}>
                Add funds to account
              </Text>
            </View>

            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: colors.accentTeal,
                  },
                ]}
              />
              <View
                style={[
                  styles.progressEmpty,
                  {
                    backgroundColor: themeColors.shadowColor,
                  },
                ]}
              />
              <View
                style={[
                  styles.progressEmpty,
                  {
                    backgroundColor: themeColors.shadowColor,
                  },
                ]}
              />
            </View>

            <Text
              style={[
                styles.progressText,
                {
                  color: themeColors.textSecondary,
                },
              ]}>
              1/3
            </Text>

            <TouchableOpacity
              style={[
                styles.stepButton,
                {
                  backgroundColor: colors.accentTeal,
                },
              ]}
              activeOpacity={0.8}>
              <Text
                style={[
                  styles.stepButtonText,
                  {
                    color: themeColors.bgPrimary,
                  },
                ]}>
                →
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.card,
              {
                backgroundColor: themeColors.bgCard,
              },
            ]}>
            <Text
              style={[
                styles.cardTitle,
                {
                  color: themeColors.textPrimary,
                },
              ]}>
              Upcoming payments
            </Text>
            <View style={styles.emptyState}>
              <Text style={styles.emoji}>🎉</Text>
              <Text
                style={[
                  styles.emptyStateText,
                  {
                    color: colors.accentTeal,
                  },
                ]}>
                You're all set!
              </Text>
              <Text
                style={[
                  styles.emptyStateSubtext,
                  {
                    color: themeColors.textSecondary,
                  },
                ]}>
                Any funding or purchases will show up here.
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.card,
              {
                backgroundColor: themeColors.bgCard,
              },
            ]}>
            <Text
              style={[
                styles.cardTitle,
                {
                  color: themeColors.textPrimary,
                },
              ]}>
              Latest activity
            </Text>
            <View style={styles.emptyState}>
              <Text style={styles.emoji}>📋</Text>
              <Text
                style={[
                  styles.emptyStateText,
                  {
                    color: colors.accentTeal,
                  },
                ]}>
                No activity yet
              </Text>
              <Text
                style={[
                  styles.emptyStateSubtext,
                  {
                    color: themeColors.textSecondary,
                  },
                ]}>
                Your transactions will show up here once you get started. Add
                funds to begin!
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footerText}>
          <Text
            style={[
              styles.footerTextContent,
              {
                color: themeColors.textSecondary,
              },
            ]}>
            The Vantis App is a self-custodial smart wallet. All borrowing and
            lending features are decentralized and powered by Exactly Protocol.{' '}
            <Text
              style={[
                styles.footerLink,
                {
                  color: colors.accentTeal,
                },
              ]}>
              Terms and conditions
            </Text>
            .
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  portfolioSection: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  portfolioLink: {
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  balance: {
    fontSize: 48,
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.medium,
  },
  btnPrimary: {},
  btnSecondary: {
    borderWidth: 1,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  btnIcon: {
    fontSize: 20,
  },
  cardsGrid: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  card: {
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  gettingStartedCard: {
    position: 'relative',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  cardLink: {
    fontSize: 14,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  stepIcon: {
    fontSize: 24,
  },
  stepText: {
    fontSize: 16,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
    flex: 1,
  },
  progressEmpty: {
    height: 4,
    borderRadius: 2,
    flex: 1,
  },
  progressText: {
    fontSize: 12,
    marginBottom: spacing.md,
  },
  stepButton: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    width: 40,
    height: 40,
    borderRadius: borderRadius.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepButtonText: {
    fontSize: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  emoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  footerText: {
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  footerTextContent: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    textDecorationLine: 'underline',
  },
});

