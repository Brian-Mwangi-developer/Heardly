"use server";
import { auth } from "@clerk/nextjs/server";
import axios from "axios";


export const getAurinkoAuthUrl = async (serviceType: 'Google' | 'office365') => {
    const { userId } = await auth();
    if (!userId) throw new Error("User not authenticated");

    const params = new URLSearchParams({
        clientId: process.env.AURINKO_CLIENT_ID as string,
        serviceType,
        scopes: 'Mail.Read Mail.ReadWrite Mail.Send Mail.Drafts Mail.All',
        response_type: 'code',
        returnUrl: `${process.env.NEXT_PUBLIC_URL}/api/aurinko/callback`,
    })
    return `https://api.aurinko.io/v1/auth/authorize?${params.toString()}`
}

export const exchangeCodeForAccessToken = async (code: string) => {
    try {
        const response = await axios.post(`https://api.aurinko.io/v1/auth/token/${code}`, {}, {
            auth: {
                username: process.env.AURINKO_CLIENT_ID as string,
                password: process.env.AURINKO_CLIENT_SECRET as string
            }
        })
        console.log('Received Token:', response.data);
        return response.data as {
            accountId: number;
            accessToken: string;
            userId: string;
            UserSession: string;
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(error.response?.data)
        }
        console.error(error)
    }
}

export const getAccountDetails = async (accessToken: string) => {
    try {
        const response = await axios.get(`https://api.aurinko.io/v1/account`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
        console.log('Account Details:', response.data);
        return response.data as {
            email: string,
            name: string
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Error Fetching account details", error.response?.data)
        } else {
            console.error("unexpected Error Fetching account details", error)
        }
        console.error(error)
    }
}