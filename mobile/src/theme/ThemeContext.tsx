import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {useColorScheme} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {colors} from './colors';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  colors: typeof colors.dark | typeof colors.light & {
    accentTeal: string;
    accentTealDark: string;
    accentBlue: string;
    accentRed: string;
    accentGreen: string;
  };
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'vantis-theme';

export const ThemeProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    initTheme();
  }, []);

  const initTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setThemeState(savedTheme as Theme);
      } else {
        // Use system preference
        setThemeState(systemColorScheme === 'dark' ? 'dark' : 'light');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
      setThemeState(systemColorScheme === 'dark' ? 'dark' : 'light');
    }
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const isDark = theme === 'dark';
  const themeColors = {
    ...(isDark ? colors.dark : colors.light),
    accentTeal: colors.accentTeal,
    accentTealDark: colors.accentTealDark,
    accentBlue: colors.accentBlue,
    accentRed: colors.accentRed,
    accentGreen: colors.accentGreen,
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        colors: themeColors,
        toggleTheme,
        setTheme,
      }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

