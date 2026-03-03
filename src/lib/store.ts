import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { NaggingStyle } from "./nagging";

// --- Types ---
export type UserRole = "owner" | "member";

export interface User {
    id: string;
    name: string;
    email: string;
    familyId: string;
    role: UserRole;
    naggingStyle: NaggingStyle; // New field
}

export interface Category {
    id: string;
    name: string;
    icon: string;
    color: string;
    type: "expense" | "income"; // Added type
}

export interface Expense {
    id: string;
    userId: string;
    type: "expense" | "income";
    scope: "personal" | "shared"; // New: Personal pocket money or shared living expenses
    amount: number;
    categoryId: string;
    date: string; // ISO string
    memo: string;
    receiptImage?: string; // Base64 string (compressed)
}

export interface Budget {
    familyId: string;
    month: string; // YYYY-MM
    scope: "personal" | "shared"; // NEW: Budget scope
    totalBudget: number;
    categoryBudgets: Record<string, number>; // categoryId -> amount
}

export interface LifeEvent {
    id: string;
    familyId: string;
    title: string;
    amount: number;
    dueDate: string;
    type: string;
}

export interface Subscription {
    id: string;
    userId: string;
    name: string;
    amount: number;
    billingDay: number;
    categoryId: string;
}

interface AppState {
    currentUser: User | null;
    users: User[];
    categories: Category[];
    expenses: Expense[];
    budgets: Budget[];
    events: LifeEvent[];
    subscriptions: Subscription[];
    isPro: boolean; // Monetization toggle
    viewMode: "all" | "personal" | "shared"; // Scope filter

    // Actions
    addExpense: (expense: Omit<Expense, "id" | "userId">) => void;
    updateExpense: (id: string, updates: Partial<Expense>) => void;
    removeExpense: (id: string) => void;
    addCategory: (category: Omit<Category, 'id'>) => void;
    removeCategory: (id: string) => void;
    setBudget: (budget: Budget) => void;
    togglePro: () => void;
    toggleViewMode: (mode: "all" | "personal" | "shared") => void;
    switchUser: (userId: string) => void;
    updateUserStyle: (userId: string, style: NaggingStyle) => void;
    addSubscription: (sub: Omit<Subscription, "id" | "userId">) => void;
    updateSubscription: (id: string, updates: Partial<Subscription>) => void;
    removeSubscription: (id: string) => void;
    getTotalSubscriptionsAmount: () => number;
    resetData: () => void;
}

// --- Mock Data ---
const INITIAL_USERS: User[] = [
    { id: "u1", name: "宏 (Hiroshi)", email: "hiroshi@demo.com", familyId: "f1", role: "owner", naggingStyle: "friendly" },
    { id: "u2", name: "由紀 (Yuki)", email: "yuki@demo.com", familyId: "f1", role: "member", naggingStyle: "strict" },
];

const INITIAL_CATEGORIES: Category[] = [
    // Expenses
    { id: "c1", name: "食費", icon: "🍔", color: "orange", type: "expense" },
    { id: "c2", name: "交通費", icon: "電車", color: "blue", type: "expense" },
    { id: "c3", name: "住まい", icon: "🏠", color: "grape", type: "expense" },
    { id: "c4", name: "娯楽", icon: "🎮", color: "violet", type: "expense" },
    { id: "c5", name: "光熱費", icon: "💡", color: "yellow", type: "expense" },
    { id: "c6", name: "買い物", icon: "🛍️", color: "pink", type: "expense" },
    // Income
    { id: "i1", name: "給料", icon: "💰", color: "teal", type: "income" },
    { id: "i2", name: "ボーナス", icon: "💎", color: "cyan", type: "income" },
    { id: "i3", name: "副業", icon: "💻", color: "indigo", type: "income" },
    { id: "i4", name: "その他", icon: "💵", color: "gray", type: "income" },
];

