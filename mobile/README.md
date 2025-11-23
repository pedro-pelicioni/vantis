# Vantis Mobile

React Native mobile application with Expo for Vantis - The "Buy & Keep" Card. A self-custodial wallet with installment payment capabilities.

## Project Structure

```
mobile/
├── src/
│   ├── components/      # Reusable components (Header, NavigationBar, ThemeToggle, VantisLogo, etc.)
│   ├── screens/         # Application screens (Welcome, Home, Card, Payment, etc.)
│   ├── theme/           # Theme system and colors
│   ├── contexts/        # React contexts (WalletContext, ThemeContext)
│   ├── services/        # Services (walletService, passkeyService)
│   └── config/          # Configuration files
├── App.tsx              # Root component
├── index.js             # Entry point
├── app.json             # Expo configuration
├── eas.json             # EAS Build configuration
└── package.json         # Dependencies
```

## Quick Setup

### Prerequisites

- Node.js >= 18
- Expo CLI (installed globally or via npx)
- Expo Go app on your mobile device (for development)
- EAS CLI (for publishing updates): `npm install -g eas-cli`

### Installation Steps

1. **Install dependencies:**
```bash
cd mobile
npm install
```

2. **Start the project:**
```bash
npm start
```

This will open Expo Dev Tools in your browser.

3. **Run on your device:**

**Option A: Using Expo Go (Recommended for development)**

1. Install the **Expo Go** app on your device:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Scan the QR code that appears in the terminal or browser:
   - **iOS**: Use iPhone Camera
   - **Android**: Use Expo Go app to scan

**Option B: Emulator/Simulator**

```bash
# Android
npm run android

# iOS (macOS only)
npm run ios

# Web
npm run web
```

## Available Commands

- `npm start` - Start the development server
- `npm run android` - Open in Android emulator
- `npm run ios` - Open in iOS simulator
- `npm run web` - Open in web browser
- Press `r` in terminal - Reload the app
- Press `m` in terminal - Open developer menu

## Technologies Used

- **Expo** ~54.0.0 - React Native framework
- **React Native** 0.81.5
- **TypeScript**
- **React Navigation** - Screen navigation (Stack and Bottom Tabs)
- **AsyncStorage** - Local storage
- **React Native Gesture Handler** - Gestures
- **Expo Linear Gradient** - Gradient backgrounds
- **Expo Local Authentication** - Biometric authentication for passkeys
- **React Native SVG** - SVG rendering for logo
- **EAS Update** - Over-the-air updates

## Key Features

### Authentication
- **Passkey Authentication**: Passwordless login using device biometrics (Face ID, Touch ID, Fingerprint)
- Secure wallet connection using passkey-based authentication

### Wallet Management
- Self-custodial wallet with Stellar network support
- Balance display in USD and XLM
- Support for multiple tokens (XLM, USDC, BTC)
- Balance visibility toggle (eye icon)
- Transaction history

### Card Features
- **Virtual Card**: Display card with masked number (first 4 + last 4 digits)
- Card number generation on wallet creation
- Card blocking/unblocking functionality
- Card details modal with full number, CVV, and expiry date
- Realistic card design with gradient and logo

### Payment System
- **Payment Screen**: Simplified payment flow with card display
- Installment options (1x, 2x, 3x, 4x, 5x, 6x, 8x, 10x, 11x, 12x)
- Card payment simulation with animated card display
- Success confirmation with animated checkmark
- USD currency support

### Send & Receive
- **Send**: Transfer funds to other wallets
- **Receive**: Display wallet address and QR code for receiving funds

### DeFi
- Token portfolio display
- Asset management

## Navigation Structure

- **Welcome** - Welcome screen with passkey registration/login
- **Onboarding** - Initial account setup with passkey
- **Main Tabs**:
  - **Home** - Dashboard with balance, send/receive buttons, and activity
  - **Card** - Virtual card display with blocking options
  - **Pay** - Payment screen with card simulation
  - **DeFi** - Token portfolio
  - **Activity** - Transaction history
