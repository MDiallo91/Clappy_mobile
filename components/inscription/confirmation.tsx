import React from "react";
import { View, Text, TextInput, StyleSheet, ActivityIndicator } from "react-native";
import { Controller } from "react-hook-form";


const primary = "#EE6841";

export default function Confirmation({ control, onCodeChange, loading }: any) {
  return (
    <View>
      <Text style={styles.text}>Saisissez le code confirmation </Text>
      <Controller
        control={control}
        name="confirmation"
        rules={{ required: "Le code est obligatoire" }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            keyboardType="number-pad"
            maxLength={6}
            style={styles.codeInput}
            value={value}
            onChangeText={(txt) => {
              onChange(txt);
              onCodeChange(txt);
            }}
            placeholder="------"
          />
        )}
      />
      {loading && <ActivityIndicator style={{ marginTop: 10 }} color={primary}/>}
    </View>
  );
}

const styles = StyleSheet.create({
  text: { fontSize: 16, marginBottom: 10 },
  codeInput: {
    borderBottomWidth: 2,
    borderColor: "#EE6841",
    textAlign: "center",
    fontSize: 22,
    letterSpacing: 8,
    paddingVertical: 10,
  },
});
