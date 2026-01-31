"use client";

import { Modal, Button, Text, Stack, Group, ThemeIcon, List, Badge } from "@mantine/core";
import { IconCheck, IconCrown } from "@tabler/icons-react";

interface Props {
    opened: boolean;
    onClose: () => void;
}

export default function UpgradeModal({ opened, onClose }: Props) {
    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={
                <Group gap="xs">
                    <IconCrown size={20} color="#fab005" fill="#fab005" />
                    <Text fw={700}>プレミアムプラン (Pro)</Text>
                </Group>
            }
            centered
            size="md"
        >
            <Stack gap="lg">
                <Stack gap="xs" align="center">
                    <Text size="xl" fw={900} ta="center" c="#1d1d1f">
                        2人の家計簿を、<br />もっと自由に。
                    </Text>
                    <Text size="sm" c="dimmed" ta="center">
                        月額 <span style={{ fontSize: 24, fontWeight: 700, color: '#228be6' }}>¥500</span> で全ての機能を開放
                    </Text>
                </Stack>

                <List
                    spacing="sm"
                    size="sm"
                    center
                    icon={
                        <ThemeIcon color="teal" size={24} radius="xl">
                            <IconCheck size={16} />
                        </ThemeIcon>
                    }
                >
                    <List.Item>
                        <Text span fw={700} c="#1d1d1f">プライバシー保護</Text>
                        <Text size="xs" c="dimmed" display="block">個人の支出は非公開、共有したい分だけ同期</Text>
                    </List.Item>
                    <List.Item>
                        <Text span fw={700} c="#1d1d1f">リアルタイム共有</Text>
                        <Text size="xs" c="dimmed" display="block">パートナーと支出を即座に同期</Text>
                    </List.Item>
                    <List.Item>
                        <Text span fw={700} c="#1d1d1f">無制限の履歴</Text>
                        <Text size="xs" c="dimmed" display="block">過去のデータを全て保存・閲覧</Text>
                    </List.Item>
                    <List.Item>
                        <Text span fw={700} c="#1d1d1f">広告なし</Text>
                        <Text size="xs" c="dimmed" display="block">快適なUIでストレスフリー</Text>
                    </List.Item>
                    <List.Item>
                        <Text span fw={700} c="#1d1d1f">高度な分析レポート</Text>
                        <Text size="xs" c="dimmed" display="block">AIによる詳細な家計診断</Text>
                    </List.Item>
                </List>

                <Stack gap="xs">
                    <Button
                        fullWidth
                        size="lg"
                        color="blue"
                        radius="md"
                        style={{ boxShadow: '0 4px 14px rgba(34, 139, 230, 0.39)' }}
                        onClick={onClose} // Just close for demo
                    >
                        1ヶ月無料体験を始める
                    </Button>
                    <Button variant="subtle" size="xs" color="gray" onClick={onClose}>
                        今はしない
                    </Button>
                </Stack>
            </Stack>
        </Modal>
    );
}
