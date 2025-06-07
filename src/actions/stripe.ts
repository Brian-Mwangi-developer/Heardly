"use server";

import { stripe } from "@/lib/stripe";
import { onAuthenticateUser } from "./auth";

export const getAllProductsFromStripe = async () => {
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
}