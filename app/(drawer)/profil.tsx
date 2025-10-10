import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

  const primary="#EE6841"

export default function ProfilScreen() {
  const handleEditProfile = () => {
    console.log("Modifier le profil");
  };

  const handleChangePhoto = () => {
    console.log("Changer la photo");
  };

  return (
    <View style={styles.container}>
      {/* Titre + icône crayon */}
      <View style={styles.header}>
        <Text style={styles.title}>Mon Profil</Text>
        <TouchableOpacity  onPress={handleEditProfile}>
          <Ionicons  style={styles.modifButton} name="pencil" size={32} color="white" />
            <Text>Modifier</Text>
        </TouchableOpacity>
      </View>

      {/* Photo de profil + icône caméra */}
      <View style={styles.imageContainer}>
        <Image
          source={require("@/assets/images/profile.jpg")}
          style={styles.profileImage}
          contentFit="cover"
        />
        <TouchableOpacity style={styles.cameraButton} onPress={handleChangePhoto}>
          <Ionicons name="camera" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Informations */}
      <View style={styles.card}>
        <View style={styles.infoItem}>
          <Text style={styles.label}>Nom</Text>
          <Text style={styles.value}>Mamadou Diallo</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoItem}>
          <Text style={styles.label}>Téléphone</Text>
          <Text style={styles.value}>+224 655 34 34 34</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoItem}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>clappy@gmail.com</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#333",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 30,
    position: "relative",
  },
  profileImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
    borderColor:primary,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: "35%",
    backgroundColor: primary,
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fff",
  },
    modifButton: {
    bottom: 0,
    backgroundColor: primary,
    padding: 6,
    borderRadius: 50,
    borderWidth: 2,
    elevation:4,
    borderColor: "#fff",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoItem: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
  },
  value: {
    fontSize: 15,
    color: "#666",
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 10,
  },
});
