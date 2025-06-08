"use client";


import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAttendeeStore } from "@/store/useAttendeeStore";
import { api } from "@/trpc/react";
import { WebinarStatusEnum } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

type Props = {
    webinarId: string;
    webinarStatus: WebinarStatusEnum;
    onRegistered?: () => void;

}



export const WaitListComponent = ({
    webinarId,
    webinarStatus,
    onRegistered
}: Props) => {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const buttonText = () => {
        switch (webinarStatus) {
            case WebinarStatusEnum.SCHEDULED:
                return "Get Reminder";
            case WebinarStatusEnum.WAITING_ROOM:
                return "Waiting Room";
            case WebinarStatusEnum.LIVE:
                return "Join Webinar";
            default:
                return "Register Now";
        }
    }

    const { setAttendee } = useAttendeeStore()
    const registerAttendee = api.attendance.registerAttendee.useMutation()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        console.log("Registering attendee:", { email, name, webinarId });
        try {
            const res = await registerAttendee.mutateAsync({
                email,
                name,
                webinarId
            })
            if (!res.success) {
                throw new Error(res.message || "Failed to register");
            }
            if (res?.data?.user) {
                setAttendee({
                    id: res.data.user.id,
                    name: res.data.user.name,
                    email: res.data.user.email,
                    callStatus: "PENDING",
                    createdAt: res.data.user.createdAt ? new Date(res.data.user.createdAt) : new Date(),
                    updatedAt: res.data.user.updatedAt ? new Date(res.data.user.updatedAt) : new Date()
                })
            }

            toast.success(
                webinarStatus === WebinarStatusEnum.LIVE
                    ? 'successfully joined the webinar!'
                    : "successfully registered for the webinar"
            )
            setEmail('')
            setName('')
            setSubmitted(true);
            setTimeout(() => {
                setIsOpen(false);
                if (webinarStatus === WebinarStatusEnum.LIVE) {
                    router.refresh()
                }
                if (onRegistered) onRegistered();
            }, 1500)
            router.push(`${webinarId}/call?attendeeId=${res?.data?.user.id}`)
        } catch (error) {
            console.error("Error registering attendee:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to register for the webinar"
            )
        } finally {
            setIsSubmitting(false);
        }
    }
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    className={`${webinarStatus === WebinarStatusEnum.LIVE
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-primary hover:bg-primary/90'}
            rounded-md px-4 py-2 text-primary-foreground text-sm font-semibold`}
                >
                    {webinarStatus === WebinarStatusEnum.LIVE && (
                        <span className="mr-2 h-2 w-2 bg-white rounded-full animate-pulse"></span>
                    )}
                    {buttonText()}
                </Button>
            </DialogTrigger>
            <DialogContent
                className="border-0 bg-transparent"
                showCloseButton={true}
            >
                <DialogHeader className=" justify-center items-center border border-input rounded-xl p-4 bg-background">
                    <DialogTitle className="text-center text-lg font-semibold mb-4">
                        {webinarStatus === WebinarStatusEnum.LIVE
                            ? "Join the Webinar"
                            : "Join the Waitlist"}
                    </DialogTitle>
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-4 w-full">
                        {
                            !submitted && (
                                <React.Fragment>
                                    <Input
                                        type="text"
                                        placeholder="Your Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                    <Input
                                        type="email"
                                        placeholder="Your Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </React.Fragment>
                            )}
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isSubmitting || submitted}>
                            {
                                isSubmitting ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2" />{" "}
                                        {webinarStatus === WebinarStatusEnum.LIVE
                                            ? "Joining Webinar..."
                                            : "Registering..."}
                                    </>
                                ) : submitted ? (
                                    webinarStatus === WebinarStatusEnum.LIVE ? (
                                        "You are all set to Join!"
                                    ) : (
                                        "You have successfully joined the waitlist!"
                                    )
                                ) : webinarStatus === WebinarStatusEnum.LIVE ? (
                                    'Join  Now'
                                ) : (
                                    "Join Waitlist"
                                )
                            }
                        </Button>
                    </form>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

