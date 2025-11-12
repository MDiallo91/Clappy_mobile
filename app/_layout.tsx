import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import React from "react";
import { StatusBar } from "expo-status-bar";

const primary = "#EE6841";

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("auth_token");

        if (token && token.trim() !== "") {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        // console.error("Erreur lors de la vérification du token :", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  //  Pendant le chargement, afficher un écran neutre
  if (isAuthenticated === null) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <ActivityIndicator size="large" color={primary} />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="(drawer)" />
        ) : (
          <Stack.Screen name="(auth)" />
        )}
      </Stack>

      <Toast />
      <StatusBar style="dark" />
    </>
  );
}
