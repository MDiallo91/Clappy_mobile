import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Toast from "react-native-toast-message";
import { router, useNavigation } from "expo-router";
import UtilisateurService from "@/services/userService";
import InscriptionView from "./inscriptionView";

export default function InscriptionContainer() {
  const [etap, setEtap] = useState(1);
  const [loading, setLoading] = useState(false);
  const [telephoneTemp, setTelephoneTemp] = useState("");
  const navigation= useNavigation()
  
  const { control, handleSubmit, trigger, setValue, getValues, formState: { errors } } = useForm({
    defaultValues: { telephone: "", confirmation: "", nom: "", prenom: "", email: "" },
  });

  // Étape 1 : Envoi du code
  const handleTelephone = async () => {
    const isValid = await trigger("telephone");
    if (!isValid) return;

    setLoading(true);
    const { telephone } = getValues();

    try {
      const { status } = await UtilisateurService.addUtilisateur({ telephone });
      if (status === 422) {
        setTelephoneTemp(telephone);
        Toast.show({ type: "success", text1: "Code envoyé " });
        setEtap(2);
      }

    } catch {
      Toast.show({ type: "error", text1: "Erreur", text2: "Impossible d'envoyer le code" });
    } finally {
      setEtap(2);
      setLoading(false);
    }
  };

  // Étape 2 : Vérification du code
  const handleVerification = async (code: string) => {
    if (code.length === 6) {
      setLoading(true);
      try {
        const { status } = await UtilisateurService.updateUtilisateur({ telephone: telephoneTemp, code });
        if (status === 200) {
          Toast.show({ type: "success", text1: "Vérifié " });
          setEtap(3);
        } else {
          Toast.show({ type: "error", text1: "Code incorrect " });
        }
      } catch {
        Toast.show({ type: "error", text1: "Erreur de vérification" });
      } finally {
        setLoading(false);
        setEtap(3); //je dois enlever ce code
      }
    }
  };

  // Étape 3 : Informations personnelles
  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const { status } = await UtilisateurService.updateUtilisateur({ telephone: telephoneTemp, ...data });
      if (status === 200) {
        Toast.show({ type: "success", text1: "Compte complété " });
        router.push("/connexion");
      }
    } catch {
      Toast.show({ type: "error", text1: "Erreur", text2: "Veuillez réessayer" });
    } finally {
      setLoading(false);
      router.push("/connexion"); //code a retirer

    }
  };

  return (
    <InscriptionView
      step={etap}
      setStep={setEtap}
      control={control}
      errors={errors}
      loading={loading}
      handleTelephone={handleTelephone}
      handleVerification={handleVerification}
      handleSubmit={handleSubmit}
      onSubmit={onSubmit}
    />
  );
}
