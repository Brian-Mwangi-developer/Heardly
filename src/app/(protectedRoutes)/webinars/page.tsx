import { onAuthenticateUser } from '@/actions/auth'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/WebinarComponents/page-header'
import { WebinarCard } from '@/components/WebinarComponents/webinar-card'
import { api } from '@/trpc/server'
import { type Webinar } from '@prisma/client'
import { HomeIcon, Magnet, Webcam } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

type Props = {
    searchParams: Promise<{
        webinarStatus: string;
    }>
}

const page = async ({ searchParams }: Props) => {
    const { webinarStatus } = await searchParams;
    const checkUser = await onAuthenticateUser();
    if (!checkUser.user) {
        redirect('/');
    }

    const webinars = await api.webinar.getWebinarsByPresenterId({
        presenterId: checkUser.user.id,
        webinarStatus: webinarStatus || 'all'
    });
    return (
        <Tabs
            defaultValue='all'
            className='w-full flex flex-col gap-8'>
            <PageHeader
                leftIcon={<HomeIcon className='w-3 h-3' />}
                mainIcon={<Webcam className='w-12 h-12' />}
                rightIcon={<Magnet className='w-3 h-3' />}
                heading="Create and Manage AI Agents Webinars"
                placeholder="Search option ..."
            >
                <TabsList className='bg-transparent space-x-3'>
                    <TabsTrigger
                        value='all'
                        className='bg-secondary opacity-50 data-[state=active]:opacity-100 px-8 py-4'>
                        <Link href="/webinars?webinarStatus=all">All</Link>
                    </TabsTrigger>
                    <TabsTrigger
                        value='upcoming'
                        className='bg-secondary px-8 py-4'>
                        <Link href="/webinars?webinarStatus=upcoming">Upcoming</Link>
                    </TabsTrigger>
                    <TabsTrigger
                        value='ended'
                        className='bg-secondary px-8 py-4'>
                        <Link href="/webinars?webinarStatus=ended">Ended</Link>
                    </TabsTrigger>
                </TabsList>
            </PageHeader>
            <TabsContent
                value='all'
                className='w-full grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 place-items-start place-content-start
            gap-x-6 gap-y-10'>
                {webinars && webinars.length > 0 ? (
                    webinars.map((webinar: Webinar, index: number) => (
                        <WebinarCard
                            key={index}
                            webinar={webinar} />
                    ))
                ) : (
                    <div className='w-full h-[200px] flex justify-center items-center text-primary font-semibold text-2xl col-span-12'>
                        No webinars found
                    </div>
                )}
            </TabsContent>
            <TabsContent value="upcoming"
                className='w-full grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 place-items-start place-content-start
            gap-x-6 gap-y-10'>
                {webinars && webinars.length > 0 ? (
                    webinars.map((webinar: Webinar, index: number) => (
                        <WebinarCard
                            key={index}
                            webinar={webinar} />
                    ))
                ) : (
                    <div className='w-full h-[200px] flex justify-center items-center text-primary font-semibold text-2xl col-span-12'>
                        No upcoming webinars found
                    </div>
                )}
            </TabsContent>
            <TabsContent value="ended"
                className='w-full grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 place-items-start place-content-start
            gap-x-6 gap-y-10'>
                {webinars && webinars.length > 0 ? (
                    webinars.map((webinar: Webinar, index: number) => (
                        <WebinarCard
                            key={index}
                            webinar={webinar} />
                    ))
                ) : (
                    <div className='w-full h-[200px] flex justify-center items-center text-primary font-semibold text-2xl col-span-12'>
                        No ended webinars found
                    </div>
                )}
            </TabsContent>
        </Tabs>
    )
}

export default page