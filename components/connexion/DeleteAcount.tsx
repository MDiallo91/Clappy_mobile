import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import UtilisateurService from "@/services/userService";

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function DeleteAccountModal({
  visible,
  onClose,
}: DeleteAccountModalProps) {

  const handleDeleteAccount = async () => {
    try {
      const userDataString = await AsyncStorage.getItem("userData");

      if (!userDataString) {
        Alert.alert("Erreur", "Aucune donnée utilisateur trouvée.");
        return;
      }

      const userData = JSON.parse(userDataString);

      const response = await UtilisateurService.deleteUtilisateur(userData.client_id);

      if (response?.status === 200 || response?.status === 204) {
        // Supprimer données locales
        await AsyncStorage.removeItem("userData");
        await AsyncStorage.removeItem("auth_token");

        // Fermer modal
        onClose();

        // Redirection vers connexion
        router.replace("/(auth)/connexion");
      } else {
        Alert.alert("Erreur", "Impossible de supprimer le compte.");
      }

    } catch (error) {
      console.error("Erreur suppression compte :", error);
      Alert.alert("Erreur", "Une erreur est survenue.");
    }
  };

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Confirmation</Text>
          <Text style={styles.message}>
            Voulez-vous supprimer votre compte ?
          </Text>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
              <Text style={styles.deleteText}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
  },
  btnRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  cancelBtn: {
    padding: 10,
    marginRight: 10,
  },
  cancelText: {
    fontSize: 16,
    color: "#555",
  },
  deleteBtn: {
    padding: 10,
  },
  deleteText: {
    fontSize: 16,
    color: "#EE6841",
    fontWeight: "bold",
  },
});