- **Settings** - Theme toggle, support, logout
- **Payment** - Payment screen with installment options
- **Receive** - QR code and wallet address display
- **Transfer** - Send funds screen

## Theme System

The application supports light and dark themes, with persistence using AsyncStorage. The theme can be toggled through the `ThemeToggle` component in the header or settings screen.

- Automatic theme detection based on system preferences
- Persistent theme selection
- Smooth theme transitions

## EAS Update (Over-the-Air Updates)

The app is configured with EAS Update for seamless over-the-air updates without app store approval.

### Publishing Updates

1. **Login to Expo:**
```bash
npx expo login
```

2. **Publish an update:**
```bash
eas update --branch production --message "Your update message"
```

3. **View updates in dashboard:**
- Visit: https://expo.dev/accounts/vhendala/projects/vantis-mobile/updates

### Update Configuration

- **Runtime Version**: `1.0.0` (appVersion policy)
- **Branch**: `production`
- **Project ID**: `591bb27f-0d28-4bce-a036-cf891021abd0`

Updates are automatically downloaded when users open the app.

## Development

### Using Expo Go

1. Install Expo Go on your device
2. Run `npm start`
3. Scan the QR code

### Production Build

```bash
# Android
eas build --platform android

# iOS
eas build --platform ios
```

## Expo Advantages

- ✅ Faster development
- ✅ Native hot reload
- ✅ No need to configure Android Studio/Xcode for development
- ✅ Easy access to native APIs
- ✅ Over-the-air updates (EAS Update)
- ✅ Cloud builds (EAS Build)
- ✅ Biometric authentication support

## Troubleshooting

### Error: "Unable to resolve module"
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm start -- --clear
```

### App doesn't load on device
- Make sure device and computer are on the same Wi-Fi network
- Try using "Tunnel" mode in Expo Dev Tools

### Issues with native dependencies
```bash
# Clear Expo cache
expo start --clear
```

### Port conflicts on Windows
If you're having connection issues on Windows, try:

1. **Kill all Node processes:**
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force
```

2. **Use Tunnel mode:**
```bash
npx expo start --tunnel --clear
```

3. **Check if ports are in use:**
```powershell
netstat -ano | findstr :8081
```

### Windows Firewall blocking connection
The Windows Defender/Firewall often blocks direct connection between PC and Mobile. Use Tunnel mode to bypass this:

```bash
npx expo start --tunnel --clear
```

Tunnel mode creates a connection through the internet, bypassing the firewall.

## SDK Version

This project uses **Expo SDK 54.0.0** for compatibility with modern devices.

## Security Features

- **Passkey Authentication**: Secure passwordless authentication using WebAuthn
- **Biometric Verification**: Face ID, Touch ID, Fingerprint support
- **Self-Custodial Wallet**: Users control their private keys
- **Card Number Masking**: Sensitive data is masked on display
- **Secure Storage**: AsyncStorage for local data persistence

## Recent Updates

- ✅ Payment screen with card simulation
- ✅ Card number masking (first 4 + last 4 digits)
- ✅ Installment payment options
- ✅ Success confirmation with animated checkmark
- ✅ EAS Update configuration
- ✅ Passkey authentication
- ✅ Balance visibility toggle
- ✅ USD balance display
- ✅ Send and Receive functionality
- ✅ Virtual card with blocking options

## Notes

- The application was migrated from Nuxt.js/Vue.js to React Native with Expo
- Maintains the same visual structure and functionalities as the web frontend
- Components adapted for mobile with native navigation
- React Native Reanimated was removed for compatibility reasons
- Wallet service uses mock implementations for Stellar network (ready for integration)

## Next Steps

1. ✅ Project configured with Expo
2. ✅ Navigation configured
3. ✅ Theme system implemented
4. ✅ Passkey authentication
5. ✅ Payment system
6. ✅ Card management
7. ⏭️ Integrate with Stellar network (real-time balance and transactions)
8. ⏭️ Backend integration
9. ⏭️ Tests and deployment

## License

Copyright © 2024 Vantis. All rights reserved.
