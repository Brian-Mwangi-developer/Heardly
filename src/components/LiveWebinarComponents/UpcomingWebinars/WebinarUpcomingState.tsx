"use client";

// import { createAndStartStream } from "@/actions/streamIo";
// import { changeWebinarStatus } from "@/actions/webinar";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { type User, type Webinar, WebinarStatusEnum } from "@prisma/client";
import { format } from "date-fns";
import { Calendar, Clock, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { CountDownTimer } from "./count-down-timer";
import { WaitListComponent } from "./wait-list-component";

type Props = {
    webinar: Webinar,
    currentUser: User | null
}

export const WebinarUpcomingState = ({ webinar, currentUser }: Props) => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const changeWebinarStatus = api.webinar.changeWebinarStatus.useMutation()
    const handleStartWebinar = async () => {
        setLoading(true)
        try {
            if (!currentUser?.id) {
                throw new Error("User not authenticated");
            }
            // await createAndStartStream(webinar)
            const res = await changeWebinarStatus.mutateAsync({ webinarId: webinar.id, status: WebinarStatusEnum.LIVE });
            if (!res?.sucess) {
                throw new Error(res?.message || "Failed to start webinar");
            }
            toast.success("Webinar started successfully");
            router.refresh()
        } catch (error) {
            console.error("Error starting webinar:", error);
            toast.error("Failed to start webinar, please try again later");
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className=" w-full min-h-screen mx-auto max-w-[400px] flex flex-col items-center gap-8 py-20">
            <div className="space-y-6">
                <p className="text-3xl font-semibold text-primary text-center">
                    Webinar  Starts in:
                </p>
                <CountDownTimer
                    targetDate={new Date(webinar.startTime)}
                    className="text-center"
                    webinarId={webinar.id}
                    webinarStatus={webinar.webinarStatus}
                />
            </div>
            <div className="space-y-6 w-full h-full flex justify-center flex-col">
                <div className="w-full max-w-md aspect-[4/3] relative rounded-4xl overflow-hidden mb-6">
                    <Image
                        src={"/attendanceimage.jpg"}
                        alt={webinar.title}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
                {
                    webinar?.webinarStatus === WebinarStatusEnum.SCHEDULED ? (
                        <WaitListComponent
                            webinarId={webinar.id}
                            webinarStatus={webinar.webinarStatus}
                        />
                    ) : webinar?.webinarStatus === WebinarStatusEnum.WAITING_ROOM ? (
                        <>
                            {currentUser?.id === webinar?.presenterId ? (
                                <Button
                                    className="w-full max-w-[400px] font-semibold"
                                    onClick={handleStartWebinar}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin mr-2" />
                                            Starting ...
                                        </>
                                    ) : (
                                        'Start Webinar'
                                    )}
                                </Button>
                            ) : (
                                <WaitListComponent
                                    webinarId={webinar.id}
                                    webinarStatus={'WAITING_ROOM'}
                                />
                            )}
                        </>
                    ) : webinar.webinarStatus === WebinarStatusEnum.LIVE ? (
                        <WaitListComponent
                            webinarId={webinar.id}
                            webinarStatus="LIVE"
                        />
                    ) : webinar.webinarStatus === WebinarStatusEnum.CANCELLED ? (
                        <p className="text-xl text-foreground text-center font-semibold">Webinar is Cancelled</p>
                    ) : (
                        <Button disabled={true}> Ended</Button>
                    )}
            </div>
            <div className="text-center space-y-4">
                <h3 className="text-2xl font-semibold text-primary">
                    {webinar?.title}
                </h3>
                <p className="text-muted-foreground text-xs">{webinar.description}</p>
                <div className="w-full justify-center flex gap-2 flex-wrap items-center">
                    <Button
                        variant="outline"
                        className="rounded-md bg-secondary backdrop-blur-2xl">
                        <Calendar className="mr-2" />
                        {format(new Date(webinar.startTime), 'dd MMM yyyy')}
                    </Button>
                    <Button
                        variant="outline"
                        className="rounded-md bg-secondary backdrop-blur-2xl">
                        <Clock className="mr-2" />
                        {format(new Date(webinar.startTime), 'hh:mm a')}
                    </Button>
                </div>
            </div>
        </div>
    )
}