"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CallStatusTypes, type WebinarWithPresenter } from '@/lib/types';
import { cn, formatTime } from '@/lib/utils';
import { vapi } from '@/lib/vapi/vapiClient';
import { api } from '@/trpc/react';
import { CallStatusEnum } from '@prisma/client';
import { Bot, Clock, Loader2, Mic, MicOff, PhoneOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

type Props = {
    assistantId: string;
    userName?: string;
    assistantName?: string;
    callTimeLimit?: number;
    webinar: WebinarWithPresenter
    userId: string;
}

const AutoConnectCall = ({
    userName = 'User',
    assistantId,
    assistantName = 'Ai Assistant',
    callTimeLimit = 180,
    webinar,
    userId

}: Props) => {
    const [callStatus, setCallStatus] = useState(CallStatusTypes.CONNECTING);
    const [assistantIsSpeaking, setAssistantIsSpeaking] = useState(true);
    const [userIsSpeaking, setUserIsSpeaking] = useState(false);
    const [isMicMuted, setIsMicMuted] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(callTimeLimit);

    const createCheckoutLink = api.stripe.createCheckoutLink.useMutation()

    const changeCallStatus = api.attendance.changeCallStatus.useMutation()
    const refs = useRef({
        countdownTimer: undefined as NodeJS.Timeout | undefined,
        audioStream: null as MediaStream | null,
        userSpeakingTimeout: undefined as NodeJS.Timeout | undefined,
    })
    const toggleMicMute = () => {
        if (refs.current.audioStream) {
            refs.current.audioStream.getTracks().forEach(track => {
                track.enabled = isMicMuted
            })
        }
        setIsMicMuted(!isMicMuted)
    }
    const checkoutLink = async () => {
        try {
            if (!webinar?.priceId || !webinar?.presenter?.stripeConnectId) {
                return toast.error('No PriceId or StripeConnectId found')
            }
            const session = await createCheckoutLink.mutateAsync({
                priceId: webinar.priceId,
                stripeId: webinar.presenter.stripeConnectId,
                attendeeId: userId,
                webinarId: webinar.id,
            })
            if (!session.sessionUrl) {
                throw new Error('Failed to create checkout session');
            }
            window.open(session.sessionUrl, '_blank');
        } catch (error) {
            console.error("Checkout Link Error:", error);
            toast.error("Failed to create checkout link, please try again");
        }
    }

    const cleanup = () => {
        if (refs.current.countdownTimer) {
            clearInterval(refs.current.countdownTimer)
            refs.current.countdownTimer = undefined;
        }
        if (refs.current.userSpeakingTimeout) {
            clearTimeout(refs.current.userSpeakingTimeout);
            refs.current.userSpeakingTimeout = undefined;
        }
        if (refs.current.audioStream) {
            refs.current.audioStream.getTracks().forEach(track => track.stop());
            refs.current.audioStream = null;
        }
    }
    const setupAudio = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            refs.current.audioStream = stream;
            //simple speech detection using audioContext
            const audioContext = new (window.AudioContext || window.AudioContext)();
            const analyzer = audioContext.createAnalyser();
            analyzer.fftSize = 256;

            const microphone = audioContext.createMediaStreamSource(stream);
            microphone.connect(analyzer);

            //Monitor Audio Levels
            const checkAudioLevel = () => {
                const dataArray = new Uint8Array(analyzer.frequencyBinCount);
                analyzer.getByteFrequencyData(dataArray);
                //Calculate average volume
                const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
                const normalizedVolume = average / 256;

                //Detect Speech based on Volume
                if (normalizedVolume > 0.15 && !assistantIsSpeaking && !isMicMuted) {
                    setUserIsSpeaking(true);

                    //clear previous timeout
                    if (refs.current.userSpeakingTimeout) {
                        clearTimeout(refs.current.userSpeakingTimeout);
                    }
                    //Reset after short delay
                    refs.current.userSpeakingTimeout = setTimeout(() => {
                        setUserIsSpeaking(false);
                    }, 500)
                }
                //Continue Monitoring
                requestAnimationFrame(checkAudioLevel);
            }
            checkAudioLevel()
        } catch (error) {
            console.error("Failed to Initialize Audio:", error);
        }
    }
    const startCall = async () => {
        try {
            setCallStatus(CallStatusTypes.CONNECTING);
            await vapi.stop();
            await vapi.start(assistantId);
            const res = await changeCallStatus.mutateAsync({ attendeeId: userId, callStatus: CallStatusEnum.InProgress });
            if (!res.success) {
                throw new Error('Failed to update call status');
            }
            toast.success("Call started successfully");

        } catch (error) {
            console.error('Failed to Start Call', error)
            toast.error("Failed to start call, please try again");
            setCallStatus(CallStatusTypes.FINISHED);
        }
    }

    const stopCall = async () => {
        try {
            vapi.stop()
            setCallStatus(CallStatusTypes.FINISHED);
            cleanup();
            const res = await changeCallStatus.mutateAsync({ attendeeId: userId, callStatus: CallStatusEnum.COMPLETED });
            if (!res.success) {
                throw new Error('Falied to update call status');
            }
            toast.success("Call ended successfully");
        } catch (error) {
            console.error("Error Ending Call:", error);
            toast.error("Failed to end call,please try again");
        }
    }

    useEffect(() => {
        startCall();
        return () => {
            stopCall()
        }
    }, [])

    useEffect(() => {
        const onCallStart = async () => {
            console.log("Call Started");
            setCallStatus(CallStatusTypes.ACTIVE)
            setupAudio();

            setTimeRemaining(callTimeLimit);
            refs.current.countdownTimer = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 1) {
                        clearInterval(refs.current.countdownTimer);
                        stopCall();
                        return 0;
                    }
                    return prev - 1;
                })
            }, 1000)
        }
        const onCallEnd = () => {
            console.log('Call Ended');
            setCallStatus(CallStatusTypes.FINISHED);
            cleanup()
        }
        const onSpeechStart = () => {
            setAssistantIsSpeaking(true);
        }
        const onSpeechEnd = () => {
            setAssistantIsSpeaking(false);
        }
        const onError = (error: Error) => {
            console.error("Vapi Error", error);
            setCallStatus(CallStatusTypes.FINISHED);
            cleanup();
        }
        vapi.on('call-start', onCallStart);
        vapi.on('call-end', onCallEnd);
        vapi.on('speech-start', onSpeechStart);
        vapi.on('speech-end', onSpeechEnd);
        vapi.on('error', onError);
        return () => {
            vapi.off('call-start', onCallStart);
            vapi.off('call-end', onCallEnd);
            vapi.off('speech-start', onSpeechStart);
            vapi.off('speech-end', onSpeechEnd);
            vapi.off('error', onError);
        }

    }, [userName, callTimeLimit])

    return (
        <div className='flex flex-col h-[calc(100vh-80px)] bg-background'>
            <div className='flex-1 flex flex-col md:flex-row p-4 gap-4 relative'>
                <div className='flex-1 bg-card rounded-xl overflow-hidden shadow-lg relative'>
                    <div className='absolute top-4 left-4 bg-black/40 text-white px-3 py-1 rounded-full
                    text-sm flex items-center gap-2 z-10'>
                        <Mic className={cn('h-4 w-4', assistantIsSpeaking ? 'text-accent-primary' : '')} />
                        <span>{assistantName}</span>
                    </div>
                    <div className='h-full flex items-center justify-center'>
                        <div className='relative'>
                            {assistantIsSpeaking && (
                                <>
                                    <div className='absolute inset-0 rounded-full border-4 border-accent-primary animate-ping opacity-20'
                                        style={{ margin: '-8px' }} />
                                    <div className='absolute inset-0 rounded-full border-4 border-accent-primary animate-ping opacity-10'
                                        style={{ margin: '-16px', animationDelay: '0.5s' }} />
                                </>
                            )}
                            <div className={cn('flex justify-center items-center rounded-full overflow-hidden border-4 p-6',
                                assistantIsSpeaking ? 'border-accent-primary' : 'border-accent-secondary/50'
                            )}>
                                <Bot className='w-[70px] h-[70px] text-accent-primary' />
                            </div>
                            {assistantIsSpeaking && (
                                <div className='absolute -bottom-2 -right-2 bg-accent-primary text-white p-2 rounded-full'>
                                    <Mic className='h-5 w-5' />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className='flex-1 bg-card rounded-xl overflow-hidden shadow-lg relative'>
                    <div className='absolute top-4 left-4 bg-black/40 text-white px-3 py-1
                    rounded-full text-sm flex items-center gap-2 z-10'>
                        {isMicMuted ? (
                            <>
                                <MicOff className='h-4 w-4 text-destructive' />
                                <span>Muted</span>
                            </>
                        ) : (
                            <>
                                <Mic className={cn('h-4 w-4', userIsSpeaking ? 'text-accent-secondary' : "")} />
                                {userName}
                            </>
                        )}
                    </div>
                    <div className='absolute top-4 right-4 bg-black/40 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2 z-10'>
                        <Clock className='h-4 w-4' />
                        <span>{formatTime(timeRemaining)}</span>
                    </div>
                    <div className='h-full flex items-center justify-center'>
                        <div className='relative'>
                            {userIsSpeaking && !isMicMuted && (
                                <>
                                    <div className='absolute inset-0 rounded-full border-4 border-accent-secondary animate-ping opacity-20'
                                        style={{ margin: '-8px' }} />
                                </>
                            )}
                            <div className={cn(
                                'flex justify-center items-center rounded-full overflow-hidden border-4',
                                isMicMuted ? 'border-destructive/50' : userIsSpeaking ? 'border-accent-secondary' : 'border-accent-secondary/50',
                            )}>
                                <Avatar className='w-[100px] h-[100px]'>
                                    <AvatarImage
                                        src="/user-avatar.png"
                                        alt={userName}
                                    />
                                    <AvatarFallback>{userName.split('')?.[0]}</AvatarFallback>
                                </Avatar>
                            </div>
                            {isMicMuted && (
                                <div className='absolute -bottom-2 -right-2 bg-destructive text-white p-2 rounded-full'>
                                    <MicOff className='h-5 w-5' />
                                </div>
                            )}
                            {userIsSpeaking && !isMicMuted && (
                                <div className='absolute -bottom-2 -right-2 bg-accent-secondary text-white p-2 rounded-full'>
                                    <Mic className='h-5 w-5' />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {callStatus === CallStatusTypes.CONNECTING && (
                    <div className='absolute inset-0 bg-background/80 flex items-center justify-center flex-col gap-4 z-20'>
                        <Loader2 className='h-10 w-10 animate-spin text-accent-primary' />
                        <h3 className='text-xl font-medium'>Connecting ...</h3>
                    </div>
                )}
                {callStatus === CallStatusTypes.FINISHED && (
                    <div className='absolute inset-0 bg-background/80 flex items-center justify-center flex-col gap-4 z-20'>

                        <h3 className='text-xl font-medium'>Call Ended</h3>
                        <p className='text-muted-foreground'>Time limit Reached</p>
                    </div>
                )}
            </div>
            <div className='bg-card border-t border-border p-4'>
                <div className='max-w-3xl mx-auto flex items-center justify-between flex-wrap gap-3'>
                    <div className='flex items-center gap-2'>
                        {callStatus === CallStatusTypes.ACTIVE && (
                            <div className='flex items-center gap-2'>
                                <Clock className='h-4 w-4 text-muted-foreground' />
                                <span
                                    className={cn('text-sm font-medium',
                                        timeRemaining < 30 ? 'text-destructive animate-pulse' : timeRemaining < 60 ? 'text-amber-500' : 'text-muted-foreground'
                                    )}>
                                    {formatTime(timeRemaining)} time Remaining
                                </span>
                            </div>
                        )}
                    </div>
                    <div className='flex items-center gap-4'>
                        <button
                            onClick={toggleMicMute}
                            className={cn(
                                'p-3 rounded-full transition-all',
                                isMicMuted ? 'bg-destructive text-primary' : 'bg-secondary hover:bg-secondary/80 text-foreground')}
                            disabled={callStatus !== CallStatusTypes.ACTIVE}>
                            {isMicMuted ? (
                                <MicOff className='h-6 w-6' />
                            ) : (
                                <Mic className='h-6 w-6' />
                            )}
                        </button>
                        <button
                            onClick={stopCall}
                            className='p-3 rounded-full bg-destructive text-primary hover:bg-destructive/90 transition-all'
                            aria-label='End call'
                            disabled={callStatus !== CallStatusTypes.ACTIVE}>
                            <PhoneOff className='h-6 w-6' />
                        </button>
                    </div>
                    <Button
                        onClick={checkoutLink}
                        variant={'outline'}>
                        Buy Now
                    </Button>
                    <div className='hidden md:block'>
                        {callStatus === CallStatusTypes.ACTIVE && timeRemaining < 30 && (
                            <span className='font-medium text-destructive'>
                                Call Ending Soon
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AutoConnectCall