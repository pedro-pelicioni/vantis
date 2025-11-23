import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {useTheme} from '../theme/ThemeContext';
import {useWallet} from '../contexts/WalletContext';
import {ThemeToggle} from './ThemeToggle';
import {spacing} from '../theme/colors';

interface HeaderProps {
  walletAddress?: string;
  showMenu?: boolean;
  onBalanceToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  walletAddress,
  showMenu = false,
  onBalanceToggle,
}) => {
  const navigation = useNavigation();
  const {colors: themeColors} = useTheme();
  const {account} = useWallet();
  const insets = useSafeAreaInsets();
  
  const displayAddress = walletAddress || 
    (account?.publicKey 
      ? `${account.publicKey.slice(0, 6)}...${account.publicKey.slice(-4)}`
      : 'Not connected');

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: themeColors.bgPrimary,
          borderBottomColor: themeColors.borderColor,
          paddingTop: insets.top,
        },
      ]}>
      {showMenu && (
        <TouchableOpacity>
          <Ionicons name="menu" size={24} color={themeColors.textPrimary} />
        </TouchableOpacity>
      )}
      <Text style={[styles.walletAddress, {color: themeColors.textPrimary}]}>
        {displayAddress}
      </Text>
      <View style={styles.actions}>
        <ThemeToggle />
        <TouchableOpacity onPress={onBalanceToggle}>
          <Ionicons 
            name="eye" 
            size={20} 
            color={themeColors.textPrimary} 
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Settings' as never)}>
          <Ionicons name="settings" size={20} color={themeColors.textPrimary} />
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
  walletAddress: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
});

