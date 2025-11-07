import React, { createContext, useContext, useState, ReactNode } from 'react';
import { THEMES, ThemeType } from '../constants/theme';

interface ThemeContextProps {
  theme: ThemeType;
  setThemeByName: (name: keyof typeof THEMES) => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: THEMES.light,
  setThemeByName: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeName, setThemeName] = useState<keyof typeof THEMES>('light');
  const theme = THEMES[themeName];

  const setThemeByName = (name: keyof typeof THEMES) => {
    setThemeName(name);
  };

  return (
    <ThemeContext.Provider value={{ theme, setThemeByName }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
