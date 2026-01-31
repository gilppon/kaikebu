"use client";

import { useEffect, useState } from "react";
import { Container, Grid, Title, Text, Button, Group, Box, Paper, Flex, Stack, SegmentedControl, rem } from "@mantine/core";
import { useStore } from "@/lib/store";
import { IconPlus, IconWallet, IconChartPie, IconSettings } from "@tabler/icons-react";
import ExpenseInputModal from "@/components/ExpenseInputModal";
import SummaryCard from "@/components/SummaryCard";
import BudgetCard from "@/components/BudgetCard";
import RecentTransactions from "@/components/RecentTransactions";
import PredictionCard from "@/components/PredictionCard";
import QuickAddButtons from "@/components/QuickAddButtons";
import CalendarCard from "@/components/CalendarCard";
import CategoryChart from "@/components/CategoryChart";
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
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Group justify="space-between" mb={30}>
          <div>
            <Text c="blue.5" tt="uppercase" fw={800} style={{ letterSpacing: '2px', fontSize: rem(12) }}>
              家計簿ダッシュボード (KAIKEBU)
            </Text>
            <Title order={1} style={{ fontSize: rem(42), fontWeight: 900, lineHeight: 1.1, color: '#2b2d42' }}>
              おかえりなさい、<br />
              <span style={{
                background: 'linear-gradient(120deg, #339af0, #228be6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>{currentUser?.name || "ゲスト"}</span>さん ✨
            </Title>
          </div>
          <Stack align="flex-end" gap="xs">
            <Group gap="xs">
              <Button
                variant="white"
                color="gray.7"
                component={Link}
                href="/settings"
                leftSection={<IconSettings size={18} />}
                radius="xl"
                size="sm"
                style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255,255,255,0.5)' }}
              >
                Settings
              </Button>
              <Button
                leftSection={<IconPlus size={18} />}
                onClick={() => setOpened(true)}
                size="sm"
                radius="xl"
                color="blue.6"
                style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              >
                収支を追加
              </Button>
            </Group>
            <SegmentedControl
              value={viewMode === 'all' ? 'shared' : viewMode}
              onChange={(value) => toggleViewMode(value as "personal" | "shared")}
              data={[
                { label: '個人', value: 'personal' },
                { label: '共同', value: 'shared' },
              ]}
              radius="xl"
              size="xs"
              bg="rgba(255,255,255,0.4)"
            />
          </Stack>
        </Group>
      </motion.div>

      <Grid gutter="lg">
        {/* Fast Input Row */}
        <Grid.Col span={12}>
          <motion.div variants={itemVariants} initial="hidden" animate="visible">
            <QuickAddButtons />
          </motion.div>
        </Grid.Col>

        {/* Calendar View (Top Priority) */}
        <Grid.Col span={12}>
          <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.05 }}>
            <CalendarCard />
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

        {/* Category Chart */}
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.18 }}>
            <CategoryChart />
          </motion.div>
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
