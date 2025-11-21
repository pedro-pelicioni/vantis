import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, Platform} from 'react-native';
import {useTheme} from '../theme/ThemeContext';
import {spacing} from '../theme/colors';

// StatusBar customizado apenas para web/desktop
// No mobile, o Expo StatusBar é usado automaticamente

export const StatusBar: React.FC = () => {
  const {colors} = useTheme();
  const [currentTime, setCurrentTime] = useState('20:05');
  const [battery, setBattery] = useState(78);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  // On mobile, use native status bar
  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <View style={[styles.container, {backgroundColor: colors.bgPrimary}]}>
      <View style={styles.left}>
        <Text style={[styles.text, {color: colors.textPrimary}]}>
          {currentTime}
        </Text>
        <Text style={styles.moonIcon}>🌙</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.icon}>📶</Text>
        <Text style={styles.icon}>📶</Text>
        <Text style={[styles.text, {color: colors.textPrimary}]}>
          {battery}%
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  text: {
    fontSize: 14,
  },
  moonIcon: {
    fontSize: 16,
  },
  icon: {
    fontSize: 16,
  },
});

