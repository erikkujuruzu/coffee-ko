import Ionicons from "@expo/vector-icons/Ionicons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";

import Dashboard from "./screens/Dashboard";
import Inventory from "./screens/Inventory";
import Reports from "./screens/Reports";
import Sales from "./screens/Sales";

const Tab = createBottomTabNavigator();

export default function Layout() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "Dashboard") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Inventory") {
            iconName = focused ? "cube" : "cube-outline";
          } else if (route.name === "Sales") {
            iconName = focused ? "cash" : "cash-outline";
          } else if (route.name === "Reports") {
            iconName = focused ? "document-text" : "document-text-outline";
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
      <Tab.Screen name="Inventory" component={Inventory} />
      <Tab.Screen name="Sales" component={Sales} />
      <Tab.Screen name="Reports" component={Reports} />
    </Tab.Navigator>
  );
}
