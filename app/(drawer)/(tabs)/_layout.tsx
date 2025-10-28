import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useColorScheme, View, ActivityIndicator } from 'react-native';

interface UserData {
  access: string;
  id: number;
  refresh: string;
  status: number;
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
          const userData = JSON.parse(userDataString);
          setUserData(userData);
        }
      } catch (error) {
        console.error("Erreur récupération userData:", error);
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const isAdmin = userData?.username === "admin";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'dark'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      {/* Onglets toujours visibles */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="trajet"
        options={{
          title: 'Trajet',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
          href: !isAdmin ? undefined : null, //  null = masqué de la tab bar

        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
          href: !isAdmin ? undefined : null, //  null = masqué de la tab bar

        }}
      />

      {/* Onglets admin - conditionnés */}
      <Tabs.Screen
        name="chauffeur"
        options={{
          title: 'Chauffeur',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.circle.fill" color={color} />,
          href: isAdmin ? undefined : null, //  null = masqué de la tab bar
        }}
      />
      <Tabs.Screen
        name="payement"
        options={{
          title: 'Payement',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="creditcard" color={color} />,
          href: isAdmin ? undefined : null, //  null = masqué de la tab bar
        }}
      />
    </Tabs>
  );
}