import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Controller } from "react-hook-form";
import Confirmation from "./confirmation";

const primary = "#EE6841";

export default function InscriptionView({
  control, errors, step, setStep,
  handleTelephone, handleVerification, handleSubmit, onSubmit, loading
}: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inscription</Text>

      {/* Étape 1 */}
      {step === 1 && (
        <>
          <Text>Téléphone :</Text>
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
                placeholder="Entrez votre téléphone"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.telephone && <Text style={styles.error}>{errors.telephone.message}</Text>}
          <TouchableOpacity style={styles.button} onPress={handleTelephone} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Envoyer le code</Text>}
          </TouchableOpacity>
        </>
      )}

      {/* Étape 2 */}
      {step === 2 && <Confirmation control={control} onCodeChange={handleVerification} loading={loading} />}

      {/* Étape 3 */}
      {step === 3 && (
        <>
          <Text>Email :</Text>
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
                placeholder="Entrez votre email"
              />
            )}
          />
          {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

          <Text>Prénom :</Text>
          <Controller control={control} name="prenom" rules={{ required: "Obligatoire" }}
            render={({ field: { onChange, value } }) => (
              <TextInput style={styles.input} onChangeText={onChange} value={value} placeholder="Entrez votre prénom" />
            )}
          />
          {errors.prenom && <Text style={styles.error}>{errors.prenom.message}</Text>}

          <Text>Nom :</Text>
          <Controller control={control} name="nom" rules={{ required: "Obligatoire" }}
            render={({ field: { onChange, value } }) => (
              <TextInput style={styles.input} onChangeText={onChange} value={value} placeholder="Entrez votre nom" />
            )}
          />
          {errors.nom && <Text style={styles.error}>{errors.nom.message}</Text>}

          <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Terminer</Text>}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center", color: primary },
  input: { borderWidth: 1.5, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 10 },
  error: { color: "red", marginBottom: 10 },
  button: { backgroundColor: primary, padding: 12, borderRadius: 8, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
