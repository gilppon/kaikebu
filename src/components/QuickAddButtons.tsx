"use client";

import { Paper, Text, SimpleGrid, UnstyledButton, Group, ThemeIcon, rem, NumberInput } from "@mantine/core";
import { useStore } from "@/lib/store";
import dayjs from "dayjs";
import { IconCoffee, IconToolsKitchen2, IconBuildingStore, IconTrain } from "@tabler/icons-react";
import { useState } from "react";

const QUICK_ITEMS = [
    { label: "コーヒー", amount: 400, icon: IconCoffee, color: "brown", categoryId: "c1" }, // Assuming c1 is Food/Drink or similar
    { label: "ランチ", amount: 1000, icon: IconToolsKitchen2, color: "orange", categoryId: "c1" },
    { label: "コンビニ", amount: 800, icon: IconBuildingStore, color: "blue", categoryId: "c6" },
    { label: "交通費", amount: 500, icon: IconTrain, color: "grape", categoryId: "c2" },
];

export default function QuickAddButtons() {
    const { addExpense, currentUser } = useStore();
    const [customAmount, setCustomAmount] = useState<number | string>("");

    const handleQuickAdd = (item: typeof QUICK_ITEMS[0]) => {
        if (!currentUser) return;

        const amountToUse = typeof customAmount === 'number' && customAmount > 0 ? customAmount : item.amount;

        addExpense({
            amount: amountToUse,
            categoryId: item.categoryId,
            date: new Date().toISOString(),
            memo: `${item.label} (クイック追加)${typeof customAmount === 'number' && customAmount > 0 ? ' [金額指定]' : ''}`,
            type: "expense",
        });

        if (typeof customAmount === 'number' && customAmount > 0) {
            setCustomAmount(""); // Reset after use
        }
    };

    return (
        <Paper p="md" radius="lg" withBorder mb="lg">
            <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="sm">
                クイック入力 (Fast Input)
            </Text>

            <NumberInput
                placeholder="金額を入力 (任意)"
                value={customAmount}
                onChange={setCustomAmount}
                min={0}
                mb="md"
                thousandSeparator=","
                prefix="¥"
                styles={{
                    input: { fontSize: '16px', fontWeight: 600 }
                }}
            />

            <SimpleGrid cols={4} spacing="xs">
                {QUICK_ITEMS.map((item) => (
                    <UnstyledButton
                        key={item.label}
                        onClick={() => handleQuickAdd(item)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: rem(8)
                        }}
                    >
                        <ThemeIcon
                            size={48}
                            radius="xl"
                            color={item.color}
                            variant="light"
                        >
                            <item.icon size={26} />
                        </ThemeIcon>
                        <Text size="xs" fw={700} ta="center" c="#1d1d1f">{item.label}</Text>
                    </UnstyledButton>
                ))}
            </SimpleGrid>
        </Paper>
    );
}
