import React from 'react';
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
import {ThemeToggle} from '../components/ThemeToggle';
import {spacing, borderRadius, colors} from '../theme/colors';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const {colors: themeColors} = useTheme();
  const {account, isConnected, disconnectWallet} = useWallet();
  const insets = useSafeAreaInsets();

  const openSupport = () => {
    Alert.alert('Support', 'Support information');
  };

  const handleLogout = () => {
    Alert.alert(
      'Disconnect Wallet',
      'Are you sure you want to disconnect your wallet?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            await disconnectWallet();
            navigation.navigate('Welcome' as never);
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: themeColors.bgPrimary}]}>
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
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <Text style={[styles.headerBtnText, {color: themeColors.textPrimary}]}>
            ←
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: themeColors.textPrimary}]}>
          Settings
        </Text>
        <View style={styles.headerBtn} />
      </View>

      <View style={styles.content}>
        <View
          style={[
            styles.settingsCard,
            {
              backgroundColor: themeColors.bgCard,
              borderColor: themeColors.borderColor,
            },
          ]}>
          <View
            style={[
              styles.settingsItem,
              styles.themeSettings,
              {
                borderBottomColor: themeColors.borderColor,
              },
            ]}>
            <View
              style={[
                styles.settingsIcon,
                styles.themeIcon,
                {
                  borderColor: colors.accentTeal,
                },
              ]}>
              <Ionicons name="color-palette" size={20} color={colors.accentTeal} />
            </View>
            <View style={styles.themeControl}>
              <Text
                style={[
                  styles.settingsLabel,
                  {
                    color: themeColors.textPrimary,
                  },
                ]}>
                Theme
              </Text>
              <ThemeToggle />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.settingsItem,
              {
                borderBottomColor: themeColors.borderColor,
              },
            ]}
            onPress={openSupport}
            activeOpacity={0.7}>
            <View
              style={[
                styles.settingsIcon,
                {
                  borderColor: colors.accentTeal,
                },
              ]}>
              <Ionicons name="help-circle" size={20} color={colors.accentTeal} />
            </View>
            <Text
              style={[
                styles.settingsLabel,
                {
                  color: themeColors.textPrimary,
                },
              ]}>
              Support
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsItem}
            onPress={handleLogout}
            activeOpacity={0.7}>
            <View
              style={[
                styles.settingsIcon,
                {
                  borderColor: colors.accentRed,
                },
              ]}>
              <Ionicons name="log-out" size={20} color={colors.accentRed} />
            </View>
            <Text
              style={[
                styles.settingsLabel,
                {
                  color: themeColors.textPrimary,
                },
              ]}>
              {isConnected ? 'Disconnect Wallet' : 'Logout'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.versionInfo}>
          <Text
            style={[
              styles.versionText,
              {
                color: themeColors.textSecondary,
              },
            ]}>
            mobile@1.0.34
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerBtnText: {
    fontSize: 24,
  },
  headerTitle: {
    position: 'absolute',
    left: '50%',
    transform: [{translateX: -50}],
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    padding: spacing.md,
  },
  settingsCard: {
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  themeSettings: {
    justifyContent: 'space-between',
  },
  themeControl: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  themeIcon: {},
  settingsLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  versionInfo: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  versionText: {
    fontSize: 12,
  },
  walletInfo: {
    flex: 1,
  },
  walletAddress: {
    fontSize: 12,
    marginTop: spacing.xs,
    fontFamily: 'monospace',
  },
});

