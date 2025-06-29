import { loadStripe } from '@stripe/stripe-js';

export const useStripeElements = (connectedAccountId?: string) => {
    if (connectedAccountId) {
        const StripePromise = () =>
            loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '', {
                stripeAccount: connectedAccountId,
            });
        return { StripePromise };
    }
    const StripePromise = () =>
        loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '');
    return { StripePromise };
};