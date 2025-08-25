import React, { useMemo, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import {
  Appbar,
  Button,
  Card,
  Divider,
  ProgressBar,
  Text,
} from "react-native-paper";

export default function ReportsTab() {
  const [viewType, setViewType] = useState<"daily" | "weekly" | "monthly">(
    "daily"
  );

  // Dummy simulated sales data (per day, per product)
  const salesData = [
    { date: "2025-08-15", product: "Latte", quantity: 5, price: 150 },
    { date: "2025-08-15", product: "Espresso", quantity: 3, price: 120 },
    { date: "2025-08-16", product: "Cappuccino", quantity: 4, price: 140 },
    { date: "2025-08-17", product: "Latte", quantity: 7, price: 150 },
    { date: "2025-08-17", product: "Mocha", quantity: 2, price: 160 },
    { date: "2025-08-18", product: "Espresso", quantity: 6, price: 120 },
    { date: "2025-08-18", product: "Latte", quantity: 0, price: 150 }, // out of stock sold 0
  ];

  // --- Helpers ---
  // Aggregate totals for weekly/monthly
  const aggregateData = () => {
    const grouped: Record<string, number> = {};
    for (const sale of salesData) {
      const revenue = sale.quantity * sale.price;
      let key = "";
      if (viewType === "daily") key = sale.date;
      else if (viewType === "weekly") key = "Week of " + sale.date.slice(0, 7);
      else if (viewType === "monthly") key = sale.date.slice(0, 7);
      grouped[key] = (grouped[key] || 0) + revenue;
    }
    return grouped;
  };

  // Daily breakdown per product for a given date
  const dailyBreakdown = (date: string) => {
    const grouped: Record<string, { qty: number; revenue: number }> = {};
    salesData
      .filter((s) => s.date === date)
      .forEach((sale) => {
        if (!grouped[sale.product]) {
          grouped[sale.product] = { qty: 0, revenue: 0 };
        }
        grouped[sale.product].qty += sale.quantity;
        grouped[sale.product].revenue += sale.quantity * sale.price;
      });
    return grouped;
  };

  // --- DAILY: mock hourly revenue for the top chart (like battery usage) ---
  // If you later have real per-hour data, just replace this map.
  const hourlyRevenue: Record<string, number[]> = {
    // 7 points (e.g., 8AM, 10AM, 12PM, 2PM, 4PM, 6PM, 8PM)
    "2025-08-15": [200, 350, 500, 420, 300, 250, 180],
    "2025-08-16": [120, 210, 260, 310, 280, 240, 190],
    "2025-08-17": [150, 220, 320, 400, 380, 330, 200],
    "2025-08-18": [90, 150, 230, 260, 240, 180, 120],
  };

  // If a date has no hourly data above, scale a simple curve to the day's total:
  const getHourlyForDate = (date: string, totalForDate: number) => {
    const preset = hourlyRevenue[date];
    if (preset) return preset;
    // default 7-point shape, normalized then scaled to roughly match the total
    const base = [1, 2, 3, 3, 2, 2, 1];
    const sum = base.reduce((a, b) => a + b, 0);
    const unit = totalForDate / sum;
    return base.map((v) => Math.round(v * unit));
  };

  // --- Derived values for summary cards ---
  const grouped = aggregateData();
  const labels = Object.keys(grouped);
  const dataPoints = Object.values(grouped);

  const totalRevenue = useMemo(
    () => dataPoints.reduce((a, b) => a + b, 0),
    [dataPoints]
  );
  const totalTransactions = salesData.length;

  return (
    <View style={styles.container}>
      {/* Appbar */}
      <Appbar.Header style={{ backgroundColor: "#6D4C41" }}>
        <Appbar.Content title="Reports" color="#fff" />
      </Appbar.Header>

      {/* Toggle buttons */}
      <View style={styles.toggleContainer}>
        <Button
          mode={viewType === "daily" ? "contained" : "outlined"}
          onPress={() => setViewType("daily")}
          style={styles.toggleBtn}
        >
          Daily
        </Button>
        <Button
          mode={viewType === "weekly" ? "contained" : "outlined"}
          onPress={() => setViewType("weekly")}
          style={styles.toggleBtn}
        >
          Weekly
        </Button>
        <Button
          mode={viewType === "monthly" ? "contained" : "outlined"}
          onPress={() => setViewType("monthly")}
          style={styles.toggleBtn}
        >
          Monthly
        </Button>
      </View>

      <ScrollView>
        {/* Summary cards */}
        <View style={styles.summaryContainer}>
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Total Sales</Text>
              <Text style={styles.cardValue}>₱{totalRevenue}</Text>
            </Card.Content>
          </Card>
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Transactions</Text>
              <Text style={styles.cardValue}>{totalTransactions}</Text>
            </Card.Content>
          </Card>
        </View>

        {/* MAIN CONTENT */}
        <View style={{ alignItems: "center", marginVertical: 10 }}>
          {viewType === "daily" ? (
            // DAILY: per date – top revenue trend chart + ranked product list
            labels.map((date, idx) => {
              const breakdown = dailyBreakdown(date);
              const totalForDate = Object.values(breakdown).reduce(
                (sum, d) => sum + d.revenue,
                0
              );
              const hours = ["8", "10", "12", "14", "16", "18", "20"];
              const hourData = getHourlyForDate(date, totalForDate);

              // Rank products (by revenue desc)
              const ranked = Object.entries(breakdown).sort(
                (a, b) => b[1].revenue - a[1].revenue
              );

              return (
                <View
                  key={idx}
                  style={{ width: Dimensions.get("window").width - 20 }}
                >
                  {/* Revenue trend like battery usage */}
                  <Text style={styles.sectionHeader}>
                    {date} – Revenue Trend
                  </Text>
                  <LineChart
                    data={{
                      labels: hours,
                      datasets: [{ data: hourData }],
                    }}
                    width={Dimensions.get("window").width - 30}
                    height={220}
                    yAxisLabel="₱"
                    yAxisSuffix=""
                    chartConfig={chartConfig}
                    bezier
                    style={{ borderRadius: 12, marginBottom: 12 }}
                  />

                  {/* Ranked product list with progress bars */}
                  <Card style={{ marginHorizontal: 5, borderRadius: 12 }}>
                    <Card.Content>
                      <Text style={styles.breakdownTitle}>
                        Products (High → Low)
                      </Text>
                      <Divider style={{ marginVertical: 6 }} />
                      {ranked.map(([prod, details], i) => {
                        const share =
                          totalForDate > 0 ? details.revenue / totalForDate : 0;
                        const isLow = details.qty <= 10 && details.qty > 0;
                        const isZero = details.qty === 0;

                        return (
                          <View key={i} style={{ marginBottom: 10 }}>
                            <View style={styles.row}>
                              <Text
                                style={[
                                  styles.prodName,
                                  isZero
                                    ? styles.outOfStockText
                                    : isLow
                                    ? styles.lowText
                                    : null,
                                ]}
                              >
                                {i + 1}. {prod}
                              </Text>
                              <Text
                                style={[
                                  styles.prodRight,
                                  isZero
                                    ? styles.outOfStockText
                                    : isLow
                                    ? styles.lowText
                                    : null,
                                ]}
                              >
                                {isZero ? "0 pcs" : `${details.qty} pcs`} · ₱
                                {details.revenue}
                              </Text>
                            </View>
                            <ProgressBar
                              progress={share}
                              style={styles.progress}
                            />
                          </View>
                        );
                      })}
                      <Divider style={{ marginTop: 8 }} />
                      <Text style={{ marginTop: 8, fontWeight: "bold" }}>
                        Total: ₱{totalForDate}
                      </Text>
                    </Card.Content>
                  </Card>

                  <View style={{ height: 18 }} />
                </View>
              );
            })
          ) : (
            // WEEKLY / MONTHLY unchanged summary (line chart)
            <LineChart
              data={{
                labels,
                datasets: [{ data: dataPoints }],
              }}
              width={Dimensions.get("window").width - 30}
              height={220}
              yAxisLabel="₱"
              yAxisSuffix=""
              chartConfig={chartConfig}
              bezier
              style={{ borderRadius: 12 }}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const chartConfig = {
  backgroundColor: "#6D4C41",
  backgroundGradientFrom: "#8D6E63",
  backgroundGradientTo: "#6D4C41",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  toggleBtn: { flex: 1, marginHorizontal: 4 },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  card: { flex: 1, marginHorizontal: 6, borderRadius: 10, elevation: 3 },
  cardTitle: { fontSize: 14, color: "#6D4C41" },
  cardValue: { fontSize: 18, fontWeight: "bold", marginTop: 4 },
  sectionHeader: { fontWeight: "bold", fontSize: 16, marginBottom: 8 },
  breakdownTitle: { fontSize: 16, fontWeight: "bold" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  prodName: { fontSize: 14, fontWeight: "600" },
  prodRight: { fontSize: 13 },
  progress: { height: 6, borderRadius: 6, marginTop: 6 },
  lowText: { color: "red", fontWeight: "bold" },
  outOfStockText: { color: "gray", fontStyle: "italic" },
});
