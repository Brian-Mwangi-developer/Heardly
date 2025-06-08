import { getStreamClient } from "@/lib/stream/streamClient";
import { CallStatusEnum } from "@prisma/client";
import { type UserRequest } from "@stream-io/node-sdk";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const AttendeeSchema = z.object({
    name: z.string(),
    id: z.string(),
    email: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    callStatus: z.nativeEnum(CallStatusEnum)
})

export const streamIoRouter = createTRPCRouter({
    getStreamIoToken: publicProcedure.input(z.object({
        attendee: AttendeeSchema,
    })).mutation(async ({ input }) => {
        const { attendee } = input;
        try {
            const newUser: UserRequest = {
                id: attendee?.id || 'guest',
                role: "user",
                name: attendee?.name || 'Guest',
                image: `https://api.dicebear.com/7.x/initials/svg?seed=${attendee?.name || 'Guest'}`
            }
            await getStreamClient.upsertUsers([newUser]);
            //By default the token is valid for an Hour
            const validity = 60 * 60 * 60
            const token = getStreamClient.generateUserToken({
                user_id: attendee?.id || 'guest',
                validity_in_seconds: validity,
            })
            return token;
        } catch (error) {
            console.error("Error generating Stream IO token:", error);
            throw new Error("Failed to generate Stream IO token");
        }
    }),
    getTokenForHost: publicProcedure.input(z.object({
        userId: z.string(),
        username: z.string(),
        profilePic: z.string()
    })).mutation(async ({ input }) => {
        const { userId, username, profilePic } = input;
        try {
            const newUser: UserRequest = {
                id: userId,
                role: "moderator",
                name: username || "Guest",
                image: profilePic || `https://api.dicebear.com/7.x/initials/svg?seed=${username || 'Guest'}`
            }
            await getStreamClient.upsertUsers([newUser]);
            const validity = 60 * 60 * 60;
            const token = getStreamClient.generateUserToken({
                user_id: userId,
                validity_in_seconds: validity
            })
            return token
        } catch (error) {
            console.error("Error generating Stream IO token for host:", error);
            throw new Error("Failed to generate Stream IO token for host");
        }
    }),
})