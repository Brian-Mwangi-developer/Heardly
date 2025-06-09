

import { onAuthenticateUser } from '@/actions/auth';
import Header from '@/components/WebinarComponents/webinar-header';
import { api } from '@/trpc/server';


import { redirect } from 'next/navigation';
import React from 'react';

type Props = {
    children: React.ReactNode
}

const Layout = async ({ children }: Props) => {
    const userExist = await onAuthenticateUser();
    const assistantsResult = await api.vapi.getAllAssistants()
    const assistants = assistantsResult.data || []




    if (!userExist.user) redirect('/sign-in');
    const stripeProducts = await api.stripe.getAllProductsFromStripe();

    return (
        <div className='flex w-full min-h-screen'>
            <div className='flex flex-col w-full h-screen overflow-auto px-4 scrollbar-hide container mx-auto'>
                <div className="flex justify-end gap-4 py-4">
                    <Header
                        user={userExist.user}
                        stripeProducts={stripeProducts.products || []}
                        assistants={assistants}
                    />
                </div>
                <div className='flex-1 py-10'>
                    {children}
                </div>

            </div>

        </div>
    )
}

export default Layout