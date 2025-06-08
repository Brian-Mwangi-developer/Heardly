import { onAuthenticateUser } from "@/actions/auth";
import { RenderWebinar } from "@/components/LiveWebinarComponents/render-webinar";
import { api } from "@/trpc/server";

type Props = {
    params: Promise<{ liveWebinarId: string }>;
    searchParams: Promise<{ error: string }>;
}

const page = async ({ params, searchParams }: Props) => {
    const { liveWebinarId } = await params;
    const { error } = await searchParams;
    console.log("Live Webinar ID:", liveWebinarId);
    const webinarData = await api.webinar.getWebinarById({ webinarId: liveWebinarId });
    if (!webinarData) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center text-lg sm:text-4xl">
                Webinar Not Found
            </div>
        )
    }

    const checkUser = await onAuthenticateUser();
    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY as string;


    return (
        <div className="w-full min-h-screen mx-auto">
            <RenderWebinar
                apiKey={apiKey}
                error={error}
                webinar={webinarData}
                user={checkUser.user || null}
            />
        </div>
    )
}

export default page