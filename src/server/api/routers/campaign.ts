import { db } from "@/server/db";
import { CampaignStatusEnum } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";

export const CampaignSchema = z.object({
    name: z.string(),
    description: z.string().nullable().optional(),
    targetAudience: z.string(),
    goals: z.string(),
    createdAt: z.date().optional(),
    status: z.enum([
        CampaignStatusEnum.ACTIVE,
        CampaignStatusEnum.PAUSED,
        CampaignStatusEnum.COMPLETED,
    ]),
});

// Helper function to extract category from analysis
function extractCategoryFromAnalysis(analysis: any): string {
    if (!analysis) return 'unknown';

    const overallCategory = analysis.overallCategory?.toLowerCase() ||
        analysis.analyses?.[0]?.analysis?.overallCategory?.toLowerCase();

    return overallCategory || 'unknown';
}

//Helper to Update campaign Counts
async function updateCampaignCounts(campaignId: string) {
    const counts = await db.campaignThread.groupBy({
        by: ['category'],
        where: { campaignId },
        _count: { category: true }
    });

    const countMap = counts.reduce((acc, item) => {
        acc[item.category] = item._count.category;
        return acc;
    }, {} as Record<string, number>);

    const totalCount = await db.campaignThread.count({
        where: { campaignId }
    });

    await db.campaign.update({
        where: { id: campaignId },
        data: {
            emailCount: totalCount,
            potentialCount: countMap.potential || 0,
            queryCount: countMap.query || 0,
            deadCount: countMap.dead || 0,
        }
    });
}
export const campaignRouter = createTRPCRouter({
    getCampaigns: privateProcedure.query(async () => {
        return await db.campaign.findMany({
            include: {
                campaignThreads: {
                    select: {
                        id: true,
                        threadId: true,
                        category: true,
                        assignedAt: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }),
    createNewCampaign: privateProcedure.input(CampaignSchema).mutation(async ({ input }) => {
        return await db.campaign.create({
            data: {
                ...input,
                createdAt: new Date(),
                emailCount: 0,
                potentialCount: 0,
                queryCount: 0,
                deadCount: 0,
            },
        });
    }),
    assignThreadsToCampaign: privateProcedure
        .input(z.object({
            threadIds: z.array(z.string()),
            campaignId: z.string(),
        }))
        .mutation(async ({ input }) => {
            const { threadIds, campaignId } = input;

            try {
                // Start a transaction to ensure data consistency
                const result = await db.$transaction(async (tx) => {
                    // Get existing assignments to avoid duplicates
                    const existingAssignments = await tx.campaignThread.findMany({
                        where: {
                            campaignId,
                            threadId: { in: threadIds }
                        },
                        select: { threadId: true }
                    });

                    const existingThreadIds = existingAssignments.map(a => a.threadId);
                    const newThreadIds = threadIds.filter(id => !existingThreadIds.includes(id));

                    if (newThreadIds.length === 0) {
                        return { message: "All threads are already assigned to this campaign", count: 0 };
                    }

                    // Get analysis data for the new threads to determine categories
                    const threadAnalyses = await tx.emailAnalysis.findMany({
                        where: { threadId: { in: newThreadIds } },
                        select: { threadId: true, analysis: true }
                    });

                    // Create campaign thread assignments
                    const campaignThreadsData = newThreadIds.map(threadId => {
                        const analysis = threadAnalyses.find(a => a.threadId === threadId);
                        const category = extractCategoryFromAnalysis(analysis?.analysis);

                        return {
                            campaignId,
                            threadId,
                            category,
                        };
                    });

                    await tx.campaignThread.createMany({
                        data: campaignThreadsData,
                    });

                    return { message: "Threads assigned successfully", count: newThreadIds.length };
                });

                // Update campaign counts after successful assignment
                await updateCampaignCounts(campaignId);

                return result;
            } catch (error) {
                console.error('Error assigning threads to campaign:', error);
                throw new Error('Failed to assign threads to campaign');
            }
        }),
    removeThreadsFromCampaign: privateProcedure
        .input(z.object({
            threadIds: z.array(z.string()),
            campaignId: z.string(),
        }))
        .mutation(async ({ input }) => {
            const { threadIds, campaignId } = input;

            await db.campaignThread.deleteMany({
                where: {
                    campaignId,
                    threadId: { in: threadIds }
                }
            });

            // Update campaign counts
            await updateCampaignCounts(campaignId);

            return { message: "Threads removed from campaign successfully" };
        }),
    getCampaignThreads: privateProcedure
        .input(z.object({ campaignId: z.string() }))
        .query(async ({ input }) => {
            return await db.campaignThread.findMany({
                where: { campaignId: input.campaignId },
                include: {
                    thread: {
                        include: {
                            emails: {
                                take: 1,
                                orderBy: { sentAt: 'desc' }
                            }
                        }
                    }
                },
                orderBy: { assignedAt: 'desc' }
            });
        }),

    updateCampaignCounts: privateProcedure
        .input(z.object({ campaignId: z.string() }))
        .mutation(async ({ input }) => {
            await updateCampaignCounts(input.campaignId);
            return { message: "Campaign counts updated successfully" };
        }),

});