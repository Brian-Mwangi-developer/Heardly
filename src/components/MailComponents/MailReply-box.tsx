
"use client";

import useThreads from "@/hooks/use-threads";
import { api, type RouterOutputs } from "@/trpc/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import EmailEditor from "./email-editor";



export const MailReplyBox = () => {
    const { threadId, accountId } = useThreads()
    const { data: replydetails } = api.account.getReplyDetails.useQuery({
        threadId: threadId ?? "",
        accountId
    })
    if (!replydetails) return null
    return <Component replyDetails={replydetails} />
};

const Component = ({ replyDetails }: { replyDetails: RouterOutputs['account']['getReplyDetails'] }) => {
    const { threadId, accountId } = useThreads()
    const [subject, setSubject] = useState(replyDetails.subject.startsWith("Re:") ? replyDetails.subject : `Re: ${replyDetails.subject}`)
    const [toValues, setToValues] = useState<{ label: string, value: string }[]>(replyDetails.to.map(to => ({ label: to.address, value: to.address })))
    const [ccValues, setCcValues] = useState<{ label: string, value: string }[]>(replyDetails.cc.map(cc => ({ label: cc.address, value: cc.address })))

    useEffect(() => {
        if (!threadId || !replyDetails) return
        if (!replyDetails.subject.startsWith("Re:")) {
            setSubject(`Re: ${replyDetails.subject}`)
        } else {
            setSubject(replyDetails.subject)
        }
        setToValues(replyDetails.to.map(to => ({ label: to.address, value: to.address })))
        setCcValues(replyDetails.cc.map(cc => ({ label: cc.address, value: cc.address })))

    }, [threadId, replyDetails]);
    const sendEmail = api.account.sendEmail.useMutation()
    const handleSend = async (value: string) => {
        if (!replyDetails) return
        sendEmail.mutate({
            accountId,
            threadId: threadId ?? undefined,
            body: value,
            from: replyDetails.from,
            subject,
            to: replyDetails.to.map(to => ({ address: to.address, name: to.name ?? "" })),
            cc: replyDetails.cc.map(cc => ({ address: cc.address, name: cc.name ?? "" })),
            inReplyTo: replyDetails.id,
            replyTo: replyDetails.from
        }, {
            onSuccess: () => {
                toast.success("Email Sent")
            },
            onError: (error) => {
                console.log(error)
                toast.error("Error sending email")
            }
        })

    }

    return (
        <EmailEditor
            toValues={toValues}
            setToValues={setToValues}
            ccValues={ccValues}
            setCcValues={setCcValues}
            subject={subject}
            defaultToolbarExpand={true}
            setSubject={setSubject}
            to={replyDetails.to.map(to => to.address)}
            handleSend={handleSend}
            isSending={sendEmail.isPending}
        />
    )
}
