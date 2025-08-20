import React, { useState } from "react";
import {
    SectionList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type Item = {
  id: string;
  name: string;
  stock: number;
};

type Category = {
  title: string;
  data: Item[];
};

export default function Inventory() {
  const [categories, setCategories] = useState<Category[]>([
    {
      title: "Coffee",
      data: [
        { id: "1", name: "Espresso Beans", stock: 50 },
        { id: "2", name: "Arabica Beans", stock: 30 },
      ],
    },
    {
      title: "Ingredients",
      data: [
        { id: "3", name: "Milk (Liters)", stock: 20 },
        { id: "4", name: "Sugar (kg)", stock: 15 },
      ],
    },
    {
      title: "Pastries",
      data: [
        { id: "5", name: "Croissants", stock: 10 },
        { id: "6", name: "Muffins", stock: 8 },
      ],
    },
  ]);

  const [newItemName, setNewItemName] = useState("");
  const [newItemStock, setNewItemStock] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Coffee");

  // ➕ Add item
  const addItem = () => {
    if (
      newItemName.trim() === "" ||
      newItemStock.trim() === "" ||
      newItemCategory.trim() === ""
    )
      return;

    const newItem: Item = {
      id: Date.now().toString(),
      name: newItemName,
      stock: parseInt(newItemStock, 10),
    };

    setCategories((prev) =>
      prev.map((cat) =>
        cat.title === newItemCategory
          ? { ...cat, data: [...cat.data, newItem] }
          : cat
      )
    );

    setNewItemName("");
    setNewItemStock("");
  };

  // ❌ Remove item
  const removeItem = (categoryTitle: string, id: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.title === categoryTitle
          ? { ...cat, data: cat.data.filter((item) => item.id !== id) }
          : cat
      )
    );
  };

  // 🔼 Increase stock
  const increaseStock = (categoryTitle: string, id: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.title === categoryTitle
          ? {
              ...cat,
              data: cat.data.map((item) =>
                item.id === id ? { ...item, stock: item.stock + 1 } : item
              ),
            }
          : cat
      )
    );
  };

  // 🔽 Decrease stock
  const decreaseStock = (categoryTitle: string, id: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.title === categoryTitle
          ? {
              ...cat,
              data: cat.data.map((item) =>
                item.id === id && item.stock > 0
                  ? { ...item, stock: item.stock - 1 }
                  : item
              ),
            }
          : cat
      )
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Inventory</Text>

      {/* Add Item Form */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Item Name"
          value={newItemName}
          onChangeText={setNewItemName}
        />
        <TextInput
          style={styles.input}
          placeholder="Stock Quantity"
          keyboardType="numeric"
          value={newItemStock}
          onChangeText={setNewItemStock}
        />
        <TextInput
          style={styles.input}
          placeholder="Category (Coffee, Ingredients, Pastries)"
          value={newItemCategory}
          onChangeText={setNewItemCategory}
        />
        <TouchableOpacity style={styles.addBtn} onPress={addItem}>
          <Text style={styles.addText}>Add Item</Text>
        </TouchableOpacity>
      </View>

      {/* Sectioned Inventory List */}
      <SectionList
        sections={categories}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        renderItem={({ item, section }) => (
          <View style={styles.itemCard}>
            <View>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemStock}>Stock: {item.stock}</Text>
            </View>

            <View style={styles.actions}>
              {/* - button */}
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => decreaseStock(section.title, item.id)}
              >
                <Text style={styles.actionText}>-</Text>
              </TouchableOpacity>

              {/* + button */}
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => increaseStock(section.title, item.id)}
              >
                <Text style={styles.actionText}>+</Text>
              </TouchableOpacity>

              {/* delete */}
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => removeItem(section.title, item.id)}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 15, color: "#6D4C41" },
  form: { marginBottom: 20 },
  input: {
    backgroundColor: "#F5F5F5",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  addBtn: {
    backgroundColor: "#6D4C41",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  addText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 5,
    color: "#4E342E",
  },
  itemCard: {
    backgroundColor: "#F5F5F5",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  itemName: { fontSize: 16, fontWeight: "600" },
  itemStock: { fontSize: 14, color: "gray" },
  actions: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  actionBtn: {
    backgroundColor: "#8D6E63",
    padding: 8,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  actionText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  deleteBtn: {
    backgroundColor: "#B71C1C",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 10,
  },
  deleteText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
});
