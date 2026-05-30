import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { BasketProvider } from '@/hooks/useBasket';
import { ThemeProvider } from '@/hooks/useTheme';
import { UserPreferencesProvider } from '@/hooks/useUserPreferences';
import { Stack, router } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function RootLayoutNav() {
  const { user, isGuest, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (user || isGuest) {
      router.replace('/(tabs)');
    } else {
      router.replace('/login');
    }
  }, [user, isGuest, isLoading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <UserPreferencesProvider>
            <BasketProvider>
              <RootLayoutNav />
            </BasketProvider>
          </UserPreferencesProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}