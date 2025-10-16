
// import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// import { Stack } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import 'react-native-reanimated';
// import "./global.css"

// import { useColorScheme } from '@/hooks/use-color-scheme';
// import Toast from 'react-native-toast-message';

// export const unstable_settings = {
//   anchor: '(drawer)',
// };

// export default function RootLayout() {
//   const colorScheme = useColorScheme();

//   return (
//     <ThemeProvider value={colorScheme === 'light' ? DarkTheme : DefaultTheme}>
//       <Stack>
//         <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
//         <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal',  }} />
//        <Stack.Screen name="inscription" options={{ title: "Incription",headerShown:false }} />
//        <Stack.Screen name="connexion" options={{ title: "Connexion" ,headerShown:false}} />
//       </Stack>
//       <Toast />
//       <StatusBar style="auto" />
//     </ThemeProvider>
//   );
// }


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
  <ThemeProvider value={colorScheme === 'light' ? DarkTheme : DefaultTheme}>
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
  </ThemeProvider>
);

}
