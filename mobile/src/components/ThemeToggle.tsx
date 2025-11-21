import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import {useTheme} from '../theme/ThemeContext';
import {spacing, borderRadius} from '../theme/colors';

export const ThemeToggle: React.FC = () => {
  const {isDark, toggleTheme} = useTheme();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={toggleTheme}
      accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
      <Text style={styles.icon}>{isDark ? '☀️' : '🌙'}</Text>
      <Text style={styles.label}>{isDark ? 'Light' : 'Dark'}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.medium,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    fontWeight: '500',
    fontSize: 14,
  },
});

