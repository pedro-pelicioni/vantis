import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../theme/ThemeContext';
import {StatusBar} from '../components/StatusBar';

export const PayModeScreen: React.FC = () => {
  const {colors: themeColors} = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View 
      style={[styles.container, {backgroundColor: themeColors.bgPrimary}]}>
      <StatusBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

