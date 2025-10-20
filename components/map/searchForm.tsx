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
import { Alert } from 'react-native';

interface SearchFormProps {
    start: string;
    destination: string;
    startSuggestions: any[];
    destSuggestions: any[];
    distance: string | null;
    duration: string | null;
    loading: boolean;
    onStartChange: (text: string) => void;
    onDestinationChange: (text: string) => void;
    onSelectSuggestion: (item: any, type: "start" | "dest") => void;
    onTraceRoute: () => void;
    onClose: () => void;
}

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
    
    const handleTraceRoute = () => {
        console.log("🔄 Bouton Suivant cliqué");
        console.log("Start:", start);
        console.log("Destination:", destination);
        
        if (!start || start === "📍 Chargement position..." || start === "📍 Position non disponible") {
            Alert.alert("Point de départ requis", "Veuillez attendre que votre position soit disponible ou sélectionner un point de départ");
            return;
        }
        
        if (!destination || destination.trim() === "") {
            Alert.alert("Destination requise", "Veuillez sélectionner une destination");
            return;
        }
        
        console.log("✅ Validation passée, appel de onTraceRoute");
        onTraceRoute();
    };

    const isFormValid = start && 
                       start !== "📍 Chargement position..." && 
                       start !== "📍 Position non disponible" && 
                       destination && 
                       destination.trim() !== "";

    return (
        <View style={styles.searchContainer}>
            <View style={styles.headerForm}>
                <Text style={{ fontWeight: "bold", fontSize: 16 }}>Réserver un trajet</Text>
                <TouchableOpacity onPress={onClose}>
                    <Ionicons name="close" size={24} color="black" />
                </TouchableOpacity>
            </View>

            <TextInput
                placeholder="Départ (obligatoire)"
                value={start}
                style={styles.input}
                onChangeText={onStartChange}
            />
            {startSuggestions.length > 0 && (
                <SuggestionsList
                    suggestions={startSuggestions}
                    onSelect={(item) => onSelectSuggestion(item, "start")}
                />
            )}

            <TextInput
                placeholder="Destination (obligatoire)"
                value={destination}
                style={styles.input}
                onChangeText={onDestinationChange}
            />
            {destSuggestions.length > 0 && (
                <SuggestionsList
                    suggestions={destSuggestions}
                    onSelect={(item) => onSelectSuggestion(item, "dest")}
                />
            )}

            <TouchableOpacity 
                style={[
                    styles.button, 
                    (!isFormValid || loading) && styles.buttonDisabled
                ]} 
                onPress={handleTraceRoute}
                disabled={!isFormValid || loading}
            >
                <Text style={styles.btnText}>
                    {loading ? "Calcul en cours..." : "Suivant"}
                </Text>
            </TouchableOpacity>

            {distance && (
                <Text style={styles.infoText}>
                    Distance : {distance}
                </Text>
            )}
        </View>
    );
};

const SuggestionsList: React.FC<{
    suggestions: any[];
    onSelect: (item: any) => void;
}> = ({ suggestions, onSelect }) => (
    <FlatList
        data={suggestions}
        keyExtractor={(item, i) => i.toString()}
        renderItem={({ item }) => (
            <TouchableOpacity 
                onPress={() => onSelect(item)} 
                style={styles.suggestionItem}
            >
                <Text>{item.name} {item.city || ""}</Text>
            </TouchableOpacity>
        )}
        style={styles.suggestionsList}
    />
);

const styles = StyleSheet.create({
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
    suggestionsList: {
        maxHeight: 150,
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
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    btnText: { 
        color: "#fff", 
        fontWeight: "bold" 
    },
    infoText: {
        marginTop: 8,
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
    },
});

export default SearchForm;