import React, { useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface Sale {
  id: string;
  product: string;
  quantity: number;
  total: number;
  date: string;
}

export default function SalesScreen() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  const addSale = () => {
    if (!product || !quantity || !price) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    const newSale: Sale = {
      id: Date.now().toString(),
      product,
      quantity: Number(quantity),
      total: Number(quantity) * Number(price),
      date: new Date().toLocaleString(),
    };

    setSales((prev) => [...prev, newSale]);
    setProduct("");
    setQuantity("");
    setPrice("");
  };

  const totalSales = sales.reduce((sum, s) => sum + s.total, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Sales</Text>

      {/* Input Fields */}
      <TextInput
        placeholder="Product Name"
        value={product}
        onChangeText={setProduct}
        style={styles.input}
      />
      <TextInput
        placeholder="Quantity"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Price per Item"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button title="Add Sale" onPress={addSale} />

      {/* Sales List */}
      <Text style={styles.subHeader}>Transactions</Text>
      <FlatList
        data={sales}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.saleItem}>
            <Text style={styles.saleText}>
              {item.product} - {item.quantity} pcs - ₱{item.total}
            </Text>
            <Text style={styles.saleDate}>{item.date}</Text>
          </View>
        )}
      />

      {/* Summary */}
      <Text style={styles.totalText}>Total Sales: ₱{totalSales}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  subHeader: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  saleItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  saleText: {
    fontSize: 16,
  },
  saleDate: {
    fontSize: 12,
    color: "#666",
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    textAlign: "center",
  },
});
