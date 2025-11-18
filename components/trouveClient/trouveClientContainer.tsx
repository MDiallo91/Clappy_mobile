import React, { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import TrouveClientView from './trouveclientView';
import { Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import CoursService from '@/services/coursService';
import UtilisateurService from '@/services/userService';

interface CourseData {
  id:number
  startLat: string;
  startLng: string;
  destLat: string;
  destLng: string;
  clientNom: string;
  adresseDepart: string;
  adresseDestination: string;
}

// TrouveClientContainer.tsx
const TrouveClientContainer = () => {

  const [loading, setLoading] = useState(false);
    const [chauffeur,setChauffeur] = useState<any>()
  
  const params = useLocalSearchParams();

  const startLat = parseFloat(params.startLat as string);
  const startLng = parseFloat(params.startLng as string);
  const destLat = parseFloat(params.destLat as string);
  const destLng = parseFloat(params.destLng as string);
  
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
  
  // Vérifier si les coordonnées sont valides
  if (
    isNaN(startLat) || isNaN(startLng) ||
    isNaN(destLat) || isNaN(destLng)
  ) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text> Coordonnées invalides. Impossible d'afficher la carte.</Text>
      </View>
    );
  }

  //confirmation de la reservation par le chauffeur
   const confirmerReservation = async (reservation: CourseData) => {
      try {
        setLoading(true);
        // console.log("Confirmation de la réservation:", reservation);
        const statut="acceptee"
        // Ici, vous appellerez votre API pour confirmer
        await CoursService.updateCourseStatus(reservation.id, statut,chauffeur?.chauffeur_id)
  
        // Simulation délai réseau
        await new Promise((resolve) => setTimeout(resolve, 1500));
  
        Toast.show({
          type: "success",
          text1: "Réservation confirmée 🎉",
          text2: `Départ : ${reservation.adresseDepart} ➜ ${reservation.adresseDestination}`,
        });
          //  setReservations((prev) =>
          // prev.filter((item) => item.id !== reservation.id)
        // );
        // Redirection après confirmation
        router.push("/");
      } catch (error) {
        // console.error("Erreur confirmation:", error);
        Toast.show({
          type: "error",
          text1: "Erreur",
          text2: "Impossible de confirmer la réservation.",
        });
      } finally {
        setLoading(false);
      }
    };
  


  const courseData = {
    id:params.id as any,
    startLat: params.startLat as string,
    startLng: params.startLng as string,
    destLat: params.destLat as string,
    destLng: params.destLng as string,
    clientNom: params.clientNom as string,
    adresseDepart: params.adresseDepart as string,
    adresseDestination: params.adresseDestination as string,
  };

  return <TrouveClientView 
    courseData={courseData} 
    loading={false}
      onConfirmer={confirmerReservation}
   />;
};


export default TrouveClientContainer;