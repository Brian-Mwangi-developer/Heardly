
import AutoConnectCall from "@/components/Voice-Agents-Components/AutoConnectCall"
import { type WebinarWithPresenter } from "@/lib/types"
import { api } from "@/trpc/server"
import { CallStatusEnum } from "@prisma/client"
import { redirect } from "next/navigation"

type Props = {
    params: Promise<{
        liveWebinarId: string
    }>
    searchParams: Promise<{
        attendeeId: string
    }>
}

const page = async ({ params, searchParams }: Props) => {
    const { liveWebinarId } = await params;
    const { attendeeId } = await searchParams;

    if (!liveWebinarId || !attendeeId) {
        redirect('/404')
    }
    const attendee = await api.attendance.getAttendeeById({ id: attendeeId, webinarId: liveWebinarId })
    if (!attendee.data) {
        redirect(`/live-webinar/${liveWebinarId}?error=Attendee-not-found`)
    }
    const webinar = await api.webinar.getWebinarById({ webinarId: liveWebinarId });
    if (!webinar) {
        redirect('/404')
    }
    // if (webinar.webinarStatus === WebinarStatusEnum.WAITING_ROOM ||
    //     webinar.webinarStatus === WebinarStatusEnum.SCHEDULED
    // ) {
    //     redirect(`/live-webinar/${liveWebinarId}?error=Webinar-not-started`)
    // }
    if (webinar.ctaType !== 'BOOK_A_CALL' ||
        !webinar.aiAgentId || !webinar.priceId
    ) {
        redirect(`/live-webinar/${liveWebinarId}?error=cannot-book-a-call`)
    }
    if (attendee.data.callStatus === CallStatusEnum.COMPLETED) {
        redirect(`/live-webinar/${liveWebinarId}?error=call-not-pending`)
    }

    return (
        <AutoConnectCall
            userName={attendee.data.name}
            assistantId={webinar.aiAgentId}
            webinar={webinar as WebinarWithPresenter}
            userId={attendeeId}

        />
    )
}

export default page