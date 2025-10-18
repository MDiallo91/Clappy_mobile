import React from 'react';
import { Marker, Polyline } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { primary } from "../../constants/colors";

// composant qui place les point

interface MapMarkersProps {
    startCoord: any;
    destCoord: any;
    routeCoords: any[];
}

const MapMarkers: React.FC<MapMarkersProps> = ({ 
    startCoord, 
    destCoord, 
    routeCoords 
}) => {
    return (
        <>
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
            {routeCoords.length > 0 && (
                <Polyline 
                    coordinates={routeCoords} 
                    strokeWidth={6} 
                    strokeColor={primary} 
                />
            )}
        </>
    );
};

export default MapMarkers;