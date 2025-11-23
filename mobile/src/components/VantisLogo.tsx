import React from 'react';
import {View, Text, StyleSheet, ViewStyle} from 'react-native';
import Svg, {Path, Defs, LinearGradient, Stop} from 'react-native-svg';
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
  // Gold/metallic color for the logo
  const goldColor = colors.accentTeal; // #FFB700 - Golden yellow
  const logoColor = variant === 'light' ? goldColor : '#FFFFFF';

  // Calculate V path dimensions based on container size
  const containerSize = config.iconContainerSize;
  const padding = containerSize * 0.15;
  const vSize = containerSize - (padding * 2);
  const centerX = containerSize / 2;
  const centerY = containerSize / 2;
  
  // Gold gradient colors for metallic effect
  const goldLight = '#FFD700'; // Bright gold
  const goldDark = '#FFB700';  // Darker gold (accentTeal)
  const goldDarker = '#D4AF37'; // Deep gold

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.iconContainer,
          {
            width: containerSize,
            height: containerSize,
            borderRadius: borderRadius.small,
            borderWidth: 2.5,
            borderColor: logoColor,
            backgroundColor: 'transparent',
            shadowColor: logoColor,
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
          },
        ]}>
        <Svg
          width={containerSize}
          height={containerSize}
          viewBox={`0 0 ${containerSize} ${containerSize}`}
          style={styles.svg}>
          <Defs>
            <LinearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={goldLight} stopOpacity="1" />
              <Stop offset="50%" stopColor={goldDark} stopOpacity="1" />
              <Stop offset="100%" stopColor={goldDarker} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          {/* Left stroke (thicker) */}
          <Path
            d={`M ${centerX - vSize * 0.35} ${centerY - vSize * 0.4} L ${centerX} ${centerY + vSize * 0.4}`}
            stroke="url(#goldGradient)"
            strokeWidth={vSize * 0.12}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Right stroke (thinner, slightly overlapping) */}
          <Path
            d={`M ${centerX + vSize * 0.35} ${centerY - vSize * 0.4} L ${centerX} ${centerY + vSize * 0.4}`}
            stroke="url(#goldGradient)"
            strokeWidth={vSize * 0.08}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
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
    overflow: 'hidden',
  },
  svg: {
    position: 'absolute',
  },
  logoText: {
    fontWeight: '600',
    letterSpacing: 2,
    fontFamily: 'System',
  },
});

