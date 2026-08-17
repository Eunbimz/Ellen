"use client";

import { useEffect, useRef } from "react";

import { EmptyState } from "@/components/chat/empty-state";
import type { Message } from "@/components/chat/types";

interface MessageListProps {
    messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (messages.length === 0) {
        return (
        <div className="flex-1 overflow-y-auto">
            <EmptyState />
        </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-5 py-8">
            <div className="space-y-7">
            {messages.map((message, index) => {
                const isUser = message.role === "user";
                const emptyAssistant = !isUser && message.content === "";

                if (emptyAssistant) {
                return (
                    <div
                    key={index}
                    className="flex items-center gap-2 px-1 text-sm text-neutral-600"
                    >
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neutral-500" />
                    <span>Thinking...</span>
                    </div>
                );
                }

                return (
                <div
                    key={index}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                    <div
                    className={
                        isUser
                        ? "max-w-[75%] rounded-2xl bg-[#2a2a2a] px-4 py-3 text-sm leading-6 text-white"
                        : "max-w-[85%] px-1 py-2 text-sm leading-7 text-neutral-200"
                    }
                    >
                    {message.content}
                    </div>
                </div>
                );
            })}

            <div ref={messagesEndRef} />
            </div>
        </div>
        </div>
    );
}
