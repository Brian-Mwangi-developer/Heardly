"use client";
import { Button } from "@/components/ui/button";
import type { User } from "@prisma/client";
// import { Assistant } from "@vapi-ai/server-sdk/api";
import { ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Stripe from "stripe";
import { CreateWebinarButton } from "../ReusableComponents/CreateWebinarButton";
import { SubscriptionModal } from "../ReusableComponents/SubscriptionModal";
import { StripeElements } from "./stripe-element";

type Props = {
    user: User
    stripeProducts: Stripe.Product[] | []
    assistants: any[] | []
}

//TODO: Stripe Customer
const Header = ({ user, stripeProducts, assistants }: Props) => {
    const pathname = usePathname();
    const router = useRouter();
    return (
        <div className="w-full px-4 pt-10 sticky top-0 z-10 flex justify-between items-center flex-wrap gap-4 bg-transparent mb-10">
            {pathname.includes('pipeline') ? (
                <Button
                    className="bg-primary/10 border border-border rounded-xl"
                    variant={'outline'}
                    onClick={() => router.push('/webinars')}
                >
                    <ArrowLeft />
                </Button>
            ) : (
                <div className="px-4 py-2 flex justify-center text-bold items-center rounded-xl bg-background border border-border text-primary capitalize">
                    {pathname.split('/')[1]}
                </div>
            )}
            {/* Build Stripe Subscription and Create Webinar Button */}
            <div className="flex gap-6 items-center flex-wrap">
                {user.subscription ? (
                    <CreateWebinarButton stripeProducts={stripeProducts}
                        assistants={[]} />
                ) : (
                    <StripeElements>
                        <SubscriptionModal user={user} />
                    </StripeElements>
                )}


            </div>
        </div >
    )
}

export default Header