
import HomeContenaire from '@/components/home/HomeContenaire';
import MapViews from '@/components/map/mapView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';

export default function HomeScreen() {

      //recuperation du token
    useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        router.replace("/(auth)/index");
      }
    };
    checkAuth();
  }, []);
  return (
    <>
      <MapViews/>
    </>
  );
}
