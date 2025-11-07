import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface AnimatedScreenWrapperProps {
  children: React.ReactNode;
  delay?: number;
  style?: ViewStyle;
}

export default function AnimatedScreenWrapper({
  children,
  delay = 0,
  style,
}: AnimatedScreenWrapperProps) {
  const scale = useRef(new Animated.Value(0.95)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay]);

  return (
    <Animated.View
      style={[
        { flex: 1, opacity, transform: [{ scale }] },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}
