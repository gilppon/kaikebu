"use client";

import { Container, Title, Paper, Stack, TextInput, NumberInput, Button, Switch, Group, Text, Avatar, Divider, Select, SegmentedControl, ActionIcon, ColorSwatch, Modal, Grid, Badge, FileButton, Notification } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useStore, Category, Expense } from "@/lib/store";
import dayjs from "dayjs";
import { useState, useRef } from "react";
import { IconCrown, IconUser, IconUserPlus, IconPlus, IconTrash, IconDownload, IconUpload, IconArrowLeft } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useDisclosure } from "@mantine/hooks";
import UpgradeModal from "@/components/UpgradeModal";

const MANTINE_COLORS = ['red', 'pink', 'grape', 'violet', 'indigo', 'blue', 'cyan', 'teal', 'green', 'lime', 'yellow', 'orange'];
const EMOJI_OPTIONS = ['🍔', '🛒', '🎮', '💡', '🏠', '🚗', '🎓', '💊', '🐶', '✈️', '☕', '💰', '💼', '🎁', '📱'];

export default function SettingsPage() {
    const { currentUser, setBudget, users, switchUser, isPro, togglePro, updateUserStyle, categories, addCategory, removeCategory, expenses, addExpense } = useStore();
    const currentMonth = dayjs().format("YYYY-MM");
    const router = useRouter();

    const [budgetAmount, setBudgetAmount] = useState<number | string>(100000);
    const [budgetScope, setBudgetScope] = useState<"personal" | "shared">("shared");

    const [opened, { open, close }] = useDisclosure(false);
    const [catModalOpened, { open: openCatModal, close: closeCatModal }] = useDisclosure(false);

    // New Category Form State
    const [newCatName, setNewCatName] = useState('');
    const [newCatIcon, setNewCatIcon] = useState('🍔');
    const [newCatColor, setNewCatColor] = useState('blue');
    const [newCatType, setNewCatType] = useState<'expense' | 'income'>('expense');

    const handleAddCategory = () => {
        if (!newCatName.trim()) return;
        addCategory({ name: newCatName, icon: newCatIcon, color: newCatColor, type: newCatType });
        setNewCatName('');
        closeCatModal();
    };

    // --- CSV Export ---
    const handleExportCSV = () => {
        const header = "date,amount,categoryId,memo,type,scope\n";
        const rows = expenses.map(e =>
            `${e.date},${e.amount},${e.categoryId},"${e.memo.replace(/"/g, '""')}",${e.type},${e.scope || 'shared'}`
        ).join("\n");
        const csv = header + rows;
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `pfm_export_${dayjs().format('YYYYMMDD')}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // --- CSV Import ---
    const handleImportCSV = (file: File | null) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const lines = text.split('\n').slice(1); // Skip header
            let count = 0;
            lines.forEach(line => {
                if (!line.trim()) return;
                // Simple CSV parsing (date,amount,categoryId,memo,type,scope)
                // If scope not provided, default to 'shared'
                const match = line.match(/^([^,]+),(\d+),([^,]+),"?([^"]*)"?,(\w+),?(\w*)$/);
                if (match) {
                    const [, date, amount, categoryId, memo, type, scope] = match;
                    addExpense({
                        date: new Date(date).toISOString(),
                        amount: Number(amount),
                        categoryId,
                        memo: memo || '',
                        type: type as 'expense' | 'income',
                        scope: (scope === 'personal' || scope === 'shared') ? scope : 'shared',
                    });
                    count++;
                }
            });
            alert(`${count}件のデータをインポートしました。`);
        };
        reader.readAsText(file);
    };

    const handleSaveBudget = () => {
        if (!currentUser) return;
        setBudget({
            familyId: currentUser.familyId,
            month: currentMonth,
            scope: budgetScope,
            totalBudget: Number(budgetAmount),
            categoryBudgets: {},
        });
        alert(`${budgetScope === 'personal' ? '個人' : '共同'}予算を保存しました！`);
    };

    return (
        <Container size="sm" py="xl">
            <UpgradeModal opened={opened} onClose={close} />
            <Group justify="space-between" mb="xl">
                <Title order={2}>設定</Title>
                <Button
                    variant="light"
                    onClick={() => router.push("/")}
                    leftSection={<IconArrowLeft size={18} />}
                >
                    戻る
                </Button>
            </Group>

            <Stack gap="xl">
                {/* Budget Settings */}
                <Paper p="lg" radius="lg" withBorder>
                    {/* ... (existing budget settings) ... */}
                    <Title order={4} mb="md" c="#1d1d1f">月間予算 ({dayjs().format("M月")})</Title>
                    <SegmentedControl
                        value={budgetScope}
                        onChange={(val) => setBudgetScope(val as "personal" | "shared")}
                        data={[
                            { label: '個人 (Personal)', value: 'personal' },
                            { label: '共同 (Shared)', value: 'shared' },
                        ]}
                        fullWidth
                        mb="md"
                        color={budgetScope === 'personal' ? 'violet' : 'cyan'}
                    />
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

                {/* Category Management */}
                <Paper p="lg" radius="lg" withBorder>
                    <Group justify="space-between" mb="md">
                        <Title order={4} c="#1d1d1f">カテゴリー管理</Title>
                        <Button
                            variant="light"
                            size="xs"
                            leftSection={<IconPlus size={16} />}
                            onClick={openCatModal}
                        >
                            追加
                        </Button>
                    </Group>
                    <Stack gap="sm">
                        {categories.map(cat => (
                            <Group key={cat.id} justify="space-between">
                                <Group gap="sm">
                                    <Avatar color={cat.color} radius="xl" size="sm">{cat.icon}</Avatar>
                                    <Text size="sm" c="#1d1d1f">{cat.name}</Text>
                                    <Badge size="xs" color={cat.type === 'income' ? 'teal' : 'gray'} variant="light">
                                        {cat.type === 'income' ? '収入' : '支出'}
                                    </Badge>
                                </Group>
                                <ActionIcon variant="subtle" color="red" size="sm" onClick={() => removeCategory(cat.id)}>
                                    <IconTrash size={14} />
                                </ActionIcon>
                            </Group>
                        ))}
                    </Stack>
                </Paper>

                {/* Add Category Modal */}
                <Modal opened={catModalOpened} onClose={closeCatModal} title="カテゴリー追加" centered>
                    <Stack gap="md">
                        <TextInput
                            label="名前"
                            placeholder="例: 美容"
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            styles={{ label: { color: '#1d1d1f' }, input: { color: '#1d1d1f' } }}
                        />
                        <Text size="sm" fw={500} c="#1d1d1f">アイコン</Text>
                        <Group gap="xs">
                            {EMOJI_OPTIONS.map(e => (
                                <ActionIcon
                                    key={e}
                                    variant={newCatIcon === e ? 'filled' : 'light'}
                                    color="blue"
                                    size="lg"
                                    onClick={() => setNewCatIcon(e)}
                                >
                                    {e}
                                </ActionIcon>
                            ))}
                        </Group>
                        <Text size="sm" fw={500} c="#1d1d1f">カラー</Text>
                        <Group gap="xs">
                            {MANTINE_COLORS.map(c => (
                                <ColorSwatch
                                    key={c}
                                    color={`var(--mantine-color-${c}-6)`}
                                    onClick={() => setNewCatColor(c)}
                                    style={{ cursor: 'pointer', border: newCatColor === c ? '3px solid black' : 'none' }}
                                />
                            ))}
                        </Group>
                        <SegmentedControl
                            value={newCatType}
                            onChange={(val) => setNewCatType(val as any)}
                            data={[
                                { label: '支出 (Expense)', value: 'expense' },
                                { label: '収入 (Income)', value: 'income' },
                            ]}
                            fullWidth
                        />
                        <Button fullWidth onClick={handleAddCategory} disabled={!newCatName.trim()}>
                            追加
                        </Button>
                    </Stack>
                </Modal>

                {/* Data Management (PC用) */}
                <Paper p="lg" radius="lg" withBorder>
                    <Title order={4} mb="md" c="#1d1d1f">データ管理 (PC連携)</Title>
                    <Text size="sm" c="dimmed" mb="md">エクセルで編集したい場合、CSVファイルでエクスポート・インポートできます。</Text>
                    <Group>
                        <Button
                            variant="light"
                            leftSection={<IconDownload size={16} />}
                            onClick={handleExportCSV}
                        >
                            CSVエクスポート
                        </Button>
                        <FileButton onChange={handleImportCSV} accept=".csv">
                            {(props) => (
                                <Button variant="light" leftSection={<IconUpload size={16} />} {...props}>
                                    CSVインポート
                                </Button>
                            )}
                        </FileButton>
                    </Group>
                    <Text size="xs" c="dimmed" mt="sm">
                        ※ 形式: date,amount,categoryId,memo,type
                    </Text>
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
