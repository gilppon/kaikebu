"use client";

import { Card, Text, Progress, Stack, Group, Paper } from "@mantine/core";
import { useStore } from "@/lib/store";
import dayjs from "dayjs";
import { useMemo } from "react";
import { getNaggingMessage } from "@/lib/nagging";

export default function BudgetCard() {
    const { budgets, expenses, currentUser, viewMode } = useStore();

    const currentMonth = dayjs().format("YYYY-MM");

    // Find budget for current family and month
    // For MVP, assuming one global budget per family per month
    const budgetData = budgets.find(
        b => b.familyId === currentUser?.familyId && b.month === currentMonth
    );

    const totalBudget = budgetData?.totalBudget || 0;

    const totalSpent = useMemo(() => {
        return expenses
            .filter(e => {
                const isMonthMatch = dayjs(e.date).format("YYYY-MM") === currentMonth;
                if (!isMonthMatch) return false;
                if (viewMode === 'personal' && e.userId !== currentUser?.id) return false;
                return e.type === 'expense' || !e.type; // Only expenses
            })
            .reduce((acc, curr) => acc + curr.amount, 0);
    }, [expenses, currentMonth, viewMode, currentUser]);

    const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const isOverBudget = percentage > 100;
    const isWarning = percentage > 80;

    return (
        <Card padding="lg">
            <Stack gap="xs">
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    予算状況
                </Text>
                <Group justify="space-between">
                    <Text fw={700}>
                        ¥{totalSpent.toLocaleString()} / ¥{totalBudget.toLocaleString()}
                    </Text>
                    <Text c={isOverBudget ? "red" : "dimmed"} size="sm" fw={700}>
                        {percentage.toFixed(0)}%
                    </Text>
                </Group>
                <Progress
                    value={Math.min(percentage, 100)}
                    size="xl"
                    radius="xl"
                    color={isOverBudget ? 'red' : (isWarning ? 'orange' : 'blue')}
                />

                {totalBudget === 0 && (
                    <Text size="xs" c="dimmed">今月の予算は設定されていません。</Text>
                )}

                {/* AI Nagging Message */}
                {totalBudget > 0 && (
                    <Paper p="sm" radius="md" bg={isOverBudget ? "red.1" : (isWarning ? "orange.1" : "blue.1")}>
                        <Group align="flex-start" gap="xs">
                            <Text size="lg">🤖</Text>
                            <div>
                                <Text size="xs" fw={700} c={isOverBudget ? "red.8" : (isWarning ? "orange.8" : "blue.8")}>
                                    AI アシスタント ({currentUser?.naggingStyle === 'strict' ? '厳格' : (currentUser?.naggingStyle === 'humorous' ? 'ユーモア' : 'フレンドリー')})
                                </Text>
                                <Text size="sm" c="dark.9" style={{ whiteSpace: 'pre-wrap' }}>
                                    {getNaggingMessage(currentUser?.naggingStyle || "friendly", percentage)}
                                </Text>
                            </div>
                        </Group>
                    </Paper>
                )}
            </Stack>
        </Card>
    );
}
