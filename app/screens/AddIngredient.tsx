import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Menu, TextInput } from "react-native-paper";

export default function AddIngredient({ navigation }) {
  const [ingredientName, setIngredientName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);

  const categories = ["Coffee", "Drinks", "Snacks", "Essentials"];

  return (
    <View style={styles.container}>
      

      {/* Ingredient Input */}
      <TextInput
        label="Ingredient Name"
        placeholder="e.g. Sugar"
        mode="outlined"
        value={ingredientName}
        onChangeText={setIngredientName}
        style={styles.input}
      />

      {/* Quantity Input (Strictly integers only) */}
      <TextInput
        label="Quantity"
        placeholder="e.g. 10"
        mode="outlined"
        keyboardType="numeric"
        value={quantity}
        onChangeText={(text) => {
          if (/^\d*$/.test(text)) {
            setQuantity(text);
          }
        }}
        style={styles.input}
      />

      {/* Category Dropdown */}
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <Button
            mode="outlined"
            style={styles.input}
            onPress={() => setMenuVisible(true)}
          >
            {category || "Select Category"}
          </Button>
        }
      >
        {categories.map((cat) => (
          <Menu.Item
            key={cat}
            onPress={() => {
              setCategory(cat);
              setMenuVisible(false);
            }}
            title={cat}
          />
        ))}
      </Menu>

      {/* Save Button */}
      <Button
        mode="contained"
        style={styles.saveButton}
        onPress={() => {
          console.log("Ingredient saved:", { ingredientName, quantity, category });
          navigation.goBack(); // 👈 Redirects back to Inventory tab
        }}
      >
        Save Ingredient
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  input: {
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 16,
    borderRadius: 8,
    backgroundColor: "#6D4C41",
    paddingVertical: 6,
  },
});
