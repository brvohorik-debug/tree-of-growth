import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Držet splash viditelný, dokud první obrazovka nevolá hideAsync()
SplashScreen.preventAutoHideAsync?.();
// Záložní skrytí po 2 s, kdyby první obrazovka nesvolala hideAsync()
setTimeout(() => SplashScreen.hideAsync?.().catch(() => {}), 2000);

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function RootLayout() {
  useEffect(() => {
    // Request notification permissions
    Notifications.requestPermissionsAsync();
    
    // Schedule daily notification
    const scheduleDailyNotification = async () => {
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🌱 Your tree needs care today",
          body: "Complete tasks to help your tree grow!",
          sound: true,
        },
        trigger: {
          hour: 9,
          minute: 0,
          repeats: true,
        },
      });
    };
    
    scheduleDailyNotification();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}
