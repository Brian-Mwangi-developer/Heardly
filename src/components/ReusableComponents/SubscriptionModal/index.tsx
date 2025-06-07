"use client";

import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { api } from '@/trpc/react';
import { type User } from '@prisma/client';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Loader2, PlusIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

type Props = {
    user: User
}


export const SubscriptionModal = ({ user }: Props) => {
    const router = useRouter();
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const getClientSecret = api.stripe.onGetStripeClientSecret.useMutation();

    const handleConfirm = async () => {
        try {
            setLoading(true)
            if (!stripe || !elements) {
                return toast.error('Stripe is not Initialized');
            }
            const intent = await getClientSecret.mutateAsync({
                userId: user.id,
                email: user.email
            });
            console.log("Intent -->", intent);
            if (!intent.secret) {
                throw new Error("Failed to Initiaze payment");
            }
            const cardElement = elements.getElement(CardElement)
            if (!cardElement) {
                throw new Error("Card Element not found");
            }
            const { error } = await stripe.confirmCardPayment(
                intent.secret,
                {
                    payment_method: {
                        card: cardElement
                    }
                })
            if (error) {
                toast.error(error.message);
                return;
            }
            toast.success('Subscription created successfully!');
            router.refresh()
        } catch (error) {
            console.error("SUBSCRIPTION -->:", error);
            toast.error('Failed to update subscription, please try again later');
        } finally {
            setLoading(false);
        }
    }
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className='rounded-xl flex gap-2 items-center hover:cursor-pointer px-4 py-2 border
                border-border bg-primary/10 backdrop-blur-sm text-sm font-normal text-primary hover:bg-primary-20'>
                    <PlusIcon />
                    Create Webinar
                </button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[425px]'>
                <DialogHeader>
                    <DialogTitle>Spotlight Subscription</DialogTitle>
                </DialogHeader>
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: "16px",
                                color: "#B4B0AE",
                                '::placeholder': {
                                    color: '#B4B0AE',
                                },

                            }
                        }
                    }} />
                <DialogFooter className='gap-4 items-center'>
                    <DialogClose
                        className='w-full sm:w-auto border border-border rounded-md px-3 py-2'
                        disabled={loading}
                    >
                        Cancel
                    </DialogClose>
                    <Button type='submit'
                        className='w-full sm:w-auto'
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                                Loading ...
                            </>
                        ) : (
                            'Confirm Subscription'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>

        </Dialog>
    )
}

