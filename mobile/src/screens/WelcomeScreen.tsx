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
import {spacing, borderRadius, colors} from '../theme/colors';

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const {colors: themeColors} = useTheme();

  const createAccount = () => {
    navigation.navigate('Onboarding' as never);
  };

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: themeColors.bgPrimary}]}>
      <StatusBar />
      <View style={styles.content}>
        <View style={styles.illustrationSection}>
          <View
            style={[
              styles.illustrationBg,
              {
                backgroundColor: colors.accentTealDark,
                opacity: 0.3,
              },
            ]}
          />
          <View style={styles.illustrationElements}>
            <Text style={styles.calendarIcon}>📅</Text>
            <Text style={styles.clockIcon}>🕐</Text>
            <Text style={styles.coins}>💰</Text>
          </View>
        </View>

        <View style={styles.textSection}>
          <Text
            style={[
              styles.title,
              {
                color: colors.accentTeal,
              },
            ]}>
            Pay later in installments{'\n'}and hold your crypto
          </Text>

          <View style={styles.carouselIndicators}>
            <View style={styles.indicator} />
            <View style={[styles.indicator, styles.indicatorActive]} />
            <View style={styles.indicator} />
          </View>

          <TouchableOpacity
            style={[
              styles.createBtn,
              {
                backgroundColor: colors.accentTeal,
              },
            ]}
            onPress={createAccount}
            activeOpacity={0.8}>
            <Text
              style={[
                styles.btnText,
                {
                  color: themeColors.bgPrimary,
                },
              ]}>
              Create an account
            </Text>
            <Text style={styles.btnIcon}>🔑</Text>
          </TouchableOpacity>

          <View style={styles.loginLink}>
            <Text style={[styles.loginText, {color: themeColors.textSecondary}]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity>
              <Text
                style={[
                  styles.loginLinkText,
                  {
                    color: colors.accentTeal,
                  },
                ]}>
                Log in
              </Text>
            </TouchableOpacity>
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
  content: {
    flex: 1,
    flexDirection: 'column',
  },
  illustrationSection: {
    flex: 1,
    position: 'relative',
    minHeight: 300,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  illustrationBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 200,
    transform: [{scale: 1.5}],
  },
  illustrationElements: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    zIndex: 1,
  },
  calendarIcon: {
    fontSize: 100,
  },
  clockIcon: {
    fontSize: 80,
  },
  coins: {
    position: 'absolute',
    fontSize: 40,
    top: '10%',
    right: '10%',
  },
  textSection: {
    padding: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: spacing.lg,
    lineHeight: 42,
    textAlign: 'center',
  },
  carouselIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  indicatorActive: {
    backgroundColor: colors.accentTeal,
  },
  createBtn: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.md,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  btnIcon: {
    fontSize: 20,
  },
  loginLink: {
    flexDirection: 'row',
    fontSize: 14,
  },
  loginText: {
    fontSize: 14,
  },
  loginLinkText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

