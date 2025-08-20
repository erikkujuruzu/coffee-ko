import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Reports() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📑 Reports</Text>
      <Text>Generate and analyze performance reports here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
});
