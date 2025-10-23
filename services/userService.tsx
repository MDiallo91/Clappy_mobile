import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL ='http://192.168.1.167:8000/api/';

export default class UtilisateurService {

  // Login de l'utilisateur
static async login(utilisateur: { username: string; password: string }) {
  
  try {
    const response = await fetch(`${BASE_URL}login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: utilisateur.username,  
        password: utilisateur.password,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Erreur lors du login");
    }

    const data = await response.json();

    console.log("Réponse login:", data);

    if (data) {
      await AsyncStorage.setItem("auth_token", data.access);
       await AsyncStorage.setItem("userData", JSON.stringify(data));
    }

    return data;
  } catch (error: any) {
    console.error("Erreur UtilisateurService login:", error.message || error);
    throw error;
  }
}
  //connection de l'utilisateur
  static async addUtilisateur(utilisateur: any): Promise<{ status: number; message: string }> {
    return fetch(`${BASE_URL}signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",

      },
      body: JSON.stringify(utilisateur),
    })
    .then(async (response) => {
      const data = await response.json();
      console.log("Réponse login:", data);
      return {
        message: data.message,
        status: data.status,
      };
    })
    .catch((error:any) => {
     console.error(error)
      throw error;
    });
    
  } 
  
// Récupérer les utilisateurs
  // Récupérer les utilisateurs
static async getUsers(): Promise<any[]> {
  try {
    // Récupérer le token stocké
    const token = await AsyncStorage.getItem("auth_token");
    
    const response = await fetch(`${BASE_URL}clients`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Ajout du token
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP! statut: ${response.status}`);
    }

    const users = await response.json();
    // console.log('Utilisateurs récupérés:', users);
    return users;

  } catch (error) {
    console.error('Erreur de connexion:', error);
    throw error;
  }
}

  
  static updateUtilisateur(utilisateur: any): Promise<any> {
    return fetch(`${BASE_URL}user/${utilisateur.id}`, {
      method: "PUT",
      body: JSON.stringify(utilisateur),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      console.log("error")
  }
}