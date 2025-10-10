import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Platform, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

const primary = "#EE6841";

export default function MapViews() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.log("Permission refusée");
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      } catch (error) {
        console.error("Erreur de localisation :", error);
      }
    })();
  }, []);

  //  Si la plateforme est web
  if (Platform.OS === "web") {
    return (
      <View style={styles.fallback}>
        <Text style={styles.text}>🗺️ La carte n’est pas disponible sur le Web.</Text>
      </View>
    );
  }

  // Si la localisation n'est pas encore disponible
  if (!location) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={primary} />
      </View>
    );
  }

  //  Afficher la carte quand la localisation est prête
  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
      showsUserLocation
      followsUserLocation
    >
      <Marker coordinate={location} title="Ma position" pinColor="blue" />
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  fallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eee",
  },
  text: { color: "#333", fontSize: 16 },
});
