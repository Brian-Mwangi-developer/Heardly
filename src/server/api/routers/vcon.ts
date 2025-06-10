import { db } from "@/server/db";
import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";

export const vconsRouter = createTRPCRouter({
    getVconsByThreadId: privateProcedure.input(z.object({
        threadId: z.string()
    })).query(async ({ input }) => {
        const vcon = await db.conversation.findFirst({
            where: {
                threadId: input.threadId
            },
            select: {
                vcon: true
            }

        })
        if (!vcon) {
            return null;
        }
        return vcon?.vcon
    })
})