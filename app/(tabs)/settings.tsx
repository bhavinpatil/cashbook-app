import { Text } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import { GLOBAL_STYLES } from '../../constants/theme';

export default function SettingsScreen() {
  return (
    <ScreenContainer>
      <Text style={GLOBAL_STYLES.title}>Settings ⚙️</Text>
      <Text style={GLOBAL_STYLES.subtitle}>Manage your preferences</Text>
    </ScreenContainer>
  );
}
