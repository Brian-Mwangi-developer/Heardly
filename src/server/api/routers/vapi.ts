import { vapiServer } from "@/lib/vapi/vapiServer";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const VapiRouter = createTRPCRouter({
    getAllAssistants: publicProcedure.query(async () => {
        try {
            const getAllAgents = await vapiServer.assistants.list();
            return {
                success: true,
                status: 200,
                data: getAllAgents
            };
        } catch (error) {
            console.error("Error fetching assistants:", error);
            return {
                success: false,
                status: 500,
                error: "Failed to fetch assistants"
            };
        }
    })
})