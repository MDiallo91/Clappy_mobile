import { Alert } from "react-native";

// Clé API pour OpenRouteService - service de calcul d'itinéraires
const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImQ5YTE3NWZiZTkzZjRkMTJhMzg5YTAzN2Y1OGIzNWQ0IiwiaCI6Im11cm11cjY0In0=";

/**
 * Service de recherche d'adresses et lieux (géocodage)
 * Utilise l'API Photon pour transformer du texte en coordonnées GPS
 * 
 * @param query - Le texte saisi par l'utilisateur (ex: "Paris", "123 rue de...")
 * @returns Promise avec la liste des suggestions d'adresses
 */
export const fetchSuggestions = async (query: string) => {
    // Si la recherche est vide, retourne un tableau vide
    if (!query) return [];
    
    // Construction de l'URL de l'API Photon avec :
    // - Le texte recherché encodé
    // - Une bounding box pour limiter les résultats à une zone géographique (ici approximativement le Sénégal)
    // - La langue française
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&bbox=-15.5,7.0,-7.6,12.7&lang=fr`;
    
    // Appel à l'API
    const res = await fetch(url);
    const data = await res.json();
    
    // Transformation des données reçues de l'API en format simplifié
    return data.features.map((f: any) => ({
        name: f.properties.name,        // Nom du lieu (ex: "Rue de la Paix")
        city: f.properties.city,        // Ville (ex: "conakry")
        lat: f.geometry.coordinates[1], // Latitude (coordonnée Y)
        lon: f.geometry.coordinates[0], // Longitude (coordonnée X)
    }));
};

/**
 * Service de calcul d'itinéraire entre deux points GPS
 * Utilise l'API OpenRouteService pour obtenir le trajet, la distance et la durée
 * 
 * @param startC - Coordonnées de départ {latitude, longitude}
 * @param destC - Coordonnées d'arrivée {latitude, longitude}
 * @returns Promise avec les données du trajet ou null si erreur
 */
export const traceRoute = async (startC: any, destC: any) => {
    try {
        console.log("📍 Départ:", startC.longitude, startC.latitude);
        console.log("🎯 Destination:", destC.longitude, destC.latitude);
        
        // Construction de l'URL pour l'API OpenRouteService
        const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${startC.longitude},${startC.latitude}&end=${destC.longitude},${destC.latitude}`;
        
        console.log("🌐 URL appelée:", url);
        
        // Appel à l'API
        const res = await fetch(url);
        console.log("📡 Statut réponse:", res.status);
        
        const data = await res.json();
        console.log("📊 Données reçues:", data);
        
        // Vérification si un itinéraire a été trouvé
        if (!data.features || data.features.length === 0) {
            console.warn("❌ Aucun itinéraire trouvé - données:", data);
            Alert.alert("Aucun itinéraire trouvé", "Vérifiez que les adresses sont valides");
            return null;
        }

        // Extraction des coordonnées du trajet
        const coords = data.features[0].geometry.coordinates.map((c: any) => ({
            latitude: c[1],
            longitude: c[0],
        }));
        
        // Récupération des informations de résumé du trajet
        const summary = data.features[0].properties.summary;
        
        // Calcul de la distance en kilomètres (arrondi à 2 décimales)
        const distance = (summary.distance / 1000).toFixed(2) + " km";
        
        // Calcul de la durée en minutes (arrondi à l'entier supérieur)
        const duration = Math.ceil(summary.duration / 60) + " min";

        console.log("✅ Itinéraire trouvé - Distance:", distance, "Durée:", duration);

        return { 
            coords,
            distance,
            duration
        };
    } catch (err) {
        console.error("❌ Erreur traceRoute:", err);
        Alert.alert("Erreur", "Problème de connexion ou service indisponible");
        return null;
    }
};