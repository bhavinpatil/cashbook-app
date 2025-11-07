// contexts/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEMES, ThemeType } from '@/constants/theme';

interface ThemeContextProps {
  theme: ThemeType;
  setThemeByName: (name: keyof typeof THEMES) => void;
}

const THEME_KEY = 'appTheme';

const ThemeContext = createContext<ThemeContextProps>({
  theme: THEMES.light,
  setThemeByName: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeName, setThemeName] = useState<keyof typeof THEMES>('light');
  const [isLoaded, setIsLoaded] = useState(false);
  const theme = THEMES[themeName];

  // 🔹 Load saved theme on startup
  useEffect(() => {
    const loadStoredTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_KEY);
        if (saved && Object.keys(THEMES).includes(saved)) {
          setThemeName(saved as keyof typeof THEMES);
        }
      } catch (e) {
        console.error('Error loading saved theme:', e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadStoredTheme();
  }, []);

  // 🔹 Save theme when user changes it
  const setThemeByName = async (name: keyof typeof THEMES) => {
    try {
      setThemeName(name);
      await AsyncStorage.setItem(THEME_KEY, name);
    } catch (e) {
      console.error('Error saving theme:', e);
    }
  };

  // 🔸 Optional: Wait until theme is loaded before rendering app
  if (!isLoaded) return null;

  return (
    <ThemeContext.Provider value={{ theme, setThemeByName }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);