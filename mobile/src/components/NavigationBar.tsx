import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {useTheme} from '../theme/ThemeContext';
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

export const NavigationBar: React.FC<BottomTabBarProps> = ({state, descriptors, navigation}) => {
  const {colors} = useTheme();

  const currentRoute = state.routes[state.index].name;

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

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bgSecondary,
          borderTopColor: colors.borderColor,
        },
      ]}>
      {navItems.map(item => {
        const isActive = currentRoute === item.route;
        return (
          <TouchableOpacity
            key={item.name}
            style={styles.navItem}
            onPress={() => navigate(item.route)}
            activeOpacity={0.7}>
            <Text style={styles.navIcon}>{item.icon}</Text>
            <Text
              style={[
                styles.navLabel,
                {
                  color: isActive ? colors.accentTeal : colors.textPrimary,
                },
              ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    zIndex: 1000,
  },
  navItem: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    opacity: 0.6,
  },
  navIcon: {
    fontSize: 24,
  },
  navLabel: {
    fontSize: 12,
  },
});

