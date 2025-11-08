import { Drawer } from "expo-router/drawer";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: true, 
        drawerActiveTintColor: "tomato",
        drawerLabelStyle: { fontSize: 16 },
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: "Accueil",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
        <Drawer.Screen
        name="profil"
        options={{
          title: "Compte",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      
      <Drawer.Screen
        name="setting"
        options={{
          title: "Paramètres",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
       {/* <Drawer.Screen
        name="logout"
        options={{
          title: "Deconnxion",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="log-out-outline" size={size} color={color} />
          ),
        }}
      /> */}
    </Drawer>
  );
}
