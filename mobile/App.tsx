import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {StatusBar as ExpoStatusBar} from 'expo-status-bar';

import {ThemeProvider, useTheme} from './src/theme/ThemeContext';
import {WelcomeScreen} from './src/screens/WelcomeScreen';
import {OnboardingScreen} from './src/screens/OnboardingScreen';
import {HomeScreen} from './src/screens/HomeScreen';
import {CardScreen} from './src/screens/CardScreen';
import {PayModeScreen} from './src/screens/PayModeScreen';
import {DeFiScreen} from './src/screens/DeFiScreen';
import {ActivityScreen} from './src/screens/ActivityScreen';
import {SettingsScreen} from './src/screens/SettingsScreen';
import {NavigationBar} from './src/components/NavigationBar';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      tabBar={props => <NavigationBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Card" component={CardScreen} />
      <Tab.Screen name="PayMode" component={PayModeScreen} />
      <Tab.Screen name="DeFi" component={DeFiScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const {isDark} = useTheme();

  return (
    <NavigationContainer>
      <ExpoStatusBar style={isDark ? 'light' : 'dark'} />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppNavigator />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
