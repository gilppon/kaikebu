import { render, screen, fireEvent } from '@testing-library/react';
import PredictionCard from '@/components/PredictionCard';
import { useStore } from '@/lib/store';
import { MantineProvider } from '@mantine/core';

// Mock the store so we can inject initial subscriptions
jest.mock('@/lib/store', () => ({
    useStore: jest.fn(),
}));

describe('PredictionCard UI Component', () => {
    beforeEach(() => {
        (useStore as unknown as jest.Mock).mockReturnValue({
            currentUser: { id: 'u1', name: 'User1' },
            budgets: [{ familyId: 'f1', month: '2024-05', scope: 'shared', totalBudget: 500000, categoryBudgets: {} }],
            expenses: [{ id: 'e1', amount: 100000, type: 'expense', scope: 'shared', date: '2024-05-10T00:00:00.000Z' }],
            subscriptions: [], // Start without subscriptions
            getTotalSubscriptionsAmount: () => 0,
        });
    });

    const renderCard = () =>
        render(
            <MantineProvider>
                <PredictionCard />
            </MantineProvider>
        );

    it('should display the base budget without subscriptions correctly', () => {
        renderCard();
        // 500k budget - 100k expense = 400k remaining
        expect(screen.getByText(/400,000/)).toBeInTheDocument();
        // Ensures no fixed subscription warning if 0
        expect(screen.queryByText(/고정 지출/)).not.toBeInTheDocument();
    });

    it('should subtract the subscription amount from the budget prediction', () => {
        (useStore as unknown as jest.Mock).mockReturnValue({
            currentUser: { id: 'u1', name: 'User1' },
            budgets: [{ familyId: 'f1', month: '2024-05', scope: 'shared', totalBudget: 500000, categoryBudgets: {} }],
            expenses: [{ id: 'e1', amount: 100000, type: 'expense', scope: 'shared', date: '2024-05-10T00:00:00.000Z' }],
            subscriptions: [{ id: 's1', amount: 17000, name: 'Netflix' }],
            getTotalSubscriptionsAmount: () => 17000,
        });

        renderCard();

        // 500k budget - 100k expense - 17k subscriptions = 383k remaining predicted
        expect(screen.getByText(/383,000/)).toBeInTheDocument();
        expect(screen.getByText(/고정 지출/)).toBeInTheDocument(); // Expect notification of the subscriptions
        expect(screen.getByText(/17,000/)).toBeInTheDocument(); // Total subscription amount
    });
});
