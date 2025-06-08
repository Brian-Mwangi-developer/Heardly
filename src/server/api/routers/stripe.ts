import { changeAttendanceType } from "@/actions/attendance";
import { onAuthenticateUser } from "@/actions/auth";
import { subscriptionPriceId } from "@/lib/data";
import { stripe } from "@/lib/stripe";
import { db } from "@/server/db";
import Stripe from "stripe";
import z from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";

export const stripeRouter = createTRPCRouter({
    onGetStripeClientSecret: privateProcedure.input(z.object({
        email: z.string(),
        userId: z.string(),
    })
    ).mutation(async ({ input }) => { 
        try {
            let customer: Stripe.Customer
            const existingCustomer = await stripe.customers.list({ email: input.email })
            if (existingCustomer.data.length > 0) {
                customer = existingCustomer.data[0]!
            } else {
                // create a new customer if one does not exist
                customer = await stripe.customers.create({
                    email: input.email,
                    metadata: {
                        userId: input.userId
                    }
                });
            }
            await db.user.update({
                where: { id: input.userId },
                data: { stripeCustomerId: customer.id }
            })
            const subscription = await stripe.subscriptions.create({
                customer: customer.id,
                items: [{ price: subscriptionPriceId }],
                payment_behavior: 'default_incomplete',
                expand: ['latest_invoice.payment_intent'],
                metadata: {
                    userId: input.userId
                },
            })
            console.log("Subscription created:", subscription.id);
            const paymentIntent = (subscription.latest_invoice as Stripe.Invoice).payment_intent as Stripe.PaymentIntent;
            return {
                status: 200,
                secret: paymentIntent.client_secret,
                customerId: customer.id
            }
        } catch (error) {
            console.error("Subscription Creation Error:", error);
            return {
                message: "Failed to create Subscription",
                status: 400,
            }
        }
    }),
    getAllProductsFromStripe: privateProcedure.query(async () => {
        try {
            const currentUser = await onAuthenticateUser();
            if (!currentUser.user) {
                return {
                    error: "User not authenticated",
                    status: 401,
                    success: false
                }
            }
            if (!currentUser.user.stripeConnectId) {
                return {
                    error: "User not connected to Stripe",
                    status: 401,
                    success: false
                }
            }
            const products = await stripe.products.list(
                {},
                {
                    stripeAccount: currentUser.user.stripeConnectId
                }
            )
            return {
                products: products.data,
                status: 200,
                success: true
            }
        } catch (error) {
            console.error("Error fetching products from Stripe:", error);
            return {
                error: "Failed to fetch products",
                status: 500,
                success: false
            }
        }
    }),
    createCheckoutLink: privateProcedure.input(z.object({
        priceId: z.string(),
        stripeId: z.string(),
        attendeeId: z.string(),
        webinarId: z.string(),
        bookCall: z.boolean().default(false),
    })
    ).mutation(async ({ input }) => {
        const { priceId, stripeId, attendeeId, webinarId, bookCall } = input;
        try {
            const session = await stripe.checkout.sessions.create(
                {
                    line_items: [
                        {
                            price: priceId,
                            quantity: 1,
                        },
                    ],
                    mode: 'subscription',
                    success_url: `${process.env.NEXT_PUBLIC_URL}/`,
                    cancel_url: `${process.env.NEXT_PUBLIC_URL}/`,
                    metadata: {
                        attendeeId: attendeeId,
                        webinarId: webinarId
                    },
                },
                {
                    stripeAccount: stripeId
                }
            )
            if (bookCall) {
                await changeAttendanceType(attendeeId, webinarId, 'ADDED_TO_CART')
            }
            return {
                sessionUrl: session.url,
                status: 200,
                success: true
            }
        } catch (error) {
            console.log("Error creating checkout link:", error);
            return {
                error: 'Error creating checkout link',
                status: 500,
                success: false
            }
        }
    }),
})