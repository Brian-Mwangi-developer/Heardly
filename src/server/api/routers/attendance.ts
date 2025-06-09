import { z } from "zod";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../trpc";

import { changeAttendanceType } from "@/actions/attendance";
import type { AttendanceData } from "@/lib/types";
import { db } from "@/server/db";
import { AttendedTypeEnum, CallStatusEnum, CtaTypeEnum } from "@prisma/client";

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

    registerAttendee: publicProcedure.input(
        z.object({
            webinarId: z.string(),
            email: z.string(),
            name: z.string(),
        })
    ).mutation(async ({ input }) => {
        const { webinarId, email, name } = input;
        try {

            if (!webinarId || !email || !name) {
                return { success: false, status: 400, message: "Invalid input" }
            }
            const webinar = await db.webinar.findUnique({
                where: { id: webinarId },
            })

            if (!webinar) {
                return { success: false, status: 404, message: "Webinar not found" }
            }
            let attendee = await db.attendee.findUnique({
                where: { email: email }
            })
            if (!attendee) {
                attendee = await db.attendee.create({
                    data: { email, name }
                })
            }
            // check for existing attendance
            const existingAttendance = await db.attendance.findFirst({
                where: {
                    attendeeId: attendee.id,
                    webinarId: webinarId
                },
                include: {
                    user: true
                }
            })
            if (existingAttendance) {
                return {
                    success: true,
                    status: 200,
                    message: "You have already registered for this webinar",
                    data: existingAttendance
                }
            }
            // Create attendance Record
            const attendance = await db.attendance.create({
                data: {
                    attendedType: AttendedTypeEnum.REGISTERED,
                    attendeeId: attendee.id,
                    webinarId: webinarId,
                },
                include: {
                    user: true
                }
            })
            return {
                success: true,
                status: 201,
                message: "Successfully registered for the webinar",
                createdAt: attendance.createdAt,
                updatedAt: attendance.updatedAt,
                data: attendance
            }
        } catch (error) {
            console.error("Error registering attendee:", error);
            return {
                success: false,
                status: 500,
                message: "Failed to register for the webinar",
                error
            }
        }
    }),
    changeCallStatus: publicProcedure.input(z.object({
        attendeeId: z.string(),
        callStatus: z.nativeEnum(CallStatusEnum)
    })
    ).mutation(async ({ input }) => {
        const { attendeeId, callStatus } = input;
        try {
            const attendee = await db.attendee.update({
                where: { id: attendeeId },
                data: {
                    callStatus: callStatus
                }
            })
            return {
                success: true,
                status: 200,
                message: "Call status updated successfully",
                data: attendee
            }
        } catch (error) {
            console.error("Error changing call status:", error);
            return {
                success: false,
                status: 500,
                message: "Failed to update call status",
                error
            }
        }
    }),
    changeAttendeeType: publicProcedure.input(z.object({
        attendeeId: z.string(),
        attendedType: z.nativeEnum(AttendedTypeEnum),
        webinarId: z.string()
    })).mutation(async ({ input }) => {
        try {
            const attendance = await changeAttendanceType(input.attendeeId, input.webinarId, input.attendedType);
            return {
                success: true,
                status: 200,
                message: "Attendance type updated successfully",
                data: attendance
            }
        } catch (error) {
            console.error("Error changing attendance type:", error);
            return {
                success: false,
                status: 500,
                message: "Failed to update attendance type",
                error
            }
        }
    }),
    getAttendeeById: publicProcedure.input(z.object({
        id: z.string(),
        webinarId: z.string()
    })).query(async ({ input }) => {
        const { id, webinarId } = input;
        try {
            const attendee = await db.attendee.findUnique({
                where: {
                    id
                }
            })
            const attendance = await db.attendance.findFirst({
                where: {
                    attendeeId: id,
                    webinarId: webinarId
                }
            })
            if (!attendee || !attendance) {
                return { success: false, status: 404, message: "Attendee not found" }
            }
            return {
                success: true,
                status: 200,
                data: attendee,
                message: 'Get attendee details successfully'
            }
        } catch (error) {
            console.error("Error fetching attendee by ID:", error);
            return {
                success: false,
                status: 500,
                message: "Failed to fetch attendee details",
            }
        }
    })
});