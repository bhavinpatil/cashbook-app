export const COLORS = {
  primary: '#007bff',
  background: '#f8faff',
  textDark: '#1c1c1c',
  textLight: '#6b6b6b',
  card: '#ffffff',
  border: '#dce3f0',
  inputBg: '#ffffff',
  success: '#28a745',
  danger: '#dc3545',
  tabActive: '#007bff',
  tabInactive: '#9ca3af',
};

export const LIGHT_THEME = { name: 'light', ...COLORS };

// 🌙 Refined full dark theme — smoother blending
export const DARK_THEME = {
  name: 'dark',
  primary: '#3b82f6',
  background: '#0d1117',
  textDark: '#e2e8f0',
  textLight: '#94a3b8',
  card: '#161b22',
  border: '#2d3748',
  inputBg: '#0f141a',      // NEW
  success: '#22c55e',
  danger: '#ef4444',
  tabActive: '#3b82f6',
  tabInactive: '#64748b',
};

export const BLUE_THEME = {
  name: 'blue',
  primary: '#2563eb',
  background: '#e0f2fe',
  textDark: '#1e3a8a',
  textLight: '#475569',
  card: '#ffffff',
  border: '#93c5fd',
  inputBg: '#e6f2ff',      // NEW
  success: '#16a34a',
  danger: '#dc2626',
  tabActive: '#2563eb',
  tabInactive: '#94a3b8',
};

export const GREEN_THEME = {
  name: 'green',
  primary: '#16a34a',
  background: '#f0fdf4',
  textDark: '#064e3b',
  textLight: '#4b5563',
  card: '#ffffff',
  border: '#bbf7d0',
  inputBg: '#e9fcef',      // NEW
  success: '#22c55e',
  danger: '#dc2626',
  tabActive: '#16a34a',
  tabInactive: '#94a3b8',
};

export const THEMES = {
  light: LIGHT_THEME,
  dark: DARK_THEME,
  blue: BLUE_THEME,
  green: GREEN_THEME,
};

export type ThemeType = typeof LIGHT_THEME;

export const GLOBAL_STYLES = {
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
};

export const Colors = {
  light: LIGHT_THEME,
  dark: DARK_THEME,
  blue: BLUE_THEME,
  green: GREEN_THEME,
};
