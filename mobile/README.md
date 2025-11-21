# Vantis Mobile

React Native mobile application with Expo for Vantis - The "Buy & Keep" Card.

## Project Structure

```
mobile/
├── src/
│   ├── components/      # Reusable components
│   ├── screens/         # Application screens
│   ├── theme/           # Theme system and colors
│   └── utils/           # Utilities
├── App.tsx              # Root component
├── index.js             # Entry point
├── app.json             # Expo configuration
└── package.json         # Dependencies
```

## Quick Setup

### Prerequisites

- Node.js >= 18
- Expo CLI (installed globally or via npx)
- Expo Go app on your mobile device (for development)

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
- **React Navigation** - Screen navigation
- **AsyncStorage** - Local storage
- **React Native Gesture Handler** - Gestures

## Navigation Structure

- **Welcome** - Welcome screen
- **Onboarding** - Initial account setup
- **Main Tabs**:
  - Home
  - Card
  - Pay Mode
  - DeFi
  - Activity
- **Settings** - Settings

## Theme System

The application supports light and dark themes, with persistence using AsyncStorage. The theme can be toggled through the `ThemeToggle` component.

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
- ✅ Over-the-air updates
- ✅ Cloud builds (EAS Build)

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

## Notes

- The application was migrated from Nuxt.js/Vue.js to React Native with Expo
- Maintains the same visual structure and functionalities as the web frontend
- Components adapted for mobile with native navigation
- React Native Reanimated was removed for compatibility reasons

## Next Steps

1. ✅ Project configured with Expo
2. ✅ Navigation configured
3. ✅ Theme system implemented
4. ⏭️ Add specific functionalities
5. ⏭️ Integrate with backend
6. ⏭️ Tests and deployment
