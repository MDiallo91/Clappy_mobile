// import React, { useState, useEffect } from "react";
// import {
//   View,
//   TextInput,
//   TouchableOpacity,
//   Text,
//   StyleSheet,
//   FlatList,
//   Dimensions,
//   ActivityIndicator,
// } from "react-native";
// import MapView, { Marker, Polyline } from "react-native-maps";
// import * as Location from "expo-location";
// import { Ionicons } from "@expo/vector-icons";

// const { width } = Dimensions.get("window");

// // 🔑 Clé gratuite OpenRouteService
// const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImQ5YTE3NWZiZTkzZjRkMTJhMzg5YTAzN2Y1OGIzNWQ0IiwiaCI6Im11cm11cjY0In0=";
// const primary = "#EE6841";

// export default function MapViews() {
//   const [start, setStart] = useState("");
//   const [end, setEnd] = useState("");
//   const [startCoord, setStartCoord] = useState<any>(null);
//   const [endCoord, setEndCoord] = useState<any>(null);
//   const [routeCoords, setRouteCoords] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);

//   const [startSuggestions, setStartSuggestions] = useState<any[]>([]);
//   const [endSuggestions, setEndSuggestions] = useState<any[]>([]);
//   const [showForm, setShowForm] = useState(false);

//   // ✅ Récupérer la position actuelle
//   useEffect(() => {
//     (async () => {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") {
//         alert("Permission de localisation refusée");
//         return;
//       }
//       const loc = await Location.getCurrentPositionAsync({});
//       const coords = {
//         latitude: loc.coords.latitude,
//         longitude: loc.coords.longitude,
//       };
//       setStartCoord(coords);
//       setStart("Ma position actuelle");
//     })();
//   }, []);

//   // 🔎 Autocomplétion gratuite
//   const fetchSuggestions = async (query: string, type: "start" | "end") => {
//     if (!query) return;
//     const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}`;
//     const res = await fetch(url);
//     const data = await res.json();
//     const suggestions = data.features.map((f: any) => ({
//       name: f.properties.name,
//       city: f.properties.city,
//       lat: f.geometry.coordinates[1],
//       lon: f.geometry.coordinates[0],
//     }));
//     if (type === "start") setStartSuggestions(suggestions);
//     else setEndSuggestions(suggestions);
//   };

//   const selectSuggestion = (item: any, type: "start" | "end") => {
//     if (type === "start") {
//       setStart(item.name + (item.city ? ", " + item.city : ""));
//       setStartCoord({ latitude: item.lat, longitude: item.lon });
//       setStartSuggestions([]);
//     } else {
//       setEnd(item.name + (item.city ? ", " + item.city : ""));
//       setEndCoord({ latitude: item.lat, longitude: item.lon });
//       setEndSuggestions([]);
//     }
//   };

//   // 🚗 Tracer la route
//   const traceRoute = async () => {
//     if (!startCoord || !endCoord) {
//       alert("Veuillez choisir une destination");
//       return;
//     }

//     try {
//       setLoading(true);
//       const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${startCoord.longitude},${startCoord.latitude}&end=${endCoord.longitude},${endCoord.latitude}`;
//       const response = await fetch(url);
//       const data = await response.json();

//       if (data.features && data.features.length > 0) {
//         const coords = data.features[0].geometry.coordinates.map((c: any) => ({
//           latitude: c[1],
//           longitude: c[0],
//         }));
//         setRouteCoords(coords);
//       }
//     } catch (error) {
//       console.error("Erreur de tracé :", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={{ flex: 1 }}>
//       <MapView
//         style={styles.map}
//         region={
//           startCoord
//             ? { ...startCoord, latitudeDelta: 0.05, longitudeDelta: 0.05 }
//             : { latitude: 9.5, longitude: -13.7, latitudeDelta: 1, longitudeDelta: 1 }
//         }
//         showsUserLocation
//       >
//         {startCoord && <Marker coordinate={startCoord} title="Départ" pinColor="green" />}
//         {endCoord && <Marker coordinate={endCoord} title="Arrivée" pinColor="red" />}
//         {routeCoords.length > 0 && (
//           <Polyline coordinates={routeCoords} strokeWidth={5} strokeColor="#007BFF" />
//         )}
//       </MapView>

