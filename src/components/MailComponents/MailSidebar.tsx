'use client'

import { useLocalStorage } from "usehooks-ts";

import { api } from "@/trpc/react";
import { File, Inbox, Send } from "lucide-react";
import { MailNav } from './Mailnav';

type Props = {
    isCollapsed: boolean
}
export const MailSidebar = ({ isCollapsed }: Props) => {
    const [accountId] = useLocalStorage('accountId', '')
    const [tab] = useLocalStorage<'inbox' | 'draft' | 'sent'>('emailing-tab', 'inbox')
    const { data: inboxThreads } = api.account.getNumThreads.useQuery({
        accountId,
        tab: 'inbox'
    })
    const { data: draftThreads } = api.account.getNumThreads.useQuery({
        accountId,
        tab: 'draft'
    })
    const { data: sentThreads } = api.account.getNumThreads.useQuery({
        accountId,
        tab: 'sent'
    })
    return (
        <MailNav isCollapsed={isCollapsed} links={[
            {
                title: 'Inbox',
                label: inboxThreads?.toString() ?? '0',
                icon: Inbox,
                variant: tab === 'inbox' ? 'default' : 'ghost'
            },
            {
                title: 'Draft',
                label: draftThreads?.toString() ?? '0',
                icon: File,
                variant: tab === 'draft' ? 'default' : 'ghost'
            },
            {
                title: 'Sent',
                label: sentThreads?.toString() ?? '0',
                icon: Send,
                variant: tab === 'sent' ? 'default' : 'ghost'
            }
        ]} />
    )
}

