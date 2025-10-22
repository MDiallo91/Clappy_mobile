import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { Tabs } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
 <Tabs
  screenOptions={{
    tabBarActiveTintColor: Colors[colorScheme ?? 'dark'].tint,
    headerShown:false,
    tabBarButton: HapticTab,
    
  }}
>
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
      
    }}
  />
  <Tabs.Screen
    name="profile"
    options={{
      title: 'Profile',
      tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
    }}
  />
  <Tabs.Screen
    name="chauffeur"
    options={{
      title: 'Chauffeur',
      tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
    }}
  />
  <Tabs.Screen
    name="payement"
    options={{
      title: 'Payement',
      tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
    }}
  />
</Tabs>


  );
}
