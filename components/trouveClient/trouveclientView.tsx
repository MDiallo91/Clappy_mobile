import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

interface CourseData {
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
}

interface Coordinate {
  latitude: number;
  longitude: number;
}

export default function TrouveClientView({
  courseData,
  loading,
}: TrouveClientViewProps) {
  const mapRef = useRef<MapView>(null);
  const [userLocation, setUserLocation] = useState<Coordinate | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [region, setRegion] = useState({
    latitude: parseFloat(courseData.startLat),
    longitude: parseFloat(courseData.startLng),
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Coordonnées du client et de la destination
  const clientCoord: Coordinate = {
    latitude: parseFloat(courseData.startLat),
    longitude: parseFloat(courseData.startLng),
  };

  const destinationCoord: Coordinate = {
    latitude: parseFloat(courseData.destLat),
    longitude: parseFloat(courseData.destLng),
  };

  // Obtenir la position actuelle du chauffeur
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permission de localisation refusée');
          setLocationLoading(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const userCoord = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        
        setUserLocation(userCoord);
        setLocationLoading(false);

        // Ajuster la région pour montrer le client et le chauffeur
        if (mapRef.current) {
          mapRef.current.fitToCoordinates([userCoord, clientCoord], {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          });
        }
      } catch (error) {
        console.error('Erreur de localisation:', error);
        setLocationLoading(false);
      }
    };

    getUserLocation();
  }, []);

  // Coordonnées pour la polyligne (trajet)
  const routeCoordinates = [clientCoord, destinationCoord];

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f25c3c" />
        <Text style={styles.loadingText}>Chargement de la position...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📍 Position du client</Text>
        <Text style={styles.clientName}>{courseData.clientNom || "Client"}</Text>
      </View>

      {/* Carte personnalisée */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={region}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={true}
          zoomControlEnabled={true}
        >
          {/* Marqueur du client */}
          <Marker
            coordinate={clientCoord}
            title="Position du client"
            description={courseData.adresseDepart}
          >
            <View style={styles.clientMarker}>
              <Ionicons name="person" size={20} color="#fff" />
            </View>
          </Marker>

          {/* Marqueur de la destination */}
          <Marker
            coordinate={destinationCoord}
            title="Destination"
            description={courseData.adresseDestination}
            pinColor="green"
          >
            <View style={styles.destinationMarker}>
              <Ionicons name="flag" size={16} color="#fff" />
            </View>
          </Marker>

          {/* Ligne du trajet */}
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#f25c3c"
            strokeWidth={4}
            lineDashPattern={[5, 5]}
          />

          {/* Marqueur du chauffeur (si localisation disponible) */}
          {userLocation && (
            <Marker
              coordinate={userLocation}
              title="Votre position"
              description="Chauffeur"
            >
              <View style={styles.driverMarker}>
                <Ionicons name="car-sport" size={18} color="#fff" />
              </View>
            </Marker>
          )}
        </MapView>

        {/* Légende */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#f25c3c' }]} />
            <Text style={styles.legendText}>Client</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>Destination</Text>
          </View>
          {userLocation && (
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#2196F3' }]} />
              <Text style={styles.legendText}>Vous</Text>
            </View>
          )}
        </View>
      </View>

      {/* Informations du trajet */}
      <View style={styles.infoContainer}>
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Détails du trajet</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="#f25c3c" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Départ</Text>
              <Text style={styles.infoValue} numberOfLines={2}>
                {courseData.adresseDepart}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="flag-outline" size={20} color="#4CAF50" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Destination</Text>
              <Text style={styles.infoValue} numberOfLines={2}>
                {courseData.adresseDestination}
              </Text>
            </View>
          </View>

          {userLocation && (
            <View style={styles.infoRow}>
              <Ionicons name="navigate-outline" size={20} color="#2196F3" />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Votre position</Text>
                <Text style={styles.infoValue}>Localisé sur la carte</Text>
              </View>
            </View>
          )}
        </View>

        {/* Statut de localisation */}
        <View style={styles.locationStatus}>
          <Ionicons 
            name={userLocation ? "checkmark-circle" : "location-outline"} 
            size={24} 
            color={userLocation ? "#4CAF50" : "#FF9800"} 
          />
          <Text style={[
            styles.statusText,
            { color: userLocation ? "#4CAF50" : "#FF9800" }
          ]}>
            {userLocation ? "Position détectée" : "Recherche de position..."}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#f8f8f8",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  clientName: {
    fontSize: 16,
    color: "#f25c3c",
    textAlign: "center",
    marginTop: 5,
    fontWeight: "600",
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  // Styles des marqueurs
  clientMarker: {
    backgroundColor: '#f25c3c',
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  destinationMarker: {
    backgroundColor: '#4CAF50',
    padding: 6,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#fff',
  },
  driverMarker: {
    backgroundColor: '#2196F3',
    padding: 7,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#fff',
  },
  // Légende
  legend: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#333',
  },
  // Informations
  infoContainer: {
    padding: 20,
    backgroundColor: "#f8f8f8",
  },
  infoSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  // Statut de localisation
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});