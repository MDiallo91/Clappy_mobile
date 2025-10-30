import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Toast from "react-native-toast-message";
import { router } from "expo-router";
import UtilisateurService from "@/services/userService";
import InscriptionView from "./inscriptionView";

export default function InscriptionContainer() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const { control, handleSubmit, trigger, getValues, formState: { errors } } = useForm({
    defaultValues: { 
      telephone: "", 
      nom: "", 
      prenom: "", 
      email: "",
      password:""
    },
  });

  // Étape 1 : Vérification du téléphone
  const handleTelephone = async () => {
    const isValid = await trigger("telephone");
    if (!isValid) return;

    setLoading(true);
    const { telephone } = getValues();

    try {
      // Vérifier si le téléphone existe déjà
      const response = await UtilisateurService.checkTelephoneExists(telephone);
      
      if (!response.exists) {
        // Le numéro n'existe pas, on passe à l'étape 2
        setStep(2);
        Toast.show({ 
          type: "success", 
          text1: "Numéro disponible" 
        });
      } else {
        // Le numéro existe déjà
        Toast.show({ 
          type: "error", 
          text1: "Numéro déjà utilisé",
          text2: "Ce numéro est déjà associé à un compte" 
        });
      }
    } catch (error) {
      // En cas d'erreur, on passe quand même à l'étape 2
      // (meilleure expérience utilisateur)
      setStep(2);
      Toast.show({ 
        type: "info", 
        text1: "Continuez l'inscription",
        text2: "Vérification du numéro impossible" 
      });
    } finally {
      setLoading(false);
    }
  };

// Étape 2 : Création du compte
const onSubmit = async (data: any) => {
  setLoading(true);
  console.log("📝 Données du formulaire:", data);
  
  try {
    // Utiliser le service corrigé
    const response = await UtilisateurService.addUtilisateur(data);
    
    console.log("📨 Réponse du service:", response);
    
    if (response.status === 200 || response.status === 201) {
      Toast.show({ 
        type: "success", 
        text1: "Compte créé avec succès!",
        text2: "Vous pouvez maintenant vous connecter" 
      });
      router.push("/connexion");
    } else {
      // Gérer les erreurs spécifiques
      const errorMessage = response.message.toLowerCase();
      
      if (errorMessage.includes("déjà utilisé") || 
          errorMessage.includes("existe déjà") ||
          errorMessage.includes("déjà associé")) {
        Toast.show({ 
          type: "error", 
          text1: "Numéro déjà utilisé",
          text2: "Ce numéro est déjà associé à un compte" 
        });
        setStep(1); // Retour à l'étape 1
      } else if (errorMessage.includes("email")) {
        Toast.show({ 
          type: "error", 
          text1: "Email déjà utilisé",
          text2: "Cet email est déjà associé à un compte" 
        });
      } else {
        Toast.show({ 
          type: "error", 
          text1: "Erreur", 
          text2: response.message || "Impossible de créer le compte" 
        });
      }
    }
  } catch (error: any) {
    console.error("❌ Erreur catch:", error);
    Toast.show({ 
      type: "error", 
      text1: "Erreur", 
      text2: error.message || "Veuillez réessayer" 
    });
  } finally {
    setLoading(false);
  }
};
  return (
    <InscriptionView
      step={step}
      setStep={setStep}
      control={control}
      errors={errors}
      loading={loading}
      handleTelephone={handleTelephone}
      handleSubmit={handleSubmit}
      onSubmit={onSubmit}
    />
  );
}