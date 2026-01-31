"use client";

import { Container, Title, Paper, Stack, TextInput, NumberInput, Button, Switch, Group, Text, Avatar, Divider, Select, SegmentedControl } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useStore } from "@/lib/store";
import dayjs from "dayjs";
import { useState } from "react";
import { IconCrown, IconUser, IconUserPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useDisclosure } from "@mantine/hooks";
import UpgradeModal from "@/components/UpgradeModal";

export default function SettingsPage() {
    const { currentUser, setBudget, users, switchUser, isPro, togglePro, updateUserStyle } = useStore();
    const currentMonth = dayjs().format("YYYY-MM");
    const router = useRouter();

    const [budgetAmount, setBudgetAmount] = useState<number | string>(100000);

    const [opened, { open, close }] = useDisclosure(false);

    const handleSaveBudget = () => {
        if (!currentUser) return;
        setBudget({
            familyId: currentUser.familyId,
            month: currentMonth,
            totalBudget: Number(budgetAmount),
            categoryBudgets: {},
        });
        router.push("/");
    };

    return (
        <Container size="sm" py="xl">
            <UpgradeModal opened={opened} onClose={close} />
            <Title order={2} mb="xl">設定</Title>

            <Stack gap="xl">
                {/* Budget Settings */}
                <Paper p="lg" radius="lg" withBorder>
                    {/* ... (existing budget settings) ... */}
                    <Title order={4} mb="md" c="#1d1d1f">月間予算 ({dayjs().format("M月")})</Title>
                    <Group align="flex-end">
                        <NumberInput
                            label={<Text c="#1d1d1f" fw={500}>予算総額</Text>}
                            value={budgetAmount}
                            onChange={setBudgetAmount}
                            thousandSeparator=","
                            prefix="¥"
                            min={0}
                            style={{ flex: 1 }}
                            styles={{ input: { color: '#1d1d1f' } }}
                        />
                        <Button onClick={handleSaveBudget}>保存</Button>
                    </Group>

                    <Divider my="md" label={<Text c="#1d1d1f" size="sm">AI アシスタント設定</Text>} labelPosition="center" />

                    <Text size="sm" fw={500} mb="xs" c="#1d1d1f">AIの性格 (Nagging Style)</Text>
                    <SegmentedControl
                        value={currentUser?.naggingStyle || "friendly"}
                        onChange={(value) => {
                            if (currentUser) {
                                updateUserStyle(currentUser.id, value as any);
                            }
                        }}
                        data={[
                            { label: '厳格 (Strict)', value: 'strict' },
                            { label: 'フレンドリー', value: 'friendly' },
                            { label: 'ユーモア', value: 'humorous' },
                        ]}
                        fullWidth
                    />
                </Paper>

                {/* Family Sharing */}
                <Paper p="lg" radius="lg" withBorder>
                    <Group justify="space-between" mb="md">
                        <Title order={4} c="#1d1d1f">家族メンバー</Title>
                        <Button
                            variant="light"
                            size="xs"
                            leftSection={<IconUserPlus size={16} />}
                            onClick={open}
                        >
                            パートナーを招待
                        </Button>
                    </Group>
                    <Stack gap="sm">
                        {users.map(u => (
                            <Group key={u.id} justify="space-between" onClick={() => switchUser(u.id)} style={{ cursor: 'pointer' }}>
                                <Group>
                                    <Avatar color="blue" radius="xl">{u.name[0]}</Avatar>
                                    <div>
                                        <Text fw={500} c="#1d1d1f">{u.name} {u.id === currentUser?.id && "(あなた)"}</Text>
                                        <Text size="xs" c="dimmed">{u.email}</Text>
                                    </div>
                                </Group>
                                {u.role === 'owner' && <Text size="xs" c="dimmed">管理者</Text>}
                            </Group>
                        ))}
                    </Stack>
                </Paper>

                {/* Life Events / Fixed Costs */}
                <Paper p="lg" radius="lg" withBorder>
                    <Title order={4} mb="md">固定費・ライフイベント</Title>
                    <Text size="sm" c="dimmed" mb="md">定期的な支払いやイベントを追加します。</Text>
                    <Button variant="light" size="xs" fullWidth onClick={open}>イベント管理 (Pro機能)</Button>
                </Paper>

                {/* Monetization */}
                <Paper p="lg" radius="lg" withBorder bg={isPro ? "blue.0" : undefined}>
                    <Group justify="space-between">
                        <Group>
                            <IconCrown color={isPro ? "gold" : "gray"} />
                            <div>
                                <Title order={4} c="#1d1d1f">プレミアムプラン</Title>
                                <Text size="sm" c="dimmed">
                                    {isPro ? "適用中" : "Proへアップグレード"}
                                </Text>
                            </div>
                        </Group>
                        <Switch
                            checked={isPro}
                            onChange={togglePro}
                            label={<Text c="#1d1d1f">{isPro ? "Pro 有効" : "無料プラン"}</Text>}
                            size="md"
                        />
                    </Group>
                    {isPro && (
                        <Text size="xs" mt="sm" c="blue">
                            ✓ 広告なし
                            <br />
                            ✓ 家族共有機能
                            <br />
                            ✓ 高度なアラート
                        </Text>
                    )}
                </Paper>
            </Stack>
        </Container>
    );
}
