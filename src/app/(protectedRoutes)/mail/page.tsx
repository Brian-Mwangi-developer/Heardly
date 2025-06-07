"use client"
import dynamic from "next/dynamic";
// import { UserButton } from "@clerk/nextjs";
// import ComposeButton from "@/app/mail/compose-button";

const Mail = dynamic(() => {
    return import("./mail")
}, { ssr: false })

const MailDashboard = () => {
    return (
        <>
            <div className="absolute bottom-4 left-4">
                <div className="flex items-center gap-2">


                    {/* <ComposeButton /> */}
                </div>

            </div>

            <Mail defaultLayout={[20, 32, 48]} navCollapsedSize={4} defaultCollapsed={false} />
        </>
    )
}
export default MailDashboard
