import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
} from "react-native";
import { Controller } from "react-hook-form";
import Confirmation from "./confirmation";

const primary = "#EE6841";

export default function InscriptionView({
  control,
  errors,
  step,
  setStep,
  handleTelephone,
  handleVerification,
  handleSubmit,
  onSubmit,
  loading,
}: any) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/*  Logo en haut */}
      <View style={styles.logoContainer}>
        <Image
          source={require("@/assets/images/Clappy_logo.jpg")} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>Inscription</Text>

      {/* Étape 1 */}
      {step === 1 && (
        <>
          <Text style={styles.label}>Téléphone :</Text>
          <Controller
            control={control}
            name="telephone"
            rules={{
              required: "Le téléphone est obligatoire",
              pattern: { value: /^[0-9]{8,15}$/, message: "Numéro invalide" },
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                keyboardType="phone-pad"
                style={styles.input}
                placeholder="Ex : 620000000"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.telephone && (
            <Text style={styles.error}>{errors.telephone.message}</Text>
          )}
          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleTelephone}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Envoyer le code</Text>
            )}
          </TouchableOpacity>
        </>
      )}

      {/* Étape 2 */}
      {step === 2 && (
        <Confirmation
          control={control}
          onCodeChange={handleVerification}
          loading={loading}
        />
      )}

      {/* Étape 3 */}
      {step === 3 && (
        <>
          <Text style={styles.label}>Email :</Text>
          <Controller
            control={control}
            name="email"
            rules={{
              required: "L’email est obligatoire",
              pattern: { value: /^\S+@\S+$/i, message: "Email invalide" },
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                keyboardType="email-address"
                style={styles.input}
                onChangeText={onChange}
                value={value}
                placeholder="Ex : exemple@mail.com"
              />
            )}
          />
          {errors.email && (
            <Text style={styles.error}>{errors.email.message}</Text>
          )}

          <Text style={styles.label}>Prénom :</Text>
          <Controller
            control={control}
            name="prenom"
            rules={{ required: "Le prénom est obligatoire" }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                onChangeText={onChange}
                value={value}
                placeholder="Votre prénom"
              />
            )}
          />
          {errors.prenom && (
            <Text style={styles.error}>{errors.prenom.message}</Text>
          )}

          <Text style={styles.label}>Nom :</Text>
          <Controller
            control={control}
            name="nom"
            rules={{ required: "Le nom est obligatoire" }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                onChangeText={onChange}
                value={value}
                placeholder="Votre nom"
              />
            )}
          />
          {errors.nom && <Text style={styles.error}>{errors.nom.message}</Text>}

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Terminer</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
    // justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 10,
    marginTop: 30,
    // backgroundColor:"red"
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: primary,
    textAlign: "center",
    marginBottom: 25,
  },
  label: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#f9f9f9",
  },
  error: { color: "red", fontSize: 13, marginBottom: 8 },
  button: {
    backgroundColor: primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
