"use client";

import { Modal, Button, NumberInput, Select, Textarea, Group, FileButton, Image, Box, SegmentedControl } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useStore, Expense } from "@/lib/store";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { IconCamera } from "@tabler/icons-react";

// ... imports

interface Props {
    opened: boolean;
    onClose: () => void;
    editingExpense?: any; // strict typing later
}

export default function ExpenseInputModal({ opened, onClose, editingExpense }: Props) {
    const { categories, addExpense, updateExpense, currentUser } = useStore();

    const form = useForm({
        initialValues: {
            amount: 0,
            categoryId: "",
            date: new Date(),
            memo: "",
        },
        // ...
    });

    const [receiptImage, setReceiptImage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"expense" | "income">("expense");
    const [scope, setScope] = useState<"personal" | "shared">("shared"); // New: personal vs shared

    useEffect(() => {
        if (opened) {
            if (editingExpense) {
                form.setValues({
                    amount: editingExpense.amount,
                    categoryId: editingExpense.categoryId,
                    date: new Date(editingExpense.date),
                    memo: editingExpense.memo || "",
                });
                setReceiptImage(editingExpense.receiptImage || null);
                setActiveTab(editingExpense.type);
                setScope(editingExpense.scope || "shared");
            } else {
                form.reset();
                setReceiptImage(null);
                setActiveTab("expense"); // Default
                setScope("shared"); // Default
            }
        }
    }, [opened, editingExpense]);

    const handleSubmit = (values: typeof form.values) => {
        if (!currentUser) return;

        if (editingExpense) {
            updateExpense(editingExpense.id, {
                amount: values.amount,
                categoryId: values.categoryId,
                date: values.date.toISOString(),
                memo: values.memo,
                receiptImage: receiptImage || undefined,
                type: activeTab,
                scope: scope,
            });
        } else {
            addExpense({
                amount: values.amount,
                categoryId: values.categoryId,
                date: values.date.toISOString(),
                memo: values.memo,
                receiptImage: receiptImage || undefined,
                type: activeTab,
                scope: scope,
            });
        }
        form.reset();
        setReceiptImage(null);
        onClose();
    };

    const handleFileChange = (file: File | null) => {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement("img");
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                const MAX_WIDTH = 800; // Resize logic

                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;
                ctx?.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL("image/jpeg", 0.7); // Compress
                setReceiptImage(dataUrl);
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const categoryData = categories
        .filter(c => c.type === activeTab || (!c.type && activeTab === 'expense'))
        .map(c => ({
            value: c.id,
            label: `${c.icon} ${c.name}`
        }));

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={editingExpense ? "編集" : (activeTab === 'expense' ? "支出の追加" : "収入の追加")}
            centered
            styles={{
                title: { color: "#1d1d1f", fontWeight: 700 }
            }}
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <SegmentedControl
                    value={activeTab}
                    onChange={(val) => setActiveTab(val as "expense" | "income")}
                    data={[
                        { label: '支出 (Expense)', value: 'expense' },
                        { label: '収入 (Income)', value: 'income' },
                    ]}
                    fullWidth
                    mb="sm"
                    color={activeTab === 'income' ? 'teal' : 'blue'}
                />
                <SegmentedControl
                    value={scope}
                    onChange={(val) => setScope(val as "personal" | "shared")}
                    data={[
                        { label: '個人 (Personal)', value: 'personal' },
                        { label: '共同 (Shared)', value: 'shared' },
                    ]}
                    fullWidth
                    mb="md"
                    color={scope === 'personal' ? 'violet' : 'cyan'}
                />
                <NumberInput
                    label="金額"
                    placeholder="0"
                    mb="md"
                    min={0}
                    thousandSeparator=","
                    prefix="¥"
                    {...form.getInputProps("amount")}
                    styles={{
                        label: { color: "#1d1d1f", fontWeight: 600 },
                        input: { color: "#1d1d1f" }
                    }}
                />

                <Select
                    key={activeTab} // Force re-render on tab change
                    label="カテゴリー"
                    placeholder="カテゴリーを選択"
                    data={categoryData}
                    mb="md"
                    {...form.getInputProps("categoryId")}
                    searchable
                    nothingFoundMessage="カテゴリーが見つかりません"
                    styles={{
                        label: { color: "#1d1d1f", fontWeight: 600 },
                        input: { color: "#1d1d1f", fontWeight: 500 },
                        option: { color: "#1d1d1f" },
                        dropdown: { backgroundColor: "#ffffff" }
                    }}
                />

                <DateInput
                    label="日付"
                    placeholder="日付を選択"
                    mb="md"
                    locale="ja"
                    valueFormat="YYYY/MM/DD"
                    {...form.getInputProps("date")}
                    styles={{
                        label: { color: "#1d1d1f", fontWeight: 600 },
                        input: { color: "#1d1d1f" },
                        calendarHeader: { color: "#1d1d1f" },
                        calendarHeaderControl: { color: "#1d1d1f" },
                        calendarHeaderLevel: { color: "#1d1d1f" },
                        weekday: { color: "#1d1d1f" },
                        day: { color: "#1d1d1f" }
                    }}
                />

                <Textarea
                    label="メモ"
                    placeholder="メモを入力 (任意)"
                    mb="lg"
                    {...form.getInputProps("memo")}
                    styles={{
                        label: { color: "#1d1d1f", fontWeight: 600 },
                        input: { color: "#1d1d1f" }
                    }}
                />

                {activeTab === 'expense' && (
                    <Group mb="lg">
                        <FileButton onChange={handleFileChange} accept="image/png,image/jpeg">
                            {(props) => (
                                <Button {...props} variant="light" color="blue" leftSection={<IconCamera size={20} />}>
                                    {receiptImage ? "写真き換え" : "レシートを追加"}
                                </Button>
                            )}
                        </FileButton>
                        {receiptImage && (
                            <Box style={{ position: 'relative' }}>
                                <Image
                                    src={receiptImage}
                                    w={60}
                                    h={60}
                                    radius="md"
                                    fit="cover"
                                    style={{ border: '1px solid #dee2e6' }}
                                    alt="Receipt Preview"
                                />
                                <Button
                                    size="compact-xs"
                                    color="red"
                                    variant="filled"
                                    radius="xl"
                                    style={{ position: 'absolute', top: -5, right: -5, width: 20, height: 20, padding: 0 }}
                                    onClick={() => setReceiptImage(null)}
                                >
                                    ×
                                </Button>
                            </Box>
                        )}
                    </Group>
                )}

                <Group justify="flex-end">
                    <Button variant="default" onClick={onClose} c="dark">キャンセル</Button>
                    <Button type="submit">保存</Button>
                </Group>
            </form>
        </Modal>
    );
}
