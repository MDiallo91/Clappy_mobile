import React, { useEffect, useState, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Alert,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import UtilisateurService from "@/services/userService";
import VehiculeService from "@/services/vehiculeService";

const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImQ5YTE3NWZiZTkzZjRkMTJhMzg5YTAzN2Y1OGIzNWQ0IiwiaCI6Im11cm11cjY0In0=";
const primary = "#EE6841";
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

interface Props {
    trajet?: boolean;
    startLat?: any;
    startLng?: any;
    destLat?: any;
    destLng?: any;
    onRouteReady?: () => void;
}

interface Coordonnees {
    latitude: number;
    longitude: number;
}

interface TrajetComplet {
    id: number;
    name: string;
    startCoord: Coordonnees;
    destCoord: Coordonnees;
    distance: string;
    duration: string;
    vehicleType: string;
    price: string;
    startAddress: string;
    destinationAddress: string;
    timestamp: string;
}

interface Vehicule {
    id: number;
    icon: string;
    name: string;
    description: string;
    prix_base: number;
    prix_par_km: number;
    type_vehicule: string;
    est_actif: boolean;
    pricePerKm: number;
}

interface Suggestion {
    name: string;
    city: string;
    country: string;
    lat: number;
    lon: number;
}


// Fonction pour obtenir l'adresse à partir des coordonnées
const getAddressFromCoords = async (coords: Coordonnees): Promise<string> => {
    try {
        console.log("📍 Reverse geocoding pour:", coords);
        const addresses = await Location.reverseGeocodeAsync({
            latitude: coords.latitude,
            longitude: coords.longitude
        });
        
        if (addresses && addresses.length > 0) {
            const address = addresses[0];
            console.log(" Résultat reverse geocoding:", address);
            
            const addressParts = [
                address.name,
                address.street,
                address.district,
                address.city,
                address.region,
                address.country
            ].filter(part => part && part.trim() !== "");
            
            if (addressParts.length > 0) {
                const formattedAddress = addressParts.join(', ');
                console.log(" Adresse formatée:", formattedAddress);
                return formattedAddress;
            }
        }
        
        // Fallback aux coordonnées
        const fallbackAddress = `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
        console.log(" Fallback aux coordonnées:", fallbackAddress);
        return fallbackAddress;
        
    } catch (error) {
        console.error(" Erreur reverse geocoding:", error);
        return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
    }
};

export default function MapViews({ trajet, startLat, startLng, destLat, destLng, onRouteReady }: Props) {
    const mapRef = useRef<MapView>(null);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const router = useRouter();
    
    const [currentLocation, setCurrentLocation] = useState<Coordonnees | null>(null);
    const [start, setStart] = useState("");
    const [destination, setDestination] = useState("");
    const [startCoord, setStartCoord] = useState<Coordonnees | null>(null);
    const [destCoord, setDestCoord] = useState<Coordonnees | null>(null);
    const [routeCoords, setRouteCoords] = useState<Coordonnees[]>([]);
    const [loading, setLoading] = useState(false);
    const [distance, setDistance] = useState<string | null>(null);
    const [duration, setDuration] = useState<string | null>(null);
    const [startSuggestions, setStartSuggestions] = useState<Suggestion[]>([]);
    const [destSuggestions, setDestSuggestions] = useState<Suggestion[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [showVehicleSheet, setShowVehicleSheet] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicule | null>(null);
    const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
    const [user, setUser] = useState<any>([]);
    const [tarifs, setTarifs] = useState<any>([]);
    const [transformedTarifs, setTransformedTarifs] = useState<Vehicule[]>([]);
    const params = useLocalSearchParams();

   // Récupération de la position actuelle avec reverse geocoding
    useEffect(() => {
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== "granted") {
                    Alert.alert("Permission requise", "La localisation est nécessaire pour utiliser cette fonctionnalité");
                    return;
                }
                
                const loc = await Location.getCurrentPositionAsync({});
                const { latitude, longitude } = loc.coords;
                setCurrentLocation({ latitude, longitude });
                setStartCoord({ latitude, longitude });
                
                console.log(" Coordonnées actuelles:", latitude, longitude);
                
                // Reverse geocoding pour obtenir le nom du lieu
                const addresses = await Location.reverseGeocodeAsync({
                    latitude,
                    longitude
                });
                
                if (addresses && addresses.length > 0) {
                    const address = addresses[0];
                    console.log(" Adresse reverse geocoding:", address);
                    
                    // Construire une adresse lisible
                    const addressParts = [
                        address.name,
                        address.street,
                        address.district,
                        address.city,
                        address.region
                    ].filter(part => part && part.trim() !== "");
                    
                    let formattedAddress = "Position actuelle";
                    if (addressParts.length > 0) {
                        formattedAddress = addressParts.join(', ');
                    } else if (address.city) {
                        formattedAddress = address.city;
                    } else if (address.region) {
                        formattedAddress = address.region;
                    }
                    
                    setStart(formattedAddress);
                    console.log(" Adresse formatée:", formattedAddress);
                } else {
                    setStart("Position actuelle");
                    console.log(" Aucune adresse trouvée");
                }
                
            } catch (error) {
                console.error(" Erreur lors de la géolocalisation:", error);
                // Fallback aux coordonnées en cas d'erreur
                if (currentLocation) {
                    setStart(`${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`);
                }
            }
        })();
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const users = await UtilisateurService.getUsers();
                setUser(users);
            } catch (error) {
                console.error("Erreur lors de la récupération des users:", error);
            }
        };
        fetchUsers();
    }, []);

    // Récupération et transformation des tarifs
    useEffect(() => {
        const fetchTarifs = async () => {
            try {
                const tarif = await VehiculeService.getTarif();
                setTarifs(tarif);
                console.log(" Tarifs chargés:", tarif);
                
                const transformed: Vehicule[] = tarif.map((item: any) => {
                    let iconName = "car-outline";
                    let displayName = item.type_vehicule;
                    let description = "Véhicule standard";

                    switch(item.type_vehicule.toLowerCase()) {
                        case "economique":
                            iconName = "car-outline";
                            displayName = "Économique";
                            description = "Véhicule économique et confortable";
                            break;
                        case "climatiser":
                            iconName = "snow-outline";
                            displayName = "Climatisé";
                            description = "Véhicule climatisé premium";
                            break;
                        case "moto":
                            iconName = "bicycle-outline";
                            displayName = "Moto Taxi";
                            description = "Rapide et économique";
                            break;
                        case "vip":
                            iconName = "diamond-outline";
                            displayName = "VIP";
                            description = "Service haut de gamme avec chauffeur privé";
                            break;
                        case "premium":
                            iconName = "star-outline";
                            displayName = "Premium";
                            description = "Confort et luxe exceptionnels";
                            break;
                        case "luxe":
                            iconName = "diamond";
                            displayName = "Luxe";
                            description = "Expérience de voyage ultime";
                            break;
                        case "berline":
                            iconName = "car-sport-outline";
                            displayName = "Berline";
                            description = "Élégance et espace";
                            break;
                        case "suv":
                            iconName = "car-outline";
                            displayName = "SUV";
                            description = "Spacieux et confortable";
                            break;
                        case "minibus":
                            iconName = "bus-outline";
                            displayName = "Minibus";
                            description = "Idéal pour les groupes";
                            break;
                        case "camionnette":
                            iconName = "truck-outline";
                            displayName = "Camionnette";
                            description = "Parfaite pour les déménagements";
                            break;
                    }

                    return {
                        id: item.id,
                        icon: iconName,
                        name: displayName,
                        description: description,
                        prix_base: parseFloat(item.prix_base),
                        prix_par_km: parseFloat(item.prix_par_km),
                        type_vehicule: item.type_vehicule,
                        est_actif: item.est_actif,
                        pricePerKm: parseFloat(item.prix_par_km)
                    };
                });
                
                setTransformedTarifs(transformed);
                console.log(" Véhicules transformés:", transformed.length);
            } catch (error) {
                console.error(" Erreur lors de la récupération des tarifs:", error);
            }
        };
        fetchTarifs();
    }, []);

    // Si la page reçoit des coordonnées via les props
    useEffect(() => {
        if (startLat && destLat && startLng && destLng) {
            const startC: Coordonnees = {
                latitude: Number(startLat),
                longitude: Number(startLng),
            };
            const destC: Coordonnees = {
                latitude: Number(destLat),
                longitude: Number(destLng),
            };
            setStartCoord(startC);
            setDestCoord(destC);
            setTimeout(() => traceRoute(startC, destC), 300);
        }
    }, [startLat, startLng, destLat, destLng]);

    // Debug des états importants
    useEffect(() => {
        console.log(" destination state:", destination);
    }, [destination]);

    useEffect(() => {
        console.log(" destCoord state:", destCoord);
    }, [destCoord]);

    // Suggestions via Photon API
    const fetchSuggestions = async (query: string, type: "start" | "dest") => {
        if (!query || query.length < 2) {
            type === "start" ? setStartSuggestions([]) : setDestSuggestions([]);
            return;
        }
        
        try {
            const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lang=fr`;
            console.log(" Recherche suggestions:", query);
            
            const res = await fetch(url);
            const data = await res.json();
            
            const suggestions: Suggestion[] = data.features
                .filter((f: any) => f.properties.name)
                .map((f: any) => ({
                    name: f.properties.name,
                    city: f.properties.city || f.properties.county || "",
                    country: f.properties.country || "",
                    lat: f.geometry.coordinates[1],
                    lon: f.geometry.coordinates[0],
                }))
                .slice(0, 8);
            
            console.log(" Suggestions trouvées:", suggestions.length);
            
            type === "start" ? setStartSuggestions(suggestions) : setDestSuggestions(suggestions);
        } catch (error) {
            console.error(" Erreur lors de la récupération des suggestions:", error);
        }
    };

    const selectSuggestion = (item: Suggestion, type: "start" | "dest") => {
        const addressParts = [item.name];
        if (item.city && item.city !== item.name) {
            addressParts.push(item.city);
        }
        if (item.country && item.country !== "Guinée") {
            addressParts.push(item.country);
        }
        
        const formattedAddress = addressParts.join(', ');
        
        console.log(" Sélection:", { type, formattedAddress, coords: { lat: item.lat, lon: item.lon } });
        
        if (type === "start") {
            setStart(formattedAddress);
            setStartCoord({ latitude: item.lat, longitude: item.lon });
            setStartSuggestions([]);
        } else {
            setDestination(formattedAddress);
            setDestCoord({ latitude: item.lat, longitude: item.lon });
            setDestSuggestions([]);
            console.log(" Destination définie:", formattedAddress);
        }
    };

    // Enregistrer le trajet avec toutes les informations
    const saveTrajet = async (
        name: string, 
        startC: Coordonnees, 
        destC: Coordonnees, 
        dist: string, 
        dur: string,
        vehicleType: string = "",
        price: string = "",
        startAddress: string = "",
        destinationAddress: string = ""
    ) => {
        try {
            // S'assurer qu'on a des adresses valides
            const finalStartAddress = startAddress || await getAddressFromCoords(startC);
            const finalDestinationAddress = destinationAddress || await getAddressFromCoords(destC);
            
            const newTrajet: TrajetComplet = { 
                id: Date.now(), 
                name, 
                startCoord: startC, 
                destCoord: destC, 
                distance: dist, 
                duration: dur,
                vehicleType,
                price,
                startAddress: finalStartAddress,
                destinationAddress: finalDestinationAddress,
                timestamp: new Date().toISOString()
            };
            
            console.log(" Tentative d'enregistrement:", newTrajet);
            
            const existing = await AsyncStorage.getItem("trajets");
            const trajets: TrajetComplet[] = existing ? JSON.parse(existing) : [];
            trajets.push(newTrajet);
            await AsyncStorage.setItem("trajets", JSON.stringify(trajets));
            
            // Vérifier que l'enregistrement a fonctionné
            const verify = await AsyncStorage.getItem("trajets");
            console.log("Trajet enregistré avec succès. Stockage vérifié:", verify ? JSON.parse(verify).length : 0, "trajets");
            
        } catch (error) {
            console.error(" Erreur lors de l'enregistrement du trajet:", error);
            Alert.alert("Erreur", "Impossible d'enregistrer le trajet");
        }
    };

    // Tracer la route
    const traceRoute = async (startC: Coordonnees | null = startCoord, destC: Coordonnees | null = destCoord) => {
        if (!startC || !destC) {
            Alert.alert("Erreur", "Choisis le départ et la destination.");
            return;
        }
        
        try {
            setLoading(true);
            console.log(" Début du traçage de la route...");
            
            const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${startC.longitude},${startC.latitude}&end=${destC.longitude},${destC.latitude}`;
            const res = await fetch(url);
            const data = await res.json();
            
            if (!data.features || data.features.length === 0) {
                Alert.alert("Aucun itinéraire trouvé");
                return;
            }

            const coords: Coordonnees[] = data.features[0].geometry.coordinates.map((c: any) => ({
                latitude: c[1],
                longitude: c[0],
            }));
            
            const summary = data.features[0].properties.summary;
            const dist = (summary.distance / 1000).toFixed(2) + " km";
            const dur = Math.ceil(summary.duration / 60) + " min";

            setRouteCoords(coords);
            setDistance(dist);
            setDuration(dur);

            console.log(" Route tracée:", { distance: dist, duration: dur });

            mapRef.current?.fitToCoordinates(coords, {
                edgePadding: { top: 100, right: 50, bottom: 200, left: 50 },
                animated: true,
            });
            
            // Notifier que la route est prête
            if (onRouteReady) {
                onRouteReady();
            }
            
            // Ouvrir le bottom sheet pour choisir le véhicule
            setTimeout(() => {
                setShowVehicleSheet(true);
                bottomSheetRef.current?.expand();
            }, 500);
            
            // Enregistrer le trajet de base seulement si ce n'est pas un trajet chargé
            if (!trajet) {
                await saveTrajet("Trajet", startC, destC, dist, dur, "", "", start, destination);
            }
        } catch (err) {
            console.error(" Erreur lors du traçage de la route:", err);
            Alert.alert("Erreur", "Impossible de tracer l'itinéraire");
            
            if (onRouteReady) {
                onRouteReady();
            }
        } finally {
            setLoading(false);
            setShowForm(false);
        }
    };

    // Calculer le prix en fonction de la distance et du type de véhicule
    const calculatePrice = (vehicle: Vehicule): number => {
        if (!distance || !vehicle.prix_par_km) return 0;
        const distanceInKm = parseFloat(distance.split(' ')[0]);
        const pricePerKm = vehicle.prix_par_km || vehicle.pricePerKm;
        return Math.round(distanceInKm * pricePerKm);
    };

    // Sélectionner un véhicule - CORRIGÉ avec gestion robuste des adresses
    const handleVehicleSelect = async (vehicle: Vehicule) => {
        console.log("Sélection véhicule:", {
            destination,
            start,
            destCoord,
            startCoord
        });
        
        const price = calculatePrice(vehicle);
        setSelectedVehicle(vehicle);
        setCalculatedPrice(price);
        
        try {
            // S'assurer qu'on a les adresses complètes
            const startAddressFinal = start || await getAddressFromCoords(startCoord!);
            const destinationAddressFinal = destination || await getAddressFromCoords(destCoord!);
            
            console.log(" Adresses finales pour enregistrement:", {
                start: startAddressFinal,
                destination: destinationAddressFinal
            });
            
            // Enregistrer le trajet COMPLET avant la redirection
            await saveTrajet(
                "Trajet réservé", 
                startCoord!, 
                destCoord!, 
                distance!, 
                duration!,
                vehicle.name,
                price.toString(),
                startAddressFinal,
                destinationAddressFinal
            );
            
            console.log(" Trajet enregistré, redirection vers paiement...");
            
            // Rediriger vers la page de paiement après un court délai
            setTimeout(() => {
                router.push({
                    pathname: "/paiement",
                    params: {
                        vehicleType: vehicle.name,
                        price: price.toString(),
                        distance: distance,
                        duration: duration,
                        start: startAddressFinal,
                        destination: destinationAddressFinal,
                        startLat: startCoord!.latitude.toString(),
                        startLng: startCoord!.longitude.toString(),
                        destLat: destCoord!.latitude.toString(),
                        destLng: destCoord!.longitude.toString()
                    }
                });
            }, 500);
            
        } catch (error) {
            console.error(" Erreur lors de la sélection du véhicule:", error);
            Alert.alert("Erreur", "Impossible de finaliser la réservation");
        }
    };

    if (!currentLocation) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={primary} />
                <Text style={styles.loadingText}>Chargement de la carte...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                mapType="standard"
                initialRegion={{
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
                showsUserLocation
                showsMyLocationButton
            >
                {startCoord && (
                    <Marker coordinate={startCoord} title="Départ">
                        <View style={styles.markerStart}>
                            <Ionicons name="location" size={32} color={primary} />
                        </View>
                    </Marker>
                )}
                {destCoord && (
                    <Marker coordinate={destCoord} title="Destination">
                        <View style={styles.markerDest}>
                            <Ionicons name="navigate" size={30} color="#007AFF" />
                        </View>
                    </Marker>
                )}
                {routeCoords.length > 0 && (
                    <Polyline coordinates={routeCoords} strokeWidth={6} strokeColor={primary} />
                )}
            </MapView> 

            {!showForm && !trajet && (
                <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(true)}>
                    <Ionicons name="add" size={30} color="#fff" />
                </TouchableOpacity>
            )}

            {showForm && (
                <View style={styles.searchContainer}>
                    <View style={styles.headerForm}>
                        <Text style={styles.headerTitle}>Réserver un trajet</Text>
                        <TouchableOpacity onPress={() => setShowForm(false)}>
                            <Ionicons name="close" size={24} color="black" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputContainer}>
                        <Ionicons name="location" size={20} color={primary} style={styles.inputIcon} />
                        <TextInput
                            placeholder="Départ"
                            value={start}
                            style={styles.input}
                            onChangeText={(text) => {
                                setStart(text);
                                fetchSuggestions(text, "start");
                            }}
                            placeholderTextColor="#999"
                        />
                    </View>
                    {startSuggestions.length > 0 && (
                        <FlatList
                            data={startSuggestions}
                            keyExtractor={(item, i) => i.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    onPress={() => selectSuggestion(item, "start")} 
                                    style={styles.suggestionItem}
                                >
                                    <Ionicons name="location-outline" size={16} color="#666" />
                                    <View style={styles.suggestionTextContainer}>
                                        <Text style={styles.suggestionName}>{item.name}</Text>
                                        {item.city && (
                                            <Text style={styles.suggestionCity}>{item.city}</Text>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            )}
                            style={styles.suggestionsList}
                            showsVerticalScrollIndicator={false}
                        />
                    )}

                  <View style={styles.inputContainer}>
                    <Ionicons name="navigate" size={20} color={primary} style={styles.inputIcon} />
                    <TextInput
                        placeholder="Destination"
                        value={destination}
                        style={styles.input}
                        onChangeText={(text) => {
                            setDestination(text);
                            fetchSuggestions(text, "dest");
                        }}
                        placeholderTextColor="#999"
                    />
                    {destination.length > 0 && (
                        <TouchableOpacity 
                            onPress={() => {
                                setDestination("");
                                setDestSuggestions([]);
                            }}
                            style={styles.clearButton}
                        >
                            <Ionicons name="close-circle" size={20} color="#999" />
                        </TouchableOpacity>
                    )}
                </View>
                    {destSuggestions.length > 0 && (
                        <FlatList
                            data={destSuggestions}
                            keyExtractor={(item, i) => i.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    onPress={() => selectSuggestion(item, "dest")} 
                                    style={styles.suggestionItem}
                                >
                                    <Ionicons name="location-outline" size={16} color="#666" />
                                    <View style={styles.suggestionTextContainer}>
                                        <Text style={styles.suggestionName}>{item.name}</Text>
                                        {item.city && (
                                            <Text style={styles.suggestionCity}>{item.city}</Text>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            )}
                            style={styles.suggestionsList}
                            showsVerticalScrollIndicator={false}
                        />
                    )}

                    <TouchableOpacity 
                        style={[styles.button, loading && styles.buttonDisabled]} 
                        onPress={() => traceRoute()} 
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color={primary} />
                        ) : (
                            <Text style={styles.btnText}>Suivant</Text>
                        )}
                    </TouchableOpacity>
 
                    {distance && duration && (
                        <View style={styles.routeInfoContainer}>
                            <Text style={styles.infoText}>
                              Distance : {distance} • Temps estimé : {duration}
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {/* Bottom Sheet pour choisir le véhicule */}
            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                snapPoints={['50%', '70%']}
                enablePanDownToClose={true}
                onClose={() => setShowVehicleSheet(false)}
                backgroundStyle={styles.bottomSheetBackground}
                handleStyle={styles.bottomSheetHandle}
            >
                <BottomSheetView style={styles.bottomSheetContent}>
                    <View style={styles.bottomSheetHeader}>
                        <Text style={styles.bottomSheetTitle}>Choisir un véhicule</Text>
                        <TouchableOpacity onPress={() => bottomSheetRef.current?.close()}>
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    {distance && duration && (
                        <View style={styles.routeInfo}>
                            <View style={styles.routeInfoItem}>
                                <Ionicons name="speedometer" size={16} color="#666" />
                                <Text style={styles.routeInfoText}>Distance: {distance}</Text>
                            </View>
                            <View style={styles.routeInfoItem}>
                                <Ionicons name="time" size={16} color="#666" />
                                <Text style={styles.routeInfoText}>Durée: {duration}</Text>
                            </View>
                        </View>
                    )}

                    <FlatList
                        data={transformedTarifs}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => {
                            const price = calculatePrice(item);
                            return (
                                <TouchableOpacity 
                                    style={[
                                        styles.vehicleItem,
                                        selectedVehicle?.id === item.id && styles.selectedVehicleItem
                                    ]}
                                    onPress={() => handleVehicleSelect(item)}
                                >
                                    <View style={styles.vehicleInfo}>
                                        <Ionicons name={item.icon as any} size={28} color={primary} />
                                        <View style={styles.vehicleDetails}>
                                            <Text style={styles.vehicleName}>{item.name}</Text>
                                            <Text style={styles.vehicleDescription}>{item.description}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.priceContainer}>
                                        <Text style={styles.priceText}>{price.toLocaleString()} GNF</Text>
                                        <Text style={styles.priceDetail}>{item.prix_par_km} GNF/km</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        }}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.vehicleListContent}
                    />
                </BottomSheetView>
            </BottomSheet> 
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1,
        backgroundColor: '#fff'
    },
    map: { 
        flex: 1 
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
        fontWeight: '500'
    },
    searchContainer: {
        position: "absolute",
        top: 50,
        left: 16,
        right: 16,
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        zIndex: 10,
    },
    headerForm: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    headerTitle: {
        fontWeight: "bold", 
        fontSize: 18,
        color: '#333'
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "#f8f9fa",
        borderRadius: 12,
        marginBottom: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: "#e9ecef",
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 16,
        color: '#333',
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderBottomWidth: 1,
        borderColor: "#f8f9fa",
        backgroundColor: '#fff',
    },
    suggestionTextContainer: {
        marginLeft: 12,
        flex: 1,
    },
    suggestionName: {
        fontSize: 15,
        fontWeight: '500',
        color: '#333',
        marginBottom: 2,
    },
    suggestionCity: {
        fontSize: 13,
        color: '#666',
    },
    suggestionsList: {
        maxHeight: 200,
        backgroundColor: "#fff",
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e9ecef',
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    button: {
        backgroundColor: primary,
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 8,
        elevation: 2,
        shadowColor: primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    buttonDisabled: {
        backgroundColor: "#ccc",
        shadowOpacity: 0,
    },
    btnText: { 
        color: "#fff", 
        fontWeight: "bold",
        fontSize: 16
    },
    routeInfoContainer: {
        marginTop: 16,
        padding: 12,
        backgroundColor: '#e8f5e8',
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#4caf50',
    },
    infoText: {
        fontSize: 14,
        fontWeight: "600",
        textAlign: "center",
        color: '#2e7d32'
    },
    addButton: {
        position: "absolute",
        bottom: 30,
        right: 20,
        backgroundColor: primary,
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        zIndex: 10,
    },
    markerStart: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    markerDest: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    bottomSheetBackground: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
    },
    bottomSheetHandle: {
        backgroundColor: '#e0e0e0',
        width: 40,
        height: 4,
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 8,
    },
    bottomSheetContent: {
        flex: 1,
        padding: 20,
    },
    bottomSheetHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    bottomSheetTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
    },
    routeInfo: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#f8f9fa",
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#e9ecef",
    },
    routeInfoItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    routeInfoText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#666",
        marginLeft: 6,
    },
    vehicleListContent: {
        paddingBottom: 20,
    },
    vehicleItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: '#fafafa',
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    selectedVehicleItem: {
        backgroundColor: "#FFF5F2",
        borderColor: primary,
        borderWidth: 2,
        transform: [{ scale: 1.02 }],
    },
    vehicleInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    vehicleDetails: {
        marginLeft: 12,
        flex: 1,
    },
    vehicleName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 2,
    },
    vehicleDescription: {
        fontSize: 12,
        color: "#666",
        lineHeight: 16,
    },
    priceContainer: {
        alignItems: "flex-end",
        marginLeft: 8,
    },
    priceText: {
        fontSize: 16,
        fontWeight: "bold",
        color: primary,
        marginBottom: 2,
    },
    priceDetail: {
        fontSize: 10,
        color: "#666",
        fontWeight: '500',
    },
    clearButton: {
        padding: 4,
        marginLeft: 8,
    },
});