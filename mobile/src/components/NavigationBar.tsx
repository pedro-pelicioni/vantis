import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {useTheme} from '../theme/ThemeContext';
import {spacing, borderRadius, colors} from '../theme/colors';

type NavItem = {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: string;
};

const navItems: NavItem[] = [
  {name: 'home', icon: 'home', label: 'Home', route: 'Home'},
  {name: 'card', icon: 'card', label: 'Card', route: 'Card'},
  {name: 'pay-mode', icon: 'swap-horizontal', label: 'Pay', route: 'PayMode'},
  {name: 'defi', icon: 'trending-up', label: 'DeFi', route: 'DeFi'},
  {name: 'activity', icon: 'list', label: 'Activity', route: 'Activity'},
];

export const NavigationBar: React.FC<BottomTabBarProps> = ({state, descriptors, navigation}) => {
  const {colors: themeColors} = useTheme();
  const insets = useSafeAreaInsets();

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
          backgroundColor: themeColors.bgSecondary,
          borderTopColor: themeColors.borderColor,
          paddingBottom: insets.bottom,
        },
      ]}>
      {navItems.map((item, index) => {
        const isActive = currentRoute === item.route;
        const isPayButton = item.name === 'pay-mode';
        
        if (isPayButton) {
          // Special highlighted button for Pay (center button) - navigates to Payment screen
          return (
            <TouchableOpacity
              key={item.name}
              style={styles.payButtonContainer}
              onPress={() => navigation.navigate('Payment' as never)}
              activeOpacity={0.8}>
              <View
                style={[
                  styles.payButton,
                  {
                    backgroundColor: colors.accentTeal,
                    shadowColor: colors.accentTeal,
                  },
                ]}>
                <Ionicons
                  name={item.icon}
                  size={28}
                  color="#FFFFFF"
                />
              </View>
              <Text
                style={[
                  styles.payLabel,
                  {
                    color: themeColors.textPrimary,
                  },
                ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }
        
        // Regular navigation items
        return (
          <TouchableOpacity
            key={item.name}
            style={styles.navItem}
            onPress={() => navigate(item.route)}
            activeOpacity={0.7}>
            <Ionicons
              name={item.icon}
              size={24}
              color={isActive ? colors.accentTeal : themeColors.textSecondary}
            />
            <Text
              style={[
                styles.navLabel,
                {
                  color: isActive ? colors.accentTeal : themeColors.textSecondary,
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
    flex: 1,
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  payButtonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    marginTop: -spacing.md, // Lift the button up
  },
  payButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  payLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
});

