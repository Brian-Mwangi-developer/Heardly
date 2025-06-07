"use client"
import { generateEmail } from "@/actions/Mails";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import useThreads from "@/hooks/use-threads";
import { turndown } from "@/lib/turndown";
import { readStreamableValue } from "ai/rsc";
import { Zap } from "lucide-react";
import { useState } from 'react';


type Props = {
    isComposing: boolean,
    onGenerate: (token: string) => void
};
export const AIComposeButton = (props: Props) => {
    const [open, setOpen] = useState(false);
    const [prompt, setPrompt] = useState('');
    const { threads, threadId, account } = useThreads()
    const thread = threads?.find(t => t.id === threadId)

    if (!account) return null

    const aiGenerate = async () => {
        let context = ''
        if (!props.isComposing) {
            for (const email of thread?.emails ?? []) {
                const content = `
        Subject: ${email.subject}
        From:${email.from}
        Sent:{new Date(email.sentAt).toLocaleString()}
        Body:${turndown.turndown(email.body ?? email.bodySnippet ?? "")}`
                context += content
            }
        }
        context += `My name is ${account?.name} and my email is ${account.emailAddress}`
        console.log(context)
        const { output } = await generateEmail(context, prompt)
        for await (const token of readStreamableValue(output)) {
            if (token) {
                console.log(token)
                props.onGenerate(token)
            }
        }
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={'outline'} onClick={() => setOpen(true)} className="gap-4 animate-pulse">
                    <span className="bg-gradient-to-r from-pink-300 to-purple-500 bg-clip-text text-transparent font-semibold">
                        Smart Compose
                    </span>
                    <Zap className="size-5 text-purple-500" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>AI Smart Compose</DialogTitle>
                    <DialogDescription>
                        AI will help you compose your email
                    </DialogDescription>
                    <div className="h-2"></div>
                    <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Enter the prompt"
                        className="min-h-[350px]" />
                    <div className="h-2"></div>
                    <Button onClick={() => {
                        setOpen(false)
                        setPrompt('')
                        aiGenerate()

                    }}>
                        Generate
                    </Button>
                </DialogHeader>
            </DialogContent>
        </Dialog>

    );
};

