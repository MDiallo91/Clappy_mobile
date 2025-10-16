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
  console.log("Informations saisies :", data);

  // 🔹 Transformer email en username
  const utilisateur = {
    username: data.email.trim(),
    password: data.password,
  };

  try {
    const { status } = await UtilisateurService.login(utilisateur);
    console.log("Le statut", status);

    if (status === 200) {
      Toast.show({
        type: "success",
        text1: "Connexion réussie 🎉",
        text2: "Bienvenue sur votre compte !",
      });
      router.push("/");
    }
  } catch (err) {
    Toast.show({
      type: "error",
      text1: "Erreur de connexion",
      text2: "Email ou mot de passe incorrect.",
    });
  } finally {
     router.push("/");
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
