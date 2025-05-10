'use client';

import {useEffect, useState} from 'react'
import Image from "next/image";
import {cn} from "@/lib/utils";
import {useRouter} from "next/navigation";
import {vapi} from '@/lib/vapi.sdk'


enum CallStatus {
    INACTIVE = "INACTIVE",
    CONNECTING = "CONNECTING",
    ACTIVE = "ACTIVE",
    FINISHED = "FINISHED",
}

interface SavedMessage {
    role: 'user' | 'system' | 'assistant';
    content: string;
}

// TODO: Remove below suppression comment
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Agent = ({userName, type, userId, questions, interviewId, feedbackId}: AgentProps) => {
    const router = useRouter();

    const [isSpeaking, setIsSpeaking] = useState(false);
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [messages, setMessages] = useState<SavedMessage[]>([]);

    useEffect(() => {
        const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
        const onCallEnd = () => setCallStatus(CallStatus.FINISHED);

        const onMessage = (message: Message) => {
            if (message.type === 'transcript' && message.transcriptType === 'final') {
                const newMessage = {role: message.role, content: message.transcript};

                setMessages((prevMessages) => [...prevMessages, newMessage]);
            }
        }

        const onSpeechStart = () => setIsSpeaking(true);
        const onSpeechEnd = () => setIsSpeaking(false);

        const onError = (error: Error) => console.log('Agent Error', error);

        // Events
        vapi.on('call-start', onCallStart);
        vapi.on('call-end', onCallEnd);
        vapi.on('message', onMessage);
        vapi.on('speech-start', onSpeechStart);
        vapi.on('speech-end', onSpeechEnd);
        vapi.on('error', onError);


        // Cleanup
        return () => {
            vapi.off('call-start', onCallStart);
            vapi.off('call-end', onCallEnd);
            vapi.off('message', onMessage);
            vapi.off('speech-start', onSpeechStart);
            vapi.off('speech-end', onSpeechEnd);
            vapi.off('error', onError);
        }
    }, [])


    useEffect(() => {
        if (callStatus === CallStatus.FINISHED) router.push('/'); // Since it take some time to generate interview, we are routing them to home page to buy some time
    }, [messages, callStatus, type, userId]);

    const handleCall = async () => {
        setCallStatus(CallStatus.CONNECTING);

        await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!, {
            variableValues: {
                username: userName,
                userid: userId
            },
            // clientMessages: [],
            // serverMessages: []
        })
    };

    const handleDisconnect = async () => {
        setCallStatus(CallStatus.FINISHED);

        vapi.stop();
    };

    const latestMessage = messages[messages.length - 1]?.content;

    const isCallInactiveOrFinished = callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

    return (
        <>
            <div className={"call-view"}>
                <div className={"card-interviewer"}>
                    <div className={"avatar"}>
                        <Image alt={"vapi"} src={"/ai-avatar.png"} width={65} height={54} className={"object-cover"}/>
                        {isSpeaking && <span className={"animate-speak"}/>}
                    </div>
                    <h3>AI Interviewer</h3>
                </div>


                <div className={"card-border"}>
                    <div className={"card-content"}>
                        <Image alt={"user avatar"} src={"/user-avatar.png"} width={540} height={540}
                               className={"rounded-full object-cover size-[120px]"}/>
                        <h3>{userName}</h3>
                    </div>
                </div>
            </div>

            {messages.length > 0 && (
                <div className={"transcript-border"}>
                    <div className={"transcript"}>
                        <p key={latestMessage}
                           className={cn('transition-opacity duration-500 opacity-0', 'animate-fadeIn opacity-100')}>
                            {latestMessage}
                        </p>
                    </div>
                </div>
            )}

            <div className={'w- flex justify-center'}>
                {callStatus !== 'ACTIVE' ? (
                    <button className={"relative btn-call"} onClick={handleCall}>
                        <span
                            className={cn("absolute animate-ping rounded-full opacity-75", callStatus !== 'CONNECTING' && 'hidden')}/>

                        <span>{isCallInactiveOrFinished ? 'Call' : '. . .'}</span>
                    </button>
                ) : (
                    <button className={'btn-disconnect'} onClick={handleDisconnect}>
                        End
                    </button>
                )}
            </div>
        </>)
}
export default Agent
