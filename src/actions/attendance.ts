import { db } from "@/server/db";
import { AttendedTypeEnum } from "@prisma/client";

export async function changeAttendanceType(attendeeId: string, webinarId: string, attendedType: AttendedTypeEnum) {
    return db.attendance.update({
        where: {
            attendeeId_webinarId: {
                attendeeId,
                webinarId
            },
        },
        data: {
            attendedType
        }
    });
}