import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL ='http://192.168.1.167:8000/api/';

export default class UtilisateurService {

  // Login de l'utilisateur

  // Login de l'utilisateur - VERSION CORRIGÉE
  static async login(utilisateur: { username: string; password: string }) {
    try {
      console.log('🔐 Tentative de connexion avec:', { 
        username: utilisateur.username,
        url: `${BASE_URL}login/`
      });
      
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

      console.log('📡 Statut HTTP:', response.status);
      
      // ✅ CORRECTION : Vérifier d'abord si la réponse est OK
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

      // ✅ Maintenant on peut parser la réponse JSON
      const data = await response.json();
      console.log("✅ Réponse complète:", data);

      // Vérifier le status retourné par le backend
      if (data.status === 'success') {
        // Sauvegarder le token
        if (data.token) {
          await AsyncStorage.setItem("auth_token", data.token);
          console.log('✅ Token sauvegardé:', data.token.substring(0, 20) + '...');
        }
        
        // Sauvegarder les données utilisateur
        if (data.user) {
          await AsyncStorage.setItem("userData", JSON.stringify(data.user));
          console.log('✅ Données utilisateur sauvegardées:', data.user.username);
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
      console.error("❌ Erreur UtilisateurService login:", error.message || error);
      throw error;
    }
  }

  // ... le reste de votre service reste inchangé


  // Vérifier si l'utilisateur est connecté
  static async checkAuthStatus(): Promise<{
    isAuthenticated: boolean;
    user: any | null;
    token: string | null;
  }> {
    try {
      const [token, userDataString] = await Promise.all([
        AsyncStorage.getItem("auth_token"),
        AsyncStorage.getItem("userData")
      ]);
      
      const user = userDataString ? JSON.parse(userDataString) : null;
      
      
      return {
        isAuthenticated: !!(token && user),
        user: user,
        token: token
      };
    } catch (error) {
      console.error(' Erreur vérification statut auth:', error);
      return {
        isAuthenticated: false,
        user: null,
        token: null
      };
    }
  }

  // Déconnexion
  static async logout(): Promise<{status: string, message: string}> {
    try {
      await AsyncStorage.multiRemove([
        "auth_token", 
        "userData", 
        "refresh_token"
      ]);
      
      console.log('✅ Déconnexion réussie');
      return {
        status: 'success',
        message: 'Déconnexion réussie'
      };
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
      return {
        status: 'error',
        message: 'Erreur lors de la déconnexion'
      };
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