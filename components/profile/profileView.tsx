import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import UtilisateurService from "@/services/userService";
import { useRouter } from "expo-router";
  const primary="#EE6841"

export default function ProfilScreen() {

  const [chauffeur,setChauffeur] = useState<any>()
  const router = useRouter();

    //Recuperer le chauffeur connecter
   useEffect(() => {
      const fetchChauffeur = async () => {
        try {
          const userData = await UtilisateurService.getUser(); // récupère l'utilisateur
          setChauffeur(userData);
          // console.log("le user connecter",userData)
        } catch (err: any) {
          // console.error('Erreur récupération chauffeur:', err);
        } 
      };
      fetchChauffeur();
    }, []);
  
   const handleEditProfile = () => {
    router.push("/updateProfil");
  };


  const handleChangePhoto = () => {
    // console.log("Changer la photo");
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
          source={require("@/assets/images/profile.jpeg")}
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
          <Text style={styles.label}> {chauffeur?.first_name} </Text>
          <Text style={styles.label}> {chauffeur?.last_name} </Text>
        </View>

        <View style={styles.divider} />
        {chauffeur?.telephone ?(
        <View style={styles.infoItem}>
          <Text style={styles.label}>Téléphone</Text>
          <Text style={styles.label}> {chauffeur?.telephone} </Text>
        </View>
        ):(
          <View style={styles.infoItem}>
          <Text style={styles.label}>Téléphone</Text>
          <Text style={styles.label}> {chauffeur?.username} </Text>
        </View>
        )}
         

        <View style={styles.divider} />

        <View style={styles.infoItem}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}> {chauffeur?.email} </Text>
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
