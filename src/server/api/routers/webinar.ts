import { onAuthenticateUser } from "@/actions/auth";
import { db } from "@/server/db";
import { CtaTypeEnum, WebinarStatusEnum } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";



export const WebinarFormSchema = z.object({
    basicInfo: z.object({
        webinarName: z.string().optional(),
        description: z.string().optional(),
        date: z.date().optional(),
        time: z.string().optional(),
        timeFormat: z.enum(['AM', 'PM']).optional(),
    }),
    cta: z.object({
        ctaLabel: z.string().optional(),
        tags: z.array(z.string()).optional(),
        ctaType: z.nativeEnum(CtaTypeEnum),
        aiAgent: z.string().optional(),
        priceId: z.string().optional(),
    }),
    additionalInfo: z.object({
        lockChat: z.boolean().optional(),
        couponCode: z.string().optional(),
        couponEnabled: z.boolean().optional(),
    }),
});

function combineDateTime(
    date: Date,
    timeStr: string,
    timeFormat: 'AM' | 'PM'
): Date {
    const [hoursStr, minutesStr] = timeStr.split(':')
    let hours = Number.parseInt(hoursStr || '0', 10)
    const minutes = Number.parseInt(minutesStr || '0', 10)

    // convert to 24-hour format
    if (timeFormat === 'PM' && hours < 12) {
        hours += 12;
    }
    else if (timeFormat === 'AM' && hours === 12) {
        hours = 0; // 12 AM is 00:00 in 24-hour format
    }
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0); // set hours and minutes
    return result;
}

export const webinarRouter = createTRPCRouter({
    getWebinarsByPresenterId: privateProcedure.input(z.object({
        presenterId: z.string(),
        webinarStatus: z.string().optional()
    })
    ).query(async ({ input }) => {
        let statusFilter: WebinarStatusEnum | undefined;
        switch (input.webinarStatus) {
            case "upcoming":
                statusFilter = WebinarStatusEnum.SCHEDULED;
                break;
            case "ended":
                statusFilter = WebinarStatusEnum.ENDED;
                break;
            default:
                statusFilter = undefined;
        }
        try {
            const webinars = await db.webinar.findMany({
                where: {
                    presenterId: input.presenterId,
                    ...(statusFilter && { webinarStatus: statusFilter }),
                },
                include: {
                    presenter: {
                        select: {
                            name: true,
                            stripeConnectId: true,
                            id: true,
                        },
                    },
                },
            });
            return webinars;
        } catch (error) {
            console.error("Error fetching webinars:", error);
            return [];
        }
    }),
    createWebinar: privateProcedure
        .input(WebinarFormSchema)
        .mutation(async ({ ctx, input }) => {
            try {
                const user = await onAuthenticateUser();
                if (!user.user) {
                    return { status: 401, message: "Unauthorized" };
                }
                if (!user.user.subscription) {
                    return { status: 402, message: "Subscription required" };
                }
                const presenterId = user.user.id;

                if (!input.basicInfo.webinarName) {
                    return { status: 404, message: "Webinar name is required" }
                }
                if (!input.basicInfo.date) {
                    return { status: 404, message: "Webinar date is required" }
                }
                if (!input.basicInfo.time) {
                    return { status: 404, message: "Webinar time is required" }
                }
                const combinedDateTime = combineDateTime(
                    input.basicInfo.date,
                    input.basicInfo.time,
                    input.basicInfo.timeFormat || 'AM'
                )
                const now = new Date();
                if (combinedDateTime < now) {
                    return { status: 400, message: 'Webinar date and time cannot be in the past' }
                }

                const webinar = await db.webinar.create({
                    data: {
                        title: input.basicInfo.webinarName,
                        description: input.basicInfo.description || '',
                        startTime: combinedDateTime,
                        tags: input.cta.tags || [],
                        ctaLabel: input.cta.ctaLabel,
                        ctaType: input.cta.ctaType,
                        aiAgentId: input.cta.aiAgent || null,
                        priceId: input.cta.priceId || null,
                        lockChat: input.additionalInfo.lockChat || false,
                        couponCode: input.additionalInfo.couponEnabled ? input.additionalInfo.couponCode : null,
                        couponEnabled: input.additionalInfo.couponEnabled || false,
                        presenterId: presenterId
                    }
                })
                return { status: 200, message: "Webinar created successfully", webinarId: webinar.id, webinarLink: `/webinar/${webinar.id}` };
            } catch (error) {
                console.error("Error creating webinar:", error);
                return { status: 500, message: "Internal server error" };
            }
        }),
})