// --- Store ---
export const createStore = (initialState?: Partial<AppState>) => create<AppState>()(
    persist(
        (set, get) => ({
            currentUser: INITIAL_USERS[0],
            users: INITIAL_USERS,
            categories: INITIAL_CATEGORIES,
            expenses: [],
            budgets: [],
            events: [],
            subscriptions: [],
            isPro: false,
            viewMode: "shared",
            ...initialState,

            addExpense: (data) => {
                const { currentUser, budgets, setBudget } = get();
                if (!currentUser) return;
                const newExpense: Expense = {
                    id: uuidv4(),
                    userId: currentUser.id,
                    ...data,
                };
                set((state) => ({ expenses: [newExpense, ...state.expenses] }));

                // Auto-set budget when income is added
                if (data.type === "income") {
                    const month = new Date(data.date).toISOString().slice(0, 7); // YYYY-MM
                    const incomeScope = data.scope; // Use the same scope as the income
                    const existingBudget = budgets.find(
                        b => b.familyId === currentUser.familyId && b.month === month && b.scope === incomeScope
                    );
                    const currentBudgetAmount = existingBudget?.totalBudget || 0;

                    // Add income to the existing budget (or create new) for this scope
                    setBudget({
                        familyId: currentUser.familyId,
                        month,
                        scope: incomeScope,
                        totalBudget: currentBudgetAmount + data.amount,
                        categoryBudgets: existingBudget?.categoryBudgets || {},
                    });
                }
            },

            updateExpense: (id, updates) => {
                set((state) => ({
                    expenses: state.expenses.map((e) =>
                        e.id === id ? { ...e, ...updates } : e
                    ),
                }));
            },

            removeExpense: (id) =>
                set((state) => ({
                    expenses: state.expenses.filter((e) => e.id !== id),
                })),

            addCategory: (data) => {
                const newCategory: Category = {
                    id: uuidv4(),
                    ...data,
                };
                set((state) => ({ categories: [...state.categories, newCategory] }));
            },

            removeCategory: (id) =>
                set((state) => ({
                    categories: state.categories.filter((c) => c.id !== id),
                })),

            setBudget: (newBudget) => {
                set((state) => {
                    const existingIndex = state.budgets.findIndex(
                        (b) => b.familyId === newBudget.familyId && b.month === newBudget.month && b.scope === newBudget.scope
                    );
                    if (existingIndex >= 0) {
                        const updated = [...state.budgets];
                        updated[existingIndex] = newBudget;
                        return { budgets: updated };
                    }
                    return { budgets: [...state.budgets, newBudget] };
                });
            },

            togglePro: () => set((state) => ({ isPro: !state.isPro })),

            toggleViewMode: (mode) => set({ viewMode: mode }),

            switchUser: (userId) => {
                const user = get().users.find((u) => u.id === userId);
                if (user) set({ currentUser: user });
            },

            updateUserStyle: (userId, style) => {
                set((state) => {
                    const updatedUsers = state.users.map(u =>
                        u.id === userId ? { ...u, naggingStyle: style } : u
                    );
                    const updatedCurrentUser = state.currentUser?.id === userId
                        ? { ...state.currentUser, naggingStyle: style }
                        : state.currentUser;

                    return { users: updatedUsers, currentUser: updatedCurrentUser };
                });
            },

            addSubscription: (data) => {
                const { currentUser } = get();
                if (!currentUser) return;
                const newSub: Subscription = {
                    id: uuidv4(),
                    userId: currentUser.id,
                    ...data,
                };
                set((state) => ({ subscriptions: [...state.subscriptions, newSub] }));
            },

            updateSubscription: (id, updates) => {
                set((state) => ({
                    subscriptions: state.subscriptions.map((s) =>
                        s.id === id ? { ...s, ...updates } : s
                    ),
                }));
            },

            removeSubscription: (id) =>
                set((state) => ({
                    subscriptions: state.subscriptions.filter((s) => s.id !== id),
                })),

            getTotalSubscriptionsAmount: () => {
                return get().subscriptions.reduce((sum, sub) => sum + sub.amount, 0);
            },

            resetData: () =>
                set({
                    expenses: [],
                    budgets: [],
                    subscriptions: [],
                    categories: INITIAL_CATEGORIES,
                }),
        }),
        {
            name: "pfm-storage",
            storage: createJSONStorage(() => localStorage),
            skipHydration: true,
            partialize: (state) => ({
                currentUser: state.currentUser,
                users: state.users,
                categories: state.categories, // Now persisted
                expenses: state.expenses,
                budgets: state.budgets,
                events: state.events,
                subscriptions: state.subscriptions,
                isPro: state.isPro,
                viewMode: state.viewMode,
            }),
        }
    )
);

export const useStore = createStore();
