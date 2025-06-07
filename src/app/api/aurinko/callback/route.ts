// api/aurinko/callback/route.ts

import { exchangeCodeForAccessToken, getAccountDetails } from "@/lib/aurinko";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { waitUntil } from "@vercel/functions";
import axios from "axios";
import { NextResponse, type NextRequest } from "next/server";




export const GET = async (req: NextRequest) => {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    const params = req.nextUrl.searchParams;
    const status = params.get('status')
    if (status !== 'success') return NextResponse.json({ message: "Failed to Link Account" }, { status: 400 });
    //get Code to Exchange for Access Token
    const code = params.get('code');
    if (!code) return NextResponse.json({ message: "No Code Provided" }, { status: 400 });
    console.log('Received Code:', code);
    const token = await exchangeCodeForAccessToken(code)
    if (!token) return NextResponse.json({ message: "Failed to Exchange Code for Access Token" }, { status: 400 })

    const accountDetails = await getAccountDetails(token.accessToken);
    console.log('Account Details in Aurinko Callback:', accountDetails);
    if (!accountDetails) return NextResponse.json({ message: "Failed to Get Account Details" }, { status: 400 })
    await db.account.upsert({
        where: {
            id: token.accountId.toString()
        },
        update: {
            accessToken: token.accessToken,
        },
        create: {
            id: token.accountId.toString(),
            userId,
            emailAddress: accountDetails.email,
            name: accountDetails.name,
            accessToken: token.accessToken
        },
    })
    //trigger Initial Sync endpoint
    waitUntil(
        axios.post(`${process.env.NEXT_PUBLIC_URL}/api/initial-sync`, {
            accountId: token.accountId.toString(),
            userId
        }).then(response => {
            console.log('initial Sync triggered', response.data);
        }).catch(error => {
            console.error('Error triggering initial sync', error);
        })
    )
    return NextResponse.redirect(new URL('/mail', req.url))

}


