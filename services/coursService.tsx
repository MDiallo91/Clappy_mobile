import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL =  process.env.EXPO_PUBLIC_API_URL;
export default class CoursService {

static async addCourse(course: any): Promise<{ data: any; status: number; message: string }> {
  try {
    const token = await AsyncStorage.getItem("auth_token");
    if (!token) {
      return { data: null, status: 401, message: "Token d'authentification manquant" };
    }

    // console.log("Envoi de la course:", course);

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

    // console.log("Réponse du backend:", responseData);

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
    // console.error("Erreur réseau:", error);
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
    // console.log('courses récupérés:', courses.results);
    return courses.results;

  } catch (error) {
    // console.error('Erreur de connexion:', error);
    throw error;
  }
}

/*

  Recuperer les courses demandé et accepter lu chauffeur
  Methode: On envoi une requette avec l'Id du chauffeur pour recuperer les info
*/

static async getCourseByChauffeur(id:number): Promise<any[]> {
  try {
    // Récupérer le token stocké
    const token = await AsyncStorage.getItem("auth_token");
    
    const response = await fetch( `${BASE_URL}courses/?chauffeur_id=${id}&statut=acceptee`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, 
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP! statut: ${response.status}`);
    }

    const courses = await response.json();
    // console.log('courses récupérés:', courses.results);
    return courses.results;

  } catch (error) {
    // console.error('Erreur de connexion:', error);
    throw error;
  }
}


  //Update des courses
  // static async updateCourseStatus(
  //   id: any,
  //   status: string,
  //   chauffeurId?: any
  // ): Promise<{ data: any; status: number; message: string }> {
  //   try {
  //     const token = await AsyncStorage.getItem("auth_token");
  //     if (!token) {
  //       return {
  //         data: null,
  //         status: 401,
  //         message: "Token d'authentification manquant"
  //       };
  //     }

  //     console.log(` Mise à jour statut course ${id} avec:`, { status, chauffeurId });

  //     let url = `${BASE_URL}courses/${id}/`;
  //     let method = 'PATCH';
  //     let bodyData: any = {};

  //     // Si c'est une acceptation par le chauffeur
  //     if (status === 'acceptee' && chauffeurId) {
  //       url += 'accepter/'; // Appel de l'action personnalisée
  //       method = 'POST';
  //       bodyData = { chauffeur_id: chauffeurId };
  //     }

  //     // Si c'est un démarrage
  //     if (status === 'en_cours') {
  //       url += 'demarrer/';
  //       method = 'POST';
  //       bodyData = {};
  //     }

  //     // Si c'est une terminaison
  //     if (status === 'terminee') {
  //       url += 'terminer/';
  //       method = 'POST';
  //       bodyData = { tarif_final: bodyData.tarif_final || null };
  //     }

  //     const response = await fetch(url, {
  //       method,
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${token}`,
  //       },
  //       body: JSON.stringify(bodyData),
  //     });

  //     const httpStatus = response.status;
  //     const contentType = response.headers.get('content-type');
  //     let responseData = null;

  //     if (contentType && contentType.includes('application/json')) {
  //       responseData = await response.json();
  //     }

  //     console.log("📨 Réponse mise à jour statut:", responseData);

  //     if (response.ok) {
  //       return {
  //         data: responseData,
  //         status: httpStatus,
  //         message: "Statut de la course mis à jour avec succès"
  //       };
  //     } else {
  //       return {
  //         data: responseData,
  //         status: httpStatus,
  //         message: responseData?.erreur || responseData?.detail || `Erreur HTTP: ${httpStatus}`,
  //       };
  //     }

  //   } catch (error) {
  //     console.error("❌ Erreur mise à jour statut:", error);
  //     return {
  //       data: null,
  //       status: 500,
  //       message: "Erreur réseau lors de la mise à jour du statut"
  //     };
  //   }
  // }
  static async updateCourseStatus(id:any, status:string, chauffeurId?:any) {
  try {
    // console.log(`Mise à jour statut course ${id} → ${status}`);

    let url = `${BASE_URL}courses/${id}/`;
    let method = 'PATCH';
    let bodyData = {};
    if (status === 'acceptee' && chauffeurId) {
      url += 'accepter/';
      method = 'POST';
      bodyData = { chauffeur_id: chauffeurId };
    }

    if (status === 'en_cours') {
      url += 'demarrer/';
      method = 'POST';
    }

    if (status === 'terminee') {
      url += 'terminer/';
      method = 'POST';
      
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyData),
    });

    const data = await response.json();
    // console.log("📨 Réponse API:", data);
    return data;
  } catch (error) {
    // console.error("❌ Erreur updateCourseStatus:", error);
  }
}


}