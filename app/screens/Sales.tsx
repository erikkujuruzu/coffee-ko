import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Sales() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>💰 Sales</Text>
      <Text>View daily, weekly, and monthly sales reports here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
});
