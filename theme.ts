"use client";

import { createTheme, rem } from "@mantine/core";

export const theme = createTheme({
    primaryColor: "dark",
    fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
    headings: {
        fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        sizes: {
            h1: { fontSize: rem(36), fontWeight: "800", lineHeight: "1.1" },
            h2: { fontSize: rem(30), fontWeight: "700", lineHeight: "1.2" },
            h3: { fontSize: rem(24), fontWeight: "700", lineHeight: "1.3" },
        },
    },
    radius: {
        xs: rem(4),
        sm: rem(8),
        md: rem(12),
        lg: rem(16),
        xl: rem(24),
    },
    shadows: {
        md: "0 4px 12px rgba(0, 0, 0, 0.08)",
        xl: "0 12px 32px rgba(0, 0, 0, 0.12)",
    },
    components: {
        Card: {
            defaultProps: {
                radius: "lg",
                withBorder: true,
            },
            styles: (theme: any) => ({
                root: {
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(20px)",
                    border: `1px solid rgba(0,0,0,0.05)`,
                },
            }),
        },
        Button: {
            defaultProps: {
                radius: "xl",
                size: "md",
            },
        },
        TextInput: {
            defaultProps: {
                radius: "md",
                size: "md",
            },
        },
        Select: {
            defaultProps: {
                radius: "md",
                size: "md",
            },
        },
    },
});
