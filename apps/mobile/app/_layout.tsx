import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DemoProvider } from '../src/demo';
import { c } from '../src/ui';

export { ErrorBoundary } from 'expo-router';
export default function RootLayout() {
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => subscription.remove();
  }, []);
  return (
    <SafeAreaProvider>
      <DemoProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: c.background },
            headerTintColor: c.navy,
            headerTitleStyle: { fontSize: 16, fontWeight: '600' },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: c.background },
            animation: reduceMotion ? 'none' : 'default',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="patient/[id]" options={{ title: 'Patient profile' }} />
          <Stack.Screen name="session/[id]" options={{ title: 'Session' }} />
          <Stack.Screen name="feature/[slug]" options={{ title: 'Patient Touch' }} />
          <Stack.Screen
            name="journal"
            options={{ title: 'Your reflection', presentation: 'modal' }}
          />
          <Stack.Screen name="auth/[mode]" options={{ title: 'Account', presentation: 'modal' }} />
        </Stack>
      </DemoProvider>
    </SafeAreaProvider>
  );
}
