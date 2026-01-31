"use client";

import { Paper, Text, Center } from "@mantine/core";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useStore } from "@/lib/store";
import { useMemo } from "react";
import dayjs from "dayjs";

// Mantine color palette (matching with categories)
const COLORS = [
    "#228be6", // blue
    "#40c057", // green
    "#fab005", // yellow
    "#fd7e14", // orange
    "#fa5252", // red
    "#be4bdb", // violet
    "#15aabf", // cyan
    "#82c91e", // lime
    "#e64980", // pink
    "#7950f2", // grape
];

export default function CategoryChart() {
    const { expenses, categories, viewMode, currentUser } = useStore();
    const currentMonth = dayjs().format("YYYY-MM");

    const chartData = useMemo(() => {
        // Filter expenses by scope and month
        const filtered = expenses.filter(e => {
            const isMonthMatch = dayjs(e.date).format("YYYY-MM") === currentMonth;
            if (!isMonthMatch) return false;
            if (viewMode === "personal" && e.scope !== "personal") return false;
            if (viewMode === "shared" && e.scope !== "shared") return false;
            return e.type === "expense" || e.type === undefined;
        });

        // Group by category
        const categoryTotals: Record<string, number> = {};
        filtered.forEach(e => {
            categoryTotals[e.categoryId] = (categoryTotals[e.categoryId] || 0) + e.amount;
        });

        // Convert to chart data format
        return Object.entries(categoryTotals).map(([categoryId, amount]) => {
            const category = categories.find(c => c.id === categoryId);
            return {
                name: category?.name || "その他",
                value: amount,
                icon: category?.icon || "📦",
            };
        }).sort((a, b) => b.value - a.value);
    }, [expenses, categories, viewMode, currentUser, currentMonth]);

    const total = chartData.reduce((acc, item) => acc + item.value, 0);

    if (chartData.length === 0) {
        return (
            <Paper p="lg" radius="lg" withBorder>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="md">
                    カテゴリー内訳 (Category Breakdown)
                </Text>
                <Center h={200}>
                    <Text c="dimmed" size="sm">データがまだありません</Text>
                </Center>
            </Paper>
        );
    }

    return (
        <Paper p="lg" radius="lg" withBorder>
            <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="md">
                カテゴリー内訳 (Category Breakdown)
            </Text>
            <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        labelLine={false}
                    >
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                                stroke="white"
                                strokeWidth={2}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value) => [`¥${(value as number).toLocaleString()}`, ""]}
                        contentStyle={{ borderRadius: 8, border: "1px solid #eee" }}
                    />
                    <Legend
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                        formatter={(value, entry: any) => {
                            const item = chartData.find(d => d.name === value);
                            const percent = total > 0 ? ((item?.value || 0) / total * 100).toFixed(0) : 0;
                            return `${item?.icon || ""} ${value} (${percent}%)`;
                        }}
                        wrapperStyle={{ fontSize: 12 }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </Paper>
    );
}
