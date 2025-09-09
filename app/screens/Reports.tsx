import {
  eachWeekOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import React, { useMemo, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { BarChart } from "react-native-chart-kit";
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
  const [viewType, setViewType] = useState<"daily" | "weekly" | "monthly">(
    "daily"
  );
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

  // Month picker state
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

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

  // Monthly breakdown
  const monthlyBreakdown = (month: Date) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);

    const weeks = eachWeekOfInterval(
      { start: monthStart, end: monthEnd },
      { weekStartsOn: 1 }
    );

    const weekRevenues: number[] = [];
    const weekLabels: string[] = [];

    weeks.forEach((weekStart, i) => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      let total = 0;
      salesData.forEach((sale) => {
        const d = parseISO(sale.date);
        if (isWithinInterval(d, { start: weekStart, end: weekEnd })) {
          total += sale.quantity * sale.price;
        }
      });
      weekRevenues.push(total);
      weekLabels.push(`Week ${i + 1}`);
    });

    const productGrouped: Record<string, { qty: number; revenue: number }> = {};
    salesData
      .filter((s) => {
        const d = parseISO(s.date);
        return isWithinInterval(d, { start: monthStart, end: monthEnd });
      })
      .forEach((sale) => {
        if (!productGrouped[sale.product]) {
          productGrouped[sale.product] = { qty: 0, revenue: 0 };
        }
        productGrouped[sale.product].qty += sale.quantity;
        productGrouped[sale.product].revenue += sale.quantity * sale.price;
      });

    return { weekLabels, weekRevenues, productGrouped };
  };

  // Date picker confirm
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

  // Month picker confirm
  const handleMonthConfirm = (date: Date) => {
    setSelectedMonth(date);
    setShowMonthPicker(false);
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
        <View style={{ alignItems: "center", marginVertical: 10 }}>
          {viewType === "daily" ? (
            // 🔹 DAILY VIEW
            <View style={{ width: Dimensions.get("window").width - 20 }}>
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

              {(() => {
                const breakdown = dailyBreakdown(selectedDate);
                const ranked = Object.entries(breakdown).sort(
                  (a, b) => b[1].revenue - a[1].revenue
                );
                const totalForDay = ranked.reduce(
                  (sum, [, d]) => sum + d.revenue,
                  0
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
                      fromZero
                      yAxisLabel="₱"
                      yAxisSuffix=""
                      chartConfig={chartConfig}
                      style={{ borderRadius: 12, marginBottom: 12 }}
                    />

                    <Card style={{ marginHorizontal: 5, borderRadius: 12 }}>
                      <Card.Content>
                        <Text style={styles.breakdownTitle}>
                          Products (High → Low)
                        </Text>
                        <Divider style={{ marginVertical: 6 }} />
                        {ranked.map(([prod, details], i) => {
                          const share =
                            totalForDay > 0
                              ? details.revenue / totalForDay
                              : 0;
                          return (
                            <View key={i} style={{ marginBottom: 10 }}>
                              <View style={styles.row}>
                                <Text style={styles.prodName}>
                                  {i + 1}. {prod}
                                </Text>
                                <Text style={styles.prodRight}>
                                  {details.qty} pcs · ₱{details.revenue}
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
                          Total: ₱{totalForDay}
                        </Text>
                      </Card.Content>
                    </Card>
                  </>
                );
              })()}
            </View>
          ) : viewType === "weekly" ? (
            // 🔹 WEEKLY VIEW
            <View style={{ width: Dimensions.get("window").width - 20 }}>
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

              {(() => {
                // Build days of the week
                const days: Date[] = [];
                for (
                  let d = selectedWeek.start;
                  d <= selectedWeek.end;
                  d = new Date(d.getTime() + 86400000)
                ) {
                  days.push(new Date(d));
                }

                const dayLabels: string[] = [];
                const dayRevenues: number[] = [];
                days.forEach((day) => {
                  const dailySales = salesData.filter((s) =>
                    isWithinInterval(parseISO(s.date), {
                      start: day,
                      end: day,
                    })
                  );
                  const revenue = dailySales.reduce(
                    (sum, s) => sum + s.quantity * s.price,
                    0
                  );
                  dayLabels.push(format(day, "EEE"));
                  dayRevenues.push(revenue);
                });

                const totalForWeek = dayRevenues.reduce((a, b) => a + b, 0);
                const productGrouped = weeklyBreakdown(
                  selectedWeek.start,
                  selectedWeek.end
                );
                const ranked = Object.entries(productGrouped).sort(
                  (a, b) => b[1].revenue - a[1].revenue
                );

                return (
                  <>
                    <Text style={styles.sectionHeader}>
                      {format(selectedWeek.start, "MMM d")} -{" "}
                      {format(selectedWeek.end, "MMM d, yyyy")} – Revenue per
                      Day
                    </Text>
                    <BarChart
                      data={{
                        labels: dayLabels,
                        datasets: [{ data: dayRevenues }],
                      }}
                      width={Dimensions.get("window").width - 30}
                      height={250}
                      fromZero
                      yAxisLabel="₱"
                      yAxisSuffix=""
                      chartConfig={chartConfig}
                      style={{ borderRadius: 12, marginBottom: 12 }}
                    />

                    <Card
                      style={{
                        marginHorizontal: 5,
                        marginTop: 12,
                        borderRadius: 12,
                      }}
                    >
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
                          return (
                            <View key={i} style={{ marginBottom: 10 }}>
                              <View style={styles.row}>
                                <Text style={styles.prodName}>
                                  {i + 1}. {prod}
                                </Text>
                                <Text style={styles.prodRight}>
                                  {details.qty} pcs · ₱{details.revenue}
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
            // 🔹 MONTHLY VIEW
            <View style={{ width: Dimensions.get("window").width - 20 }}>
              <Button
                mode="outlined"
                onPress={() => setShowMonthPicker(true)}
                style={{ marginBottom: 10 }}
              >
                Select Month (Current: {format(selectedMonth, "MMMM yyyy")})
              </Button>
              <DateTimePickerModal
                isVisible={showMonthPicker}
                mode="date"
                onConfirm={handleMonthConfirm}
                onCancel={() => setShowMonthPicker(false)}
              />

              {(() => {
                const { weekLabels, weekRevenues, productGrouped } =
                  monthlyBreakdown(selectedMonth);
                const totalForMonth = weekRevenues.reduce((a, b) => a + b, 0);
                const ranked = Object.entries(productGrouped).sort(
                  (a, b) => b[1].revenue - a[1].revenue
                );

                return (
                  <>
                    <Text style={styles.sectionHeader}>
                      {format(selectedMonth, "MMMM yyyy")} – Revenue by Week
                    </Text>
                    <BarChart
                      data={{
                        labels: weekLabels,
                        datasets: [{ data: weekRevenues }],
                      }}
                      width={Dimensions.get("window").width - 30}
                      height={250}
                      fromZero
                      yAxisLabel="₱"
                      yAxisSuffix=""
                      chartConfig={chartConfig}
                      style={{ borderRadius: 12, marginBottom: 12 }}
                    />

                    <Card style={{ marginHorizontal: 5, borderRadius: 12 }}>
                      <Card.Content>
                        <Text style={styles.breakdownTitle}>
                          Products (High → Low)
                        </Text>
                        <Divider style={{ marginVertical: 6 }} />
                        {ranked.map(([prod, details], i) => {
                          const share =
                            totalForMonth > 0
                              ? details.revenue / totalForMonth
                              : 0;
                          return (
                            <View key={i} style={{ marginBottom: 10 }}>
                              <View style={styles.row}>
                                <Text style={styles.prodName}>
                                  {i + 1}. {prod}
                                </Text>
                                <Text style={styles.prodRight}>
                                  {details.qty} pcs · ₱{details.revenue}
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
                          Total: ₱{totalForMonth}
                        </Text>
                      </Card.Content>
                    </Card>
                  </>
                );
              })()}
            </View>
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
});
