// PaimentContainer.tsx
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import PaiementView from './paiementView';
import CoursService from '@/services/coursService';
import ConfirmeAlert from './confirmeAlert';
import { UserData } from '@/types/type';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CourseData {
  vehicleType: string;
  price: number;
  distance: string;
  duration: string;
  start: string;
  destination: string;
  startLat: string;
  startLng: string;
  destLat: string;
  destLng: string;
  paymentMethod: string;
  vehiculeId: string;
}

function PaimentContainer() {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [courseResult, setCourseResult] = useState<any>(null);

  //recuperer le user conntecter.
  const [userData, setUserData] = useState<UserData | null>(null);
  
    useEffect(() => {
      const getUserData = async () => {
        try {
          const userDataString = await AsyncStorage.getItem("userData");
          
          if (userDataString) {
            const parsedData = JSON.parse(userDataString);
            setUserData(parsedData);
          }
        } catch (error) {
          console.error("Erreur récupération userData:", error);
        } finally {
          setLoading(false);
        }
      };
  
      getUserData();
    }, []);
  // Préparer les données de la course depuis les params
  const courseData: CourseData = {
    vehicleType: params.vehicleType as string,
    price: parseInt(params.price as string) || 0,
    distance: params.distance as string,
    duration: params.duration as string,
    start: params.start as string,
    destination: params.destination as string,
    startLat: params.startLat as string,
    startLng: params.startLng as string,
    destLat: params.destLat as string,
    destLng: params.destLng as string,
    vehiculeId: params.vehicleId as string,
    paymentMethod: selectedPaymentMethod
  };

  // Fonction pour créer la course dans le backend
  const handleCreateCourse = async () => {
    if (!selectedPaymentMethod) {
      alert('Veuillez choisir un mode de paiement');
      return;
    }

    setLoading(true);
    try {

      console.log('Envoi de la course au backend:', courseData);

      const courseToSend = {
        client: userData?.client_id, // À remplacer par l'ID du client connecté
        adresse_depart: courseData.start,
        adresse_destination: courseData.destination,
        tarif_estime: courseData.price,
        methode_paiement: selectedPaymentMethod,
        statut: 'demandee',
        type_vehicule_demande: courseData.vehicleType, // 
        // notes: `Véhicule: ${courseData.vehicleType}, Distance: ${courseData.distance}`,
        // Coordonnées GPS
        latitude_depart: parseFloat(courseData.startLat),
        longitude_depart: parseFloat(courseData.startLng),
        latitude_destination: parseFloat(courseData.destLat),
        longitude_destination: parseFloat(courseData.destLng),
      };

      console.log('Données envoyées au backend:', courseToSend);

      const result = await CoursService.addCourse(courseToSend);
      
      console.log("✅ Course créée - Statut:", result.status);
      console.log("📦 Données reçues:", result.data);

      if (result.status === 201 || result.status === 200) {
        // Afficher la modal de confirmation
        setCourseResult(result);
        setShowConfirmation(true);
      } else {
        alert(`Erreur: ${result.message}`);
      }

    } catch (error: any) {
      console.error(' Erreur création course:', error);
      alert('Erreur lors de la création de la course: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour fermer la confirmation et rediriger
  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    // Rediriger vers l'écran d'accueil ou de suivi de course
    router.push('/');
  };

  return (
    <>
      <PaiementView
        courseData={courseData}
        selectedPaymentMethod={selectedPaymentMethod}
        onPaymentMethodSelect={setSelectedPaymentMethod}
        onPayment={handleCreateCourse}
        loading={loading}
      />
      
      <ConfirmeAlert 
        visible={showConfirmation}
        onClose={handleCloseConfirmation}
        message="Votre course a été réservée avec succès ! Un chauffeur sera assigné dans quelques instants."
      />
    </>
  );
}

export default PaimentContainer;