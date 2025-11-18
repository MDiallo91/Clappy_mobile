import React, { useState } from "react"; 
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

// Interface basée sur API
interface ApiReservation {
  id: number;
  adresse_depart: string;
  adresse_destination: string;
  client_nom: string;
  type_course: string;
  methode_paiement: string;
  statut: string;
  tarif_estime: string;
  date_demande: string;
  type_vehicule_demande: string;
  chauffeur: any;
  client: number;
  date_acceptation: string | null;
  date_debut: string | null;
  date_fin: string | null;
  date_reservation: string | null;
  distance_estimee: string | null;
  duree_estimee: string | null;
  duree_totale: string | null;
  latitude_depart: string;
  latitude_destination: string;
  longitude_depart: string;
  longitude_destination: string;
  client_nom_complet: string;
  tarif_final: string | null;
  url: string;
}

interface Props {
  reservations: ApiReservation[];
  selectedReservation: ApiReservation | null;
  loading: boolean;
  onConfirmer: (reservation: ApiReservation) => void;
  onSelectReservation: (reservation: ApiReservation | null) => void;
  onRefresh: () => Promise<void>; // 👈 AJOUT
}

export default function ReservationView({
  reservations,
  selectedReservation,
  loading,
  onConfirmer,
  onSelectReservation,
  onRefresh,
}: Props) {

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const formatAdresse = (adresse: string): string => {
    if (adresse.includes("+")) {
      const parts = adresse.split(", ");
      return parts.length > 1 ? parts.slice(1).join(", ") : adresse;
    }
    return adresse;
  };

  const formatTypeCourse = (type: string): string => {
    const types: Record<string, string> = {
      immediate: "Standard",
      comfort: "Confort",
      premium: "Premium",
    };
    return types[type] || type;
  };

  const handleVoirPosition = (reservation: ApiReservation) => {
    router.push({
      pathname: "/trouveClient",
      params: {
        id: reservation.id,
        startLat: reservation.latitude_depart,
        startLng: reservation.longitude_depart,
        destLat: reservation.latitude_destination,
        destLng: reservation.longitude_destination,
        clientNom: reservation.client_nom_complet,
        adresseDepart: reservation.adresse_depart,
        adresseDestination: reservation.adresse_destination,
      },
    });
  };

  const renderReservationItem = ({ item }: { item: ApiReservation }) => (
    <TouchableOpacity
      style={[
        styles.reservationItem,
        selectedReservation?.id === item.id && styles.selectedItem,
      ]}
      onPress={() => handleVoirPosition(item)}
    >
      <Text style={styles.itemClient}>{item.client_nom_complet || "Client"}</Text>
      <Text style={styles.itemRoute}>
        {formatAdresse(item.adresse_depart)} → {formatAdresse(item.adresse_destination)}
      </Text>
      <Text style={styles.itemType}>
        {formatTypeCourse(item.type_vehicule_demande)} • {item.tarif_estime} GNF
      </Text>
      <Text style={styles.itemDate}>
        {item.date_reservation
          ? `${new Date(item.date_reservation).toLocaleDateString("fr-FR")} à ${new Date(
              item.date_reservation
            ).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
          : "Date non définie"}
      </Text>
    </TouchableOpacity>
  );

  if (reservations.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Nouvelle Réservation</Text>
        <View style={styles.emptyState}>
          <Ionicons name="car-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Aucune réservation disponible</Text>
          <Text style={styles.emptySubtext}>
            Les nouvelles réservations apparaîtront ici
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>
        cliquer une réservation pour voir la position du client
      </Text>

      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>
          Réservations en attente ({reservations.length})
        </Text>

        <FlatList
          data={reservations}
          renderItem={renderReservationItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}       
          onRefresh={handleRefresh}     
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 20 },
  title: {
    color: "green",
    fontWeight: "bold",
    fontSize: 18,
    textDecorationLine: "underline",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    color: "#555",
    marginVertical: 5,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  listContainer: { flex: 1, marginHorizontal: 20, marginTop: 15 },
  listTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 10, color: "#333" },
  list: { flex: 1 },
  reservationItem: {
    backgroundColor: "#f8f8f8",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  selectedItem: { backgroundColor: "#e8f4fd", borderColor: "#2196F3", borderWidth: 2 },
  itemClient: { fontWeight: "bold", fontSize: 16, color: "#333" },
  itemRoute: { fontSize: 14, color: "#666", marginTop: 4 },
  itemType: { fontSize: 12, color: "#888", marginTop: 2 },
  itemDate: {
    fontSize: 13,
    fontWeight:"bold",
    color:"#f25c3c",
    marginTop: 2,
    fontStyle: "italic",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});
