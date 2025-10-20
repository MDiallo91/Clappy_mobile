import { Alert } from "react-native";

const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImQ5YTE3NWZiZTkzZjRkMTJhMzg5YTAzN2Y1OGIzNWQ0IiwiaCI6Im11cm11cjY0In0=";

export const fetchSuggestions = async (query: string) => {
    if (!query || query.length < 2) return [];
    
    try {
        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&bbox=-20,5,0,20&lang=fr`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (!data.features) return [];
        
        return data.features.map((f: any) => ({
            name: f.properties.name,
            city: f.properties.city || f.properties.state || "",
            lat: f.geometry.coordinates[1],
            lon: f.geometry.coordinates[0],
        }));
    } catch (error) {
        console.error("Erreur fetchSuggestions:", error);
        return [];
    }
};

export const traceRoute = async (startC: any, destC: any) => {
    try {
        console.log("🔍 Début traceRoute");
        console.log("📍 Départ reçu:", startC);
        console.log("🎯 Destination reçue:", destC);
        
        // Validation finale
        const startLat = Number(startC.latitude);
        const startLng = Number(startC.longitude);
        const destLat = Number(destC.latitude);
        const destLng = Number(destC.longitude);

        if (isNaN(startLat) || isNaN(startLng) || isNaN(destLat) || isNaN(destLng)) {
            console.error("❌ Coordonnées finales invalides");
            return null;
        }

        const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${startLng},${startLat}&end=${destLng},${destLat}`;
        
        console.log("🌐 URL API:", url);
        
        const response = await fetch(url);
        console.log("📡 Statut réponse:", response.status);
        
        const data = await response.json();
        
        if (!data.features || data.features.length === 0) {
            console.warn("⚠️ Aucun itinéraire trouvé");
            Alert.alert("Aucun itinéraire", "Impossible de trouver un chemin entre ces points");
            return null;
        }

        const feature = data.features[0];
        const coords = feature.geometry.coordinates.map((c: any) => ({
            latitude: c[1],
            longitude: c[0],
        }));
        
        const summary = feature.properties.summary;
        const distance = (summary.distance / 1000).toFixed(2) + " km";
        const duration = Math.ceil(summary.duration / 60) + " min";

        console.log("✅ Itinéraire calculé:", { distance, duration });
        
        return { coords, distance, duration };
        
    } catch (error) {
        console.error("❌ Erreur traceRoute:", error);
        Alert.alert("Erreur", "Problème de connexion au service");
        return null;
    }
};