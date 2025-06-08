"use client";

import { type WebinarWithPresenter } from "@/lib/types";
import { useAttendeeStore } from "@/store/useAttendeeStore";
import { type User, WebinarStatusEnum } from "@prisma/client";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { toast } from "sonner";
import { LiveStreamState } from "./LiveWebinar/LiveStreamState";
import { Participant } from "./Participant";
import { WebinarUpcomingState } from "./UpcomingWebinars/WebinarUpcomingState";

type Props = {
    error: string | undefined;
    user: User | null;
    webinar: WebinarWithPresenter;
    apiKey: string;
}

export const RenderWebinar = ({ error, user, webinar, apiKey, }: Props) => {
    const router = useRouter();
    const pathname = usePathname();
    const { attendee } = useAttendeeStore()

    useEffect(() => {
        if (error) {
            toast.error(error)
            router.push(pathname)
        }
    }, [error, pathname, router])
    return (
        <React.Fragment>
            {webinar.webinarStatus === WebinarStatusEnum.LIVE ? (
                <React.Fragment>
                    {user?.id === webinar.presenterId ? (
                        <LiveStreamState
                            apiKey={apiKey}
                            webinar={webinar}
                            user={user}
                            callId={webinar.id}
                        />
                    ) : attendee ? (
                        <Participant
                            apiKey={apiKey}
                            webinar={webinar}
                            callId={webinar.id}
                        />
                    ) : (
                        <WebinarUpcomingState
                            webinar={webinar}
                            currentUser={user || null}
                        />
                    )}
                </React.Fragment>
            ) : webinar.webinarStatus === WebinarStatusEnum.CANCELLED ?
                (
                    <div className="flex justify-center items-center h-full w-full">
                        <div className="text-center space-y-4">
                            <h3 className="text-2xl font-semibold text-primary">{webinar?.title}</h3>
                            <p className="text-muted-foreground text-xs">This webinar has been cancelled</p>
                        </div>
                    </div>
                ) : webinar.webinarStatus === WebinarStatusEnum.ENDED ?
                    (
                        <p className="text-muted-foreground text-xl">This Webinar has ended.</p>
                    ) : (
                        <WebinarUpcomingState
                            webinar={webinar}
                            currentUser={user || null} />
                    )}
        </React.Fragment>
    )
}



