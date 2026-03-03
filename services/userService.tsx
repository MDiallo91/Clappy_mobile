import AsyncStorage from "@react-native-async-storage/async-storage";
import { ColorSpace } from "react-native-reanimated";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export default class UtilisateurService {


  // Login de l'utilisateur 
  static async login(utilisateur: { username: string; password: string }) {
    try {

      const response = await fetch(`${BASE_URL}login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          username: utilisateur.username,
          password: utilisateur.password,
        }),
      });

      // console.log(' Statut HTTP:', response.status);

      // CORRECTION : Vérifier d'abord si la réponse est OK
      if (!response.ok) {
        // Si le statut n'est pas 200-299, c'est une erreur
        let errorMessage = `Erreur ${response.status}`;

        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (e) {
          // Si la réponse n'est pas JSON, utiliser le statut
          errorMessage = `Erreur serveur: ${response.status}`;
        }

        throw new Error(errorMessage);
      }

      // Maintenant on peut parser la réponse JSON
      const data = await response.json();
      // console.log(" Réponse complète:", data);

      // Vérifier le status retourné par le backend
      if (data.status === 'success') {
        // Sauvegarder le token
        if (data.token) {
          await AsyncStorage.setItem("auth_token", data.token);
          // console.log(' Token sauvegardé:', data.token.substring(0, 20) + '...');
        }

        // Sauvegarder les données utilisateur
        if (data.user) {
          await AsyncStorage.setItem("userData", JSON.stringify(data.user));
          // console.log(' Données utilisateur sauvegardées:', data.user.username);
        }

        // Sauvegarder le token de rafraîchissement si disponible
        if (data.refresh_token) {
          await AsyncStorage.setItem("refresh_token", data.refresh_token);
        }

        return {
          status: 'success',
          message: data.message,
          token: data.token,
          user: data.user,
          refresh_token: data.refresh_token
        };

      } else {
        // Le backend a retourné un status 'error'
        throw new Error(data.message || 'Erreur de connexion');
      }

    } catch (error: any) {
      // console.error(" Erreur UtilisateurService login:", error.message || error);
      throw error;
    }
  }



  // Vérifier si l'utilisateur est connecté
  static async checkAuthStatus(): Promise<{
    isAuthenticated: boolean;
    user: any | null;
    token: string | null;
  }> {
    try {
      const [token, userDataString] = await Promise.all([
        AsyncStorage.getItem("auth_token"),
        AsyncStorage.getItem("userData"),
      ]);

      const user = userDataString ? JSON.parse(userDataString) : null;


      return {
        isAuthenticated: !!(token && user),
        user: user,
        token: token
      };
    } catch (error) {
      // console.error(' Erreur vérification statut auth:', error);
      return {
        isAuthenticated: false,
        user: null,
        token: null
      };
    }
  }

  // Déconnexion
  static async logout(): Promise<{ status: string, message: string }> {
    try {
      await AsyncStorage.multiRemove([
        "auth_token",
        "userData",
        "refresh_token"
      ]);

      // console.log('✅ Déconnexion réussie');
      return {
        status: 'success',
        message: 'Déconnexion réussie'
      };
    } catch (error) {
      // console.error('❌ Erreur déconnexion:', error);
      return {
        status: 'error',
        message: 'Erreur lors de la déconnexion'
      };
    }
  }
  // services/clientService.ts
  static async addUtilisateur(clientData: {
    email: string;
    nom: string;
    prenom: string;
    telephone: string;
    password?: string;
  }): Promise<{ data: any; status: number; message: string }> {
    try {
      // console.log(" Envoi des données d'inscription:", clientData);

      const response = await fetch(`${BASE_URL}clients/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      });

      const httpStatus = response.status;
      let responseData = null;

      // Vérifier le content-type avant de parser JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      }

      // console.log("📨 Statut HTTP:", httpStatus);
      // console.log("📨 Réponse brute:", responseData);

      if (response.ok) {
        return {
          data: responseData,
          status: httpStatus,
          message: "Inscription réussie"
        };
      } else {
        return {
          data: responseData,
          status: httpStatus,
          message: responseData?.utilisateur?.[0] ||
            responseData?.email?.[0] ||
            responseData?.telephone?.[0] ||
            "Erreur lors de l'inscription"
        };
      }

    } catch (error) {
      // console.error("❌ Erreur inscription:", error);
      return {
        data: null,
        status: 500,
        message: "Erreur réseau lors de l'inscription"
      };
    }
  }
  // Récupérer les utilisateurs
  // Récupérer les utilisateurs
  static async getUser(): Promise<any> {
    try {
      // Récupérer le token stocké
      const token = await AsyncStorage.getItem("auth_token");

      const response = await fetch(`${BASE_URL}me/`, {
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
      // console.error('Erreur de connexion:', error);
      throw error;
    }
  }

  //Verifier si le telephone existe deja dans la base avant de cree le compte
  // Vérifier si le téléphone existe déjà
  // Dans userService.ts
  static async checkTelephoneExists(telephone: string): Promise<{ exists: boolean }> {
    try {
      // console.log('🔍 Vérification du téléphone:', telephone);

      const response = await fetch(`${BASE_URL}check-phone/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ telephone }),
      });

      console.log('📊 Statut HTTP:', response.status);

      // Vérifier le Content-Type avant de parser
      const contentType = response.headers.get('content-type');

      if (!contentType || !contentType.includes('application/json')) {
        // Si ce n'est pas du JSON, lire le texte pour debugger
        const textResponse = await response.text();
        // console.error('❌ Réponse non-JSON:', textResponse.substring(0, 200));
        throw new Error('Le serveur a retourné une réponse non-JSON');
      }

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }

      const data = await response.json();
      // console.log("✅ Réponse vérification téléphone:", data);

      return {
        exists: data.exists || false
      };

    } catch (error: any) {
      // console.error("❌ Erreur vérification téléphone:", error.message || error);

      // En cas d'erreur, on suppose que le numéro n'existe pas
      return {
        exists: false
      };
    }
  }
  static async updateUtilisateur(utilisateur: any, id: any): Promise<any> {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      console.log("le user", utilisateur, id)
      console.log("le user de deuxieme", utilisateur, id)
      console.log("url", `${BASE_URL}clients/${id}/`)
      const response = await fetch(`${BASE_URL}clients/${id}/`, {

        method: "PUT", // ou PATCH (recommandé)
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(utilisateur),
      });

      const data = await response.json();
      // console.log("resulat du put", data)
      // console.log("resulat du put", response)
      return {
        status: response.status,
        data,
      };
    } catch (error) {
      console.error("Erreur updateUtilisateur :", error);
      throw error;
    }
  }

static async deleteUtilisateur(): Promise<any> {
  try {
    const token = await AsyncStorage.getItem("auth_token");

    const response = await fetch(`${BASE_URL}me/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 204) {
      return { status: 204 };
    }

    const text = await response.text();

    if (!text) {
      return { status: response.status };
    }

    return {
      status: response.status,
      data: JSON.parse(text),
    };

  } catch (error) {
    // console.error("Erreur deleteUtilisateur :", error);

    //  IMPORTANT : Si backend a supprimé mais connexion coupée
    return { status: 204 };
  }
}
}