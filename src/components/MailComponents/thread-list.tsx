'use client'
import { Badge } from "@/components/ui/badge";
import { useStreamingAnalysis } from "@/hooks/use-streaming-analysis";
import useThreads from "@/hooks/use-threads";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { format, formatDistanceToNow } from "date-fns";
import DOMPurify from "dompurify";
import { Brain, Loader2, MessageSquare, Target, TrendingUp, XCircle } from "lucide-react";
import React, { type ComponentProps } from 'react';
import { toast } from "sonner";
import { CampaignAssignmentModal } from "../CampaignComponents/campaign-assigment-modal";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper function to get thread styling based on analysis
const getThreadStyling = (analysis: any, isSelected: boolean) => {
    if (!analysis) {
        return {
            bgColor: isSelected ? 'bg-purple-200' : 'bg-white hover:bg-gray-50',
            label: null,
            icon: null
        };
    }

    // Check if analysis has the expected structure
    // Since your API returns analysis.analysis directly, we need to check the structure
    const overallCategory = analysis.overallCategory?.toLowerCase() ||
        analysis.analyses?.[0]?.analysis?.overallCategory?.toLowerCase();

    switch (overallCategory) {
        case 'potential':
            return {
                bgColor: isSelected ? 'bg-green-200' : 'bg-green-50 hover:bg-gray-50',
                label: 'POTENTIAL',
                icon: TrendingUp,
                labelColor: 'text-green-700 bg-green-100'
            };
        case 'query':
            return {
                bgColor: isSelected ? 'bg-yellow-200' : 'bg-yellow-50 hover:bg-gray-50',
                label: 'QUERY',
                icon: MessageSquare,
                labelColor: 'text-yellow-700 bg-yellow-100'
            };
        case 'dead':
            return {
                bgColor: isSelected ? 'bg-red-200' : 'bg-red-50 hover:bg-gray-50',
                label: 'LOW PRIORITY',
                icon: XCircle,
                labelColor: 'text-red-700 bg-red-100'
            };
        default:
            return {
                bgColor: isSelected ? 'bg-purple-200' : 'bg-white hover:bg-gray-50',
                label: null,
                icon: null
            };
    }
};


const ThreadItem = ({
    thread,
    isSelected,
    onSelect,
    isInMultipleSelection,
    onMultipleSelectionChange
}: {
    thread: any;
    isSelected: boolean;
    onSelect: () => void;
    isInMultipleSelection: boolean;
    onMultipleSelectionChange: (checked: boolean) => void;
}) => {

    const { data: analysis } = api.analysis.getThreadAnalysis.useQuery(
        { threadId: thread.id },
        { enabled: !!thread.id }
    );

    const styling = getThreadStyling(analysis, isSelected);
    const StatusIcon = styling.icon;

    return (
        <div
            onClick={onSelect}
            className={cn(
                'flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all relative cursor-pointer',
                styling.bgColor
            )}
        >
            <div className="m-2">
                <Checkbox
                    checked={isInMultipleSelection}
                    onCheckedChange={onMultipleSelectionChange}
                    className="absolute left-2 top-2 w-4 h-4 border border-gray-400 active:bg-white"
                />
            </div>
            <div className='flex flex-col w-full gap-2'>
                <div className="flex items-center">
                    <div className="flex items-center gap-2">
                        <div className="font-semibold">
                            {thread.emails.at(-1)?.from.name}
                        </div>
                        {/* Analysis Status Badge */}
                        {styling.label && (
                            <div className={cn(
                                'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                                styling.labelColor
                            )}>
                                {StatusIcon && <StatusIcon className="h-3 w-3" />}
                                {styling.label}
                            </div>
                        )}
                    </div>
                    <div className={cn('ml-auto text-xs')}>
                        {formatDistanceToNow(thread.emails.at(-1)?.sentAt ?? new Date(), {
                            addSuffix: true
                        })}
                    </div>
                </div>
                <div className="text-xs font-medium">{thread.subject}</div>
            </div>
            <div className="text-xs line-clamp-2 text-muted-foreground" dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(thread.emails.at(-1)?.bodySnippet ?? '', {
                    USE_PROFILES: { html: true }
                })
            }}>
            </div>
            {thread.emails[0]?.sysLabels.length && (
                <div className="flex items-center gap-2">
                    {thread.emails[0]?.sysLabels.map((label: string) => {
                        return <Badge key={label} variant={getBadgeVariantFromLabel(label)}>{label}</Badge>
                    })}
                </div>
            )}
        </div>
    );
};

