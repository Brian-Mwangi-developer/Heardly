'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useStreamingAnalysis } from "@/hooks/use-streaming-analysis";
import useThreads from "@/hooks/use-threads";
import { format } from "date-fns";
import { useAtom } from "jotai";
import { Archive, ArchiveX, Clock, MoreVertical, Trash2 } from "lucide-react";
import { EmailDisplay } from './email-display';
import { MailReplyBox } from "./MailReply-box";
import { isSearchingAtom } from "./MailSearchBar";
import { MailSearchDisplay } from './MailSearchDisplay';

const getBadgeConfig = (category: string | undefined) => {
    switch (category?.toLowerCase()) {
        case 'potential':
            return { bg: 'bg-green-100', text: 'text-green-700', label: 'POTENTIAL' };
        case 'query':
            return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'QUERY' };
        case 'dead':
            return { bg: 'bg-red-100', text: 'text-red-700', label: 'LOW PRIORITY' };
        default:
            return { bg: 'bg-white', text: 'text-gray-500', label: 'Not Analyzed' };
    }
};

const ThreadDisplay = () => {
    const { threadId, threads } = useThreads()
    const thread = threads?.find(t => t.id === threadId)
    const { startAnalysis, results } = useStreamingAnalysis()
    const [isSearching] = useAtom(isSearchingAtom)

    const firstAnalysis = results?.analyses?.[0]?.analysis;
    const badgeConfig = getBadgeConfig(firstAnalysis?.overallCategory);
    const confidenceScore =
        firstAnalysis?.overallCategory && firstAnalysis?.urgencyLevel && firstAnalysis?.confidenceScore
            ? `${badgeConfig.label} (${firstAnalysis.confidenceScore}%)`
            : badgeConfig.label;
    return (
        <div className="flex flex-col h-full">
            {/* Header Area */}
            <div className="flex items-center justify-between px-8 pt-8 pb-4  border-b">
                <div className="flex items-start gap-4">
                    <Avatar>
                        <AvatarImage alt="avatar" />
                        <AvatarFallback>
                            {thread?.emails[0]?.from?.name?.split(' ').map(chunk => chunk[0]).join('')}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-semibold">{thread?.emails[0]?.from.name}</span>
                            <span className={`ml-2 px-2 py-1  rounded ${badgeConfig.bg} ${badgeConfig.text} text-md font-semibold`}>
                                {firstAnalysis?.overallCategory && firstAnalysis?.confidenceScore
                                    ? `${badgeConfig.label} (${firstAnalysis.confidenceScore}%)`
                                    : badgeConfig.label}
                            </span>
                        </div>
                        <div className="text-lg font-bold mt-2">{thread?.emails[0]?.subject}</div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                            <span>
                                <span className="font-medium">Reply-To:</span> {thread?.emails[0]?.from?.address}
                            </span>
                            {thread?.emails[0]?.sentAt && (
                                <span>
                                    {format(new Date(thread.emails[0]?.sentAt), 'PPpp')}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant={'ghost'} size={'icon'} disabled={!thread}>
                        <Archive className="size-4" />
                    </Button>
                    <Button variant={'ghost'} size={'icon'} disabled={!thread}>
                        <ArchiveX className="size-4" />
                    </Button>
                    <Button variant={'ghost'} size={'icon'} disabled={!thread}>
                        <Trash2 className="size-4" />
                    </Button>
                    <Separator orientation='vertical' className="mx-2 h-6" />
                    <Button variant={'ghost'} size={'icon'} disabled={!thread}>
                        <Clock className="size-4" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="ml-2" variant={'ghost'} size={'icon'} disabled={!thread}>
                                <MoreVertical className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Mark as unread</DropdownMenuLabel>
                            <DropdownMenuItem>Star thread</DropdownMenuItem>
                            <DropdownMenuItem>Add label</DropdownMenuItem>
                            <DropdownMenuItem>Mute thread</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <Separator />
            {
                isSearching ? <MailSearchDisplay /> : (
                    <>
                        {thread ?
                            <>
                                <div className="flex flex-col flex-1 overflow-scroll">
                                    <div className="max-h-[calc(100vh-500px)] overflow-scroll flex flex-col">
                                        <div className="p-6 flex flex-col gap-4">
                                            {thread.emails.map(email => {
                                                return <EmailDisplay key={email.id} email={email} />
                                            })}
                                        </div>
                                    </div>
                                    <div className="flex-1"></div>
                                    <Separator className="mt-auto" />
                                    {/*  Reply Box*/}
                                    <div className="mb-10">
                                        <MailReplyBox />
                                    </div>
                                </div>
                            </>
                            : <>
                                <div className="p-8 text-center text-muted-foreground">
                                    No Message selected
                                </div>
                            </>
                        }
                    </>
                )}
        </div>
    )
}
export default ThreadDisplay