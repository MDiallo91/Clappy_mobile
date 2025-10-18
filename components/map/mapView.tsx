import React, { useEffect, useState, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Image,
    Alert,
    Platform,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImQ5YTE3NWZiZTkzZjRkMTJhMzg5YTAzN2Y1OGIzNWQ0IiwiaCI6Im11cm11cjY0In0=";
const primary = "#EE6841";
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

interface Props {
    trajet?: boolean;
    startLat?: any;
    startLng?: any;
    destLat?: any;
    destLng?: any;
}

// Types de véhicules disponibles
const VEHICLE_TYPES = [
    {
        id: 1,
        name: "Taxi Climatisé",
        icon: "car",
        pricePerKm: 4000,
        description: "Confort et fraîcheur garantis"
    },
    {
        id: 2,
        name: "Taxi Non Climatisé",
        icon: "car-outline",
        pricePerKm: 200,
        description: "Économique et fiable"
    },
    {
        id: 3,
        name: "Moto Taxi",
        icon: "bicycle",
        pricePerKm: 5000,
        description: "Rapide et pratique"
    },
    {
        id: 4,
        name: "Véhicule Premium",
        icon: "diamond",
        pricePerKm: 7000,
        description: "Luxe et prestige"
    }
];

export default function MapViews({ trajet, startLat, startLng, destLat, destLng }: Props) {
    const mapRef = useRef<MapView>(null);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const router = useRouter();
    
    const [currentLocation, setCurrentLocation] = useState<any>(null);
    const [start, setStart] = useState("");
    const [destination, setDestination] = useState("");
    const [startCoord, setStartCoord] = useState<any>(null);
    const [destCoord, setDestCoord] = useState<any>(null);
    const [routeCoords, setRouteCoords] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [distance, setDistance] = useState<string | null>(null);
    const [duration, setDuration] = useState<string | null>(null);
    const [startSuggestions, setStartSuggestions] = useState<any[]>([]);
    const [destSuggestions, setDestSuggestions] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [showVehicleSheet, setShowVehicleSheet] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
    const [calculatedPrice, setCalculatedPrice] = useState<number>(0);

    const params = useLocalSearchParams();

    //  Récupération de la position actuelle
    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                console.warn("Permission de localisation refusée");
                return;
            }
            const loc = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = loc.coords;
            setCurrentLocation({ latitude, longitude });
            setStartCoord({ latitude, longitude });
            setStart(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        })();
    }, []);

    //  Si la page reçoit des coordonnées via les props
    useEffect(() => {
        if (startLat && destLat && startLng && destLng) {
            const startC = {
                latitude: Number(startLat),
                longitude: Number(startLng),
            };
            const destC = {
                latitude: Number(destLat),
                longitude: Number(destLng),
            };
            setStartCoord(startC);
            setDestCoord(destC);
            setTimeout(() => traceRoute(startC, destC), 300);
        }
    }, [startLat, startLng, destLat, destLng]);

    //  Suggestions via Photon API
    const fetchSuggestions = async (query: string, type: "start" | "dest") => {
        if (!query) return;
        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&bbox=-15.5,7.0,-7.6,12.7&lang=fr`;
        const res = await fetch(url);
        const data = await res.json();
        const suggestions = data.features.map((f: any) => ({
            name: f.properties.name,
            city: f.properties.city,
            lat: f.geometry.coordinates[1],
            lon: f.geometry.coordinates[0],
        }));
        type === "start" ? setStartSuggestions(suggestions) : setDestSuggestions(suggestions);
    };

    const selectSuggestion = (item: any, type: "start" | "dest") => {
        if (type === "start") {
            setStart(`${item.name}, ${item.city || ""}`);
            setStartCoord({ latitude: item.lat, longitude: item.lon });
            setStartSuggestions([]);
        } else {
            setDestination(`${item.name}, ${item.city || ""}`);
            setDestCoord({ latitude: item.lat, longitude: item.lon });
            setDestSuggestions([]);
        }
    };

    //  Tracer la route
    const traceRoute = async (startC = startCoord, destC = destCoord) => {
        if (!startC || !destC) return Alert.alert("Erreur", "Choisis le départ et la destination.");
        try {
            setLoading(true);
            const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${startC.longitude},${startC.latitude}&end=${destC.longitude},${destC.latitude}`;
            const res = await fetch(url);
            const data = await res.json();
            if (!data.features || data.features.length === 0) return Alert.alert("Aucun itinéraire trouvé");

            const coords = data.features[0].geometry.coordinates.map((c: any) => ({
                latitude: c[1],
                longitude: c[0],
            }));
            const summary = data.features[0].properties.summary;
            const dist = (summary.distance / 1000).toFixed(2) + " km";
            const dur = Math.ceil(summary.duration / 60) + " min";

            setRouteCoords(coords);
            setDistance(dist);
            setDuration(dur);

            mapRef.current?.fitToCoordinates(coords, {
                edgePadding: { top: 100, right: 50, bottom: 200, left: 50 },
                animated: true,
            });
            
            // Ouvrir le bottom sheet pour choisir le véhicule
            setTimeout(() => {
                setShowVehicleSheet(true);
                bottomSheetRef.current?.expand();
            }, 500);
            
            if (!trajet) {
                saveTrajet("Trajet", startC, destC, dist, dur,  start, destination);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setShowForm(false);
        }
    };

    // Calculer le prix en fonction de la distance et du type de véhicule
    const calculatePrice = (vehicle: any) => {
        if (!distance) return 0;
        const distanceInKm = parseFloat(distance.split(' ')[0]);
        return Math.round(distanceInKm * vehicle.pricePerKm);
    };

    // Sélectionner un véhicule
    const handleVehicleSelect = (vehicle: any) => {
        const price = calculatePrice(vehicle);
        setSelectedVehicle(vehicle);
        setCalculatedPrice(price);
        
        // Rediriger vers la page de paiement après un court délai
        setTimeout(() => {
            router.push({
                pathname: "/paiement",
                params: {
                    vehicleType: vehicle.name,
                    price: price.toString(),
                    distance: distance,
                    duration: duration,
                    start: start,
                    destination: destination,
                    startLat: startCoord.latitude.toString(),
                    startLng: startCoord.longitude.toString(),
                    destLat: destCoord.latitude.toString(),
                    destLng: destCoord.longitude.toString()
                }
            });
        }, 500);
    };

    //  Enregistrer le trajet
    const saveTrajet = async (name: string, startC: any, destC: any, dist: any, dur: any,  start:any,destination:any) => {
        const newTrajet = { id: Date.now(), name, startCoord: startC, destCoord: destC, distance: dist, duration: dur ,start,destination};
        const existing = await AsyncStorage.getItem("trajets");
        const trajets = existing ? JSON.parse(existing) : [];
        trajets.push(newTrajet);
        await AsyncStorage.setItem("trajets", JSON.stringify(trajets));
    };

    if (!currentLocation) return <ActivityIndicator style={{ flex: 1 }} size="large" color={primary} />;

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
            >
                {startCoord && (
                    <Marker coordinate={startCoord} title="Départ">
                        <Ionicons name="location" size={32} color={primary} />
                    </Marker>
                )}
                {destCoord && (
                    <Marker coordinate={destCoord} title="Destination">
                        <Ionicons name="location" size={30} color="#007AFF" />
                    </Marker>
                )}
                {routeCoords.length > 0 && <Polyline coordinates={routeCoords} strokeWidth={6} strokeColor={primary} />}
            </MapView>

            {!showForm && !trajet && (
                <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(true)}>
                    <Ionicons name="add" size={30} color="#fff" />
                </TouchableOpacity>
            )}

            {showForm && (
                <View style={styles.searchContainer}>
                    <View style={styles.headerForm}>
                        <Text style={{ fontWeight: "bold", fontSize: 16 }}>Réserver un trajet</Text>
                        <TouchableOpacity onPress={() => setShowForm(false)}>
                            <Ionicons name="close" size={24} color="black" />
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        placeholder="Départ"
                        value={start}
                        style={styles.input}
                        onChangeText={(text) => {
                            setStart(text);
                            fetchSuggestions(text, "start");
                        }}
                    />
                    {startSuggestions.length > 0 && (
                        <FlatList
                            data={startSuggestions}
                            keyExtractor={(item, i) => i.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => selectSuggestion(item, "start")} style={styles.suggestionItem}>
                                    <Text>{item.name} {item.city || ""}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    )}

                    <TextInput
                        placeholder="Destination"
                        value={destination}
                        style={styles.input}
                        onChangeText={(text) => {
                            setDestination(text);
                            fetchSuggestions(text, "dest");
                        }}
                    />
                    {destSuggestions.length > 0 && (
                        <FlatList
                            data={destSuggestions}
                            keyExtractor={(item, i) => i.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => selectSuggestion(item, "dest")} style={styles.suggestionItem}>
                                    <Text>{item.name} {item.city || ""}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    )}

                    <TouchableOpacity style={styles.button} onPress={() => traceRoute()} disabled={loading}>
                        <Text style={styles.btnText}>{loading ? "chargement..." : "Suivant"}</Text>
                    </TouchableOpacity>
 
                    {distance && duration && (
                        <Text style={styles.infoText}>Distance : {distance} | Durée : {duration}</Text>
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
                            <Text style={styles.routeInfoText}>Distance: {distance}</Text>
                            <Text style={styles.routeInfoText}>Durée: {duration}</Text>
                        </View>
                    )}

                    <FlatList
                        data={VEHICLE_TYPES}
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
                                        <Ionicons name={item.icon as any} size={24} color={primary} />
                                        <View style={styles.vehicleDetails}>
                                            <Text style={styles.vehicleName}>{item.name}</Text>
                                            <Text style={styles.vehicleDescription}>{item.description}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.priceContainer}>
                                        <Text style={styles.priceText}>{price} GNF</Text>
                                        <Text style={styles.priceDetail}>({item.pricePerKm} GNF/km)</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        }}
                    />
                </BottomSheetView>
            </BottomSheet>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    searchContainer: {
        position: "absolute",
        top: 30,
        left: 10,
        right: 10,
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 10,
        elevation: 6,
        zIndex: 10,
    },
    headerForm: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    input: {
        backgroundColor: "#f2f2f2",
        borderRadius: 8,
        padding: 8,
        marginBottom: 6,
    },
    suggestionItem: {
        padding: 8,
        borderBottomWidth: 1,
        borderColor: "#ddd",
    },
    button: {
        backgroundColor: primary,
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 6,
    },
    btnText: { color: "#fff", fontWeight: "bold" },
    infoText: {
        marginTop: 8,
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
    },
    addButton: {
        position: "absolute",
        bottom: 30,
        right: 20,
        backgroundColor: primary,
        width: 55,
        height: 55,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        elevation: 8,
        zIndex: 10,
    },
    // Styles pour le Bottom Sheet
    bottomSheetBackground: {
        backgroundColor: "#fff",
        borderRadius: 20,
    },
    bottomSheetContent: {
        flex: 1,
        padding: 16,
    },
    bottomSheetHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    bottomSheetTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    routeInfo: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#f8f8f8",
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    routeInfoText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#666",
    },
    vehicleItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
        borderRadius: 8,
        marginBottom: 8,
    },
    selectedVehicleItem: {
        backgroundColor: "#FFF5F2",
        borderColor: primary,
        borderWidth: 1,
    },
    vehicleInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    vehicleDetails: {
        marginLeft: 12,
    },
    vehicleName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    vehicleDescription: {
        fontSize: 12,
        color: "#666",
        marginTop: 2,
    },
    priceContainer: {
        alignItems: "flex-end",
    },
    priceText: {
        fontSize: 16,
        fontWeight: "bold",
        color: primary,
    },
    priceDetail: {
        fontSize: 10,
        color: "#666",
        marginTop: 2,
    },
});