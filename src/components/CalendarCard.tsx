"use client";

import { Card, Text, Group, Indicator, Stack, ThemeIcon, Avatar } from "@mantine/core";
import { Calendar } from "@mantine/dates";
import { useStore } from "@/lib/store";
import dayjs from "dayjs";
import { useState, useMemo } from "react";
import { IconReceipt } from "@tabler/icons-react";

export default function CalendarCard() {
    const { expenses, categories, viewMode, currentUser } = useStore();
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

    // Filter expenses based on view mode
    const filteredExpenses = useMemo(() => {
        return expenses.filter(e => {
            if (viewMode === 'personal' && e.scope !== 'personal') return false;
            if (viewMode === 'shared' && e.scope !== 'shared') return false;
            return true;
        });
    }, [expenses, viewMode, currentUser]);

    // Group expenses by date string (YYYY-MM-DD)
    const expensesByDate = useMemo(() => {
        const groups: Record<string, typeof expenses> = {};
        filteredExpenses.forEach(e => {
            const dateStr = dayjs(e.date).format("YYYY-MM-DD");
            if (!groups[dateStr]) groups[dateStr] = [];
            groups[dateStr].push(e);
        });
        return groups;
    }, [filteredExpenses]);

    const getDayProps = (date: any) => {
        const isSelected = selectedDate ? dayjs(date).isSame(selectedDate, 'day') : false;

        return {
            selected: isSelected,
            onClick: () => setSelectedDate(dayjs(date).toDate()),
        };
    };

    // Expenses for the selected date
    const selectedDateExpenses = useMemo(() => {
        if (!selectedDate) return [];
        const dateStr = dayjs(selectedDate).format("YYYY-MM-DD");
        return expensesByDate[dateStr] || [];
    }, [selectedDate, expensesByDate]);

    const getCategory = (id: string) => categories.find(c => c.id === id);

    return (
        <Card padding="lg" radius="lg" withBorder mb="lg">
            <Group justify="space-between" mb="md">
                <Text size="sm" c="dimmed" tt="uppercase" fw={700}>
                    カレンダー (Calendar)
                </Text>
            </Group>

            <Group justify="center" mb="md">
                <Calendar
                    static
                    renderDay={(date: any) => {
                        const d = dayjs(date);
                        const dateStr = d.format("YYYY-MM-DD");
                        const dayExpenses = expensesByDate[dateStr];
                        const hasExpense = dayExpenses?.length > 0;

                        // Check if income or expense dominant?
                        // For now just generic dot

                        return (
                            <Indicator
                                size={6}
                                color="red"
                                offset={-2}
                                disabled={!hasExpense}
                                position="bottom-center"
                            >
                                <div>{d.date()}</div>
                            </Indicator>
                        );
                    }}
                    getDayProps={getDayProps}
                    styles={{
                        calendarHeader: { color: "#1d1d1f" },
                        calendarHeaderControl: { color: "#1d1d1f" },
                        calendarHeaderLevel: { color: "#1d1d1f" },
                        weekday: { color: "#1d1d1f" },
                        day: {
                            color: "#1d1d1f",
                            borderRadius: '8px'
                        }
                    }}
                />
            </Group>

            {/* Daily Summary */}
            {selectedDate && (
                <Stack gap="sm" mt="sm">
                    <Text size="sm" fw={600} c="#1d1d1f" style={{ borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                        {dayjs(selectedDate).format("M月D日 (ddd)")} の内訳
                    </Text>

                    {selectedDateExpenses.length === 0 ? (
                        <Text size="sm" c="dimmed" ta="center" py="xs">
                            取引はありません
                        </Text>
                    ) : (
                        <Stack gap="xs">
                            {selectedDateExpenses.map(e => {
                                const cat = getCategory(e.categoryId);
                                return (
                                    <Group key={e.id} justify="space-between">
                                        <Group gap="xs">
                                            <Avatar size="sm" color={cat?.color} radius="xl">
                                                {cat?.icon}
                                            </Avatar>
                                            <Text size="sm" c="#1d1d1f">{cat?.name}</Text>
                                        </Group>
                                        <Text size="sm" fw={500} c={e.type === 'income' ? 'teal' : 'dark'}>
                                            {e.type === 'income' ? '+' : '-'}¥{e.amount.toLocaleString()}
                                        </Text>
                                    </Group>
                                );
                            })}
                        </Stack>
                    )}
                </Stack>
            )}
        </Card>
    );
}
