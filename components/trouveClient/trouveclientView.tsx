import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";

const { width } = Dimensions.get("window");

// --- Interfaces ---
interface CourseData {
  id: number;
  startLat: string;
  startLng: string;
  destLat: string;
  destLng: string;
  clientNom: string;
  adresseDepart: string;
  adresseDestination: string;
}

interface TrouveClientViewProps {
  courseData: CourseData;
  loading: boolean;
  onConfirmer: (reservation: CourseData) => void;
}

interface Coordinate {
  latitude: number;
  longitude: number;
}

export default function TrouveClientView({
  courseData,
  loading,
  onConfirmer,
}: TrouveClientViewProps) {
  const mapRef = useRef<MapView>(null);
  const [userLocation, setUserLocation] = useState<Coordinate | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const clientCoord: Coordinate = {
    latitude: parseFloat(courseData.startLat),
    longitude: parseFloat(courseData.startLng),
  };

  const destinationCoord: Coordinate = {
    latitude: parseFloat(courseData.destLat),
    longitude: parseFloat(courseData.destLng),
  };

  // --- Récupération position du chauffeur ---
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          // console.log("Permission refusée");
          setLocationLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const userCoord = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        setUserLocation(userCoord);
        setLocationLoading(false);

        if (mapRef.current) {
          mapRef.current.fitToCoordinates(
            [userCoord, clientCoord, destinationCoord],
            {
              edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
              animated: true,
            }
          );
        }
      } catch (error) {
        // console.error("Erreur de localisation :", error);
        setLocationLoading(false);
      }
    };

    getUserLocation();
  }, []);

  const routeCoordinates = [clientCoord, destinationCoord];

  if (loading || locationLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f25c3c" />
        <Text style={styles.loadingText}>Chargement de la carte...</Text>
      </View>
    );
  }

  const handleConfirmer = async () => {
    if (isConfirming) return;
    setIsConfirming(true);
    try {
      await onConfirmer(courseData);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* --- Carte --- */}
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation
        showsCompass
        initialRegion={{
          latitude: clientCoord.latitude,
          longitude: clientCoord.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* Client */}
        <Marker coordinate={clientCoord} title="Client" description={courseData.adresseDepart}>
          <View style={styles.clientMarker}>
            <Ionicons name="person" size={18} color="#fff" />
          </View>
        </Marker>

        {/* Destination */}
        <Marker coordinate={destinationCoord} title="Destination" description={courseData.adresseDestination}>
          <View style={styles.destinationMarker}>
            <Ionicons name="flag" size={16} color="#fff" />
          </View>
        </Marker>

        {/* Chauffeur */}
        {userLocation && (
          <Marker coordinate={userLocation} title="Vous (chauffeur)">
            <View style={styles.driverMarker}>
              <Ionicons name="car-sport" size={16} color="#fff" />
            </View>
          </Marker>
        )}

        {/* Ligne */}
        <Polyline
          coordinates={routeCoordinates}
          strokeColor="#f25c3c"
          strokeWidth={3}
          lineDashPattern={[5, 5]}
        />
      </MapView>

      {/* --- Bouton "+" / "-" --- */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          onPress={() => setShowDetails(!showDetails)}
          style={styles.toggleButton}
        >
          <Ionicons
            name={showDetails ? "remove" : "add"}
            size={26}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {/* --- Panneau des détails --- */}
      {showDetails && (
        <View style={styles.detailsPanel}>
          <Text style={styles.panelTitle}>Détails de la course</Text>

          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={20} color="#f25c3c" />
            <Text style={styles.detailText}>{courseData.clientNom}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={20} color="#f25c3c" />
            <Text style={styles.detailText}>{courseData.adresseDepart}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="flag-outline" size={20} color="#4CAF50" />
            <Text style={styles.detailText}>{courseData.adresseDestination}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.confirmButton,
              (loading || isConfirming) && styles.buttonDisabled,
            ]}
            onPress={handleConfirmer}
            disabled={loading || isConfirming}
          >
            {isConfirming ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.confirmText}>Confirmer la réservation</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#555", marginTop: 10 },

  clientMarker: {
    backgroundColor: "#f25c3c",
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fff",
  },
  destinationMarker: {
    backgroundColor: "#4CAF50",
    padding: 6,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#fff",
  },
  driverMarker: {
    backgroundColor: "#2196F3",
    padding: 6,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#fff",
  },

  toggleContainer: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
  },
  toggleButton: {
    backgroundColor: "#f25c3c",
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },

  detailsPanel: {
    position: "absolute",
    bottom: 80,
    width: width - 40,
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailText: {
    marginLeft: 8,
    color: "#333",
    flexShrink: 1,
  },
  confirmButton: {
    backgroundColor: "#f25c3c",
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: { opacity: 0.7 },
  confirmText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
});
