import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL =  'http://192.168.1.167:8000//api/';

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



  
}