import React from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Controller } from "react-hook-form";
import { router } from "expo-router"; // ✅ Import du router Expo

const primary = "#EE6841";

interface ConnexionViewProps {
  control: any;
  errors: any;
  handleSubmit: any;
  onSubmit: (data: any) => void;
  loading: boolean;
}

export default function ConnexionView({
  control,
  errors,
  handleSubmit,
  onSubmit,
  loading,
}: ConnexionViewProps) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Connexion</Text>

      {/* Champ Email */}
      <Text>Email :</Text>
      <Controller
        control={control}
        name="email"
        rules={{
          required: "L’email est obligatoire",
          pattern: { value: /^\S+@\S+$/i, message: "Adresse email invalide" },
        }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            onChangeText={onChange}
            value={value}
            placeholder="Entrez votre email"
          />
        )}
      />
      {errors.email && (
        <Text style={styles.errorText}>{errors.email.message}</Text>
      )}

      {/* Champ Mot de passe */}
      <Text>Mot de passe :</Text>
      <Controller
        control={control}
        name="password"
        rules={{
          required: "Le mot de passe est obligatoire",
          minLength: {
            value: 6,
            message: "Le mot de passe doit contenir au moins 6 caractères",
          },
        }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            secureTextEntry
            style={styles.input}
            onChangeText={onChange}
            value={value}
            placeholder="Entrez votre mot de passe"
          />
        )}
      />
      {errors.password && (
        <Text style={styles.errorText}>{errors.password.message}</Text>
      )}

      {/* Bouton de soumission */}
      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Se connecter</Text>
        )}
      </TouchableOpacity>

      {/* ✅ Lien vers inscription */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Vous n’avez pas de compte ? </Text>
        <TouchableOpacity onPress={() => router.push("/inscription")}>
          <Text style={styles.linkText}>S’inscrire</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 40,
    marginTop: 60,
    textAlign: "center",
    color: primary,
  },
  input: {
    borderWidth: 2,
    borderColor: "gray",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  errorText: { color: "red", marginBottom: 10 },
  button: {
    backgroundColor: primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: "#555",
  },
  linkText: {
    fontSize: 14,
    color: primary,
    fontWeight: "bold",
  },
});
