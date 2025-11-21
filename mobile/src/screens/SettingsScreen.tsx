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
import {useTheme} from '../theme/ThemeContext';
import {StatusBar} from '../components/StatusBar';
import {ThemeToggle} from '../components/ThemeToggle';
import {spacing, borderRadius, colors} from '../theme/colors';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const {colors: themeColors} = useTheme();

  const openSupport = () => {
    Alert.alert('Support', 'Support information');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            console.log('Logging out...');
            // Handle logout logic
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
              <Text
                style={[
                  styles.settingsIconText,
                  {
                    color: colors.accentTeal,
                  },
                ]}>
                🎨
              </Text>
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
              <Text
                style={[
                  styles.settingsIconText,
                  {
                    color: colors.accentTeal,
                  },
                ]}>
                ?
              </Text>
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
              <Text
                style={[
                  styles.settingsIconText,
                  {
                    color: colors.accentRed,
                  },
                ]}>
                →
              </Text>
            </View>
            <Text
              style={[
                styles.settingsLabel,
                {
                  color: themeColors.textPrimary,
                },
              ]}>
              Logout
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
  settingsIconText: {
    fontSize: 20,
    fontWeight: '700',
  },
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
});

