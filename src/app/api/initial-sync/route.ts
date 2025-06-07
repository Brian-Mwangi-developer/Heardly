import { Account } from "@/lib/account";
import { syncEmailsToDatabase } from "@/lib/sync-to-db";
import { db } from "@/server/db";
import { NextResponse, type NextRequest } from "next/server";



export const POST = async (req: NextRequest) => {
    const { accountId, userId } = await req.json();
    if (!accountId || !userId) {
        return NextResponse.json({ error: 'Missing AccountId or UserId' }, { status: 400 });
    }
    try {
        const dbAccount = await db.account.findUnique({
            where: {
                id: accountId,
                userId
            }
        })
        if (!dbAccount) return NextResponse.json({ error: 'Account Not Found' }, { status: 404 });
        const account = new Account(dbAccount.accessToken)
        const response = await account.performInitialSync()
        if (!response) return NextResponse.json({ error: 'Failed to perform initial Sync' }, { status: 500 })
        const { emails, deltaToken } = response;
        await syncEmailsToDatabase(emails, accountId)
        console.log('Sync Completed', deltaToken);
        return NextResponse.json({ success: true }, { status: 200 })
    } catch (error) {
        console.error('Error during initial sync:', error);
        return NextResponse.json({ error: 'Failed to perform initial Sync' }, { status: 500 })
    }
}