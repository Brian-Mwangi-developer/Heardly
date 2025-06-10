import { analyzeEmailThread, type EmailThread } from '@/lib/analyse';
import { z } from 'zod';
import { createTRPCRouter, privateProcedure } from "../trpc";

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
    })
})