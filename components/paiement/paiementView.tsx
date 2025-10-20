// paiementView.tsx
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const primary = "#EE6841";

interface PaiementViewProps {
  courseData: {
    vehicleType: string;
    price: number;
    distance: string;
    duration: string;
    start: string;
    destination: string;
  };
  selectedPaymentMethod: string;
  onPaymentMethodSelect: (method: string) => void;
  onPayment: () => void;
  loading: boolean;
}

const paymentMethods = [
    { id: 'orange', name: 'Orange Money', icon: 'phone-portrait' },
    { id: 'mtn', name: 'MTN Money', icon: 'phone-portrait' },
    { id: 'wave', name: 'Wave', icon: 'card' },
    { id: 'cash', name: 'Espèces', icon: 'cash' },
    { id: 'card', name: 'Carte Bancaire', icon: 'card' },
];

export default function PaiementView({
  courseData,
  selectedPaymentMethod,
  onPaymentMethodSelect,
  onPayment,
  loading
}: PaiementViewProps) {

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Paiement</Text>
            </View>

            {/* Récapitulatif du trajet */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Récapitulatif du trajet</Text>
                <View style={styles.tripInfo}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Véhicule:</Text>
                        <Text style={styles.infoValue}>{courseData.vehicleType}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Distance:</Text>
                        <Text style={styles.infoValue}>{courseData.distance}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Durée estimée:</Text>
                        <Text style={styles.infoValue}>{courseData.duration}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>De:</Text>
                        <Text style={styles.infoValue}>{courseData.start}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>À:</Text>
                        <Text style={styles.infoValue}>{courseData.destination}</Text>
                    </View>
                </View>
            </View>

            {/* Prix total */}
            <View style={styles.priceSection}>
                <Text style={styles.totalPrice}>{courseData.price} GNF</Text>
                <Text style={styles.priceLabel}>Total à payer</Text>
            </View>

            {/* Méthodes de paiement */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Choisir le mode de paiement</Text>
                {paymentMethods.map((method) => (
                    <TouchableOpacity
                        key={method.id}
                        style={[
                            styles.paymentMethod,
                            selectedPaymentMethod === method.id && styles.selectedPaymentMethod,
                        ]}
                        onPress={() => onPaymentMethodSelect(method.id)}
                        disabled={loading}
                    >
                        <View style={styles.methodInfo}>
                            <Ionicons 
                                name={method.icon as any} 
                                size={24} 
                                color={selectedPaymentMethod === method.id ? primary : '#666'} 
                            />
                            <Text style={[
                                styles.methodName,
                                selectedPaymentMethod === method.id && styles.selectedMethodName,
                            ]}>
                                {method.name}
                            </Text>
                        </View>
                        {selectedPaymentMethod === method.id && (
                            <Ionicons name="checkmark-circle" size={24} color={primary} />
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            {/* Bouton de confirmation */}
            <TouchableOpacity 
                style={[
                    styles.payButton,
                    loading && styles.payButtonDisabled
                ]} 
                onPress={onPayment}
                disabled={loading || !selectedPaymentMethod}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.payButtonText}>
                        Payer {courseData.price} GNF
                    </Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    section: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    tripInfo: {
        backgroundColor: '#f8f8f8',
        padding: 16,
        borderRadius: 8,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
    },
    priceSection: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFF5F2',
        margin: 16,
        borderRadius: 12,
    },
    totalPrice: {
        fontSize: 32,
        fontWeight: 'bold',
        color: primary,
    },
    priceLabel: {
        fontSize: 16,
        color: '#666',
        marginTop: 4,
    },
    paymentMethod: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        marginBottom: 8,
    },
    selectedPaymentMethod: {
        borderColor: primary,
        backgroundColor: '#FFF5F2',
    },
    methodInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    methodName: {
        fontSize: 16,
        color: '#333',
        marginLeft: 12,
    },
    selectedMethodName: {
        color: primary,
        fontWeight: '600',
    },
    payButton: {
        backgroundColor: primary,
        margin: 16,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    payButtonDisabled: {
        backgroundColor: '#ccc',
    },
    payButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});