//composant permettant de stocker les trajet frequement choisi par le client
import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveTrajet = async (
    name: string, 
    startC: any, 
    destC: any, 
    dist: any, 
    dur: any,
    startName?: string,    // Nouveau : nom de l'adresse de départ
    destinationName?: string // Nouveau : nom de l'adresse d'arrivée
) => {
    const newTrajet = { 
        id: Date.now(), 
        name, 
        startCoord: startC, 
        destCoord: destC, 
        distance: dist, 
        duration: dur,
        startName: startName || "Position actuelle",    // Stocke le nom
        destinationName: destinationName || "Destination" // Stocke le nom
    };
    
    const existing = await AsyncStorage.getItem("trajets");
    const trajets = existing ? JSON.parse(existing) : [];
    trajets.push(newTrajet);
    await AsyncStorage.setItem("trajets", JSON.stringify(trajets));
    
    console.log("💾 Trajet enregistré:", newTrajet);
};