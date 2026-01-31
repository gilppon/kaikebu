"use client";

import { Card, Text, Avatar, Group, Stack, ScrollArea, ActionIcon, Modal, Image } from "@mantine/core";
import { useStore } from "@/lib/store";
import dayjs from "dayjs";
import { IconReceipt } from "@tabler/icons-react";
import { useState } from "react";

export default function RecentTransactions() {
    const { expenses, categories, viewMode, currentUser } = useStore();
    const [viewedReceipt, setViewedReceipt] = useState<string | null>(null);

    const sortedExpenses = [...expenses]
        .filter(e => viewMode === 'personal' ? e.userId === currentUser?.id : true)
        .sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        ).slice(0, 5); // Last 5

    const getCategory = (id: string) => categories.find(c => c.id === id);

    return (
        <Card padding="lg">
            <Text size="sm" c="dimmed" tt="uppercase" fw={700} mb="md">
                最近の取引
            </Text>

            {sortedExpenses.length === 0 ? (
                <Text c="dimmed" size="sm">まだ支出はありません。</Text>
            ) : (
                <Stack gap="md">
                    {sortedExpenses.map(expense => {
                        const cat = getCategory(expense.categoryId);
                        return (
                            <Group key={expense.id} justify="space-between" wrap="nowrap">
                                <Group gap="sm" wrap="nowrap">
                                    <Avatar radius="xl" size="md" color={cat?.color || "gray"}>
                                        {cat?.icon || "?"}
                                    </Avatar>
                                    <div>
                                        <Text size="sm" fw={500}>{cat?.name || "不明"}</Text>
                                        <Text size="xs" c="dimmed">
                                            {dayjs(expense.date).format("M月D日")} • {expense.memo || "メモなし"}
                                        </Text>
                                    </div>
                                </Group>
                                <Group gap={4}>
                                    <Text fw={600} c={expense.type === 'income' ? 'teal' : 'dark'}>
                                        {expense.type === 'income' ? '+' : '-'}¥{expense.amount.toLocaleString()}
                                    </Text>
                                    {expense.receiptImage && (
                                        <ActionIcon variant="light" color="gray" size="sm" onClick={() => setViewedReceipt(expense.receiptImage!)}>
                                            <IconReceipt size={14} />
                                        </ActionIcon>
                                    )}
                                </Group>
                            </Group>
                        );
                    })}
                </Stack>
            )}

            <Modal opened={!!viewedReceipt} onClose={() => setViewedReceipt(null)} title="レシート (Receipt)" centered>
                {viewedReceipt && (
                    <Image src={viewedReceipt} radius="md" alt="Receipt" />
                )}
            </Modal>
        </Card>
    );
}
