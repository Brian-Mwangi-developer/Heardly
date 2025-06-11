import { analyzeEmailThread, type EmailThread } from '@/lib/analyse';
import { z } from 'zod';
import { createTRPCRouter, privateProcedure } from "../trpc";

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const analysisRouter = createTRPCRouter({
    analyzeThread: privateProcedure.input(z.object({
        threadId: z.string()
    })).mutation(async ({ input, ctx }) => {
        const thread = await ctx.db.thread.findFirst({
            where: {
                id: input.threadId
            },
            include: {
                emails: {
                    orderBy: {
                        sentAt: 'asc'
                    },
                    select: {
                        from: true,
                        body: true,
                        bodySnippet: true,
                        emailLabel: true,
                        subject: true,
                        sysLabels: true,
                        id: true,
                        sentAt: true
                    }
                }
            }
        });
        if (!thread) {
            throw new Error('Thread not found');
        }
        const analyses = [];
        const totalEmails = thread.emails.length;
        console.log("Email Length is", thread.emails.length);

        if (!thread.emails || thread.emails.length === 0) {
            throw new Error('Thread has no emails');
        }
        for (let i = 0; i < thread.emails.length; i++) {
            const email = thread.emails[i];
            if (!email) {
                console.warn(`Email at index ${i} is undefined, skipping.`);
                continue;
            }
            const emailThread: EmailThread = {
                subject: email.subject || '',
                body: email.body || '',
                sender: email.from?.address || '',
                timestamp: email.sentAt?.toISOString() || '',
            };
            try {
                if (i > 0) {
                    console.log(`Waiting 1 second before processing email ${i + 1}...`);
                    await delay(1000);
                }
                const analysis = await analyzeEmailThread(emailThread, undefined, {
                    onProgress: (step, progress) => {
                        // In a real implementation, you'd emit this via WebSocket or SSE
                        console.log(`Email ${i + 1}/${totalEmails}: ${step} (${progress}%)`);
                    },
                    onEmailStart: (emailIndex, total, subject) => {
                        console.log(`Starting analysis of email ${emailIndex + 1}/${total}: ${subject}`);
                    },
                    onEmailComplete: (emailIndex, analysis) => {
                        console.log(`Completed analysis of email ${emailIndex + 1}`);
                    }
                });
                analyses.push({
                    emailId: email.id,
                    analysis,
                });
                // Save the analysis result to the database
                await ctx.db.emailAnalysis.upsert({
                    where: { threadId: input.threadId },
                    update: { analysis: { analyses, totalEmails: thread.emails.length, analyzedAt: new Date() } },
                    create: {
                        threadId: input.threadId,
                        analysis: { analyses, totalEmails: thread.emails.length, analyzedAt: new Date() },
                    },
                });

            } catch (error) {
                console.error(`Failed to analyze email ${email.id}:`, error);
                analyses.push({
                    emailId: email.id,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }
        return {
            threadId: input.threadId,
            analyses,
            totalEmails: thread.emails.length,
            analyzedAt: new Date(),
        };
    }),
    saveThreadAnalysis: privateProcedure.input(z.object({
        threadId: z.string(),
        analysis: z.any().describe("The analysis result to save for the thread")
    })).mutation(async ({ input, ctx }) => {
        const thread = await ctx.db.thread.findFirst({
            where: {
                id: input.threadId
            }
        });
        if (!thread) {
            throw new Error('Thread not found');
        }
        const createAnalysis = await ctx.db.emailAnalysis.create({
            data: {
                threadId: input.threadId,
                analysis: input.analysis,
            }
        });
        return createAnalysis;
    }),
    updateThreadAnalysis: privateProcedure.input(z.object({
        threadId: z.string(),
        analysis: z.any().describe("The updated analysis result for the thread")
    })).mutation(async ({ input, ctx }) => {
        const thread = await ctx.db.thread.findFirst({
            where: {
                id: input.threadId
            }
        });
        if (!thread) {
            throw new Error('Thread not found');
        }
        const updatedAnalysis = await ctx.db.emailAnalysis.update({
            where: {
                threadId: input.threadId
            },
            data: {
                analysis: input.analysis,
            }
        });
        return updatedAnalysis;
    }),
    getThreadAnalysis: privateProcedure.input(z.object({
        threadId: z.string()
    })).query(async ({ input, ctx }) => {
        const analysis = await ctx.db.emailAnalysis.findFirst({
            where: {
                threadId: input.threadId
            }
        });
        if (!analysis) {
            return null
        }
        return analysis.analysis;
    })
})