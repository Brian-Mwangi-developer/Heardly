
import { type WebinarWithPresenter } from "@/lib/types";
import { api } from "@/trpc/react";
import { type User } from "@prisma/client";
import { type User as StreamUser, StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CustomLivestreamPlayer } from "./CustomLivestreamPlayer";
type Props = {
    apiKey: string;
    webinar: WebinarWithPresenter;
    user: User;
    callId: string;
}



export const LiveStreamState = ({
    apiKey,
    webinar,
    user,
    callId
}: Props) => {
    const [client, setClient] = useState<StreamVideoClient | null>(null);
    const [hostToken, setHostToken] = useState<string | null>(null);

    const getTokenForHost = api.streamIo.getTokenForHost.useMutation()

    useEffect(() => {
        const init = async () => {
            try {
                const token = await getTokenForHost.mutateAsync({
                    userId: webinar.presenterId,
                    username: webinar.presenter.name,
                    profilePic: webinar.presenter.profileImage
                })
                const hostUser: StreamUser = {
                    id: webinar.presenterId,
                    name: webinar.presenter.name,
                    image: webinar.presenter.profileImage
                }
                const streamClient = new StreamVideoClient({
                    apiKey,
                    user: hostUser,
                    token,
                })
                setHostToken(token);
                setClient(streamClient);
            } catch (error) {
                console.error("Failed to initialize Stream Video client:", error);
                setHostToken(null);
                toast.error("Failed to initialize livestream. Please try again later.");
                setClient(null);
            }
        }
        init();

    }, [apiKey, webinar])
    if (!client || !hostToken) return null
    return (
        <StreamVideo
            client={client}
        >
            <CustomLivestreamPlayer
                callId={callId}
                callType="livestream"
                webinar={webinar}
                username={user.name}
                token={hostToken}

            />
        </StreamVideo>
    )
}