"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

enum CallStatus {
  INACTIVE = "INACTIVE",
  ACTIVE = "ACTIVE",
  CONNECTING = "CONNECTING",
  FINISHED = "FINISHED",
}

type AgentProps = {
  userName: string;
  userId?: string;
  type?: "generate" | "review";
};

const Agent = ({ userName }: AgentProps) => {
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.FINISHED);
  const isSpeaking = true;
  const messages =[
    'whats your name?',
    'My name is john doe.',
  ];
  const lastMessage = messages[messages.length - 1];

  const handleCallClick = () => {
    if (callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED) {
      setCallStatus(CallStatus.CONNECTING);
      setTimeout(() => {
        setCallStatus(CallStatus.ACTIVE);
      }, 2000); // simulate connection delay
    } else if (callStatus === CallStatus.ACTIVE) {
      setCallStatus(CallStatus.FINISHED);
    }
  };

  return (
    <>
      <div className="call-view">
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/robot.png"
              alt="robot"
              width={70}
              height={70}
              className="rounded-full object-cover size-[80px]"
            />
            {isSpeaking && <span className="animate-speak"></span>}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="user avatar"
              width={540}
              height={540}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>
    {messages.length > 0 && (
        <div className='transcript-border'>
            <div className='transcript'>
                <p key={lastMessage} className={cn('transition-opacity duration-500 opacity-0','animate-fade-in opacity-100')}>
                    {lastMessage}
                </p>
            </div>
        </div>
    )}
      <div className="w-full flex justify-center">
        {callStatus !== CallStatus.ACTIVE ? (
          <button className="relative btn-call" onClick={handleCallClick}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus === CallStatus.CONNECTING && "hidden"
              )}
            />
            <span>
              {callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED
                ? "Call"
                : "Connecting..."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={handleCallClick}>
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
