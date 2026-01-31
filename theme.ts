"use client";

import { createTheme, rem } from "@mantine/core";

export const theme = createTheme({
    primaryColor: "blue",
    defaultRadius: "xl",
    fontFamily: '"Lexend", sans-serif',
    headings: {
        fontFamily: '"Lexend", sans-serif',
        sizes: {
            h1: { fontSize: rem(36), fontWeight: "800", lineHeight: "1.1" },
            h2: { fontSize: rem(30), fontWeight: "700", lineHeight: "1.2" },
            h3: { fontSize: rem(24), fontWeight: "700", lineHeight: "1.3" },
        },
    },
    radius: {
        xs: rem(6),
        sm: rem(10),
        md: rem(16),
        lg: rem(24),
        xl: rem(32),
    },
    shadows: {
        md: "0 8px 24px rgba(149, 157, 165, 0.1)",
        xl: "0 20px 48px rgba(149, 157, 165, 0.15)",
    },
    components: {
        Card: {
            defaultProps: {
                radius: "xl",
                withBorder: false,
            },
            styles: (theme: any) => ({
                root: {
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                    backdropFilter: "blur(12px)",
                    border: `1px solid rgba(255, 255, 255, 0.4)`,
                    boxShadow: theme.shadows.md,
                },
            }),
        },
        Paper: {
            defaultProps: {
                radius: "xl",
                withBorder: false,
            },
            styles: (theme: any) => ({
                root: {
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                    backdropFilter: "blur(12px)",
                    border: `1px solid rgba(255, 255, 255, 0.4)`,
                    boxShadow: theme.shadows.md,
                },
            }),
        },
        Button: {
            defaultProps: {
                radius: "xl",
                size: "md",
                variant: "filled",
            },
            styles: {
                root: {
                    fontWeight: 600,
                    transition: 'transform 0.2s ease',
                    '&:active': {
                        transform: 'scale(0.96)',
                    },
                },
            },
        },
        TextInput: {
            defaultProps: {
                radius: "lg",
                size: "md",
            },
        },
        Select: {
            defaultProps: {
                radius: "lg",
                size: "md",
            },
        },
    },
});
