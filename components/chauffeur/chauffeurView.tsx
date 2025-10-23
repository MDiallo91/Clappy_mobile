import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Interface basée sur votre API
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
  notes_client: string;
  tarif_final: string | null;
  url: string;
}

interface Props {
  reservations: ApiReservation[];
  selectedReservation: ApiReservation | null;
  loading: boolean;
  onConfirmer: (reservation: ApiReservation) => void;
  onSelectReservation: (reservation: ApiReservation | null) => void; // ← Correction ici
}

export default function ReservationView({
  reservations,
  selectedReservation,
  loading,
  onConfirmer,
  onSelectReservation,
}: Props) {
  // Fonction pour formater l'adresse (enlever les codes GPS)
  const formatAdresse = (adresse: string): string => {
    if (adresse.includes('+')) {
      const parts = adresse.split(', ');
      return parts.length > 1 ? parts.slice(1).join(', ') : adresse;
    }
    return adresse;
  };

  // Fonction pour formater le type de course
  const formatTypeCourse = (type: string): string => {
    const types: { [key: string]: string } = {
      'immediate': 'Standard',
      'comfort': 'Confort',
      'premium': 'Premium'
    };
    return types[type] || type;
  };

  // Fonction pour formater le paiement
  const formatPaiement = (methode: string): string => {
    const methodes: { [key: string]: string } = {
      'mobile_money': 'Mobile Money',
      'cash': 'Espèces',
      'card': 'Carte'
    };
    return methodes[methode] || methode;
  };

  const renderReservationItem = ({ item }: { item: ApiReservation }) => (
    <TouchableOpacity
      style={[
        styles.reservationItem,
        selectedReservation?.id === item.id && styles.selectedItem
      ]}
      onPress={() => onSelectReservation(item)}
    >
      <Text style={styles.itemClient}>{item.client_nom || "Client"}</Text>
      <Text style={styles.itemRoute}>
        {formatAdresse(item.adresse_depart)} → {formatAdresse(item.adresse_destination)}
      </Text>
      <Text style={styles.itemType}>
        {formatTypeCourse(item.type_course)} • {item.tarif_estime} GNF
      </Text>
      <Text style={styles.itemDate}>
        {new Date(item.date_demande).toLocaleDateString('fr-FR')} à {' '}
        {new Date(item.date_demande).toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </Text>
    </TouchableOpacity>
  );

  if (reservations.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Nouvelle Réservation</Text>
        <View style={styles.emptyState}>
          <Ionicons name="car-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Aucune réservation disponible</Text>
          <Text style={styles.emptySubtext}>
            Les nouvelles réservations apparaîtront ici
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Nouvelle Réservation</Text>
      <Text style={styles.subtitle}>
        Réservez seulement si vous êtes à proximité du client
      </Text>

      {/* Liste des réservations disponibles */}
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
        />
      </View>

      {/* Détails de la réservation sélectionnée - N'apparaît QUE si on clique */}
      {selectedReservation ? (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Détails de la réservation</Text>
            <TouchableOpacity 
              onPress={() => onSelectReservation(null)} // ← Maintenant ça fonctionne !
              style={styles.closeButton}
            >
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.clientName}>
            {selectedReservation.client_nom || "Client"}
          </Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.info}>
              Départ : <Text style={styles.bold}>{formatAdresse(selectedReservation.adresse_depart)}</Text>
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="flag-outline" size={16} color="#666" />
            <Text style={styles.info}>
              Arrivée : <Text style={styles.bold}>{formatAdresse(selectedReservation.adresse_destination)}</Text>
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="car-sport-outline" size={16} color="#666" />
            <Text style={styles.info}>
              Type : <Text style={styles.bold}>{formatTypeCourse(selectedReservation.type_course)}</Text>
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="wallet-outline" size={16} color="#666" />
            <Text style={styles.info}>
              Paiement : <Text style={styles.bold}>{formatPaiement(selectedReservation.methode_paiement)}</Text>
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="pricetag-outline" size={16} color="#666" />
            <Text style={styles.info}>
              Tarif estimé : <Text style={styles.bold}>{selectedReservation.tarif_estime} GNF</Text>
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.info}>
              Demandé le : <Text style={styles.bold}>
                {new Date(selectedReservation.date_demande).toLocaleDateString('fr-FR')} à {' '}
                {new Date(selectedReservation.date_demande).toLocaleTimeString('fr-FR')}
              </Text>
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={() => onConfirmer(selectedReservation)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.buttonText}>Confirmer la réservation</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        // Message quand aucune réservation n'est sélectionnée
        <View style={styles.noSelection}>
          <Ionicons name="information-circle-outline" size={40} color="#ccc" />
          <Text style={styles.noSelectionText}>
            Sélectionnez une réservation pour voir les détails
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 20,
  },
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
  listContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: 15,
  },
  listTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
    color: "#333",
  },
  instructionText: {
    fontSize: 12,
    color: "#666",
    fontStyle: 'italic',
    marginBottom: 10,
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  reservationItem: {
    backgroundColor: "#f8f8f8",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  selectedItem: {
    backgroundColor: "#e8f4fd",
    borderColor: "#2196F3",
    borderWidth: 2,
  },
  itemClient: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  itemRoute: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  itemType: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  itemDate: {
    fontSize: 10,
    color: "#999",
    marginTop: 2,
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: "#f2f2f2",
    borderRadius: 20,
    padding: 20,
    margin: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  clientName: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 15,
    color: "#333",
    textAlign: "center",
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  info: {
    fontSize: 14,
    color: "#555",
    marginLeft: 8,
    flex: 1,
  },
  bold: {
    fontWeight: "600",
    color: "#000",
  },
  button: {
    backgroundColor: "#f25c3c",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  noSelection: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
  },
  noSelectionText: {
    marginTop: 10,
    fontSize: 14,
    color: "#999",
    textAlign: 'center',
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