import { createStore } from '@/lib/store';

describe('Subscription Store Slice', () => {
    // createStore function returns an isolated store for test isolation
    let store: ReturnType<typeof createStore>;

    beforeEach(() => {
        store = createStore();
        store.getState().resetData();
    });

    it('addSubscription should add a new subscription to the state', () => {
        store.getState().addSubscription({
            name: 'Netflix',
            amount: 17000,
            billingDay: 15,
            categoryId: 'entertainment',
        });

        const subscriptions = store.getState().subscriptions;
        expect(subscriptions).toHaveLength(1);
        expect(subscriptions[0].name).toBe('Netflix');
        expect(subscriptions[0].id).toBeDefined(); // Ensures UUID is appended
    });

    it('removeSubscription should remove an existing subscription by id', () => {
        store.getState().addSubscription({
            name: 'Netflix',
            amount: 17000,
            billingDay: 15,
            categoryId: 'entertainment',
        });
        const subId = store.getState().subscriptions[0].id;

        store.getState().removeSubscription(subId);
        expect(store.getState().subscriptions).toHaveLength(0);
    });

    it('updateSubscription should modify an existing subscription', () => {
        store.getState().addSubscription({
            name: 'Netflix',
            amount: 17000,
            billingDay: 15,
            categoryId: 'entertainment',
        });
        const subId = store.getState().subscriptions[0].id;

        store.getState().updateSubscription(subId, { amount: 20000 });
        expect(store.getState().subscriptions[0].amount).toBe(20000);
    });

    it('getTotalSubscriptionsAmount should calculate the correct sum of current subscriptions', () => {
        store.getState().addSubscription({
            name: 'Netflix', amount: 17000, billingDay: 15, categoryId: 'entertainment',
        });
        store.getState().addSubscription({
            name: 'Spotify', amount: 10900, billingDay: 5, categoryId: 'entertainment',
        });

        expect(store.getState().getTotalSubscriptionsAmount()).toBe(27900);
    });
});
