import Ionicons from "@expo/vector-icons/Ionicons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { DefaultTheme, Provider as PaperProvider } from "react-native-paper";

import AddIngredient from "./screens/AddIngredient"; // <-- import new screen
import Dashboard from "./screens/Dashboard";
import Inventory from "./screens/Inventory";
import Reports from "./screens/Reports";
import Settings from "./screens/Settings";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 🔹 Custom Theme for React Native Paper
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#6D4C41",    // Coffee brown for accents
    background: "#FFFFFF", // App background
    surface: "#FFFFFF",    // Inputs/cards background
    text: "#000000",       // Default text
    placeholder: "#888888" // Input placeholders
  },
};

// Stack for Inventory (so it can navigate to AddIngredient)
function InventoryStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="InventoryMain"
        component={Inventory}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddIngredient"
        component={AddIngredient}
        options={{
          title: "Add Ingredient",
          headerStyle: { backgroundColor: "#6D4C41" },
          headerTintColor: "#fff",
        }}
      />
    </Stack.Navigator>
  );
}

export default function Layout() {
  return (
    <PaperProvider theme={theme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = "help-circle-outline";

            if (route.name === "Dashboard") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "InventoryTab") {
              iconName = focused ? "cube" : "cube-outline";
            } else if (route.name === "Reports") {
              iconName = focused ? "document-text" : "document-text-outline";
            } else if (route.name === "Settings") {
              iconName = focused ? "settings" : "settings-outline";
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#6D4C41",
          tabBarInactiveTintColor: "gray",
          tabBarStyle: {
            backgroundColor: "#F5F5F5",
            borderTopWidth: 1,
            borderTopColor: "#ddd",
            paddingBottom: 5,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
          },
        })}
      >
        <Tab.Screen name="Dashboard" component={Dashboard} />
        {/* Use InventoryStack instead of Inventory directly */}
        <Tab.Screen
          name="InventoryTab"
          component={InventoryStack}
          options={{ title: "Inventory" }}
        />
        <Tab.Screen name="Reports" component={Reports} />
        <Tab.Screen name="Settings" component={Settings} />
      </Tab.Navigator>
    </PaperProvider>
  );
}
