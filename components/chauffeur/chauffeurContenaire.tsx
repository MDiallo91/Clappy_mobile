import React, { useEffect, useState } from "react";
import ReservationView from "./chauffeurView";
import Toast from "react-native-toast-message";
import CoursService from "@/services/coursService";
import UtilisateurService from "@/services/userService";
import { ActivityIndicator, View, Text, StyleSheet } from "react-native";

const primary = "#EE6841";

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
  type_vehicule_demande: string;
}

export default function ReservationContenaire() {
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [reservations, setReservations] = useState<ApiReservation[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<ApiReservation | null>(null);
  const [chauffeur, setChauffeur] = useState<any>();

  useEffect(() => {
    const fetchChauffeur = async () => {
      try {
        const userData = await UtilisateurService.getUser();
        setChauffeur(userData);
      } catch (err) {}
    };
    fetchChauffeur();
  }, []);

  // const fetchReservations = async () => {
  //   try {
  //     const coursesData = await CoursService.getCourses();
  //     // console.log("les courses:", courseData)
  //     const reservationsEnAttente = coursesData.filter(
  //       (item: ApiReservation) => item.statut === "demandee"
  //     );

  //     setReservations(reservationsEnAttente);
  //   } catch (error) {
  //     Toast.show({
  //       type: "error",
  //       text1: "Erreur",
  //       text2: "Impossible de charger les réservations",
  //     });
  //   }
  // };
const fetchReservations = async () => {
  try {
    const coursesData = await CoursService.getCourses();
    // console.log("les courses", coursesData);
    
    // Obtenir la date d'aujourd'hui (sans l'heure)
    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);
    
    const reservationsEnAttente = coursesData.filter(
      (item: ApiReservation) => {
        // Vérifier le statut
        if (item.statut !== "demandee") return false;
        
        // Vérifier si la date de réservation est aujourd'hui
        if (item.date_reservation) {
          const dateReservation = new Date(item.date_reservation);
          dateReservation.setHours(0, 0, 0, 0); // Normaliser l'heure
          return dateReservation.getTime() === aujourdhui.getTime();
        }
        
        return false;
      }
    );

    setReservations(reservationsEnAttente);
  } catch (error) {
    Toast.show({
      type: "error",
      text1: "Erreur",
      text2: "Impossible de charger les réservations",
    });
  }
};

  // Chargement initial
  useEffect(() => {
    const loadData = async () => {
      setDataLoading(true);
      await fetchReservations();
      setDataLoading(false);
    };

    loadData();
  }, []);

  //  fonction utilisée pour le Pull-to-Refresh
  const refreshReservations = async () => {
    await fetchReservations();
  };

  const confirmerReservation = async (reservation: ApiReservation) => {
    try {
      setLoading(true);
      const statut = "acceptee";

      await CoursService.updateCourseStatus(
        reservation.id,
        statut,
        chauffeur?.id
      );

      Toast.show({
        type: "success",
        text1: "Réservation confirmée 🎉",
        text2: `${reservation.adresse_depart} ➜ ${reservation.adresse_destination}`,
      });

      setReservations((prev) => prev.filter((item) => item.id !== reservation.id));
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Impossible de confirmer la réservation.",
      });
    } finally {
      setLoading(false);
    }
  };

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
      onRefresh={refreshReservations}   // 👈 AJOUT ESSENTIEL
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
    color: "black",
  },
});
