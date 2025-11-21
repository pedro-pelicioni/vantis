import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Ionicons} from '@expo/vector-icons';
import {useTheme} from '../theme/ThemeContext';
import {useWallet} from '../contexts/WalletContext';
import {walletService} from '../services/walletService';
import {LoadingSpinner} from '../components/LoadingSpinner';
import {spacing, borderRadius, colors} from '../theme/colors';

export const WalletConnectScreen: React.FC = () => {
  const navigation = useNavigation();
  const {colors: themeColors, isDark} = useTheme();
  const {connectWallet, isLoading} = useWallet();
  const [publicKey, setPublicKey] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (!publicKey.trim()) {
      Alert.alert('Error', 'Please enter a valid public key');
      return;
    }

    try {
      setIsConnecting(true);
      await connectWallet(publicKey.trim());
      navigation.navigate('Main' as never);
    } catch (error: any) {
      Alert.alert('Connection Failed', error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleGenerateWallet = async () => {
    try {
      setIsConnecting(true);
      const {publicKey: newPublicKey, secretKey} = await walletService.generateWallet();
      
      Alert.alert(
        'New Wallet Created',
        `Public Key: ${newPublicKey}\n\n⚠️ Save your secret key securely!\n${secretKey}`,
        [
          {
            text: 'Copy Secret Key',
            onPress: () => {
              // In production, use Clipboard API
              setPublicKey(newPublicKey);
            },
          },
          {
            text: 'Connect',
            onPress: async () => {
              await connectWallet(newPublicKey);
              navigation.navigate('Main' as never);
            },
          },
        ],
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to generate wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  if (isConnecting || isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: themeColors.bgPrimary}]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons
            name="wallet"
            size={64}
            color={colors.accentTeal}
            style={styles.icon}
          />
          <Text style={[styles.title, {color: themeColors.textPrimary}]}>
            Connect Your Wallet
          </Text>
          <Text style={[styles.subtitle, {color: themeColors.textSecondary}]}>
            Connect using OpenZeppelin Smart Account or enter your Stellar public key
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={[styles.label, {color: themeColors.textPrimary}]}>
            Public Key
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: themeColors.bgCard,
                borderColor: themeColors.borderColor,
                color: themeColors.textPrimary,
              },
            ]}
            placeholder="Enter your Stellar public key (G...)"
            placeholderTextColor={themeColors.textSecondary}
            value={publicKey}
            onChangeText={setPublicKey}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={[
              styles.connectButton,
              {
                backgroundColor: colors.accentTeal,
              },
            ]}
            onPress={handleConnect}
            activeOpacity={0.8}>
            <Ionicons name="link" size={20} color={themeColors.bgPrimary} />
            <Text
              style={[
                styles.buttonText,
                {
                  color: themeColors.bgPrimary,
                },
              ]}>
              Connect Wallet
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View
              style={[styles.dividerLine, {backgroundColor: themeColors.borderColor}]}
            />
            <Text style={[styles.dividerText, {color: themeColors.textSecondary}]}>
              OR
            </Text>
            <View
              style={[styles.dividerLine, {backgroundColor: themeColors.borderColor}]}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.generateButton,
              {
                backgroundColor: themeColors.bgCard,
                borderColor: themeColors.borderColor,
              },
            ]}
            onPress={handleGenerateWallet}
            activeOpacity={0.8}>
            <Ionicons name="add-circle" size={20} color={colors.accentTeal} />
            <Text
              style={[
                styles.buttonText,
                {
                  color: colors.accentTeal,
                },
              ]}>
              Generate New Wallet
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.info}>
          <Ionicons name="information-circle" size={20} color={colors.accentTeal} />
          <Text style={[styles.infoText, {color: themeColors.textSecondary}]}>
            Your wallet uses OpenZeppelin Smart Accounts for secure, programmable
            authorization on Stellar/Soroban.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.xl,
    paddingTop: spacing.xl * 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl * 2,
  },
  icon: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    fontSize: 16,
    marginBottom: spacing.lg,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    gap: spacing.sm,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    fontSize: 14,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});

