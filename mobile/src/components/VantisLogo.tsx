import React from 'react';
import {View, Text, StyleSheet, ViewStyle, TextStyle} from 'react-native';
import {colors, spacing, borderRadius} from '../theme/colors';

interface VantisLogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'light' | 'dark';
  showText?: boolean;
  style?: ViewStyle;
}

export const VantisLogo: React.FC<VantisLogoProps> = ({
  size = 'medium',
  variant = 'light',
  showText = true,
  style,
}) => {
  const sizeConfig = {
    small: {
      iconSize: 24,
      iconContainerSize: 32,
      fontSize: 16,
      spacing: spacing.xs,
    },
    medium: {
      iconSize: 32,
      iconContainerSize: 44,
      fontSize: 20,
      spacing: spacing.sm,
    },
    large: {
      iconSize: 48,
      iconContainerSize: 64,
      fontSize: 28,
      spacing: spacing.md,
    },
  };

  const config = sizeConfig[size];
  const logoColor = variant === 'light' ? colors.accentTeal : '#FFFFFF';

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.iconContainer,
          {
            width: config.iconContainerSize,
            height: config.iconContainerSize,
            borderRadius: borderRadius.small,
            borderWidth: 2,
            borderColor: logoColor,
          },
        ]}>
        <Text
          style={[
            styles.iconText,
            {
              fontSize: config.iconSize,
              color: logoColor,
            },
          ]}>
          V
        </Text>
      </View>
      {showText && (
        <Text
          style={[
            styles.logoText,
            {
              fontSize: config.fontSize,
              color: logoColor,
              marginTop: config.spacing,
            },
          ]}>
          VANTIS
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconText: {
    fontWeight: '700',
    fontFamily: 'System',
  },
  logoText: {
    fontWeight: '600',
    letterSpacing: 2,
    fontFamily: 'System',
  },
});

