"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Text } from "@tiptap/extension-text";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { useEffect, useState } from "react";

import { generate } from "@/actions/Mails";
import { Input } from "@/components/ui/input";
import { readStreamableValue } from "ai/rsc";
import { AIComposeButton } from "./ai-compose-button";
import EditorMenubar from "./editor-menubar";
import { TagInput } from "./tag-input";


type EmailEditorProps = {
    toValues: { label: string, value: string }[];
    setToValues: (value: { label: string, value: string }[]) => void

    ccValues: { label: string, value: string }[];
    setCcValues: (value: { label: string, value: string }[]) => void

    subject: string;
    setSubject: (subject: string) => void;
    to: string[]
    handleSend: (value: string) => void;
    isSending: boolean;

    defaultToolbarExpand?: boolean;
}



const EmailEditor = ({ toValues, setToValues, ccValues, setCcValues, subject, setSubject, to, handleSend, isSending, defaultToolbarExpand }: EmailEditorProps) => {
    const [value, setValue] = useState<string>('')
    const [expanded, setExpanded] = useState<boolean | undefined>(defaultToolbarExpand)
    const [token, setToken] = useState<string>('')
    const aiGenerate = async (value: string) => {
        console.log("Ai generate", value)
        const { output } = await generate(value)
        for await (const token of readStreamableValue(output)) {
            if (token) {
                setToken(token)
            }
        }
    }
    const CustomText = Text.extend({
        addKeyboardShortcuts() {
            return {
                'Meta-j': () => {
                    aiGenerate(this.editor.getText())
                    return true
                }
            }
        }
    })
    const editor = useEditor({
        autofocus: false,
        extensions: [StarterKit, CustomText],
        onUpdate: ({ editor }) => {
            setValue(editor.getHTML())
        }
    });
    useEffect(() => {
        editor?.commands?.insertContent(token)
    }, [editor, token])

    const onGenerate = (token: string) => {
        editor?.commands?.insertContent(token)
    }

    if (!editor) return null
    return (
        <div>
            <div className="flex p-4 py-2 border-b">
                <EditorMenubar editor={editor} />
            </div>
            <div className="p-4 pb-0 space-y-2">
                {expanded && (
                    <>
                        <TagInput
                            label="To"
                            onChange={setToValues}
                            placeholder="Add recipient"
                            value={toValues}
                        />
                        <TagInput
                            label="Cc"
                            onChange={setCcValues}
                            placeholder="Add recipient"
                            value={ccValues}
                        />
                        <Input id="subject" placeholder='Subject' value={subject} onChange={(e) => setSubject(e.target.value)} />
                    </>
                )}
                <div className="flex items-center gap-2">
                    <div className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
                        <span className="text-green-600 font-medium">
                            Draft {" "}
                        </span>
                        <span>
                            to {to.join(",")}
                        </span>
                    </div>
                    {/* @ts-ignore  Make sure to Check this Error and Resolve it */}
                    <AIComposeButton isComposing={defaultToolbarExpand} onGenerate={onGenerate} />
                </div>
            </div>

            <div className="prose w-full px-4 mb-10">
                <EditorContent editor={editor} value={value} className="editor-input-area" />
            </div>
            <Separator />
            <div className="py-3 px-4 flex items-center justify-between">
                <span className="text-sm">
                    Tip: Press {" "}
                    <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-l">
                        Cmd + J
                    </kbd>{" "}
                    for AI autocomplete
                </span>
                <Button onClick={async () => {
                    editor?.commands?.clearContent()
                    await handleSend(value)
                }}
                    disabled={isSending}>
                    Send
                </Button>
            </div>
        </div>
    );
};
export default EmailEditor;
