import React, { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import TrouveClientView from './trouveclientView';

interface CourseData {
  startLat: string;
  startLng: string;
  destLat: string;
  destLng: string;
  clientNom: string;
  adresseDepart: string;
  adresseDestination: string;
}

function TrouveClientContainer() {
  const params = useLocalSearchParams();
  
  const [loading, setLoading] = useState(false);

  // Préparer les données de la course depuis les params
  const courseData: CourseData = {
    startLat: params.startLat as string,
    startLng: params.startLng as string,
    destLat: params.destLat as string,
    destLng: params.destLng as string,
    clientNom: params.clientNom as string,
    adresseDepart: params.adresseDepart as string,
    adresseDestination: params.adresseDestination as string,
  };

  return (
    <TrouveClientView
      courseData={courseData}
      loading={loading}
    />
  );
}

export default TrouveClientContainer;