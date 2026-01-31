"use client";

import { Modal, NumberInput, TextInput, Button, Group, Text, Stack, Slider, Box, Divider } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useStore } from "@/lib/store";
import { useState } from "react";
import { IconCalculator, IconArrowRight } from "@tabler/icons-react";

interface Props {
    opened: boolean;
    onClose: () => void;
}

export default function SplitBillModal({ opened, onClose }: Props) {
    const { addExpense, currentUser } = useStore();
    const [ratio, setRatio] = useState(50); // User's share percentage

    const form = useForm({
        initialValues: {
            totalAmount: 0,
            memo: "",
        },
        validate: {
            totalAmount: (value) => (value <= 0 ? "金額を入力してください" : null),
            memo: (value) => (!value ? "内容を入力してください (例: ランチ)" : null),
        },
    });

    // Calculate shares
    const userShare = Math.round((form.values.totalAmount * ratio) / 100);
    const partnerShare = form.values.totalAmount - userShare;

    const handleSubmit = (values: typeof form.values) => {
        if (!currentUser) return;

        // Add ONLY user's share to the expenses
        addExpense({
            amount: userShare,
            categoryId: "c1", // Default to Food for MVP, or we can add selector later
            date: new Date().toISOString(),
            memo: `${values.memo} (割り勘: 総額 ¥${values.totalAmount.toLocaleString()})`,
            type: "expense",
            scope: "shared", // Split bills are typically shared expenses
        });

        form.reset();
        setRatio(50);
        onClose();
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={
                <Group gap="xs">
                    <IconCalculator size={20} color="#228be6" />
                    <Text fw={700}>割り勘計算 (Split Bill)</Text>
                </Group>
            }
            centered
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                    <NumberInput
                        label="支払い総額"
                        placeholder="0"
                        value={form.values.totalAmount}
                        onChange={(val) => form.setFieldValue("totalAmount", typeof val === 'number' ? val : 0)}
                        min={0}
                        thousandSeparator=","
                        prefix="¥"
                        size="md"
                        styles={{ input: { fontSize: 18, fontWeight: 700 } }}
                    />

                    <TextInput
                        label="内容"
                        placeholder="例: ランチ、映画など"
                        {...form.getInputProps("memo")}
                    />

                    <Divider label="分担割合" labelPosition="center" />

                    <Box px="xs">
                        <Group justify="space-between" mb={5}>
                            <Text size="sm" fw={500}>あなた ({ratio}%)</Text>
                            <Text size="sm" fw={500}>パートナー ({100 - ratio}%)</Text>
                        </Group>
                        <Slider
                            value={ratio}
                            onChange={setRatio}
                            min={0}
                            max={100}
                            step={5}
                            marks={[
                                { value: 30, label: '30%' },
                                { value: 50, label: '50%' },
                                { value: 70, label: '70%' },
                            ]}
                            mb="sm"
                        />
                    </Box>

                    <Group grow align="flex-start">
                        <Stack gap={0} align="center" bg="blue.0" p="xs" style={{ borderRadius: 8 }}>
                            <Text size="xs" c="dimmed">あなたの支払い</Text>
                            <Text size="lg" fw={700} c="blue">¥{userShare.toLocaleString()}</Text>
                        </Stack>
                        <Stack gap={0} align="center" bg="gray.1" p="xs" style={{ borderRadius: 8 }}>
                            <Text size="xs" c="dimmed">パートナーの支払い</Text>
                            <Text size="lg" fw={700} c="dimmed">¥{partnerShare.toLocaleString()}</Text>
                        </Stack>
                    </Group>

                    <Button
                        type="submit"
                        fullWidth
                        size="md"
                        color="blue"
                        rightSection={<IconArrowRight size={16} />}
                        mt="xs"
                    >
                        自分の分 (¥{userShare.toLocaleString()}) を記録
                    </Button>
                </Stack>
            </form>
        </Modal>
    );
}
