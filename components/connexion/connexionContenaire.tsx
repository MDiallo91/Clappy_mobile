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
    router.push("/");

    try {
      const { status } = await UtilisateurService.login(data);
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
