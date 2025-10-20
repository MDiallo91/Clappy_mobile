import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = 'http://192.168.1.167:8000/api/';


export default class VehiculeService {

    static async getTarif(): Promise<any[]> {
  try {
    // Récupérer le token stocké
    const token = await AsyncStorage.getItem("auth_token");
    
    const response = await fetch(`${BASE_URL}tarifs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Ajout du token
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP! statut: ${response.status}`);
    }

    const tarifs = await response.json();
    console.log('tarifs récupérés:', tarifs.results);
    return tarifs.results;

  } catch (error) {
    console.error('Erreur de connexion:', error);
    throw error;
  }
}


}