"use client"
import useThreads from "@/hooks/use-threads";
import { cn } from "@/lib/utils";
import { type RouterOutputs } from "@/trpc/react";
import { formatDistanceToNow } from "date-fns";
import Avatar from "react-avatar";
import { Letter } from "react-letter";

type Props = {
    email: RouterOutputs['account']['getThreads'][0]['emails'][0]
}

export const EmailDisplay = ({ email }: Props) => {
    const { account } = useThreads()
    const isMe = account?.emailAddress === email.from.address
    return (
        <div className={cn('border rounded-md p-4 transition-all hover:translate-x-2', {
            'border-1-gray-900 border-l-4': isMe
        })}>
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center justify-between gap-2">
                    {!isMe && <Avatar name={email.from.name ?? email.from.address} size="35" round={true} textSizeRatio={2} />}
                    <span className="font-medium">
                        {isMe ? 'Me' : email.from.address}
                    </span>
                </div>
                <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(email.sentAt ?? new Date(), {
                        addSuffix: true
                    })}
                </p>
            </div>
            <div className="h-4"></div>
            <Letter html={email?.body ?? ''} className="bg-white rounded-md text-black" />
        </div>
    );
};

