"use client"

import { AccountSwitcher } from "@/components/MailComponents/account-switcher"
import { EmailAnalysis } from "@/components/MailComponents/email-analysis"
import { MailSearchBar } from "@/components/MailComponents/MailSearchBar"
import { MailSidebar } from "@/components/MailComponents/MailSidebar"
import ThreadDisplay from "@/components/MailComponents/thread-display"
import { ThreadList } from "@/components/MailComponents/thread-list"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { TooltipProvider } from "@/components/ui/tooltip"
import UseThreads from "@/hooks/use-threads"
import { useState } from "react"

type Props = {
    defaultLayout: number[] | undefined
    navCollapsedSize: number
    defaultCollapsed: boolean
}

const Mail = ({ defaultLayout = [15, 38, 15], navCollapsedSize }: Props) => {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const { threadId,threads } = UseThreads()
    return (
        <>
            <TooltipProvider delayDuration={0}>
                <ResizablePanelGroup direction="horizontal" className="items-stretch h-full min-h-screen">
                    <ResizablePanel defaultSize={defaultLayout[0]} minSize={10}>
                        <Tabs defaultValue='inbox'>
                            <div className="">
                                <div className="flex flex-col justify-center">
                                    <AccountSwitcher isCollapsed={false} />
                                </div>
                                <Separator className="" />
                                <MailSidebar isCollapsed={false} />
                            </div>
                            <Separator />
                            {/* SearchBar */}
                            <MailSearchBar />
                            <TabsContent value="inbox">
                                <ThreadList />
                            </TabsContent>
                            <TabsContent value="done">
                                <ThreadList />
                            </TabsContent>
                        </Tabs>
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={60} minSize={25}>
                        <ThreadDisplay />
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={25} minSize={15} className="flex flex-col">
                        {threadId && <EmailAnalysis threadId={threadId} />}
                    </ResizablePanel>
                </ResizablePanelGroup>
            </TooltipProvider>
        </>
    )
}

export default Mail