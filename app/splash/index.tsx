import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useRouter } from 'expo-router';

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    async function prepare() {
      await SplashScreen.preventAutoHideAsync();
      setTimeout(async () => {
        await SplashScreen.hideAsync();
        router.replace('/');
      }, 2500); // 2.5 seconds
    }
    prepare();
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/cashbook-splash-icon.png')}
        style={{ width: 120, height: 120 }}
        resizeMode="contain"
      />
      <Text style={styles.title}>Cashbook</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
    marginTop: 20,
  },
});
