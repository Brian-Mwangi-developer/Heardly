"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Copy, ExternalLink, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Props = {
    webinarLink: string;
    onCreateNew?: () => void;
    // onClose?: () => void;
}

export const SuccessStep = ({ webinarLink, onCreateNew }: Props) => {
    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(webinarLink)
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
    return (
        <div className="relative text-center space-y-6 py-8 px-6">
            <div className="flex items-center justify-center">
                <div className="bg-green-500 rounded-full p-2">
                    <Check className="w-6 h-6 text-primary" />
                </div>
            </div>
            <h2 className="text-2xl font-bold">Your Webinar has been created</h2>
            <p className="text-foreground">
                You can share the link with your viewers for them to join
            </p>
            <div className="flex mt-4 max-w-md mx-auto">
                <Input
                    value={webinarLink}
                    readOnly
                    className="bg-muted border-input right-r-none"
                />
                <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    className="rounded-1-none border-1-0 border-gray-800"
                >
                    {
                        copied ? (
                            <Check className="h-4 w-4" />
                        ) : (
                            <Copy className="h-4 w-4" />
                        )
                    }

                </Button>
            </div>
            <div className="mt-4 flex justify-center">
                <Link
                    href={webinarLink}
                    target="_blank"
                >
                    <Button
                        variant="outline"
                        className="border-muted text-primary hover:bg-input"
                    >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Preview Webinar
                    </Button>
                </Link>
            </div>
            {
                onCreateNew && (
                    <Button
                        onClick={onCreateNew}
                        variant="outline"
                        className="border-gray-700 text-gray-700 hover:bg-gray-800 hover:text-white"
                    >
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Create another Webinar
                    </Button>
                )
            }
        </div>
    )
}
