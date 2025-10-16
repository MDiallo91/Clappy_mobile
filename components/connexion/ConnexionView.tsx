import React from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import { Controller } from "react-hook-form";
import { router } from "expo-router";

const primary = "#EE6841";
const { width } = Dimensions.get("window");

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
      {/* Logo et titre */}
      <View style={styles.header}>
        <Image
          source={require("@/assets/images/Clappy_logo.jpg")} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Bienvenue </Text>
        <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>
      </View>

      {/* Champ Email */}
      <View style={styles.form}>
        <Text style={styles.label}>Adresse email</Text>
        <Controller
          control={control}
          name="email"
          rules={{
            // required: "L’email est obligatoire",
            // pattern: { value: /^\S+@\S+$/i, message: "Adresse email invalide" },
          }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              onChangeText={onChange}
              value={value}
              placeholder="exemple@email.com"
              placeholderTextColor="#aaa"
            />
          )}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

        {/* Champ Mot de passe */}
        <Text style={styles.label}>Mot de passe</Text>
        <Controller
          control={control}
          name="password"
          rules={{
            required: "Le mot de passe est obligatoire",
            minLength: {
              value: 2,
              message: "Le mot de passe doit contenir au moins 6 caractères",
            },
          }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              secureTextEntry
              style={styles.input}
              onChangeText={onChange}
              value={value}
              placeholder="••••••••"
              placeholderTextColor="#aaa"
            />
          )}
        />
        {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

        {/* Bouton Connexion */}
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

        {/* Lien vers inscription */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Vous n’avez pas de compte ? </Text>
          <TouchableOpacity onPress={() => router.push("/inscription")}>
            <Text style={styles.linkText}>Créer un compte</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingVertical: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: primary,
  },
  subtitle: {
    fontSize: 15,
    color: "#555",
    marginTop: 5,
  },
  form: {
    width: "90%",
    backgroundColor: "#fdfdfd",
    borderRadius: 12,
    padding: 20,
    elevation: 2,
  },
  label: {
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    marginBottom: 15,
    backgroundColor: "#fafafa",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    fontSize: 13,
  },
  button: {
    backgroundColor: primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 5,
    shadowColor: primary,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
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
