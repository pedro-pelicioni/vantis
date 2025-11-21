import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../theme/ThemeContext';
import {StatusBar} from '../components/StatusBar';
import {spacing} from '../theme/colors';

export const CardScreen: React.FC = () => {
  const navigation = useNavigation();
  const {colors: themeColors} = useTheme();

  const showHelp = () => {
    Alert.alert('Card Help', 'Card help information');
  };

  return (
    <View style={[styles.container, {backgroundColor: themeColors.bgPrimary}]}>
      <StatusBar />
      <View
        style={[
          styles.header,
          {
            borderBottomColor: themeColors.borderColor,
          },
        ]}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <Text style={[styles.headerBtnText, {color: themeColors.textPrimary}]}>
            ←
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: themeColors.textPrimary}]}>
          Card
        </Text>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={showHelp}
          activeOpacity={0.7}>
          <Text style={[styles.headerBtnText, {color: themeColors.textPrimary}]}>
            ?
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={[styles.text, {color: themeColors.textSecondary}]}>
          Card features coming soon
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerBtnText: {
    fontSize: 24,
  },
  headerTitle: {
    position: 'absolute',
    left: '50%',
    transform: [{translateX: -50}],
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    padding: spacing.md,
    alignItems: 'center',
    marginTop: 100,
  },
  text: {
    fontSize: 16,
  },
});

