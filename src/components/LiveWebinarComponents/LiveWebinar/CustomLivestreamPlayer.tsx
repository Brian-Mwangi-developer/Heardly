import {type WebinarWithPresenter } from '@/lib/types';
import { Call, StreamCall, useStreamVideoClient } from '@stream-io/video-react-sdk';
import { useEffect, useState } from 'react';
import { LiveWebinarView } from '../common/Live-webinar-view';


type Props = {
    username: string;
    callId: string;
    callType: string;
    token: string;
    webinar: WebinarWithPresenter
}

export const CustomLivestreamPlayer = ({
    username,
    callId,
    callType,
    token,
    webinar
}: Props) => {
    const client = useStreamVideoClient();
    const [call, setCall] = useState<Call>();
    const [showChat, setShowChat] = useState(false);

    useEffect(() => {
        if (!client) return;
        const myCall = client.call(callType, callId);
        setCall(myCall);
        myCall.join({ create: true }).then(
            () => setCall(myCall),
            () => console.error('Failed to join Call')
        )
        return () => {
            setCall(undefined);
        }
    }, [client, callId, callType])
    if (!call) return null;
    return (
        <StreamCall call={call}>
            <LiveWebinarView
                showChat={showChat}
                setShowChat={setShowChat}
                webinar={webinar}
                isHost={true}
                username={username}
                userToken={token}
                call={call}
                userId={webinar.presenter.id}
            />
        </StreamCall>
    )
}

