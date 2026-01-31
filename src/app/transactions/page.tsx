"use client";

import { Container, Title, Text, Group, Stack, Card, Avatar, Select, ActionIcon, Button, ThemeIcon, Modal, Image } from "@mantine/core";
import { useStore, Expense } from "@/lib/store"; // Import Expense
import dayjs from "dayjs";
import { useState, useMemo } from "react";
import { IconArrowLeft, IconReceipt, IconFilter } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useDisclosure } from "@mantine/hooks";
import ExpenseInputModal from "@/components/ExpenseInputModal";

export default function TransactionsPage() {
    const { expenses, categories, viewMode, currentUser } = useStore();
    const router = useRouter();
    const [viewedReceipt, setViewedReceipt] = useState<string | null>(null);
    const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);
    const [opened, { open, close }] = useDisclosure(false);

    const handleEdit = (expense: Expense) => {
        setEditingExpense(expense);
        open();
    };

    // Initial month state: Current month
    const [selectedMonth, setSelectedMonth] = useState<string | null>(dayjs().format("YYYY-MM"));

    // Function to get unique months from expenses
    const availableMonths = useMemo(() => {
        const months = new Set<string>();
        expenses.forEach(e => {
            months.add(dayjs(e.date).format("YYYY-MM"));
        });
        // Ensure current month is always available
        months.add(dayjs().format("YYYY-MM"));

        return Array.from(months)
            .sort((a, b) => b.localeCompare(a)) // Sort descending
            .map(m => ({ value: m, label: dayjs(m).format("YYYY年 M月") }));
    }, [expenses]);

    const filteredExpenses = useMemo(() => {
        return expenses
            .filter(e => {
                if (viewMode === 'personal' && e.scope !== 'personal') return false;
                if (viewMode === 'shared' && e.scope !== 'shared') return false;
                return true;
            })
            .filter(e => selectedMonth ? dayjs(e.date).format("YYYY-MM") === selectedMonth : true)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [expenses, viewMode, currentUser, selectedMonth]);

    const getCategory = (id: string) => categories.find(c => c.id === id);

    // Group expenses by date for nicer display
    const groupedExpenses = useMemo(() => {
        const groups: Record<string, typeof expenses> = {};
        filteredExpenses.forEach(e => {
            const dateKey = dayjs(e.date).format("YYYY-MM-DD");
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(e);
        });
        return groups;
    }, [filteredExpenses]);

    return (
        <Container size="sm" py="xl" pb={100}>
            {/* Header */}
            <Group mb="lg">
                <ActionIcon variant="light" color="gray" onClick={() => router.back()} radius="xl" size="lg">
                    <IconArrowLeft size={20} />
                </ActionIcon>
                <Title order={3} c="#1d1d1f">入出金履歴</Title>
            </Group>

            {/* Filter */}
            <Group mb="lg" justify="flex-end">
                <Select
                    leftSection={<IconFilter size={16} />}
                    data={availableMonths}
                    value={selectedMonth}
                    onChange={setSelectedMonth}
                    allowDeselect={false}
                    w={160}
                    styles={{ input: { fontWeight: 500, color: '#1d1d1f' } }}
                />
            </Group>

            {/* List */}
            {filteredExpenses.length === 0 ? (
                <Stack align="center" py="xl" gap="xs">
                    <ThemeIcon size={64} radius="xl" color="gray" variant="light">
                        <IconReceipt size={32} />
                    </ThemeIcon>
                    <Text c="#1d1d1f" fw={500}>この月の履歴はありません</Text>
                </Stack>
            ) : (
                <Stack gap="lg">
                    {Object.entries(groupedExpenses).map(([date, items]) => (
                        <div key={date}>
                            <Text size="xs" c="#1d1d1f" fw={700} mb="sm" pl="xs">
                                {dayjs(date).format("M月D日 (ddd)")}
                            </Text>
                            <Card radius="lg" withBorder padding="md">
                                <Stack gap="md">
                                    {items.map(expense => {
                                        const cat = getCategory(expense.categoryId);
                                        return (
                                            <Group
                                                key={expense.id}
                                                justify="space-between"
                                                wrap="nowrap"
                                                onClick={() => handleEdit(expense)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <Group gap="sm" wrap="nowrap">
                                                    <Avatar radius="xl" size="md" color={cat?.color || "gray"}>
                                                        {cat?.icon || "?"}
                                                    </Avatar>
                                                    <div>
                                                        <Text size="sm" fw={500} c="#1d1d1f">
                                                            {cat?.name || "不明"}
                                                        </Text>
                                                        <Text size="xs" c="dimmed">
                                                            {expense.memo || "メモなし"}
                                                        </Text>
                                                    </div>
                                                </Group>
                                                <Group gap={4}>
                                                    <Text fw={600} c={expense.type === 'income' ? 'teal' : 'dark'}>
                                                        {expense.type === 'income' ? '+' : '-'}¥{expense.amount.toLocaleString()}
                                                    </Text>
                                                    {expense.receiptImage && (
                                                        <ActionIcon
                                                            variant="light"
                                                            color="gray"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setViewedReceipt(expense.receiptImage!)
                                                            }}
                                                        >
                                                            <IconReceipt size={14} />
                                                        </ActionIcon>
                                                    )}
                                                </Group>
                                            </Group>
                                        );
                                    })}
                                </Stack>
                            </Card>
                        </div>
                    ))}
                </Stack>
            )}

            <ExpenseInputModal
                opened={opened}
                onClose={() => { close(); setEditingExpense(undefined); }}
                editingExpense={editingExpense}
            />

            <Modal opened={!!viewedReceipt} onClose={() => setViewedReceipt(null)} title="レシート" centered>
                {viewedReceipt && (
                    <Image src={viewedReceipt} radius="md" alt="Receipt" />
                )}
            </Modal>
        </Container>
    );
}
