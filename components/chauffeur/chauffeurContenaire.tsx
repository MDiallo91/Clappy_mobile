import React, { useState } from "react";
import ReservationView from "./chauffeurView";
import Toast from "react-native-toast-message";
import { router } from "expo-router";

export default function ReservationContenaire() {
  const [loading, setLoading] = useState(false);

  const reservation = {
    client: "CISSE FODE",
    depart: "Waninadara",
    arrivee: "Cosa",
    typeVoiture: "Climatisé",
    payement: "Compte marchand",
  };

  const confirmerReservation = async () => {
    try {
      setLoading(true);
      console.log("✅ Réservation confirmée :", reservation);

      // Simule un délai réseau
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Toast.show({
        type: "success",
        text1: "Réservation confirmée 🎉",
        text2: `Départ : ${reservation.depart} ➜ ${reservation.arrivee}`,
      });

      // Redirection après confirmation
      router.push("/");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Impossible de confirmer la réservation.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReservationView
      reservation={reservation}
      loading={loading}
      onConfirmer={confirmerReservation}
    />
  );
}
