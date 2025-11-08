
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import "./global.css"

import { useColorScheme } from '@/hooks/use-color-scheme';
import Toast from 'react-native-toast-message';
import { ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationProvider } from '@/context/notificationContext';

import * as Notifications from 'expo-notifications';
import React from 'react';

// ✅ CORRECTION : Configuration avec le bon type
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: true,
//     shouldShowBanner: true, // ✅ Ajouté pour iOS
//     shouldShowList: true,   // ✅ Ajouté pour iOS
//   }),
// });




const primary = "#EE6841";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Exemple : vérifier si un token utilisateur existe
    AsyncStorage.getItem("auth_token").then(auth_token => {
      setIsAuthenticated(!!auth_token);
       console.log("Token récupéré :", auth_token);
    });
  }, []);

  if (isAuthenticated === null) {
    return <ActivityIndicator style={{ flex: 1 }} color={primary} />;
  }

  return (
  // <NotificationProvider>
  <>
    <Stack>
      {isAuthenticated ? (
        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="connexion" options={{ headerShown: false }} />
      )}
      <Stack.Screen name="inscription" options={{ headerShown: true }} />
    </Stack>
    <Toast />
    <StatusBar style="dark" />
  </>
  // </NotificationProvider>
);

}
