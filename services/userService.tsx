import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL =process.env.EXPO_PUBLIC_API_URL;

export default class UtilisateurService {

  // Login de l'utilisateur

  // Login de l'utilisateur - VERSION CORRIGÉE
  static async login(utilisateur: { username: string; password: string }) {
    try {
      console.log(' Tentative de connexion avec:', { 
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

      console.log(' Statut HTTP:', response.status);
      
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
      console.log(" Réponse complète:", data);

      // Vérifier le status retourné par le backend
      if (data.status === 'success') {
        // Sauvegarder le token
        if (data.token) {
          await AsyncStorage.setItem("auth_token", data.token);
          console.log(' Token sauvegardé:', data.token.substring(0, 20) + '...');
        }
        
        // Sauvegarder les données utilisateur
        if (data.user) {
          await AsyncStorage.setItem("userData", JSON.stringify(data.user));
          console.log(' Données utilisateur sauvegardées:', data.user.username);
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
      console.error(" Erreur UtilisateurService login:", error.message || error);
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
static async addUtilisateur(utilisateur: any): Promise<{ status: number; message: string }> {
  console.log("verification si le user est present lores de l'enregistrement",utilisateur)
  try {
    console.log(" Envoi des données d'inscription:", utilisateur);
    
    const response = await fetch(`${BASE_URL}clients/`, { 
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(utilisateur),
    });

    console.log(" Statut HTTP:", response.status);
    
    // Lire d'abord en texte pour debugger
    const responseText = await response.text();
    console.log(" Réponse brute:", responseText.substring(0, 500));
    
    if (responseText) {
      try {
        const data = JSON.parse(responseText);
        console.log("✅ Réponse inscription parsée:", data);
        
        return {
          message: "Compte créé avec succès",
          status: response.status,
        };
      } catch (jsonError) {
        console.error("❌ Erreur parsing JSON:", jsonError);
        return {
          message: "Erreur de format de réponse",
          status: 500,
        };
      }
    } else {
      // Réponse vide (peut arriver avec DRF)
      return {
        message: "Compte créé avec succès",
        status: response.status,
      };
    }
    
  } catch (error: any) {
    console.error("❌ Erreur inscription:", error);
    return {
      message: error.message || "Erreur de connexion",
      status: 500,
    };
  }
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

//Verifier si le telephone existe deja dans la base avant de cree le compte
  // Vérifier si le téléphone existe déjà
// Dans userService.ts
static async checkTelephoneExists(telephone: string): Promise<{ exists: boolean }> {
  try {
    console.log('🔍 Vérification du téléphone:', telephone);
    
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
      console.error('❌ Réponse non-JSON:', textResponse.substring(0, 200));
      throw new Error('Le serveur a retourné une réponse non-JSON');
    }
    
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Réponse vérification téléphone:", data);
    
    return {
      exists: data.exists || false
    };

  } catch (error: any) {
    console.error("❌ Erreur vérification téléphone:", error.message || error);
    
    // En cas d'erreur, on suppose que le numéro n'existe pas
    return {
      exists: false
    };
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