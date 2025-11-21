import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../theme/ThemeContext';
import {ThemeToggle} from './ThemeToggle';
import {spacing} from '../theme/colors';

interface HeaderProps {
  walletAddress?: string;
  showMenu?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  walletAddress = '0x670a...31e9',
  showMenu = false,
}) => {
  const navigation = useNavigation();
  const {colors} = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bgPrimary,
          borderBottomColor: colors.borderColor,
        },
      ]}>
      {showMenu && <Text style={styles.menuIcon}>☰</Text>}
      <Text style={[styles.walletAddress, {color: colors.textPrimary}]}>
        {walletAddress}
      </Text>
      <View style={styles.actions}>
        <ThemeToggle />
        <Text style={styles.icon}>👁</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings' as never)}>
          <Text style={styles.icon}>⚙</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  menuIcon: {
    fontSize: 24,
    position: 'relative',
  },
  walletAddress: {
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
  },
});

