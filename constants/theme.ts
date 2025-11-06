// constants/theme.ts
export const COLORS = {
  primary: '#007bff', // Light blue
  background: '#f8faff', // Soft white-blue
  textDark: '#1c1c1c',
  textLight: '#6b6b6b',
  card: '#ffffff',
  border: '#dce3f0',
  success: '#28a745',
  danger: '#dc3545',
  textGray: '#888888',
  textSecondary: '#6c757d',
  text: '#0056b3',
  gray2: '#e0e0e0',
};

export const GLOBAL_STYLES = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 600 as const,
    color: COLORS.textDark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 16,
  },
};
