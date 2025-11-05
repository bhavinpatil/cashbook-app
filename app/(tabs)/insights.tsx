import { Text } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import { GLOBAL_STYLES } from '../../constants/theme';

export default function InsightsScreen() {
  return (
    <ScreenContainer>
      <Text style={GLOBAL_STYLES.title}>Insights</Text>
      <Text style={GLOBAL_STYLES.subtitle}>Charts and reports will come here 📊</Text>
    </ScreenContainer>
  );
}
