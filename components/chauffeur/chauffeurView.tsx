import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  reservation: {
    client: string;
    depart: string;
    arrivee: string;
    typeVoiture: string;
    payement: string;
  };
  loading: boolean;
  onConfirmer: () => void;
}

export default function ReservationView({
  reservation,
  loading,
  onConfirmer,
}: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Nouvelle Réservation</Text>
      <Text style={styles.subtitle}>
        Réservez seulement si vous êtes à proximité du client
      </Text>

      <View style={styles.card}>
        <Text style={styles.clientName}>{reservation.client}</Text>
        <Text style={styles.info}>
          Départ : <Text style={styles.bold}>{reservation.depart}</Text>
        </Text>
        <Text style={styles.info}>
          Arrivé : <Text style={styles.bold}>{reservation.arrivee}</Text>
        </Text>
        <Text style={styles.info}>
          Type Voiture :{" "}
          <Text style={styles.bold}>{reservation.typeVoiture}</Text>
        </Text>
        <Text style={styles.info}>
          Payement : <Text style={styles.bold}>{reservation.payement}</Text>
        </Text>

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={onConfirmer}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Confirmer</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.bottomNav}>
        <View style={styles.navItem}>
          <Ionicons name="home-outline" size={24} color="black" />
          <Text style={styles.navText}>Accueil</Text>
        </View>
        <View style={styles.navItem}>
          <Ionicons name="card-outline" size={24} color="black" />
          <Text style={styles.navText}>Payement</Text>
        </View>
        <View style={styles.navItem}>
          <Ionicons name="person-outline" size={24} color="black" />
          <Text style={styles.navText}>Compte</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingTop: 20,
  },
  title: {
    color: "green",
    fontWeight: "bold",
    fontSize: 18,
    textDecorationLine: "underline",
  },
  subtitle: {
    fontSize: 12,
    color: "#555",
    marginVertical: 5,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#f2f2f2",
    borderRadius: 20,
    padding: 25,
    width: "85%",
    marginTop: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  clientName: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 10,
  },
  info: {
    fontSize: 15,
    marginVertical: 3,
  },
  bold: {
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#f25c3c",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginTop: 18,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    position: "absolute",
    bottom: 0,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    color: "#333",
  },
});
