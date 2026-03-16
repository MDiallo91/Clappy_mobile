import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import UtilisateurService from "@/services/userService";
import { useRouter } from "expo-router";
import DeleteAcountModal from "@/components/connexion/DeleteAcount";


  const primary="#EE6841"

export default function ProfilScreen() {

  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [chauffeur,setChauffeur] = useState<any>()

  const router = useRouter();

  useEffect(() => {
    const fetchChauffeur = async () => {
      try {
        const userData = await UtilisateurService.getUser();
        setChauffeur(userData);
      } catch (err: any) {}
    };
    fetchChauffeur();
  }, []);

  const handleEditProfile = () => {
    router.push("/updateProfil");
  };

  return (
    <View style={styles.container}>
      {/* Titre + icône crayon */}
      <View style={styles.header}>
        <Text style={styles.title}>Mon Profil</Text>
        <TouchableOpacity onPress={handleEditProfile}>
          <Ionicons
            style={styles.modifButton}
            name="pencil"
            size={32}
            color="white"
          />
          <Text>Modifier</Text>
        </TouchableOpacity>
      </View>

      {/* Informations */}
      <View style={styles.card}>
        <View style={styles.infoItem}>
          <Text style={styles.label}>{chauffeur?.first_name}</Text>
          <Text style={styles.label}>{chauffeur?.last_name}</Text>
        </View>

        <View style={styles.divider} />

        {chauffeur?.telephone ? (
          <View style={styles.infoItem}>
            <Text style={styles.label}>Téléphone</Text>
            <Text style={styles.label}>{chauffeur?.telephone}</Text>
          </View>
        ) : (
          <View style={styles.infoItem}>
            <Text style={styles.label}>Téléphone</Text>
            <Text style={styles.label}>{chauffeur?.username}</Text>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.infoItem}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{chauffeur?.email}</Text>
        </View>
      </View>

      {/* suppression du compte utilisatuer */}
      <DeleteAcountModal
              visible={modalDeleteVisible}
              onClose={() => setModalDeleteVisible(false)}
               />
               
               <TouchableOpacity style={styles.item}  onPress={() => setModalDeleteVisible(true)}>
                <Ionicons name="log-in-sharp" size={22} color="#EE6841" />
                <Text style={styles.itemText}>Suprimer mon compte</Text>
              </TouchableOpacity>
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
  modifButton: {
    bottom: 0,
    backgroundColor: primary,
    padding: 6,
    borderRadius: 50,
    borderWidth: 2,
    elevation: 4,
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
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
    marginTop:40,
    
  },
  itemText: {
    marginLeft: 12,
    fontSize: 15,
    color: "#333",
  },
});
