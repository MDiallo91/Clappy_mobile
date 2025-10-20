// PaimentContainer.tsx
import React, { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import PaiementView from './paiementView';
import CoursService from '@/services/coursService';

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
}

function PaimentContainer() {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [loading, setLoading] = useState(false);

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
      console.log('📤 Envoi de la course au backend:', courseData);

      const courseToSend = {
        client: 1, // À remplacer par l'ID du client connecté
        adresse_depart: courseData.start,
        adresse_arrivee: courseData.destination,
        tarif_estime: courseData.price,
        methode_paiement: selectedPaymentMethod,
        statut: 'demandee',
        notes: `Véhicule: ${courseData.vehicleType}, Distance: ${courseData.distance}`,
        // Coordonnées GPS si votre backend les accepte
        latitude_depart: parseFloat(courseData.startLat),
        longitude_depart: parseFloat(courseData.startLng),
        latitude_arrivee: parseFloat(courseData.destLat),
        longitude_arrivee: parseFloat(courseData.destLng),
      };

      const result = await CoursService.addCourse(courseToSend);
      
      console.log("✅ Course créée - Statut:", result.status);
      console.log("📦 Données reçues:", result.data);

      if (result.status === 201 || result.status === 200) {
        // Rediriger vers l'écran de confirmation
        // router.push({
        //   pathname: "/confirmation",
        //   params: {
        //     courseId: result.data.id,
        //     vehicleType: courseData.vehicleType,
        //     price: courseData.price.toString(),
        //     distance: courseData.distance,
        //     paymentMethod: selectedPaymentMethod
        //   }
        // });
      } else {
        alert(`Erreur: ${result.message}`);
      }

    } catch (error: any) {
      console.error('❌ Erreur création course:', error);
      alert('Erreur lors de la création de la course: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Passer toutes les données et fonctions à la View
  return (
    <PaiementView
      courseData={courseData}
      selectedPaymentMethod={selectedPaymentMethod}
      onPaymentMethodSelect={setSelectedPaymentMethod}
      onPayment={handleCreateCourse}
      loading={loading}
    />
  );
}

export default PaimentContainer;