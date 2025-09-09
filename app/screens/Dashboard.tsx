import { isToday, parseISO } from "date-fns";
import React, { useMemo } from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { Card, Divider, ProgressBar, Text } from "react-native-paper";

// Mock sales + inventory data
const mockSalesData = [
  { date: "2025-09-08", product: "Latte", quantity: 5, price: 150 },
  { date: "2025-09-08", product: "Espresso", quantity: 3, price: 120 },
  { date: "2025-09-09", product: "Cappuccino", quantity: 4, price: 140 },
  { date: "2025-09-09", product: "Latte", quantity: 6, price: 150 },
  { date: "2025-09-09", product: "Mocha", quantity: 2, price: 160 },
];

const mockInventoryData = [
  { product: "Latte Beans", stock: 2, lowStockThreshold: 5 },
  { product: "Espresso Beans", stock: 12, lowStockThreshold: 5 },
  { product: "Milk", stock: 1, lowStockThreshold: 3 },
];

export default function Dashboard() {
  const salesData = mockSalesData;
  const inventoryData = mockInventoryData;

  // Today's sales
  const todaySales = useMemo(
    () => (salesData || []).filter((s) => isToday(parseISO(s.date))),
    [salesData]
  );
  const todayRevenue = todaySales.reduce(
    (sum, s) => sum + s.quantity * s.price,
    0
  );
  const todayOrders = todaySales.reduce((sum, s) => sum + s.quantity, 0);

  // Best seller today
  const bestSeller = (() => {
    const grouped: Record<string, number> = {};
    todaySales.forEach((s) => {
      grouped[s.product] = (grouped[s.product] || 0) + s.quantity;
    });
    const sorted = Object.entries(grouped).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : "N/A";
  })();

  // Product revenue share for PieChart (safe version)
  const productRevenueData = (() => {
    const grouped: Record<string, number> = {};
    todaySales.forEach((s) => {
      grouped[s.product] =
        (grouped[s.product] || 0) + s.quantity * s.price;
    });

    const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#8BC34A", "#FF9800"];

    return Object.entries(grouped)
      .filter(([_, revenue]) => typeof revenue === "number" && revenue > 0)
      .map(([product, revenue], i) => ({
        name: product,
        population: Number(revenue),
        color: colors[i % colors.length] || "#999", // always defined
        legendFontColor: "#333",
        legendFontSize: 14,
      }));
  })();

  // Low stock alerts
  const lowStock = (inventoryData || []).filter(
    (item) => item.stock <= item.lowStockThreshold
  );

  return (
    <ScrollView style={styles.container}>
      {/* KPIs */}
      <View style={styles.row}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.kpiLabel}>Revenue Today</Text>
            <Text style={styles.kpiValue}>₱{todayRevenue}</Text>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.kpiLabel}>Orders Today</Text>
            <Text style={styles.kpiValue}>{todayOrders}</Text>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.row}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.kpiLabel}>Best Seller</Text>
            <Text style={styles.kpiValue}>{bestSeller}</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Product revenue distribution (PieChart) */}
      <Card style={styles.fullCard}>
        <Card.Content>
          <Text style={styles.sectionHeader}>Revenue by Product</Text>
          {productRevenueData.length > 0 ? (
            <PieChart
              data={productRevenueData}
              width={Dimensions.get("window").width - 40}
              height={220}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          ) : (
            <Text style={{ marginTop: 10 }}>No sales yet today.</Text>
          )}
        </Card.Content>
      </Card>

      {/* Low stock alerts */}
      <Card style={styles.fullCard}>
        <Card.Content>
          <Text style={styles.sectionHeader}>Low Stock Alerts</Text>
          <Divider style={{ marginVertical: 6 }} />
          {lowStock.length === 0 ? (
            <Text>✅ All stocks are sufficient.</Text>
          ) : (
            lowStock.map((item, i) => (
              <View key={i} style={{ marginBottom: 10 }}>
                <View style={styles.row}>
                  <Text style={styles.prodName}>{item.product}</Text>
                  <Text style={styles.prodRight}>
                    {item.stock} left (min {item.lowStockThreshold})
                  </Text>
                </View>
                <ProgressBar
                  progress={item.stock / (item.lowStockThreshold + 5)}
                  style={styles.progress}
                />
              </View>
            ))
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 10 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  card: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 12,
    elevation: 3,
  },
  fullCard: {
    marginVertical: 10,
    borderRadius: 12,
    elevation: 3,
  },
  kpiLabel: { fontSize: 14, color: "#555" },
  kpiValue: { fontSize: 20, fontWeight: "bold" },
  sectionHeader: { fontSize: 16, fontWeight: "bold" },
  prodName: { fontSize: 14, fontWeight: "600" },
  prodRight: { fontSize: 13 },
  progress: { height: 6, borderRadius: 6, marginTop: 6 },
});
