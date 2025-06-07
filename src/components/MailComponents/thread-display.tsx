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
import useThreads from "@/hooks/use-threads";
import { format } from "date-fns";
import { useAtom } from "jotai";
import { Archive, ArchiveX, Clock, MoreVertical, Trash2 } from "lucide-react";
import { EmailDisplay } from './email-display';
import { MailReplyBox } from "./MailReply-box";
import { isSearchingAtom } from "./MailSearchBar";
import { MailSearchDisplay } from './MailSearchDisplay';




const ThreadDisplay = () => {
    const { threadId, threads } = useThreads()
    const thread = threads?.find(t => t.id === threadId)
    const [isSearching] = useAtom(isSearchingAtom)
    return (
        <div className="flex flex-col h-full">
            {/*Buttons row*/}
            <div className="flex items-center p-2">
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
                </div>
                <Separator orientation='vertical' className="ml-2" />
                <Button className="ml-2" variant={'ghost'} size={'icon'} disabled={!thread}>
                    <Clock className="size-4" />
                </Button>
                <div className="flex items-center ml-auto">
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
                                    <div className="flex items-center p-4">
                                        <div className="flex items-center gap-4 text-sm">
                                            <Avatar>
                                                <AvatarImage alt="avatar" />
                                                <AvatarFallback>
                                                    {thread.emails[0]?.from?.name?.split(' ').map(chunk => chunk[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="grid gap-1">
                                                <div className="font-semibold">
                                                    {thread.emails[0]?.from.name}
                                                    <div className="text-xs line-clamp-1">
                                                        {thread.emails[0]?.subject}
                                                    </div>
                                                    <div className="text-xs line-clamp-1">
                                                        <span className="font-medium">
                                                            Reply-To:
                                                        </span>
                                                        {thread.emails[0]?.from?.address}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {thread.emails[0]?.sentAt && (
                                            <div className="ml-auto text-xs text-muted-foreground">
                                                {format(new Date(thread.emails[0]?.sentAt), 'PPpp')}
                                            </div>
                                        )}
                                    </div>
                                    <Separator />
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
                                    <div className="mb-20">
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
