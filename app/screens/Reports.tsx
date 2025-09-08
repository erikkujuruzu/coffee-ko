import { endOfWeek, format, isWithinInterval, parseISO, startOfWeek } from "date-fns";
import React, { useMemo, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import {
  Appbar,
  Button,
  Card,
  Divider,
  ProgressBar,
  Text,
} from "react-native-paper";

export default function ReportsTab() {
  const [viewType, setViewType] = useState<"daily" | "weekly" | "monthly">("daily");
  const [selectedDate, setSelectedDate] = useState("2025-08-15");
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Week picker state
  const [showWeekPicker, setShowWeekPicker] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const now = new Date();
    return {
      start: startOfWeek(now, { weekStartsOn: 1 }),
      end: endOfWeek(now, { weekStartsOn: 1 }),
    };
  });

  // Dummy simulated sales data
  const salesData = useMemo(
    () => [
      { date: "2025-08-15", product: "Latte", quantity: 5, price: 150 },
      { date: "2025-08-15", product: "Espresso", quantity: 3, price: 120 },
      { date: "2025-08-16", product: "Cappuccino", quantity: 4, price: 140 },
      { date: "2025-08-17", product: "Latte", quantity: 7, price: 150 },
      { date: "2025-08-17", product: "Mocha", quantity: 2, price: 160 },
      { date: "2025-08-18", product: "Espresso", quantity: 6, price: 120 },
      { date: "2025-08-18", product: "Latte", quantity: 0, price: 150 },
    ],
    []
  );

  // Aggregate totals (weekly/monthly)
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

  // Daily breakdown
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

  // Weekly breakdown
  const weeklyBreakdown = (start: Date, end: Date) => {
    const grouped: Record<string, { qty: number; revenue: number }> = {};
    salesData
      .filter((s) => {
        const d = parseISO(s.date);
        return isWithinInterval(d, { start, end });
      })
      .forEach((sale) => {
        if (!grouped[sale.product]) {
          grouped[sale.product] = { qty: 0, revenue: 0 };
        }
        grouped[sale.product].qty += sale.quantity;
        grouped[sale.product].revenue += sale.quantity * sale.price;
      });
    return grouped;
  };

  // Derived summary
  const grouped = aggregateData();
  const labels = Object.keys(grouped);
  const dataPoints = Object.values(grouped);

  const totalRevenue = useMemo(
    () => dataPoints.reduce((a, b) => a + b, 0),
    [dataPoints]
  );
  const totalTransactions = salesData.length;

  // Date picker
  const handleDateConfirm = (date: Date) => {
    const isoDate = date.toISOString().split("T")[0];
    setSelectedDate(isoDate);
    setShowDatePicker(false);
  };

  // Week picker confirm
  const handleWeekConfirm = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = endOfWeek(date, { weekStartsOn: 1 });
    setSelectedWeek({ start, end });
    setShowWeekPicker(false);
  };

  return (
    <View style={styles.container}>
      {/* Appbar */}
      <Appbar.Header style={{ backgroundColor: "#6D4C41" }}>
        <Appbar.Content title="Reports" color="#fff" />
      </Appbar.Header>

      {/* Toggle buttons */}
      <View style={styles.toggleContainer}>
        {["daily", "weekly", "monthly"].map((t) => (
          <Button
            key={t}
            mode={viewType === t ? "contained" : "outlined"}
            onPress={() => setViewType(t as any)}
            style={styles.toggleBtn}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </Button>
        ))}
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
            <View style={{ width: Dimensions.get("window").width - 20 }}>
              {/* Date selector */}
              <Button
                mode="outlined"
                onPress={() => setShowDatePicker(true)}
                style={{ marginBottom: 10 }}
              >
                Select Date (Current: {selectedDate})
              </Button>
              <DateTimePickerModal
                isVisible={showDatePicker}
                mode="date"
                onConfirm={handleDateConfirm}
                onCancel={() => setShowDatePicker(false)}
              />

              {/* Daily revenue by product */}
              {(() => {
                const breakdown = dailyBreakdown(selectedDate);
                const totalForDate = Object.values(breakdown).reduce(
                  (sum, d) => sum + d.revenue,
                  0
                );

                const ranked = Object.entries(breakdown).sort(
                  (a, b) => b[1].revenue - a[1].revenue
                );

                return (
                  <>
                    <Text style={styles.sectionHeader}>
                      {selectedDate} – Revenue by Product
                    </Text>
                    <BarChart
                      data={{
                        labels: ranked.map(([prod]) => prod),
                        datasets: [{ data: ranked.map(([_, d]) => d.revenue) }],
                      }}
                      width={Dimensions.get("window").width - 30}
                      height={250}
                      fromZero={true}
                      yAxisLabel="₱"
                      yAxisSuffix=""   // ✅ FIX
                      chartConfig={chartConfig}
                      style={{ borderRadius: 12, marginBottom: 12 }}
                    />

                    {/* Product breakdown */}
                    <Card style={{ marginHorizontal: 5, borderRadius: 12 }}>
                      <Card.Content>
                        <Text style={styles.breakdownTitle}>
                          Products (High → Low)
                        </Text>
                        <Divider style={{ marginVertical: 6 }} />
                        {ranked.map(([prod, details], i) => {
                          const share =
                            totalForDate > 0
                              ? details.revenue / totalForDate
                              : 0;
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
                  </>
                );
              })()}
            </View>
          ) : viewType === "weekly" ? (
            <View style={{ width: Dimensions.get("window").width - 20 }}>
              {/* Week selector */}
              <Button
                mode="outlined"
                onPress={() => setShowWeekPicker(true)}
                style={{ marginBottom: 10 }}
              >
                Select Week (Current:{" "}
                {`${format(selectedWeek.start, "MMM d")} - ${format(
                  selectedWeek.end,
                  "MMM d, yyyy"
                )}`}
              </Button>
              <DateTimePickerModal
                isVisible={showWeekPicker}
                mode="date"
                onConfirm={handleWeekConfirm}
                onCancel={() => setShowWeekPicker(false)}
              />

              {/* Weekly revenue by product */}
              {(() => {
                const breakdown = weeklyBreakdown(
                  selectedWeek.start,
                  selectedWeek.end
                );
                const totalForWeek = Object.values(breakdown).reduce(
                  (sum, d) => sum + d.revenue,
                  0
                );

                const ranked = Object.entries(breakdown).sort(
                  (a, b) => b[1].revenue - a[1].revenue
                );

                return (
                  <>
                    <Text style={styles.sectionHeader}>
                      {format(selectedWeek.start, "MMM d")} -{" "}
                      {format(selectedWeek.end, "MMM d, yyyy")} – Revenue by
                      Product
                    </Text>
                    <BarChart
                      data={{
                        labels: ranked.map(([prod]) => prod),
                        datasets: [{ data: ranked.map(([_, d]) => d.revenue) }],
                      }}
                      width={Dimensions.get("window").width - 30}
                      height={250}
                      fromZero={true}
                      yAxisLabel="₱"
                      yAxisSuffix=""   // ✅ FIX
                      chartConfig={chartConfig}
                      style={{ borderRadius: 12, marginBottom: 12 }}
                    />

                    {/* Product breakdown */}
                    <Card style={{ marginHorizontal: 5, borderRadius: 12 }}>
                      <Card.Content>
                        <Text style={styles.breakdownTitle}>
                          Products (High → Low)
                        </Text>
                        <Divider style={{ marginVertical: 6 }} />
                        {ranked.map(([prod, details], i) => {
                          const share =
                            totalForWeek > 0
                              ? details.revenue / totalForWeek
                              : 0;
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
                          Total: ₱{totalForWeek}
                        </Text>
                      </Card.Content>
                    </Card>
                  </>
                );
              })()}
            </View>
          ) : (
            <LineChart
              data={{
                labels,
                datasets: [{ data: dataPoints }],
              }}
              width={Dimensions.get("window").width - 30}
              height={220}
              yAxisLabel="₱"
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
