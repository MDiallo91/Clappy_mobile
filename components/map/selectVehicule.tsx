import React, { forwardRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { VEHICLE_TYPES } from "../../constants/vehicules";
import { primary } from "../../constants/colors";

interface VehicleSelectionSheetProps {
    visible: boolean;
    distance: string | null;
    duration: string | null;
    selectedVehicle: any;
    onVehicleSelect: (vehicle: any) => void;
    onClose: () => void;
}

const VehicleSelectionSheet = forwardRef<BottomSheet, VehicleSelectionSheetProps>(
    ({ visible, distance, duration, selectedVehicle, onVehicleSelect, onClose }, ref) => {
        
        const calculatePrice = (vehicle: any) => {
            if (!distance) return 0;
            const distanceInKm = parseFloat(distance.split(' ')[0]);
            return Math.round(distanceInKm * vehicle.pricePerKm);
        };

        if (!visible) return null;

        return (
            <BottomSheet
                ref={ref}
                index={-1}
                snapPoints={['50%', '70%']}
                enablePanDownToClose={true}
                onClose={onClose}
                backgroundStyle={styles.bottomSheetBackground}
            >
                <BottomSheetView style={styles.bottomSheetContent}>
                    <View style={styles.bottomSheetHeader}>
                        <Text style={styles.bottomSheetTitle}>Choisir un véhicule</Text>
                        <TouchableOpacity onPress={onClose}>
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
                                <VehicleItem
                                    vehicle={item}
                                    price={price}
                                    isSelected={selectedVehicle?.id === item.id}
                                    onSelect={() => onVehicleSelect(item)}
                                />
                            );
                        }}
                    />
                </BottomSheetView>
            </BottomSheet>
        );
    }
);

const VehicleItem: React.FC<{
    vehicle: any;
    price: number;
    isSelected: boolean;
    onSelect: () => void;
}> = ({ vehicle, price, isSelected, onSelect }) => (
    <TouchableOpacity 
        style={[
            styles.vehicleItem,
            isSelected && styles.selectedVehicleItem
        ]}
        onPress={onSelect}
    >
        <View style={styles.vehicleInfo}>
            <Ionicons name={vehicle.icon as any} size={24} color={primary} />
            <View style={styles.vehicleDetails}>
                <Text style={styles.vehicleName}>{vehicle.name}</Text>
                <Text style={styles.vehicleDescription}>{vehicle.description}</Text>
            </View>
        </View>
        <View style={styles.priceContainer}>
            <Text style={styles.priceText}>{price} GNF</Text>
            <Text style={styles.priceDetail}>({vehicle.pricePerKm} GNF/km)</Text>
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
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

export default VehicleSelectionSheet;