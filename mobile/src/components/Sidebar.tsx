import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Platform} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useTheme} from '../theme/ThemeContext';
import {ThemeToggle} from './ThemeToggle';
import {spacing, borderRadius} from '../theme/colors';

type NavItem = {
  name: string;
  icon: string;
  label: string;
  route: string;
};

const navItems: NavItem[] = [
  {name: 'home', icon: '🏠', label: 'Home', route: 'Home'},
  {name: 'card', icon: '💳', label: 'Card', route: 'Card'},
  {name: 'pay-mode', icon: '🔄', label: 'Pay Mode', route: 'PayMode'},
  {name: 'defi', icon: '📦', label: 'DeFi', route: 'DeFi'},
  {name: 'activity', icon: '📄', label: 'Activity', route: 'Activity'},
];

export const Sidebar: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {colors} = useTheme();

  const currentRoute = route.name;

  const navigate = (routeName: string) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: routeName,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      navigation.navigate(routeName as never);
    }
  };

  // Only show sidebar on tablet/desktop (for web or larger screens)
  // On mobile, use bottom navigation instead
  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bgSecondary,
          borderRightColor: colors.borderColor,
        },
      ]}>
      <View style={styles.header}>
        <Text
          style={[
            styles.logo,
            {
              color: colors.accentTeal,
            },
          ]}>
          Vantis
        </Text>
      </View>

      <View style={styles.nav}>
        {navItems.map(item => {
          const isActive = currentRoute === item.route;
          return (
            <TouchableOpacity
              key={item.name}
              style={[
                styles.navItem,
                isActive && {
                  backgroundColor: colors.accentTealDark,
                },
              ]}
              onPress={() => navigate(item.route)}
              activeOpacity={0.7}>
              <Text style={styles.navIcon}>{item.icon}</Text>
              <Text
                style={[
                  styles.navLabel,
                  {
                    color: isActive
                      ? colors.accentTeal
                      : colors.textPrimary,
                  },
                ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={[styles.footer, {borderTopColor: colors.borderColor}]}>
        <ThemeToggle />
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigate('Settings')}
          activeOpacity={0.7}>
          <Text style={styles.navIcon}>⚙</Text>
          <Text style={[styles.navLabel, {color: colors.textPrimary}]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 240,
    height: '100%',
    flexDirection: 'column',
    padding: spacing.lg,
    borderRightWidth: 1,
    zIndex: 1000,
  },
  header: {
    marginBottom: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  logo: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  nav: {
    flex: 1,
    flexDirection: 'column',
    gap: spacing.sm,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    opacity: 0.7,
  },
  navIcon: {
    fontSize: 24,
    width: 24,
    textAlign: 'center',
  },
  navLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    flexDirection: 'column',
    gap: spacing.sm,
  },
});

