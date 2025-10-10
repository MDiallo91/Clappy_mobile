import { Utilisateur } from "@/types/type";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://numambhgn.alwaysdata.net/api/";

export default class UtilisateurService {

   // Headers avec token récupéré 
   private static async getHeaders() {
    const token = await AsyncStorage.getItem("auth_token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    }
    static async getCollecteurs(): Promise<Utilisateur[]> {
      const headers = await this.getHeaders();
      return fetch(`${BASE_URL}collecteur/liste`, {
        method: 'GET',
        headers: headers,
      })
        .then(async (response) => {
          const json = await response.json();
          if (!response.ok) throw new Error(json.message || "Erreur lors du chargement");
          return json.data;
        })
        .catch(this.handleError);
    }

    static async getEntreprises(): Promise<Utilisateur[]> {
      const headers = await this.getHeaders();
      return fetch(`${BASE_URL}entreprise/liste`, {
        method: 'GET',
        headers: headers,
      })
        .then(async (response) => {
          const json = await response.json();
          if (!response.ok) throw new Error(json.message || "Erreur lors du chargement");
          return json.data;
        })
        .catch(this.handleError);
    }
  
    static async getPoinLoc(): Promise<Utilisateur> { //recuperer les points et les coordonnee
      const headers = await this.getHeaders();
      return fetch(`${BASE_URL}user/pointsloc`, {
        method: 'GET',
        headers: headers,
      })
        .then(async (response) => {
          const json = await response.json();
          if (!response.ok) throw new Error(json.message || "Erreur lors du chargement");
          return json.data;
        })
        .catch(this.handleError);
    }
    

  static getUtilisateurs(): Promise<Utilisateur[]> {
    const headers=this.getHeaders
    return fetch(`${BASE_URL}user/liste`) 
      .then((response) => response.json())
      .catch(this.handleError);
  }

  static getUtilisateur(id: number): Promise<Utilisateur | null> {
    return fetch(`${BASE_URL}user/${id}`)
      .then((response) => response.json())
      .then((data) => (this.isEmpty(data) ? null : data))
      .catch(this.handleError);
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
    .catch((error) => {
      this.handleError(error);
      throw error;
    });
  }

  //deconnection de l'utilisateur
  static async logoutUser(): Promise<{ status: number; message: string }> {
    const token = await AsyncStorage.getItem('auth_token');
  
    return fetch(`${BASE_URL}logout`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, 
      },
    })
      .then(async (response) => {
        const data = await response.json(); 
        return {
          message: data.message,
          status: data.status,
        };
      })
      .catch((error) => {
        this.handleError?.(error); 
        throw error;
      });
  }

  //recuperer le profil du useer
  static async getProfil(): Promise<{ status: number; message: string,data:Utilisateur }> {
    const token = await AsyncStorage.getItem('auth_token');
  
    return fetch(`${BASE_URL}user/profil`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, 
      },
    })
      .then(async (response) => {
        const data = await response.json(); 
        console.log("les data", data)
        return {
          message: data.message,
          status: data.status,
          data:  data.data
        };
      })
      .catch((error) => {
        this.handleError?.(error); 
        throw error;
      });
  }

  static updateUtilisateur(utilisateur: any): Promise<any> {
    return fetch(`${BASE_URL}user/${utilisateur.id}`, {
      method: "PUT",
      body: JSON.stringify(utilisateur),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .catch(this.handleError);
  }

  static deleteUtilisateur(utilisateur: Utilisateur): Promise<{}> {
    return fetch(`${BASE_URL}user/${utilisateur.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .catch(this.handleError);
  }
//gestion du login de l'utilisateur
  static login(utilisateur: Utilisateur): Promise<{ token: string; message: string; status: number }> {
    return fetch(`${BASE_URL}signin`, {
      method: "POST",
      body: JSON.stringify(utilisateur),
      headers: { "Content-Type": "application/json" },
    })
      .then(async (response) => {
        const data = await response.json();
        console.log("Réponse login:", data);
        return {
          token: data.token,
          message: data.message,
          status: data.status,
        };
      })
      .catch((error) => {
        this.handleError(error);
        throw error;
      });
  }
 // Mise à jour de la géolocalisation de l'utilisateur
 static async updateGeoloc(latitude: number, longitude: number): Promise<{ status: number; message: string }> {
  try {
    const token = await AsyncStorage.getItem('auth_token');

    const response = await fetch(`${BASE_URL}user/geoloc`, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || ''}`,
      },
      body: JSON.stringify({ latitude, longitude }),
    });

    const data = await response.json();

    console.log("Réponse géolocalisation:", data);

    return {
      message: data.message,
      status: response.status,
    };

  } catch (error) {
    console.error("Erreur updateGeoloc:", error);
    throw error;
  }
}



  static isEmpty(data: Object): boolean {
    return Object.keys(data).length === 0;
  }

  static handleError(error: any): void {
    console.error("Erreur UtilisateurService:", error);
  }
}
