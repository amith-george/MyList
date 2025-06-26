'use client';

import { useEffect, useState } from 'react';

const prePingMessages = [
  "Fetching TMDb Database...",
  "Fetching User Details...",
  "Loading Personal Lists..."
];
const finalMessage = "Making the Final Changes...";

export default function SiteLoader({ pinged }: { pinged: boolean }) {
  const [index, setIndex] = useState(0);
  const isFinal = pinged && index === prePingMessages.length;
  const message = isFinal ? finalMessage : prePingMessages[index];
  const charCount = message.length;

  useEffect(() => {
    if (pinged) {
      setIndex(prePingMessages.length); // Show final message
      return;
    }

    const timer = setTimeout(() => {
      setIndex((prev) => (prev + 1) % prePingMessages.length);
    }, 4000);

    return () => clearTimeout(timer);
  }, [index, pinged]);

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-black">
      <div className="w-[26rem] min-h-[14em] rounded-lg border border-gray-800 bg-[#1a1a1a] p-8 shadow-lg text-green-500 font-mono text-xl relative overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 h-10 bg-gray-800 rounded-t px-4 flex items-center">
          <div className="text-gray-200 text-lg flex-1">Status</div>
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
        </div>

        {/* Typing Text */}
        <div
          key={index}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap overflow-hidden border-r-[3px] border-green-500"
          style={{
            '--ch': `${charCount}`,
            animation: `typeAndDelete 4s steps(${charCount}) forwards, blinkCursor 0.5s step-end infinite alternate`,
            width: '0ch',
          } as React.CSSProperties}
        >
          {message}
        </div>

        <style jsx>{`
          @keyframes blinkCursor {
            50% {
              border-right-color: transparent;
            }
          }

          @keyframes typeAndDelete {
            0% {
              width: 0ch;
            }
            45%, 55% {
              width: calc(var(--ch) * 1ch);
            }
            100% {
              width: 0ch;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
