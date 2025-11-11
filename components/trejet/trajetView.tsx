import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import MapViews from "@/components/map/mapView";
import { useFocusEffect } from "expo-router";

const primary = "#EE6841";

export default function TrajetScreen() {
  const [trajets, setTrajets] = useState<any[]>([]);
  const [selectedTrajet, setSelectedTrajet] = useState<any | null>(null);
  const trajet = true;

  //Mettre les trajet a jour a chque fois qu'on ouvre l'onglet
  const loadTrajets = async () => {
    const stored = await AsyncStorage.getItem("trajets");
    setTrajets(stored ? JSON.parse(stored) : []);
  };
    //  recharge à chaque retour sur l’écran
  useFocusEffect(
    useCallback(() => {
      loadTrajets();
    }, [])
  );
  useEffect(() => {
    const fetchTrajets = async () => {
      const data = await AsyncStorage.getItem("trajets");
      if (data) setTrajets(JSON.parse(data));
      // console.log("les donnee enregister dans le storage",data)
    };
    fetchTrajets();
  }, []);

  const openTrajet = (trajet: any) => {
    setSelectedTrajet(trajet);
  };

  const deleteTrajet = async (id: number) => {
    Alert.alert("Supprimer ce trajet ?", "Cette action est irréversible.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          const updated = trajets.filter((t) => t.id !== id);
          setTrajets(updated);
          await AsyncStorage.setItem("trajets", JSON.stringify(updated));
          if (selectedTrajet?.id === id) setSelectedTrajet(null);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes trajets</Text>

      {selectedTrajet ? (
        <View style={styles.selectedContainer}>
          <Text style={styles.selectedTitle}>
            Trajet sélectionné : {selectedTrajet.name}
          </Text>

          <View style={styles.mapContainer}>
            <MapViews
              trajet={true}
              startLat={selectedTrajet.startCoord.latitude}
              startLng={selectedTrajet.startCoord.longitude}
              destLat={selectedTrajet.destCoord.latitude}
              destLng={selectedTrajet.destCoord.longitude}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setSelectedTrajet(null)}
            >
              <Ionicons name="close" size={28} color={primary} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlatList
          data={trajets}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <TouchableOpacity
                onPress={() => openTrajet(item)}
                style={styles.itemContent}
              >
                <Text style={styles.itemTitle}>{item.name}</Text>
                <Text style={styles.itemSub}>
                  Distance : {item.distance} | Destination : {item.destinationAddress}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteTrajet(item.id)}>
                <Ionicons name="close-circle" size={24} color="red" />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Aucun trajet enregistré pour l’instant.
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  selectedContainer: { flex: 1, marginTop: 10 },
  selectedTitle: { textAlign: "center", marginBottom: 5, fontSize: 16 },
  mapContainer: { flex: 1, borderRadius: 10, overflow: "hidden" },
  addButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "white",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    zIndex: 10,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 8, 
  },
  itemContent: { flex: 1, marginRight: 10 },
  itemTitle: { fontSize: 16, fontWeight: "600" },
  itemSub: { color: "#555" },
  emptyText: { textAlign: "center", marginTop: 20, color: "#777" },
});
