"use client"

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { useWebinarStore } from "@/store/useWebinarStore"
import { DialogTitle } from "@radix-ui/react-dialog"
// import { Assistant } from "@vapi-ai/server-sdk/api"
import { PlusIcon } from "lucide-react"
import { useEffect, useState } from "react"
import Stripe from "stripe"
import { AdditionalInfoStep } from "./additional-info-step"
import { BasicInfoStep } from "./basic-info-step"
import { CTAStep } from "./cta-steps"
import { MultiStepForm } from "./multi-step-form"
import { SuccessStep } from "./success-step"

type Props = {
    stripeProducts: Stripe.Product[] | []
    // assistants: Assistant[] | []
    assistants: any[]
}

export const CreateWebinarButton = ({ stripeProducts, assistants }: Props) => {
    const { isModalOpen, setModalOpen, isComplete, setIsComplete, resetForm } = useWebinarStore();
    const [webinarLink, setWebinarLink] = useState('');

    const handleComplete = (webinarId: string) => {
        setIsComplete(true)

        setWebinarLink(
            `${process.env.NEXT_PUBLIC_URL}/live-webinar/${webinarId}`
        )
    }

    const handleCreateNew = () => {
        resetForm()
    }
    useEffect(() => {
        if (isComplete) {
            setModalOpen(true)
        }
    }, [isComplete, setModalOpen])
    const steps = [
        {
            id: "basicInfo",
            title: "Basic Information",
            description: "Please fill out the standard info needed for your webinar",
            component: <BasicInfoStep />

        },
        {
            id: 'cta',
            title: "CTA",
            description: 'Please provide the end-point for your customers through your webinar',
            component: (
                <CTAStep
                    assistants={assistants}
                    stripeProducts={stripeProducts}

                />

            )
        },
        {
            id: 'additionalInfo',
            title: "Additional Information",
            description: "Please provide any additional information needed for your webinar",
            component: <AdditionalInfoStep />
        }
    ]
    return (
        <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
                <button
                    className="rounded-xl flex gap-2 items-center hover:cursor-pointer px-4 py-2 border border-border
                    bg-gradient-to-r from-pink-100 to-purple-100 backdrop-blur-sm text-sm font-normal text-primary hover:bg-primary-20"
                    onClick={() => setModalOpen(true)}>
                    <PlusIcon />
                    Create Webinar
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] p-0 bg-white border-none">
                {isComplete ? (
                    <div className="bg-muted text-primary rounded-lg overflow-hidden">
                        <DialogTitle className="sr-only">Webinar Created</DialogTitle>
                        <SuccessStep
                            webinarLink={webinarLink}
                            onCreateNew={handleCreateNew}
                        // onClose ={()=> setModalOpen(false)}
                        />

                    </div>
                ) : (<>
                    <DialogTitle className="sr-only">Create Webinar</DialogTitle>
                    <MultiStepForm
                        steps={steps}
                        onComplete={handleComplete}
                    />
                </>)}
            </DialogContent>
        </Dialog>
    )
}