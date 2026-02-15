import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Controller } from "react-hook-form";

const primary = "#EE6841";

export default function ProfilUpdateView({
  control,
  errors,
  handleSubmit,
  onSubmit,
  loading,
}: any) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Modifier vos informations</Text>

      {/* Téléphone */}
      <Text style={styles.label}>Téléphone</Text>
      <Controller
        control={control}
        name="telephone"
        rules={{
          required: "Le téléphone est obligatoire",
          pattern: {
            value: /^[0-9]{8,15}$/,
            message: "Numéro invalide",
          },
        }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            keyboardType="phone-pad"
            style={styles.input}
            value={value}
            onChangeText={onChange}
            placeholder="620000000"
          />
        )}
      />
      {errors.telephone && (
        <Text style={styles.error}>{errors.telephone.message}</Text>
      )}

      {/* Email */}
      <Text style={styles.label}>Email</Text>
      <Controller
        control={control}
        name="email"
        rules={{
          required: "L'email est obligatoire",
          pattern: {
            value: /^\S+@\S+$/i,
            message: "Email invalide",
          },
        }}
        render={({ field: { value } }) => (
          <TextInput
            style={[styles.input, { backgroundColor: "#eee" }]}
            value={value}
            editable={false}
          />
        )}
      />
      {errors.email && (
        <Text style={styles.error}>{errors.email.message}</Text>
      )}

      {/* Prénom */}
      <Text style={styles.label}>Prénom</Text>
      <Controller
        control={control}
        name="prenom"
        rules={{ required: "Le prénom est obligatoire" }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChange}
            placeholder="Votre prénom"
          />
        )}
      />
      {errors.prenom && (
        <Text style={styles.error}>{errors.prenom.message}</Text>
      )}

      {/* Nom */}
      <Text style={styles.label}>Nom</Text>
      <Controller
        control={control}
        name="nom"
        rules={{ required: "Le nom est obligatoire" }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChange}
            placeholder="Votre nom"
          />
        )}
      />
      {errors.nom && <Text style={styles.error}>{errors.nom.message}</Text>}

      {/* Mot de passe */}
      {/* <Text style={styles.label}>Mot de passe (optionnel)</Text>
      <Controller
        control={control}
        name="password"
        rules={{
          minLength: {
            value: 6,
            message: "Minimum 6 caractères",
          },
        }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChange}
            secureTextEntry
            placeholder="Laisser vide pour ne pas changer"
          />
        )}
      />
      {errors.password && (
        <Text style={styles.error}>{errors.password.message}</Text>
      )} */}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Enregistrer</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    marginTop:50,
    backgroundColor: "white",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 10, 
    marginTop: 30,
  },
  logo: {
    width: 220,
    height: 160,
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
    color: "black",
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
    paddingHorizontal:60,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    marginLeft: 5,
  },
  secondaryButton: {
    backgroundColor: "#ccc",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    flex: 1,
    marginRight: 5,
  },
  btnText: { 
    color: "#fff", 
    fontWeight: "bold", 
    fontSize: 16 
  },

  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
});