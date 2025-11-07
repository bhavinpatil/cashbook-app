// constants/theme.ts

// Base light color palette — used as default and fallback
export const COLORS = {
  primary: '#007bff',
  background: '#f8faff',
  textDark: '#1c1c1c',
  textLight: '#6b6b6b',
  card: '#ffffff',
  border: '#dce3f0',
  success: '#28a745',
  danger: '#dc3545',
  tabActive: '#007bff',
  tabInactive: '#9ca3af',
};

export const LIGHT_THEME = { name: 'light', ...COLORS };

export const DARK_THEME = {
  name: 'dark',
  primary: '#4e9eff',
  background: '#0f172a',
  textDark: '#f8fafc',
  textLight: '#94a3b8',
  card: '#1e293b',
  border: '#334155',
  success: '#22c55e',
  danger: '#ef4444',
  tabActive: '#4e9eff',
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
    color: COLORS.textDark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 16,
  },
};
