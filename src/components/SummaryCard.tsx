"use client";

import { Card, Text, Group, ThemeIcon, RingProgress, Stack } from "@mantine/core";
import { useStore } from "@/lib/store";
import { IconCurrencyYen } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useMemo } from "react";

export default function SummaryCard() {
    const { expenses, budgets, currentUser, viewMode } = useStore();

    const currentMonth = dayjs().format("YYYY-MM");

    const totalSpent = useMemo(() => {
        return expenses
            .filter(e => {
                const isMonthMatch = dayjs(e.date).format("YYYY-MM") === currentMonth;
                if (!isMonthMatch) return false;
                if (viewMode === 'personal' && e.scope !== 'personal') return false;
                if (viewMode === 'shared' && e.scope !== 'shared') return false;
                return e.type === 'expense' || e.type === undefined; // Count only expenses
            })
            .reduce((acc, curr) => acc + curr.amount, 0);
    }, [expenses, currentMonth, viewMode, currentUser]);

    const totalIncome = useMemo(() => {
        return expenses
            .filter(e => {
                const isMonthMatch = dayjs(e.date).format("YYYY-MM") === currentMonth;
                if (!isMonthMatch) return false;
                if (viewMode === 'personal' && e.scope !== 'personal') return false;
                if (viewMode === 'shared' && e.scope !== 'shared') return false;
                return e.type === 'income';
            })
            .reduce((acc, curr) => acc + curr.amount, 0);
    }, [expenses, currentMonth, viewMode, currentUser]);

    // Budget Logic - Filter by scope (viewMode)
    const budgetData = budgets.find(
        b => b.familyId === currentUser?.familyId && b.month === currentMonth && b.scope === viewMode
    );
    const totalBudget = budgetData?.totalBudget || 0;
    const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const isOverBudget = percentage > 100;
    const displayPercentage = Math.min(percentage, 100);

    return (
        <Card padding="lg">
            <Group justify="space-between" align="flex-start">
                <Stack gap="xs">
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                        今月の支出 ({dayjs().format("M月")})
                    </Text>
                    <Group align="center" gap={4}>
                        <ThemeIcon variant="light" color="gray" size="lg" radius="xl">
                            <IconCurrencyYen size={20} />
                        </ThemeIcon>
                        <Text fz={32} fw={800} lh={1}>
                            {totalSpent.toLocaleString()}
                        </Text>
                    </Group>
                    {totalIncome > 0 && (
                        <Text size="xs" c="teal" fw={600}>
                            + {totalIncome.toLocaleString()} (収入)
                        </Text>
                    )}
                </Stack>

                <RingProgress
                    size={80}
                    roundCaps
                    thickness={8}
                    sections={[{ value: displayPercentage, color: isOverBudget ? 'red' : 'blue' }]}
                    label={
                        <Text c={isOverBudget ? "red" : "blue"} fw={700} ta="center" size="xs">
                            {percentage.toFixed(0)}%
                        </Text>
                    }
                />
            </Group>
        </Card>
    );
}
