import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import HandleLogout from "@/components/connexion/deconnexion";
import LogoutModal from "@/components/connexion/deconnexion";
import DeleteAcountModal from "@/components/connexion/DeleteAcount";
import { useRouter } from "expo-router";


export default function SettingScreen() {
  const [notifications, setNotifications] = React.useState(true);
  const [location, setLocation] = React.useState(true);
  const router = useRouter();
  
  const handleEditProfile = () => {
    router.push("/updateProfil");
  };
  //la deconnexion
  const [modalVisible, setModalVisible] = useState(false);
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Paramètres</Text>

      {/*  Profil */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mon profil</Text>

        <TouchableOpacity style={styles.item}  onPress={handleEditProfile}>
          <Ionicons name="person-outline" size={22} color="#EE6841" />
          <Text style={styles.itemText}>Modifier mes informations</Text>
        </TouchableOpacity>

      </View>

    

      {/*  Support */}
      <View style={styles.section}>
        {/* <Text style={styles.sectionTitle}>Aide & support</Text> */}


        {/* supression du compte */}
        <DeleteAcountModal
        visible={modalDeleteVisible}
        onClose={() => setModalDeleteVisible(false)}
         />
         
         <TouchableOpacity style={styles.item}  onPress={() => setModalDeleteVisible(true)}>
          <Ionicons name="log-in-sharp" size={22} color="#EE6841" />
          <Text style={styles.itemText}>Suprimer mon compte</Text>
        </TouchableOpacity>
      </View>
        

      {/* Modal de deconnexion */}
     <LogoutModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
      <View style={styles.btnContainer}>
              {/*  Déconnexion */}
      <TouchableOpacity style={styles.logoutButton}  onPress={() => setModalVisible(true)}>
        <Ionicons name="log-out-outline" size={22} color="#fff" />
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    paddingBottom: 30, 
    
  },
  title: {
    fontSize: 22,
    fontWeight: "bold", 
    textAlign: "center",
    color: "#EE6841",
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
    marginBottom: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  itemText: {
    marginLeft: 12,
    fontSize: 15,
    color: "#333",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  switchLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EE6841",
    paddingVertical: 14,
    borderRadius: 10,
    margin:5
  },
  btnContainer:{
      marginBottom:50
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
  },
});
