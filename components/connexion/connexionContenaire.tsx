import React, { useState } from "react";
import ConnexionView from "./ConnexionView";
import UtilisateurService from "@/services/userService";
import Toast from "react-native-toast-message";
import { router } from "expo-router";
import { useForm } from "react-hook-form";

function ConnexionContenaire() {
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    // console.log("Informations saisies :", data);

    // Transformer email en username
    const utilisateur = {
      username: data.email.trim(),
      password: data.password,
    };

    try {
      // ✅ CORRECTION : Attendre le résultat complet
      const result = await UtilisateurService.login(utilisateur);
      // console.log("Résultat login:", result);

      if (result.status === 'success') {
        Toast.show({
          type: "success",
          text1: "Connexion réussie 🎉",
          text2: "Bienvenue sur votre compte !",
        });
        router.push("/inscription");
        router.push("/");
      }
    } catch (err: any) {
      // console.error("Erreur détaillée:", err);
      
      //  Message d'erreur 
      let errorMessage = "Email ou mot de passe incorrect.";
      
      if (err.message.includes("401") || err.message.includes("Authentication")) {
        errorMessage = "Identifiants incorrects. Vérifiez votre nom d'utilisateur et mot de passe.";
      } else if (err.message.includes("Network")) {
        errorMessage = "Problème de connexion. Vérifiez votre internet.";
      }
      
      Toast.show({
        type: "error",
        text1: "Erreur de connexion",
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConnexionView
      control={control}
      errors={errors}
      handleSubmit={handleSubmit}
      onSubmit={onSubmit}
      loading={loading}
    />
  );
}

export default ConnexionContenaire;