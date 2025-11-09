import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useColorScheme, View, ActivityIndicator } from 'react-native';

// Interface corrigée selon la structure de vos données
interface UserData {
  message: string;
  refresh_token: string;
  status: string;
  token: string;
  chauffeur_id: number | null;
  client_id: number;
  email: string;
  id: number;
  role: string; // "client", "chauffeur", ou "admin"
  username: string;

}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem("userData");
        
        if (userDataString) {
          const parsedData = JSON.parse(userDataString);
          setUserData(parsedData);
        }
      } catch (error) {
        console.error("Erreur récupération userData:", error);
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, []);

  // console.log("le role du user lorem upsun",userData?.user.role)
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  console.log("les dataUser pour verification",userData)
  // CORRECTION : Vérifier le rôle au lieu du username
  const isAdmin = userData?.role === "admin";
  const isClient = userData?.role === "client";
  const isChauffeur = userData?.role === "chauffeur";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'dark'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      {/* Onglets toujours visibles pour tous */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,

        }}
      />

      {/* Trajet - visible pour clients et chauffeurs,  */}
      <Tabs.Screen
        name="trajet"
        options={{
          title: 'Trajet',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
          href: isClient ? undefined : null, // visible seulement par client
        }}
      />

      {/* Profile - visible pour tous */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
          href: isClient ? undefined : null, // visible seuelement par le client

        }}
      />

      {/* Onglets admin - SEULEMENT visibles pour les chauffeur */}
      <Tabs.Screen
        name="chauffeur"
        options={{
          title: 'Reservation',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="car.fill" color={color} />,
          href: isChauffeur ? undefined : null, // Visible seulement pour  chauffeur
        }}
      />
      {/* Onglets admin - SEULEMENT visibles pour les chauffeur */}
      <Tabs.Screen
        name="courses"
        options={{
          title: 'Courses',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
          href: isChauffeur ? undefined : null, // Visible seulement pour  chauffeur
        }}
      />
      <Tabs.Screen
        name="payement"
        options={{
          title: 'Payement',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="creditcard" color={color} />,
          href: isChauffeur ? undefined : null, // Visible seulement pour chauffeur
        }}
      />
    </Tabs>
  );
}