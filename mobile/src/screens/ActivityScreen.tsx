import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '../theme/ThemeContext';
import {StatusBar} from '../components/StatusBar';
import {spacing} from '../theme/colors';

export const ActivityScreen: React.FC = () => {
  const {colors: themeColors} = useTheme();

  return (
    <View style={[styles.container, {backgroundColor: themeColors.bgPrimary}]}>
      <StatusBar />
      <View style={styles.content}>
        <Text style={[styles.text, {color: themeColors.textSecondary}]}>
          Activity features coming soon
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 80,
  },
  content: {
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  text: {
    fontSize: 16,
  },
});

