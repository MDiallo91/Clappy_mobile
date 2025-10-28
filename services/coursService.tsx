import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL =  process.env.EXPO_PUBLIC_API_URL;
export default class CoursService {

static async addCourse(course: any): Promise<{ data: any; status: number; message: string }> {
  try {
    const token = await AsyncStorage.getItem("auth_token");
    if (!token) {
      return { data: null, status: 401, message: "Token d'authentification manquant" };
    }

    console.log("Envoi de la course:", course);

    const response = await fetch(`${BASE_URL}courses/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(course),
    });

    const httpStatus = response.status;
    const contentType = response.headers.get('content-type');
    let responseData = null;

    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    }

    console.log("Réponse du backend:", responseData);

    if (response.ok) {
      return { data: responseData, status: httpStatus, message: "Cours ajouté avec succès" };
    } else {
      return {
        data: responseData,
        status: httpStatus,
        message: responseData?.message || `Erreur HTTP: ${httpStatus}`,
      };
    }

  } catch (error: any) {
    console.error("Erreur réseau:", error);
    return {
      data: null,
      status: 500,
      message: error.message || "Erreur inattendue",
    };
  }
}

//Recuperation de course en attentes pour les envoyer aux chauffeurs
static async getCourses(): Promise<any[]> {
  try {
    // Récupérer le token stocké
          const token = await AsyncStorage.getItem("auth_token");
    
    const response = await fetch(`${BASE_URL}courses/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Ajout du token
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP! statut: ${response.status}`);
    }

    const courses = await response.json();
    console.log('courses récupérés:', courses.results);
    return courses.results;

  } catch (error) {
    console.error('Erreur de connexion:', error);
    throw error;
  }
}


  
}