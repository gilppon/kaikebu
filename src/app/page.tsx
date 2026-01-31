"use client";

import { useEffect, useState } from "react";
import { Container, Grid, Title, Text, Button, Group, Box, Paper, Flex, Stack, SegmentedControl } from "@mantine/core";
import { useStore } from "@/lib/store";
import { IconPlus, IconWallet, IconChartPie, IconSettings } from "@tabler/icons-react";
import ExpenseInputModal from "@/components/ExpenseInputModal";
import SummaryCard from "@/components/SummaryCard";
import BudgetCard from "@/components/BudgetCard";
import RecentTransactions from "@/components/RecentTransactions";
import PredictionCard from "@/components/PredictionCard";
import QuickAddButtons from "@/components/QuickAddButtons";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { currentUser, expenses, budgets, viewMode, toggleViewMode } = useStore();
  const [opened, setOpened] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    useStore.persist.rehydrate();
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: any = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  return (
    <Container size="md" py="xl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Group justify="space-between" mb={40}>
          <div>
            <Text c="dimmed" tt="uppercase" fw={700} style={{ letterSpacing: '1px', fontSize: 'var(--mantine-font-size-sm)' }}>
              概要 (Overview)
            </Text>
            <Title order={1} style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              こんにちは、<br />
              <span style={{ color: '#0071e3' }}>{currentUser?.name || "ゲスト"}</span>さん
            </Title>
          </div>
          <Group>
            <SegmentedControl
              value={viewMode}
              onChange={(value) => toggleViewMode(value as "personal" | "shared")}
              data={[
                { label: '全員 (Shared)', value: 'shared' },
                { label: '自分 (Personal)', value: 'personal' },
              ]}
              radius="xl"
              size="sm"
              mb={{ base: 'sm', sm: 0 }}
            />
            <Button
              variant="white"
              color="dark"
              component={Link}
              href="/settings"
              leftSection={<IconSettings size={20} />}
              radius="xl"
              size="md"
              style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            >
              設定
            </Button>
            <Button
              variant="filled"
              color="blue"
              radius="xl"
              size="md"
              onClick={() => alert("会員登録機能は準備中です。\n(Registration feature coming soon)")}
            >
              新規登録
            </Button>
            <Button
              leftSection={<IconPlus size={20} />}
              onClick={() => setOpened(true)}
              size="md"
              radius="xl"
              color="dark"
            >
              支出を追加
            </Button>
          </Group>
        </Group>
      </motion.div>

      <Grid gutter="lg">
        {/* Fast Input Row */}
        <Grid.Col span={12}>
          <motion.div variants={itemVariants} initial="hidden" animate="visible">
            <QuickAddButtons />
          </motion.div>
        </Grid.Col>

        {/* Bento Grid Layout */}

        {/* Large Block: Summary (Top Left) */}
        <Grid.Col span={{ base: 12, sm: 7 }}>
          <motion.div variants={itemVariants} initial="hidden" animate="visible">
            <SummaryCard />
          </motion.div>
        </Grid.Col>

        {/* Medium Block: Budget (Top Right) */}
        <Grid.Col span={{ base: 12, sm: 5 }}>
          <Stack gap="lg">
            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
              <BudgetCard />
            </motion.div>
            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.15 }}>
              <PredictionCard />
            </motion.div>
          </Stack>
        </Grid.Col>

        {/* Full Width Block: Transactions */}
        <Grid.Col span={12}>
          <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
            <RecentTransactions />
          </motion.div>
        </Grid.Col>
      </Grid>

      <ExpenseInputModal opened={opened} onClose={() => setOpened(false)} />
    </Container>
  );
}
