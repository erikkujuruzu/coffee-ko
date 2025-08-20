import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Card } from "react-native-paper";

type ReportType = "sales" | "inventory" | "summary";

export default function ReportsScreen() {
  const [selectedReport, setSelectedReport] = useState<ReportType>("sales");

  // Mock data (later we’ll fetch from backend / database)
  const salesData = [
    { id: "1", item: "Latte", qty: 25, total: 250 },
    { id: "2", item: "Cappuccino", qty: 18, total: 180 },
    { id: "3", item: "Espresso", qty: 30, total: 300 },
  ];

  const inventoryData = [
    { id: "1", item: "Coffee Beans", stock: 10, unit: "kg" },
    { id: "2", item: "Milk", stock: 20, unit: "liters" },
    { id: "3", item: "Sugar", stock: 15, unit: "kg" },
  ];

  const summaryData = {
    totalSales: 730,
    bestSeller: "Espresso",
    lowStock: "Coffee Beans",
  };

  const renderReport = () => {
    switch (selectedReport) {
      case "sales":
        return (
          <FlatList
            data={salesData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Card style={styles.card}>
                <Card.Content>
                  <Text style={styles.item}>{item.item}</Text>
                  <Text>Qty Sold: {item.qty}</Text>
                  <Text>Total: ₱{item.total}</Text>
                </Card.Content>
              </Card>
            )}
          />
        );
      case "inventory":
        return (
          <FlatList
            data={inventoryData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Card style={styles.card}>
                <Card.Content>
                  <Text style={styles.item}>{item.item}</Text>
                  <Text>Stock: {item.stock} {item.unit}</Text>
                </Card.Content>
              </Card>
            )}
          />
        );
      case "summary":
        return (
          <View style={styles.summaryBox}>
            <Text style={styles.summaryText}>
              Total Sales: ₱{summaryData.totalSales}
            </Text>
            <Text style={styles.summaryText}>
              Best Seller: {summaryData.bestSeller}
            </Text>
            <Text style={styles.summaryText}>
              Low Stock Item: {summaryData.lowStock}
            </Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Reports</Text>

      <Picker
        selectedValue={selectedReport}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedReport(itemValue as ReportType)}
      >
        <Picker.Item label="Sales Report" value="sales" />
        <Picker.Item label="Inventory Report" value="inventory" />
        <Picker.Item label="Summary" value="summary" />
      </Picker>

      <View style={styles.reportContainer}>{renderReport()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  picker: { height: 50, marginBottom: 16 },
  reportContainer: { flex: 1 },
  card: { marginBottom: 10, backgroundColor: "#f8f8f8" },
  item: { fontSize: 18, fontWeight: "600" },
  summaryBox: {
    padding: 20,
    backgroundColor: "#e6f2ff",
    borderRadius: 10,
  },
  summaryText: { fontSize: 16, marginBottom: 8 },
});
