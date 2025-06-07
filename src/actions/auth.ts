"use server"

import { db } from "@/server/db";
import { currentUser } from "@clerk/nextjs/server";



export async function onAuthenticateUser() {
    try {
        const user = await currentUser();
        if (!user) {
            return { status: 403, message: "User not authenticated" }
        }
        const userExists = await db.user.findUnique({
            where: {
                clerkId: user.id,
            }
        })
        if (userExists) {
            return { status: 200, user: userExists }
        }

        const newUser = await db.user.create({
            data: {
                clerkId: user.id,
                email: user.emailAddresses?.[0]?.emailAddress || '',
                name: user.firstName + '' + user.lastName,
                profileImage: user.imageUrl
            }
        })
        if (!newUser) {
            return { status: 500, message: "Failed to create user" }
        }
        return { status: 201, user: newUser }
    } catch (error) {
        return { status: 500, message: "Internal server error", error: error }
    }
}