import { createTRPCRouter, privateProcedure } from "../trpc";
import { z } from "zod";

import type { AttendanceData } from "@/lib/types";
import { AttendedTypeEnum, CtaTypeEnum } from "@prisma/client";
import { db } from "@/server/db";

export const attendanceRouter = createTRPCRouter({
    getWebinarAttendance: privateProcedure
        .input(
            z.object({
                webinarId: z.string(),
                includeUsers: z.boolean().optional().default(true),
                userLimit: z.number().optional().default(100),
            })
        )
        .query(async ({ input }) => {
            try {
                const webinar = await db.webinar.findUnique({
                    where: { id: input.webinarId },
                    select: {
                        id: true,
                        ctaType: true,
                        tags: true,
                        presenter: true,
                        _count: {
                            select: {
                                attendances: true,
                            },
                        },
                    },
                });
                if (!webinar) {
                    return { success: false, status: 404, message: "Webinar not found" };
                }
                const attendanceCounts = await db.attendance.groupBy({
                    by: ["attendedType"],
                    where: { webinarId: input.webinarId },
                    _count: {
                        attendedType: true,
                    },
                });
                const result: Record<AttendedTypeEnum, AttendanceData> = {} as Record<
                    AttendedTypeEnum,
                    AttendanceData
                >;

                for (const type of Object.values(AttendedTypeEnum)) {
                    if (
                        type === AttendedTypeEnum.ADDED_TO_CART &&
                        webinar.ctaType === CtaTypeEnum.BOOK_A_CALL
                    )
                        continue;
                    if (
                        type === AttendedTypeEnum.BREAKOUT_ROOM &&
                        webinar.ctaType !== CtaTypeEnum.BOOK_A_CALL
                    )
                        continue;
                    const countItem = attendanceCounts.find((item) => {
                        if (
                            webinar.ctaType === CtaTypeEnum.BOOK_A_CALL &&
                            type === AttendedTypeEnum.BREAKOUT_ROOM &&
                            item.attendedType === AttendedTypeEnum.ADDED_TO_CART
                        ) {
                            return true;
                        }
                        return item.attendedType === type;
                    });
                    result[type] = {
                        count: countItem ? countItem._count.attendedType : 0,
                        users: [],
                    };
                }
                if (input.includeUsers) {
                    for (const type of Object.values(AttendedTypeEnum)) {
                        if (
                            (type === AttendedTypeEnum.ADDED_TO_CART &&
                                webinar.ctaType === CtaTypeEnum.BOOK_A_CALL) ||
                            (type === AttendedTypeEnum.BREAKOUT_ROOM &&
                                webinar.ctaType !== CtaTypeEnum.BOOK_A_CALL)
                        ) {
                            continue;
                        }
                        const queryType =
                            webinar.ctaType === CtaTypeEnum.BOOK_A_CALL &&
                                type === AttendedTypeEnum.BREAKOUT_ROOM
                                ? AttendedTypeEnum.ADDED_TO_CART
                                : type;
                        if (result[type].count > 0) {
                            const attendances = await db.attendance.findMany({
                                where: {
                                    webinarId: input.webinarId,
                                    attendedType: queryType,
                                },
                                include: {
                                    user: true,
                                },
                                take: input.userLimit,
                                orderBy: {
                                    joinedAt: "desc",
                                },
                            });
                            result[type].users = attendances.map((attendance) => ({
                                id: attendance.user.id,
                                name: attendance.user.name,
                                email: attendance.user.email,
                                joinedAt: attendance.joinedAt,
                                createdAt: attendance.createdAt,
                                updatedAt: attendance.updatedAt,
                                stripeConnectId: null,
                                callStatus: attendance.user.callStatus,
                            }));
                        }
                    }
                }
                return {
                    success: true,
                    data: result,
                    ctaType: webinar.ctaType,
                    webinarTags: webinar.tags || [],
                    presenter: webinar.presenter,
                };
            } catch (error) {
                console.error("Failed to fetch attendance data:", error);
                return {
                    success: false,
                    error: "Failed to fetch attendance data",
                };
            }
        }),
});