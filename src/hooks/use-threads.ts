"use client";
import { api } from "@/trpc/react";
import { atom, useAtom } from 'jotai';
import { useLocalStorage } from "usehooks-ts";


export const threadIdAtom = atom<string | null>(null)
export const multipleThreadIdsAtom = atom<string[]>([]);

const UseThreads = () => {
    const { data: accounts } = api.account.getAccounts.useQuery()
    const [accountId] = useLocalStorage('accountId', '')
    const [tab] = useLocalStorage('emailing-tab', 'inbox')
    const [done] = useLocalStorage('emailing-done', false)
    const [threadId, setThreadId] = useAtom(threadIdAtom);
    const [multipleThreads, setMultipleThreads] = useAtom(multipleThreadIdsAtom);
    const { data: threads, isFetching, refetch } = api.account.getThreads.useQuery({
        accountId,
        tab,
        done
    }, {
        enabled: !!accountId && !!tab, placeholderData: e => e, refetchInterval: 300000
    })
    return {
        threads,
        isFetching,
        refetch,
        accountId,
        threadId, setThreadId,
        multipleThreads, setMultipleThreads,
        account: accounts?.find(e => e.id === accountId)
    }
}
export default UseThreads
