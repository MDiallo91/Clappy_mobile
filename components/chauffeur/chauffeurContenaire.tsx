import React, { useEffect, useState } from "react";
import ReservationView from "./chauffeurView";
import Toast from "react-native-toast-message";
import { router } from "expo-router";
import CoursService from "@/services/coursService";
import { ActivityIndicator, View, Text, StyleSheet } from "react-native";
import UtilisateurService from "@/services/userService";


  const primary = "#EE6841";



// Interface basée sur votre API
interface ApiReservation {
  id: number;
  adresse_depart: string;
  adresse_destination: string;
  client_nom: string;
  type_course: string;
  methode_paiement: string;
  statut: string;
  tarif_estime: string;
  date_demande: string;
  chauffeur: any;
  client: number;
  date_acceptation: string | null;
  date_debut: string | null;
  date_fin: string | null;
  date_reservation: string | null;
  distance_estimee: string | null;
  duree_estimee: string | null;
  duree_totale: string | null;
  latitude_depart: string;
  latitude_destination: string;
  longitude_depart: string;
  longitude_destination: string;
  client_nom_complet: string;
  tarif_final: string | null;
  url: string;
  type_vehicule_demande:string
}

export default function ReservationContenaire() {
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true); // Nouvel état pour le chargement des données
  const [reservations, setReservations] = useState<ApiReservation[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<ApiReservation | null>(null);
  const [chauffeur,setChauffeur] = useState<any>()

  //Recuperer le chauffeur connecter
 useEffect(() => {
    const fetchChauffeur = async () => {
      try {
        const userData = await UtilisateurService.getUser(); // récupère l'utilisateur
        setChauffeur(userData);
        // console.log("le user connecter",userData)
      } catch (err: any) {
        console.error('Erreur récupération chauffeur:', err);
      } 
    };
    fetchChauffeur();
  }, []);

  // Récupération des courses en attente
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setDataLoading(true);
        const coursesData = await CoursService.getCourses();
        console.log("Données reçues de l'API:", coursesData);
        
        // Filtrer seulement les réservations avec statut "demandee"
        const reservationsEnAttente = coursesData.filter((item: ApiReservation) => 
          item.statut === "demandee"
        );
        
        setReservations(reservationsEnAttente);
        
        // NE PAS sélectionner automatiquement la première réservation
        // setSelectedReservation(null); // Laisser null au début
        
      } catch (error) {
        console.error("Erreur lors de la récupération des courses:", error);
        Toast.show({
          type: "error",
          text1: "Erreur",
          text2: "Impossible de charger les réservations",
        });
      } finally {
        setDataLoading(false);
      }
    };
    
    fetchCourses();
  }, []);

  const confirmerReservation = async (reservation: ApiReservation) => {
    try {
      setLoading(true);
      console.log("Confirmation de la réservation:", reservation);
      const statut="acceptee"
      // Ici, vous appellerez votre API pour confirmer
      await CoursService.updateCourseStatus(reservation.id, statut,chauffeur?.id)
      // await CoursService.confirmReservation(reservation.id);

      // Simulation délai réseau
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Toast.show({
        type: "success",
        text1: "Réservation confirmée 🎉",
        text2: `Départ : ${reservation.adresse_depart} ➜ ${reservation.adresse_destination}`,
      });
         setReservations((prev) =>
        prev.filter((item) => item.id !== reservation.id)
      );
      // Redirection après confirmation
      // router.push("/");
    } catch (error) {
      console.error("Erreur confirmation:", error);
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Impossible de confirmer la réservation.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Afficher le loader pendant le chargement des données
  if (dataLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={primary} />
        <Text style={styles.loaderText}>Chargement des réservations...</Text>
      </View>
    );
  }

  return (
    <ReservationView
      reservations={reservations}
      selectedReservation={selectedReservation}
      loading={loading}
      onConfirmer={confirmerReservation}
      onSelectReservation={setSelectedReservation}
    />
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: "black"
  },
});