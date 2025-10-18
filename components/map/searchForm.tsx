import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { primary } from "../../constants/colors";

// Définition des propriétés (props) que le composant SearchForm accepte
interface SearchFormProps {
    start: string;                      // Texte saisi pour le point de départ
    destination: string;                // Texte saisi pour la destination
    startSuggestions: any[];            // Liste des suggestions pour le départ
    destSuggestions: any[];             // Liste des suggestions pour la destination
    distance: string | null;            // Distance calculée du trajet (ex: "5.25 km")
    duration: string | null;            // Durée calculée du trajet (ex: "15 min")
    loading: boolean;                   // État de chargement (true pendant le calcul)
    onStartChange: (text: string) => void;          // Callback quand le texte de départ change
    onDestinationChange: (text: string) => void;    // Callback quand le texte de destination change
    onSelectSuggestion: (item: any, type: "start" | "dest") => void; // Callback quand une suggestion est sélectionnée
    onTraceRoute: () => void;           // Callback pour lancer le calcul d'itinéraire
    onClose: () => void;                // Callback pour fermer le formulaire
}

/**
 * COMPOSANT PRINCIPAL : SearchForm
 * 
 * Ce composant affiche un formulaire de recherche de trajet avec :
 * - Deux champs de texte pour départ et destination
 * - Des suggestions d'adresses en temps réel
 * - Un bouton pour lancer le calcul d'itinéraire
 * - Affichage des informations du trajet (distance)
 */
const SearchForm: React.FC<SearchFormProps> = ({
    start,
    destination,
    startSuggestions,
    destSuggestions,
    distance,
    duration,
    loading,
    onStartChange,
    onDestinationChange,
    onSelectSuggestion,
    onTraceRoute,
    onClose,
}) => {
    return (
        // Conteneur principal du formulaire qui flotte au-dessus de la carte
        <View style={styles.searchContainer}>
            
            {/* En-tête avec titre et bouton de fermeture */}
            <View style={styles.headerForm}>
                <Text style={{ fontWeight: "bold", fontSize: 16 }}>Réserver un trajet</Text>
                <TouchableOpacity onPress={onClose}>
                    <Ionicons name="close" size={24} color="black" />
                </TouchableOpacity>
            </View>

            {/* CHAMP DE TEXTE : Point de départ */}
            <TextInput
                placeholder="Départ"                    // Texte indicatif
                value={start}                           // Valeur contrôlée du champ
                style={styles.input}
                onChangeText={onStartChange}            // Appelé à chaque frappe
            />
            
            {/* AFFICHAGE CONDITIONNEL : Suggestions pour le départ */}
            {/* Affiche la liste seulement s'il y a des suggestions */}
            {startSuggestions.length > 0 && (
                <SuggestionsList
                    suggestions={startSuggestions}
                    onSelect={(item) => onSelectSuggestion(item, "start")}
                />
            )}                  

            {/* CHAMP DE TEXTE : Destination */}
            <TextInput
                placeholder="Destination"
                value={destination}
                style={styles.input}
                onChangeText={onDestinationChange}
            />
            
            {/* AFFICHAGE CONDITIONNEL : Suggestions pour la destination */}
            {destSuggestions.length > 0 && (
                <SuggestionsList
                    suggestions={destSuggestions}
                    onSelect={(item) => onSelectSuggestion(item, "dest")}
                />
            )}

            {/* BOUTON : Lancer le calcul d'itinéraire */}
            <TouchableOpacity 
                style={styles.button} 
                onPress={onTraceRoute}      // Appelé quand on appuie sur le bouton
                disabled={loading}          // Désactivé pendant le chargement
            >
                <Text style={styles.btnText}>
                    {/* Texte changeant selon l'état de chargement */}
                    {loading ? "chargement..." : "Suivant"}
                </Text>
            </TouchableOpacity>

            {/* AFFICHAGE CONDITIONNEL : Informations du trajet calculé */}
            {/* Affiche seulement quand la distance est disponible */}
            {distance && duration && (
                <Text style={styles.infoText}>
                    Distance : {distance}
                    {/* La durée est commentée mais pourrait être affichée plus tard */}
                    {/* | Durée : {duration} */}
                </Text>
            )}
        </View>
    );
};

/**
 * SOUS-COMPOSANT : SuggestionsList
 * 
 * Affiche une liste déroulante de suggestions d'adresses
 * Utilise FlatList pour des performances optimales avec de longues listes
 */
const SuggestionsList: React.FC<{
    suggestions: any[];                // Liste des suggestions à afficher
    onSelect: (item: any) => void;     // Callback quand un élément est sélectionné
}> = ({ suggestions, onSelect }) => (
    <FlatList
        data={suggestions}              // Données à afficher
        keyExtractor={(item, i) => i.toString()}  // Clé unique pour chaque élément
        renderItem={({ item }) => (     // Fonction pour rendre chaque élément
            <TouchableOpacity 
                onPress={() => onSelect(item)}  // Appelé quand on appuie sur une suggestion
                style={styles.suggestionItem}
            >
                {/* Affichage du nom du lieu et de la ville si disponible */}
                <Text>{item.name} {item.city || ""}</Text>
            </TouchableOpacity>
        )}
    />
);

/**
 * STYLES : Définition de l'apparence des éléments
 */
const styles = StyleSheet.create({
    // Conteneur principal du formulaire
    searchContainer: {
        position: "absolute",    // Position absolue pour flotter au-dessus
        top: 30,                 // 30px du haut de l'écran
        left: 10,                // 10px de la gauche
        right: 10,               // 10px de la droite
        backgroundColor: "#fff", // Fond blanc
        borderRadius: 10,        // Coins arrondis
        padding: 10,             // Espacement intérieur
        elevation: 6,            // Ombre sur Android
        zIndex: 10,              // Au-dessus des autres éléments
    },
    
    // En-tête avec titre et bouton fermer
    headerForm: {
        flexDirection: "row",           // Alignement horizontal
        justifyContent: "space-between",// Titre à gauche, bouton à droite
        alignItems: "center",           // Centré verticalement
        marginBottom: 8,                // Espace en dessous
    },
    
    // Style des champs de texte
    input: {
        backgroundColor: "#f2f2f2",     // Fond gris clair
        borderRadius: 8,                // Coins arrondis
        padding: 8,                     // Espacement intérieur
        marginBottom: 6,                // Espace entre les champs
    },
    
    // Style de chaque élément de suggestion
    suggestionItem: {
        padding: 8,                     // Espacement intérieur
        borderBottomWidth: 1,           // Ligne de séparation
        borderColor: "#ddd",            // Couleur grise pour la ligne
    },
    
    // Style du bouton principal
    button: {
        backgroundColor: primary,       // Couleur principale (orange)
        padding: 12,                    // Espacement intérieur
        borderRadius: 8,                // Coins arrondis
        alignItems: "center",           // Centrage horizontal du texte
        marginTop: 6,                   // Espace au-dessus
    },
    
    // Style du texte du bouton
    btnText: { 
        color: "#fff",                  // Texte blanc
        fontWeight: "bold"              // Texte en gras
    },
    
    // Style des informations du trajet
    infoText: {
        marginTop: 8,                  
        fontSize: 16,                  
        fontWeight: "bold",            
        textAlign: "center",            // Centré horizontalement
    },
});

export default SearchForm;