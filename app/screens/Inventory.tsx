import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import {
  Button,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

type InventoryItem = {
  id: string;
  name: string;
  quantity: number;
  category: string;
};

const categories = ["Coffee", "Pastries", "Snacks", "Drinks"];

export default function InventoryScreen() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [newItem, setNewItem] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [search, setSearch] = useState("");

  const addItem = () => {
    if (newItem.trim() === "" || newQuantity === "") return;
    const item: InventoryItem = {
      id: Math.random().toString(),
      name: newItem,
      quantity: parseInt(newQuantity),
      category: selectedCategory,
    };
    setInventory((prev) => [...prev, item]);
    setNewItem("");
    setNewQuantity("");
  };

  const updateQuantity = (id: string, change: number) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + change) }
          : item
      )
    );
  };

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const groupedInventory = categories.map((cat) => ({
    title: cat,
    data: filteredInventory.filter((item) => item.category === cat),
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📦 Inventory</Text>

      {/* Search Bar */}
      <TextInput
        placeholder="🔍 Search items..."
        style={styles.searchInput}
        value={search}
        onChangeText={setSearch}
      />

      {/* Add New Item */}
      <TextInput
        placeholder="Item name"
        style={styles.input}
        value={newItem}
        onChangeText={setNewItem}
      />
      <TextInput
        placeholder="Quantity"
        style={styles.input}
        keyboardType="numeric"
        value={newQuantity}
        onChangeText={setNewQuantity}
      />

      {/* Category Picker */}
      <Picker
        selectedValue={selectedCategory}
        style={styles.picker}
        onValueChange={(value) => setSelectedCategory(value)}
      >
        {categories.map((cat) => (
          <Picker.Item key={cat} label={cat} value={cat} />
        ))}
      </Picker>

      <Button title="➕ Add Item" onPress={addItem} />

      {/* Inventory List */}
      <SectionList
        sections={groupedInventory}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDetails}>
                Qty: {item.quantity} | {item.category}
              </Text>
            </View>

            {/* Plus Minus Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => updateQuantity(item.id, -1)}
              >
                <Text style={styles.actionText}>➖</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => updateQuantity(item.id, 1)}
              >
                <Text style={styles.actionText}>➕</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        renderSectionHeader={({ section }) =>
          section.data.length > 0 ? (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f9f9f9" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 8,
    color: "#333",
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  itemName: { fontSize: 16, fontWeight: "600" },
  itemDetails: { fontSize: 14, color: "#555" },
  actions: { flexDirection: "row" },
  actionBtn: {
    marginLeft: 8,
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 8,
  },
  actionText: { fontSize: 18 },
});
