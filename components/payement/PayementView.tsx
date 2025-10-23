import React from "react";
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  onScan: () => void;
}

export default function PayementView({ onScan }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>PAYEMENT</Text>
      <Text style={styles.subtitle}>
        Réservez seulement si vous êtes à proximité du client
      </Text>

      <View style={styles.qrContainer}>
        <Image
          source={{
            uri: "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=reservation",
          }}
          style={styles.qrCode}
        />
        <TouchableOpacity onPress={onScan}>
          <Text style={styles.scanText}>Scanner le code</Text>
        </TouchableOpacity>
      </View>

    
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingTop: 30,
  },
  title: {
    color: "green",
    fontWeight: "bold",
    fontSize: 20,
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 12,
    color: "#555",
    marginVertical: 5,
    textAlign: "center",
  },
  qrContainer: {
    marginTop: 30,
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    padding: 20,
    borderRadius: 15,
  },
  qrCode: {
    width: 180,
    height: 180,
  },
  scanText: {
    color: "green",
    fontWeight: "600",
    marginTop: 15,
    fontSize: 15,
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
