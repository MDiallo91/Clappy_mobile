import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Toast from "react-native-toast-message";
import UtilisateurService from "@/services/userService";
import ProfilUpdateView from "./updatProfilView";
import { View, ActivityIndicator ,Text} from "react-native";


interface Chauffeur {
  telephone?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  username:string;
  client_id?:number;
}

interface FormValues {
  telephone: string;
  prenom: string;
  nom: string;
  email: string;
  // password: string;
}
const primary = "#EE6841";

export default function ProfilUpdatContainer() {
  const [loading, setLoading] = useState(false);
  const [chauffeur, setChauffeur] = useState<Chauffeur | null>(null);
  const [loadingChauffeur, setLoadingChauffeur] = useState(true);


  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      telephone: "",
      prenom: "",
      nom: "",
      email: "",
      // password: "",
    },
  });

  // Charger l'utilisateur connecté
 useEffect(() => {
  const fetchChauffeur = async () => {
    try {
      setLoadingChauffeur(true);
      const userData = await UtilisateurService.getUser();
      setChauffeur(userData);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Impossible de récupérer les informations",
      });
    } finally {
      setLoadingChauffeur(false);
    }
  };

  fetchChauffeur();
}, []);


  //  Remplir le formulaire quand chauffeur est chargé
  useEffect(() => {
    if (chauffeur) {
      reset({
        telephone: chauffeur.telephone ||chauffeur.username ,
        prenom: chauffeur.first_name ?? "",
        nom: chauffeur.last_name ?? "",
        email: chauffeur.email ?? "",
        // password: "",
      });
    }
  }, [chauffeur, reset]);

  //  Soumission
  const onSubmit = async (data: FormValues) => {
    setLoading(true);

    try {
      const payload = {
        ...data,
        // password: data.password || undefined, // ne pas envoyer si vide
      };

      const response = await UtilisateurService.updateUtilisateur(payload,chauffeur?.client_id);

      if (response?.status === 200 || response?.status === 201) {
        Toast.show({
          type: "success",
          text1: "Succès",
          text2: "Profil mis à jour",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Erreur",
          text2: response?.message || "Échec de la mise à jour",
        });
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: error?.message || "Veuillez réessayer",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
 <>
    {loadingChauffeur ? (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={primary} />
        <Text>chargement...</Text>
      </View>
    ) : (
      <ProfilUpdateView
        control={control}
        errors={errors}
        loading={loading}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
      />
    )}
  </>
  );
}