export const ThreadList = () => {
    const { threads, threadId, setThreadId, isFetching, multipleThreads, setMultipleThreads } = useThreads()
    const [loading, setLoading] = React.useState(false)
    const [dialogOpen, setDialogOpen] = React.useState(false)
    const { startAnalysis } = useStreamingAnalysis()

    const assignToCampaignMutation = api.campaign.assignThreadsToCampaign.useMutation({
        onSuccess: (data) => {
            toast.success(`${data.count} threads assigned to campaign successfully`)
            setMultipleThreads([])
            setDialogOpen(false)
        },
        onError: (error) => {
            toast.error(`Failed to assign threads: ${error.message || 'Unknown error'}`)
        }
    })
    const handleCampaignAssignment = (threadIds: string[], campaignId: string) => {
        assignToCampaignMutation.mutate({
            threadIds,
            campaignId
        })
    }

    const getSelectedEmailsForModal = () => {
        if (!threads) return []

        return threads
            .filter(thread => multipleThreads.includes(thread.id))
            .map(thread => ({
                id: thread.id,
                sender: thread.emails.at(-1)?.from.name || 'Unknown Sender',
                subject: thread.subject || 'No Subject',
                // Add any other fields the modal needs
                threadId: thread.id,
                emailId: thread.emails.at(-1)?.id || thread.id
            }))
    }

    const groupedThreads = threads?.reduce((acc, thread) => {
        const date = format(thread.emails[0]?.sentAt ?? new Date(), 'yyyy-MM-dd')
        if (!acc[date]) {
            acc[date] = []
        }
        acc[date].push(thread)
        return acc
    }, {} as Record<string, typeof threads>)

    if (isFetching && !threads?.length) {
        return <div className="flex items-center justify-center h-full">
            <div className="text-sm text-muted-foreground">
                Loading Emails...
                <Loader2 className="inline-block ml-2 animate-spin h-5 w-5" />
            </div>
        </div>
    }

    const handleMultipleThreadsAnalysis = async () => {
        if (multipleThreads.length === 0) return;
        setLoading(true);
        for (const threadId of multipleThreads) {
            await startAnalysis(threadId);
            await delay(2000);
        }
        setLoading(false);
        setMultipleThreads([]);
    }

    return (
        <div className="max w-full overflow-y-scroll max-h-[calc(100vh-120px)] mb-10">
            <div className="flex flex-row items-end justify-end gap-2 mx-2">
                <Button
                    variant={"outline"}
                    onClick={handleMultipleThreadsAnalysis}
                    disabled={multipleThreads.length === 0 || isFetching || loading}
                >
                    <Brain />
                    Analyze mails
                    {multipleThreads.length > 0 && `(${multipleThreads.length})`}
                </Button>
                <Button
                    variant={"outline"}
                    className=""
                    disabled={multipleThreads.length === 0 || isFetching || loading}
                    onClick={() => setDialogOpen(true)}
                >
                    <Target />
                    Assign Campaign
                </Button>
                <Button
                    variant={"outline"}
                    className="text-red-400 hover:text-red-700"
                    disabled={multipleThreads.length === 0 || isFetching || loading}
                    onClick={() => { setMultipleThreads([]) }}
                > Clear All
                </Button>
            </div>
            <div className="flex flex-col gap-2 p-4 pt-0">
                {Object.entries(groupedThreads ?? {}).map(([date, threads]) => {
                    return <React.Fragment key={date}>
                        <div className="text-xs font-medium text-muted-foreground mt-5 first:mt-0">
                            {date}
                        </div>
                        <div className="mb-30">
                            {threads.map(thread => (
                                <div className="mb-3" key={thread.id}>
                                    <ThreadItem
                                        key={thread.id}
                                        thread={thread}
                                        isSelected={thread.id === threadId}
                                        onSelect={() => setThreadId(thread.id)}
                                        isInMultipleSelection={multipleThreads.includes(thread.id)}
                                        onMultipleSelectionChange={(checked) => {
                                            if (checked) {
                                                setMultipleThreads([...multipleThreads, thread.id])
                                            } else {
                                                setMultipleThreads(multipleThreads.filter(id => id !== thread.id))
                                            }
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </React.Fragment>
                })}
            </div>
            <CampaignAssignmentModal
                emails={getSelectedEmailsForModal()}
                isOpen={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onAssign={(emailIds, campaignId) => {
                    const threadIds = multipleThreads;
                    handleCampaignAssignment(threadIds, campaignId);
                }}
                isAssigning={assignToCampaignMutation.isPending}
            />
        </div>
    )
}

function getBadgeVariantFromLabel(label: string): ComponentProps<typeof Badge>['variant'] {
    if (['work'].includes(label.toLowerCase())) {
        return 'default'
    }
    return 'secondary'
}