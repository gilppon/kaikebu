"use client";

import { Card, Text, Group, Stack, ThemeIcon, Progress, Alert } from "@mantine/core";
import { useStore } from "@/lib/store";
import dayjs from "dayjs";
import { useMemo } from "react";
import { IconTrendingUp, IconAlertTriangle, IconCheck } from "@tabler/icons-react";

export default function PredictionCard() {
    const { expenses, budgets, currentUser, viewMode } = useStore();
    const currentMonth = dayjs().format("YYYY-MM");
    const today = dayjs();
    const daysInMonth = today.daysInMonth();
    const currentDay = today.date();
    const remainingDays = daysInMonth - currentDay;

    // Calculate Total Spent
    const totalSpent = useMemo(() => {
        return expenses
            .filter(e => {
                const isMonthMatch = dayjs(e.date).format("YYYY-MM") === currentMonth;
                if (!isMonthMatch) return false;
                if (viewMode === 'personal' && e.scope !== 'personal') return false;
                if (viewMode === 'shared' && e.scope !== 'shared') return false;
                return e.type === 'expense' || !e.type;
            })
            .reduce((acc, curr) => acc + curr.amount, 0);
    }, [expenses, currentMonth, viewMode, currentUser]);

    // Get Budget - Filter by scope (viewMode)
    const budgetData = budgets.find(
        b => b.familyId === currentUser?.familyId && b.month === currentMonth && b.scope === viewMode
    );
    const totalBudget = budgetData?.totalBudget || 0;

    // Linear Projection Logic
    const dailyAverage = currentDay > 0 ? totalSpent / currentDay : 0;
    const projectedTotal = totalSpent + (dailyAverage * remainingDays);
    const projectedBalance = totalBudget - projectedTotal;
    const isDanger = projectedTotal > totalBudget;

    // "Broke in X Days" Logic
    let daysUntilBroke = null;
    if (totalBudget > 0 && dailyAverage > 0) {
        const remainingBudget = totalBudget - totalSpent;
        if (remainingBudget > 0) {
            const daysLeft = remainingBudget / dailyAverage;
            if (daysLeft < remainingDays) {
                daysUntilBroke = Math.floor(daysLeft);
            }
        } else {
            daysUntilBroke = 0; // Already broke
        }
    }

    if (totalBudget === 0) return null;

    return (
        <Card padding="lg" radius="lg" withBorder style={{ borderColor: isDanger ? 'red' : undefined }}>
            <Stack gap="sm">
                <Group justify="space-between" align="flex-start">
                    <div>
                        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                            AI 未来予測 (AI Future Prediction)
                        </Text>
                        <Text size="xl" fw={800} c={isDanger ? "red" : "teal"}>
                            {isDanger ? "赤字予報" : "黒字予報"}
                        </Text>
                    </div>
                    <ThemeIcon
                        variant="light"
                        color={isDanger ? "red" : "teal"}
                        size="lg"
                        radius="xl"
                    >
                        {isDanger ? <IconAlertTriangle size={20} /> : <IconTrendingUp size={20} />}
                    </ThemeIcon>
                </Group>

                <Group align="flex-end" gap={4}>
                    <Text size="sm" c="dimmed">月末予想残高:</Text>
                    <Text fw={700} c={isDanger ? "red" : "teal"}>
                        {projectedBalance >= 0 ? "+" : ""}{Math.round(projectedBalance).toLocaleString()}円
                    </Text>
                </Group>

                {isDanger && daysUntilBroke !== null && daysUntilBroke > 0 && (
                    <Alert variant="light" color="red" title="警告" icon={<IconAlertTriangle size={16} />}>
                        このペースだと、あと<span style={{ fontWeight: 800, fontSize: '1.1em' }}> {daysUntilBroke}日 </span>で予算がつきます。
                    </Alert>
                )}

                {isDanger && daysUntilBroke === 0 && (
                    <Alert variant="light" color="red" title="警告" icon={<IconAlertTriangle size={16} />}>
                        既に予算を超過しています！支出を直ちに停止してください。
                    </Alert>
                )}

                {!isDanger && (
                    <Text size="xs" c="dimmed">
                        現在のペースなら、月末には約 {Math.round(totalBudget - projectedTotal).toLocaleString()}円 余る見込みです。
                    </Text>
                )}
            </Stack>
        </Card>
    );
}
