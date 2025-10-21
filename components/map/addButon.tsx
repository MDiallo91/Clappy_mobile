// Boton d'ajoute de trajet


import React from 'react';
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { primary } from "../../constants/colors";

interface AddButtonProps {
    onPress: () => void;
}

const AddButton: React.FC<AddButtonProps> = ({ onPress }) => {
    return (
        <TouchableOpacity style={styles.addButton} onPress={onPress}>
            <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
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

export default AddButton;