//       {/* 🔘 Bouton pour afficher/masquer le formulaire */}
//       {!showForm && (
//         <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(true)}>
//           <Ionicons name="add" size={28} color="#fff" />
//         </TouchableOpacity>
//       )}

//       {showForm && (
//         <View style={styles.searchContainer}>
//           <View style={styles.headerForm}>
//             <Text style={{ fontWeight: "bold", fontSize: 16 }}>Tracer un trajet</Text>
//             <TouchableOpacity onPress={() => setShowForm(false)}>
//               <Ionicons name="close" size={24} color="black" />
//             </TouchableOpacity>
//           </View>

//           <TextInput
//             style={styles.input}
//             placeholder="Destination"
//             value={end}
//             onChangeText={(text) => {
//               setEnd(text);
//               fetchSuggestions(text, "end");
//             }}
//           />
//           {endSuggestions.length > 0 && (
//             <FlatList
//               data={endSuggestions}
//               keyExtractor={(item, i) => i.toString()}
//               renderItem={({ item }) => (
//                 <TouchableOpacity onPress={() => selectSuggestion(item, "end")}>
//                   <Text style={styles.suggestion}>
//                     {item.name} {item.city || ""}
//                   </Text>
//                 </TouchableOpacity>
//               )}
//               style={styles.suggestionsList}
//             />
//           )}

//           <TouchableOpacity style={styles.button} onPress={traceRoute} disabled={loading}>
//             {loading ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text style={styles.btnText}>Reserver</Text>
//             )}
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   map: { flex: 1 },
//   searchContainer: {
//     position: "absolute",
//     top: 20,
//     left: 10,
//     right: 10,
//     backgroundColor: "white",
//     borderRadius: 10,
//     padding: 10,
//     elevation: 5,
//   },
//   headerForm: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   input: {
//     backgroundColor: "#f1f1f1",
//     borderRadius: 8,
//     padding: 8,
//     marginBottom: 5,
//   },
//   suggestionsList: {
//     maxHeight: 120,
//     marginBottom: 5,
//   },
//   suggestion: {
//     padding: 8,
//     borderBottomWidth: 1,
//     borderColor: "#ddd",
//   },
//   button: {
//     backgroundColor: primary,
//     padding: 10,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   btnText: { color: "#fff", fontWeight: "bold" },
//   addButton: {
//     position: "absolute",
//     bottom: 30,
//     right: 20,
//     backgroundColor: primary,
//     width: 55,
//     height: 55,
//     borderRadius: 30,
//     alignItems: "center",
//     justifyContent: "center",
//     elevation: 5,
//   },
// });


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
import { useLocalSearchParams } from "expo-router";

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

export default function MapViews({ trajet, startLat, startLng, destLat, destLng }: Props) {
    const mapRef = useRef<MapView>(null);
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

    const params = useLocalSearchParams();
    console.log("api",BASE_URL)
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
            setTimeout(() => traceRoute(startC, destC), 300); // petit délai pour s'assurer que la map est ready
        }
    }, [startLat, startLng, destLat, destLng]);


    // 🔹 Suggestions via Photon API
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
            
            if (!trajet) {
            saveTrajet("Trajet", startC, destC, dist, dur);
            }        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setShowForm(false);
        }
    };

    //  Enregistrer le trajet
    const saveTrajet = async (name: string, startC: any, destC: any, dist: any, dur: any) => {
        const newTrajet = { id: Date.now(), name, startCoord: startC, destCoord: destC, distance: dist, duration: dur };
        const existing = await AsyncStorage.getItem("trajets");
        const trajets = existing ? JSON.parse(existing) : [];
        trajets.push(newTrajet);
        await AsyncStorage.setItem("trajets", JSON.stringify(trajets));
        Alert.alert("Trajet enregistré", `"${name}" a été ajouté.`);
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
                        <Text style={styles.btnText}>{loading ? "Calcul..." : "Tracer la route"}</Text>
                    </TouchableOpacity>
 
                    {distance && duration && (
                        <Text style={styles.infoText}>Distance : {distance} | Durée : {duration}</Text>
                    )}
                </View>
            )}
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
});
